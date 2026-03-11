// fileParser.js — PDF/DOC/DOCX 텍스트 추출 유틸리티

/**
 * PDF 파일에서 텍스트 추출 (pdf.js 사용)
 */
async function extractTextFromPDF(file) {
  var arrayBuffer = await file.arrayBuffer();
  var pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  var text = '';
  for (var i = 1; i <= pdf.numPages; i++) {
    var page = await pdf.getPage(i);
    var content = await page.getTextContent();
    var pageText = content.items.map(function(item) { return item.str; }).join(' ');
    text += pageText + '\n\n';
  }
  return text.trim();
}

/**
 * DOCX 파일에서 텍스트 추출 (mammoth.js 사용)
 */
async function extractTextFromDOCX(file) {
  var arrayBuffer = await file.arrayBuffer();
  var result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });
  return result.value.trim();
}

/**
 * DOC (구형 바이너리 Word) 파일에서 텍스트 추출
 * CFB 라이브러리로 OLE 컨테이너를 파싱하고 WordDocument 스트림에서 텍스트 추출
 */
async function extractTextFromDOC(file) {
  var arrayBuffer = await file.arrayBuffer();
  var bytes = new Uint8Array(arrayBuffer);

  // 1) ZIP 시그니처(PK)면 실제로는 .docx — mammoth로 처리
  if (bytes[0] === 0x50 && bytes[1] === 0x4B) {
    var result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });
    return result.value.trim();
  }

  // 2) RTF 파일 감지 ({\rtf)
  var header = String.fromCharCode.apply(null, bytes.slice(0, 6));
  if (header.indexOf('{\\rtf') === 0) {
    return extractTextFromRTF(bytes);
  }

  // 3) HTML/XML로 저장된 .doc 감지
  var headerStr = String.fromCharCode.apply(null, bytes.slice(0, 100));
  if (headerStr.indexOf('<html') !== -1 || headerStr.indexOf('<HTML') !== -1 ||
      headerStr.indexOf('<?xml') !== -1 || headerStr.indexOf('<!DOCTYPE html') !== -1 ||
      headerStr.indexOf('<meta') !== -1 || headerStr.indexOf('<?mso') !== -1) {
    return extractTextFromHTMLDoc(bytes);
  }

  // 4) OLE2 시그니처 확인 (D0 CF 11 E0) — 정상적인 .doc 바이너리
  var isOLE2 = bytes[0] === 0xD0 && bytes[1] === 0xCF && bytes[2] === 0x11 && bytes[3] === 0xE0;
  if (!isOLE2) {
    // 마지막 시도: 일반 텍스트로 디코딩
    var plainText = new TextDecoder('utf-8').decode(bytes);
    if (plainText.trim().length > 50) return cleanExtractedText(plainText);
    throw new Error('지원하지 않는 DOC 파일 형식입니다. PDF나 DOCX로 변환 후 다시 시도해주세요.');
  }

  // CFB 라이브러리로 OLE 컨테이너 파싱
  var cfb = CFB.read(bytes, { type: 'array' });

  // WordDocument 스트림 찾기
  var wordDoc = CFB.find(cfb, 'WordDocument');
  if (!wordDoc || !wordDoc.content || wordDoc.content.length < 34) {
    throw new Error('DOC 파일에서 WordDocument 스트림을 찾을 수 없습니다.');
  }

  var wdBuf = wordDoc.content instanceof Uint8Array ? wordDoc.content : new Uint8Array(wordDoc.content);

  // FIB (File Information Block) 읽기
  var wIdent = wdBuf[0] | (wdBuf[1] << 8);
  if (wIdent !== 0xA5EC) {
    throw new Error('유효한 Word 문서 형식이 아닙니다.');
  }

  // FIB flags (offset 0x0A)
  var flagsA = wdBuf[10] | (wdBuf[11] << 8);
  var fComplex = (flagsA >> 2) & 1;
  var fEncrypted = (flagsA >> 8) & 1;
  var fWhichTblStm = (flagsA >> 9) & 1;

  if (fEncrypted) {
    throw new Error('암호화된 DOC 파일은 지원하지 않습니다.');
  }

  // Table 스트림 찾기 (피스 테이블이 여기에 있음)
  var tableName = fWhichTblStm ? '1Table' : '0Table';
  var tableEntry = CFB.find(cfb, tableName);

  // FibRgLw에서 ccpText 읽기
  var offset = 32; // FibBase 끝
  var csw = wdBuf[offset] | (wdBuf[offset + 1] << 8);
  offset += 2 + csw * 2; // FibRgW 건너뛰기
  var cslw = wdBuf[offset] | (wdBuf[offset + 1] << 8);
  offset += 2;

  var ccpText = 0;
  if (cslw >= 4) {
    // FibRgLw97: ccpText는 4번째 dword (index 3, offset 12)
    ccpText = readUInt32(wdBuf, offset + 12);
  }

  // FibRgFcLcb에서 피스 테이블(clx) 위치 찾기
  var fibRgLwEnd = offset + cslw * 4;
  var cbRgFcLcb = wdBuf[fibRgLwEnd] | (wdBuf[fibRgLwEnd + 1] << 8);
  var rgFcLcbStart = fibRgLwEnd + 2;

  // fcClx (offset 264 in FibRgFcLcb97) and lcbClx (offset 268)
  var fcClx = 0;
  var lcbClx = 0;
  if (cbRgFcLcb >= 67) { // clx is at pair index 66 (0-based)
    fcClx = readUInt32(wdBuf, rgFcLcbStart + 66 * 8);
    lcbClx = readUInt32(wdBuf, rgFcLcbStart + 66 * 8 + 4);
  }

  // 피스 테이블에서 텍스트 추출 시도
  if (tableEntry && tableEntry.content && fcClx > 0 && lcbClx > 0) {
    var tblBuf = tableEntry.content instanceof Uint8Array ? tableEntry.content : new Uint8Array(tableEntry.content);
    var text = extractTextFromPieceTable(wdBuf, tblBuf, fcClx, lcbClx, ccpText);
    if (text && text.trim().length > 20) {
      return cleanExtractedText(text);
    }
  }

  // 폴백: WordDocument 스트림에서 직접 텍스트 스캔
  var fallbackText = scanReadableText(wdBuf);
  if (fallbackText.trim().length > 20) {
    return cleanExtractedText(fallbackText);
  }

  // 최종 폴백: 전체 파일에서 스캔
  return cleanExtractedText(scanReadableText(bytes));
}

