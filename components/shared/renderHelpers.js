// 페이지 번호 계산
function calcPageNumber(slideIndex, slides) {
  if (!slides || !slides[slideIndex]) return '';
  var pageNumber = 1;
  for (var i = 0; i < slideIndex; i++) {
    var tid = slides[i].templateId;
    if (!tid.startsWith('maincover') && !tid.startsWith('finalcover') && !tid.startsWith('index')) {
      pageNumber++;
    }
  }
  var cur = slides[slideIndex].templateId;
  if (cur.startsWith('maincover') || cur.startsWith('finalcover') || cur.startsWith('index')) return '';
  return 'P' + pageNumber;
}

// 공통 푸터 렌더링 (SlideCanvas용)
function renderCanvasFooter(template, footerIndices, getPageNumber, currentSlideIndex) {
  // footerIndices: { logo: idx, copyright: idx, page: idx }
  var els = template.elements;
  var nodes = [];

  if (footerIndices.logo !== undefined && els[footerIndices.logo]) {
    var logo = els[footerIndices.logo];
    nodes.push(
      React.createElement('div', { key: 'footer-logo', style: { position: 'absolute', left: logo.x + 'px', top: logo.y + 'px', width: logo.width + 'px', height: logo.height + 'px' } },
        React.createElement('img', { src: logo.url, alt: '', style: { width: '100%', height: '100%', objectFit: 'contain' } })
      )
    );
  }
  if (footerIndices.copyright !== undefined && els[footerIndices.copyright]) {
    var cr = els[footerIndices.copyright];
    nodes.push(
      React.createElement('div', { key: 'footer-cr', style: { position: 'absolute', left: cr.x + 'px', top: cr.y + 'px', fontSize: cr.fontSize + 'px', fontWeight: cr.fontWeight, color: cr.fill, fontFamily: cr.fontFamily, letterSpacing: (cr.letterSpacing || -0.2) + 'px', lineHeight: cr.lineHeight || 1.4, whiteSpace: 'pre-wrap' } }, cr.content)
    );
  }
  if (footerIndices.page !== undefined) {
    nodes.push(
      React.createElement('div', { key: 'footer-page', className: 'editable-field', contentEditable: false, style: { position: 'absolute', left: '1680px', top: '990px', fontSize: '20px', fontWeight: '500', color: '#999999', fontFamily: 'Pretendard', letterSpacing: '-0.2px', lineHeight: 1.4, textAlign: 'right', width: '120px', cursor: 'default' } }, getPageNumber(currentSlideIndex))
    );
  }
  return nodes;
}

// 프레임 rect/이미지 인덱스 집합 계산
function calcFrameSkipIndices(elements, frames) {
  var frameRectIndices = new Set();
  var frameImgIndices = new Set();
  elements.forEach(function(el, idx) {
    if (el.type === 'rect' && el.stroke && el.cornerRadius) {
      frames.forEach(function(f) {
        if (el.x === f.frame.x && el.y === f.frame.y && el.width === f.frame.w && el.height === f.frame.h) {
          frameRectIndices.add(idx);
        }
      });
    }
    if (el.type === 'image' && el.placeholder && el.editable) {
      frames.forEach(function(f) {
        if (el.x === f.img.x && el.y === f.img.y && el.width === f.img.w && el.height === f.img.h) {
          frameImgIndices.add(idx);
        }
      });
    }
  });
  return { frameRectIndices: frameRectIndices, frameImgIndices: frameImgIndices };
}

// 일반 요소 렌더링 (mobile/pc/generic에서 공유)
function renderGenericElement(element, idx, data, handleTextEdit, textRefs, getPageNumber, currentSlideIndex) {
  var elementId = element.type + '_' + idx;

  if (element.type === 'rect') {
    return React.createElement('div', { key: idx, style: { position: 'absolute', left: element.x + 'px', top: element.y + 'px', width: element.width + 'px', height: element.height + 'px', backgroundColor: element.fill, borderRadius: element.cornerRadius ? element.cornerRadius + 'px' : '0', border: element.stroke ? element.strokeWidth + 'px solid ' + element.stroke : 'none' } });
  }

  if (element.type === 'text' && element.editable) {
    var isPageNumber = element.x === 1680 && element.y === 990;
    var autoPageNumber = isPageNumber ? getPageNumber(currentSlideIndex) : null;
    var displayValue = data[elementId] || element.content;
    if (autoPageNumber !== null) displayValue = autoPageNumber;
    return React.createElement('div', {
      key: idx,
      ref: function(el) { if (textRefs) textRefs.current[elementId] = el; },
      className: 'editable-field absolute',
      contentEditable: !isPageNumber,
      suppressContentEditableWarning: true,
      onBlur: function(e) { handleTextEdit(elementId, e); },
      style: { left: element.x + 'px', top: element.y + 'px', fontSize: element.fontSize + 'px', fontWeight: element.fontWeight, color: element.fill, maxWidth: element.width ? element.width + 'px' : 'none', width: element.width ? element.width + 'px' : 'auto', lineHeight: element.lineHeight || 1.5, fontFamily: element.fontFamily, letterSpacing: element.letterSpacing ? element.letterSpacing + 'px' : 'normal', textAlign: element.textAlign || 'left', whiteSpace: 'pre-wrap', wordBreak: 'break-word', cursor: isPageNumber ? 'default' : 'text' }
    }, displayValue);
  }

  if (element.type === 'text' && !element.editable) {
    return React.createElement('div', {
      key: idx,
      className: 'absolute whitespace-pre-wrap',
      style: { left: element.x + 'px', top: element.y + 'px', fontSize: element.fontSize + 'px', fontWeight: element.fontWeight, color: element.fill, maxWidth: element.width ? element.width + 'px' : 'none', width: element.width ? element.width + 'px' : 'auto', lineHeight: element.lineHeight || 1.5, fontFamily: element.fontFamily, letterSpacing: element.letterSpacing ? element.letterSpacing + 'px' : 'normal', textAlign: element.textAlign || 'left' }
    }, element.content);
  }

  if (element.type === 'image' && !element.editable) {
    return React.createElement('div', { key: idx, className: 'absolute', style: { left: element.x + 'px', top: element.y + 'px', width: element.width + 'px', height: element.height + 'px' } },
      React.createElement('img', { src: element.url, alt: '', className: 'w-full h-full object-contain' })
    );
  }

  if (element.type === 'line') {
    var lx = Math.min(element.x1, element.x2);
    var ly = Math.min(element.y1, element.y2);
    var lw = Math.abs(element.x2 - element.x1);
    var lh = Math.abs(element.y2 - element.y1);
    return React.createElement('svg', { key: idx, style: { position: 'absolute', left: lx + 'px', top: ly + 'px', width: lw + 'px', height: lh + 'px', overflow: 'visible' } },
      React.createElement('line', {
        x1: element.x1 < element.x2 ? 0 : lw, y1: element.y1 < element.y2 ? 0 : lh,
        x2: element.x1 < element.x2 ? lw : 0, y2: element.y1 < element.y2 ? lh : 0,
        stroke: element.stroke, strokeWidth: element.strokeWidth
      })
    );
  }

  return null;
}