/**
 * RTF 파일에서 텍스트 추출
 */
function extractTextFromRTF(bytes) {
  var rtfStr = new TextDecoder('ascii').decode(bytes);
  var text = '';
  var groupDepth = 0;
  var skipGroup = false;
  var skipDepth = 0;
  var i = 0;

  // 건너뛸 RTF 그룹 (이미지, 폰트 테이블, 스타일시트 등)
  var skipDestinations = ['fonttbl', 'colortbl', 'stylesheet', 'info', 'pict',
    'header', 'footer', 'headerl', 'headerr', 'footerl', 'footerr',
    'object', 'datafield', 'themedata', 'colorschememapping',
    'datastore', 'latentstyles', 'listtable', 'listoverridetable',
    'pgdsctbl', 'rsidtbl', 'generator', 'xmlnstbl', 'mmathPr',
    'defchp', 'defpap', 'fldinst', 'blipuid'];

  while (i < rtfStr.length) {
    var ch = rtfStr[i];

    if (ch === '{') {
      groupDepth++;
      i++;
      continue;
    }

    if (ch === '}') {
      if (skipGroup && groupDepth === skipDepth) {
        skipGroup = false;
      }
      groupDepth--;
      i++;
      continue;
    }

    if (skipGroup) {
      i++;
      continue;
    }

    if (ch === '\\') {
      i++;
      if (i >= rtfStr.length) break;

      // \* destination 마커 — 이 그룹 전체를 건너뛰기
      if (rtfStr[i] === '*') {
        skipGroup = true;
        skipDepth = groupDepth;
        i++;
        continue;
      }

      // 이스케이프 문자
      if (rtfStr[i] === '\\' || rtfStr[i] === '{' || rtfStr[i] === '}') {
        text += rtfStr[i];
        i++;
        continue;
      }

      // \'XX hex 인코딩
      if (rtfStr[i] === "'") {
        i++;
        var hex = rtfStr.substring(i, i + 2);
        var charCode = parseInt(hex, 16);
        if (!isNaN(charCode) && charCode >= 0x20) {
          text += String.fromCharCode(charCode);
        }
        i += 2;
        continue;
      }

      // 컨트롤 워드 읽기
      var word = '';
      while (i < rtfStr.length && /[a-zA-Z]/.test(rtfStr[i])) {
        word += rtfStr[i];
        i++;
      }

      // 숫자 파라미터 건너뛰기
      var param = '';
      if (i < rtfStr.length && (rtfStr[i] === '-' || /[0-9]/.test(rtfStr[i]))) {
        if (rtfStr[i] === '-') { param += '-'; i++; }
        while (i < rtfStr.length && /[0-9]/.test(rtfStr[i])) {
          param += rtfStr[i];
          i++;
        }
      }

      // 구분 공백 건너뛰기
      if (i < rtfStr.length && rtfStr[i] === ' ') {
        i++;
      }

      // 건너뛸 그룹 확인
      if (skipDestinations.indexOf(word) !== -1) {
        skipGroup = true;
        skipDepth = groupDepth;
        continue;
      }

      // 줄바꿈
      if (word === 'par' || word === 'line') {
        text += '\n';
      } else if (word === 'tab') {
        text += '\t';
      } else if (word === 'u') {
        // 유니코드 문자 \uN
        var code = parseInt(param, 10);
        if (!isNaN(code)) {
          if (code < 0) code += 65536;
          text += String.fromCharCode(code);
          // 유니코드 뒤의 대체 문자 건너뛰기
          if (i < rtfStr.length && rtfStr[i] !== '\\' && rtfStr[i] !== '{' && rtfStr[i] !== '}') {
            i++;
          }
        }
      }

      continue;
    }

    // 일반 텍스트
    if (ch === '\r' || ch === '\n') {
      i++;
      continue;
    }

    text += ch;
    i++;
  }

  return cleanExtractedText(text);
}

/**
 * HTML/XML로 저장된 .doc 파일에서 텍스트 추출
 */
function extractTextFromHTMLDoc(bytes) {
  var htmlStr = new TextDecoder('utf-8').decode(bytes);

  // DOMParser로 파싱
  var parser = new DOMParser();
  var doc = parser.parseFromString(htmlStr, 'text/html');

  // style, script 태그 제거
  var removes = doc.querySelectorAll('style, script, head');
  for (var i = 0; i < removes.length; i++) {
    removes[i].remove();
  }

  // body 텍스트 추출
  var body = doc.body;
  if (!body) {
    // body가 없으면 태그만 제거
    var stripped = htmlStr.replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
    return cleanExtractedText(stripped);
  }

  var text = body.innerText || body.textContent || '';
  return cleanExtractedText(text);
}

/**
 * 피스 테이블(CLX)에서 텍스트 추출
 */
function extractTextFromPieceTable(wdBuf, tblBuf, fcClx, lcbClx, ccpText) {
  if (fcClx + lcbClx > tblBuf.length) return '';

  var text = '';
  var pos = fcClx;
  var clxEnd = fcClx + lcbClx;

  // CLX 내의 Grpprl 건너뛰기 (type 0x01)
  while (pos < clxEnd && tblBuf[pos] === 0x01) {
    var cbGrpprl = tblBuf[pos + 1] | (tblBuf[pos + 2] << 8);
    pos += 3 + cbGrpprl;
  }

  // Pcdt 시작 (type 0x02)
  if (pos >= clxEnd || tblBuf[pos] !== 0x02) return '';
  pos += 1;

  var lcb = readUInt32(tblBuf, pos);
  pos += 4;

  // PlcPcd 구조: (n+1) CP 값 + n PCD 구조 (각 8바이트)
  // 각 PCD는 8바이트: 2(flags) + 4(fc) + 2(prm)
  var pcdSize = 8;
  // n+1개의 CP (각 4바이트) + n개의 PCD (각 8바이트) = lcb
  // 4*(n+1) + 8*n = lcb → 12n + 4 = lcb → n = (lcb - 4) / 12
  var n = Math.floor((lcb - 4) / 12);
  if (n <= 0) return '';

  var cpStart = pos;
  var pcdStart = pos + (n + 1) * 4;

  for (var i = 0; i < n; i++) {
    var cp1 = readUInt32(tblBuf, cpStart + i * 4);
    var cp2 = readUInt32(tblBuf, cpStart + (i + 1) * 4);
    var charCount = cp2 - cp1;
    if (charCount <= 0 || charCount > 1000000) continue;

    // PCD에서 fc 읽기
    var pcdOff = pcdStart + i * pcdSize;
    var fcCompressed = readUInt32(tblBuf, pcdOff + 2);

    var fCompressed = (fcCompressed >> 30) & 1;
    var fc = fcCompressed & 0x3FFFFFFF;

    if (fCompressed) {
      // 8비트 인코딩 (Windows-1252), fc를 2로 나눈 위치
      var byteOffset = fc / 2;
      for (var j = 0; j < charCount; j++) {
        var idx = byteOffset + j;
        if (idx >= wdBuf.length) break;
        var ch = wdBuf[idx];
        if (ch === 0x0D) { text += '\n'; }
        else if (ch === 0x07 || ch === 0x0C) { text += '\n'; }
        else if (ch >= 0x20) { text += String.fromCharCode(ch); }
      }
    } else {
      // 16비트 UTF-16LE
      for (var j = 0; j < charCount; j++) {
        var idx = fc + j * 2;
        if (idx + 1 >= wdBuf.length) break;
        var code = wdBuf[idx] | (wdBuf[idx + 1] << 8);
        if (code === 0x000D) { text += '\n'; }
        else if (code === 0x0007 || code === 0x000C) { text += '\n'; }
        else if (code >= 0x0020) { text += String.fromCharCode(code); }
      }
    }
  }

  // ccpText만큼만 잘라서 반환 (메인 문서 텍스트만)
  if (ccpText > 0 && text.length > ccpText) {
    text = text.substring(0, ccpText);
  }

  return text;
}

/**
 * 바이너리 데이터에서 읽을 수 있는 텍스트 스캔 (폴백용)
 */
function scanReadableText(buf) {
  // UTF-16LE 스캔 (한국어 등 유니코드 텍스트)
  var unicodeRuns = [];
  var run = [];
  for (var i = 0; i + 1 < buf.length; i += 2) {
    var code = buf[i] | (buf[i + 1] << 8);
    if (isReadableChar(code)) {
      run.push(code === 0x0D || code === 0x0A ? '\n' : String.fromCharCode(code));
    } else {
      if (run.length >= 5) unicodeRuns.push(run.join(''));
      run = [];
    }
  }
  if (run.length >= 5) unicodeRuns.push(run.join(''));

  // 싱글바이트 스캔 (ASCII/Latin 텍스트)
  var byteRuns = [];
  run = [];
  for (var i = 0; i < buf.length; i++) {
    var b = buf[i];
    if ((b >= 0x20 && b <= 0x7E) || b === 0x0D || b === 0x0A) {
      run.push(b === 0x0D || b === 0x0A ? '\n' : String.fromCharCode(b));
    } else {
      if (run.length >= 5) byteRuns.push(run.join(''));
      run = [];
    }
  }
  if (run.length >= 5) byteRuns.push(run.join(''));

  var unicodeText = unicodeRuns.join(' ');
  var byteText = byteRuns.join(' ');

  return unicodeText.length > byteText.length ? unicodeText : byteText;
}

/**
 * 읽을 수 있는 유니코드 문자 판별
 */
function isReadableChar(code) {
  return (code >= 0x0020 && code <= 0x007E) || // ASCII
    (code >= 0xAC00 && code <= 0xD7AF) || // 한글 음절
    (code >= 0x3131 && code <= 0x318E) || // 한글 자모
    (code >= 0x1100 && code <= 0x11FF) || // 한글 자모 (extended)
    (code >= 0x3000 && code <= 0x303F) || // CJK 기호
    (code >= 0x4E00 && code <= 0x9FFF) || // CJK 통합 한자
    (code >= 0xFF00 && code <= 0xFFEF) || // 전각 문자
    (code >= 0x2000 && code <= 0x206F) || // 일반 구두점
    (code >= 0x00A0 && code <= 0x00FF) || // Latin-1 Supplement
    code === 0x000D || code === 0x000A;
}

/**
 * uint32 리틀엔디안 읽기
 */
function readUInt32(buf, offset) {
  return (buf[offset]) | (buf[offset + 1] << 8) | (buf[offset + 2] << 16) | ((buf[offset + 3] << 24) >>> 0);
}

/**
 * 추출된 텍스트 정리
 */
function cleanExtractedText(text) {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/ {2,}/g, ' ')
    .replace(/[^\S\n]+/g, ' ')
    .trim();
}

/**
 * 파일 타입에 따라 텍스트 추출
 */
async function extractTextFromFile(file) {
  var name = file.name.toLowerCase();
  if (name.endsWith('.pdf')) {
    return extractTextFromPDF(file);
  } else if (name.endsWith('.docx')) {
    return extractTextFromDOCX(file);
  } else if (name.endsWith('.doc')) {
    return extractTextFromDOC(file);
  } else {
    throw new Error('지원하지 않는 파일 형식입니다.\nPDF, DOC, DOCX 파일을 업로드해주세요.');
  }
}
