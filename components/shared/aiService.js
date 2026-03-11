// aiService.js — AI API 연동 (OpenAI / Gemini)

/**
 * 슬라이드 스키마를 자동 생성
 * 각 슬라이드의 editable text 필드를 추출하여 AI가 채울 수 있는 구조로 변환
 */
function buildSlideSchema(slides) {
  return slides.map(function(slide, idx) {
    var template = ALL_TEMPLATES[slide.templateId];
    if (!template) return null;

    var schema = {
      slideIndex: idx,
      templateId: slide.templateId,
      category: template.category,
      fields: {}
    };

    // editable text 필드 추출
    template.elements.forEach(function(el, elIdx) {
      if (el.type === 'text' && el.editable) {
        var key = 'text_' + elIdx;
        schema.fields[key] = {
          type: 'text',
          defaultContent: el.content,
          fontSize: el.fontSize,
          maxLines: el.maxLines || null
        };
      }
    });

    // table01 특수 필드
    if (template.dynamicTable && template.defaultTable) {
      schema.fields['tableData'] = {
        type: 'table',
        description: 'Table with headers and rows',
        defaultValue: template.defaultTable
      };
    }

    // faq 특수 필드
    if (slide.templateId === 'faq01' || slide.templateId === 'faq02') {
      schema.fields['faqItems'] = {
        type: 'faq',
        description: 'FAQ items array with question and answer',
        defaultValue: [
          { id: 'faq1', question: 'Q1. 질문', answer: '답변' },
          { id: 'faq2', question: 'Q2. 질문', answer: '답변' },
          { id: 'faq3', question: 'Q3. 질문', answer: '답변' }
        ]
      };
    }

    return schema;
  }).filter(Boolean);
}

/**
 * 추가 슬라이드에 사용 가능한 템플릿 목록 생성
 */
function buildAvailableTemplateList() {
  var categories = {};
  Object.keys(ALL_TEMPLATES).forEach(function(id) {
    var t = ALL_TEMPLATES[id];
    if (!categories[t.category]) categories[t.category] = [];
    // 각 템플릿의 editable text 필드 수 계산
    var editableCount = 0;
    t.elements.forEach(function(el) {
      if (el.type === 'text' && el.editable) editableCount++;
    });
    categories[t.category].push({
      id: t.id,
      name: t.name,
      editableFields: editableCount,
      hasTable: !!(t.dynamicTable),
      hasFaq: (id.indexOf('faq') === 0)
    });
  });
  return categories;
}

/**
 * 새 슬라이드용 스키마 생성 (templateId 기준)
 */
function buildNewSlideSchema(templateId) {
  var template = ALL_TEMPLATES[templateId];
  if (!template) return null;

  var fields = {};
  template.elements.forEach(function(el, elIdx) {
    if (el.type === 'text' && el.editable) {
      var key = 'text_' + elIdx;
      fields[key] = el.content;
    }
  });

  if (template.dynamicTable && template.defaultTable) {
    fields['tableData'] = '{ "headers": [...], "rows": [{"label": "...", "cells": [...]}] }';
  }
  if (templateId.indexOf('faq') === 0) {
    fields['faqItems'] = '[{"id": "faq1", "question": "Q1. 질문?", "answer": "답변"}, ...]';
  }

  return fields;
}

/**
 * AI 프롬프트 생성
 */
function buildAIPrompt(schema, documentText) {
  var slideDescriptions = schema.map(function(s) {
    var fieldDescs = Object.keys(s.fields).map(function(key) {
      var f = s.fields[key];
      if (f.type === 'text') {
        var desc = '    "' + key + '": "' + f.defaultContent + '"';
        if (f.maxLines) desc += ' (최대 ' + f.maxLines + '줄)';
        return desc;
      }
      if (f.type === 'table') {
        return '    "tableData": { "headers": ["헤더1", "헤더2"], "rows": [{"label": "항목", "cells": ["값1", "값2"]}] }';
      }
      if (f.type === 'faq') {
        return '    "faqItems": [{"id": "faq1", "question": "Q1. 질문?", "answer": "답변"}]';
      }
      return '';
    }).filter(Boolean).join(',\n');

    return '  {\n    "slideIndex": ' + s.slideIndex + ',\n    "templateId": "' + s.templateId + '",\n    "category": "' + s.category + '",\n    "data": {\n' + fieldDescs + '\n    }\n  }';
  }).join(',\n');

  // 추가 슬라이드에 사용 가능한 템플릿 정보
  var availableTemplates = buildAvailableTemplateList();
  // Section Cover, Core Value, Mobile, PC, Table, FAQ만 추가 대상
  var addableCategories = ['Section Cover', 'Core Value', 'Mobile', 'PC', 'Table', 'FAQ'];
  var templateInfo = addableCategories.map(function(cat) {
    var templates = availableTemplates[cat];
    if (!templates) return '';
    var ids = templates.map(function(t) { return t.id; }).join(', ');
    return '  - ' + cat + ': [' + ids + ']';
  }).filter(Boolean).join('\n');

  return '당신은 회사 소개서 슬라이드 콘텐츠를 생성하는 전문가입니다.\n\n' +
    '아래는 업로드된 회사 소개 문서에서 추출한 텍스트입니다:\n' +
    '---\n' + documentText.substring(0, 8000) + '\n---\n\n' +
    '아래 슬라이드 구조에 맞게 문서 내용을 분석하여 적절한 텍스트를 채워주세요.\n' +
    '각 슬라이드의 category와 용도에 맞는 내용을 배치해야 합니다.\n\n' +
    '슬라이드 구조:\n[\n' + slideDescriptions + '\n]\n\n' +
    '추가 슬라이드용 템플릿 (사용 가능한 templateId):\n' + templateInfo + '\n\n' +
    '규칙:\n' +
    '1. 반드시 아래 JSON 형태로 응답하세요:\n' +
    '   { "existing": [...], "newSlides": [...] }\n' +
    '2. "existing" 배열: 기존 슬라이드 데이터 (위 구조와 동일한 형태)\n' +
    '3. "newSlides" 배열: 문서 내용이 기존 슬라이드에 다 담기지 않을 때 추가할 슬라이드\n' +
    '   각 항목 형태: { "templateId": "corevalue01", "insertAfter": 2, "data": { "text_1": "...", ... } }\n' +
    '   - templateId: 위 추가 슬라이드용 템플릿 중 선택\n' +
    '   - insertAfter: 기존 슬라이드 인덱스 뒤에 삽입 (0부터 시작)\n' +
    '   - data: 해당 템플릿의 editable text 필드를 text_0, text_1, ... 형태로 채우기\n' +
    '4. 추가 슬라이드는 문서에 내용이 충분할 때만 만들고, 최대 5개까지만 추가하세요.\n' +
    '5. 추가 슬라이드의 insertAfter는 내용 흐름에 맞는 위치를 선택하세요:\n' +
    '   - 핵심 가치/강점이 더 있으면 Core Value 슬라이드 뒤에\n' +
    '   - 제품 기능이 더 있으면 Mobile/PC 슬라이드 뒤에\n' +
    '   - 서비스 비교가 더 있으면 Table 슬라이드 뒤에\n' +
    '   - 새 섹션이 필요하면 Section Cover를 먼저 추가\n' +
    '6. Main Cover: 회사명과 핵심 슬로건을 배치하세요.\n' +
    '7. Index: 소개서의 목차를 구성하세요.\n' +
    '8. Core Value: 회사의 핵심 가치나 강점을 배치하세요.\n' +
    '9. Table: 서비스 비교나 요금 등 표로 정리할 수 있는 내용을 배치하세요.\n' +
    '10. Section Cover: 각 섹션의 제목을 배치하세요.\n' +
    '11. Mobile/PC: 제품의 주요 기능과 설명을 배치하세요.\n' +
    '12. FAQ: 자주 묻는 질문과 답변을 생성하세요.\n' +
    '13. Contact: 연락처 정보를 배치하세요.\n' +
    '14. Final Cover: 마무리 메시지를 배치하세요.\n' +
    '15. 문서에 해당 내용이 없으면 적절한 기본값을 유지하세요.\n' +
    '16. 한국어로 작성하세요.\n' +
    '17. faqItems가 있는 슬라이드는 faqItems 배열만 채우고 text_ 필드는 카테고리/제목 필드만 채우세요.\n' +
    '18. tableData가 있는 슬라이드는 tableData만 채우고 text_ 필드는 제목만 채우세요.\n' +
    '19. 문서 내용이 적으면 newSlides는 빈 배열로 두세요. 억지로 만들지 마세요.\n\n' +
    'JSON 객체만 응답하세요. 다른 텍스트는 포함하지 마세요.';
}

/**
 * OpenAI API 호출
 */
async function callOpenAI(apiKey, prompt) {
  var response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + apiKey
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a JSON-only response bot. Always respond with a valid JSON object only. No markdown, no explanation.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 8000
    })
  });

  if (!response.ok) {
    var err = await response.json().catch(function() { return {}; });
    throw new Error('OpenAI API 오류: ' + (err.error?.message || response.statusText));
  }

  var result = await response.json();
  var content = result.choices[0].message.content.trim();
  return parseAIResponse(content);
}

/**
 * Google Gemini API 호출
 */
async function callGemini(apiKey, prompt) {
  var response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + apiKey, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 8000
      }
    })
  });

  if (!response.ok) {
    var err = await response.json().catch(function() { return {}; });
    throw new Error('Gemini API 오류: ' + (err.error?.message || response.statusText));
  }

  var result = await response.json();
  var content = result.candidates[0].content.parts[0].text.trim();
  return parseAIResponse(content);
}

/**
 * AI 응답에서 JSON 추출 및 파싱
 * 새 형태: { existing: [...], newSlides: [...] }
 * 구 형태: [...] (하위 호환)
 */
function parseAIResponse(content) {
  // markdown 코드블록 제거
  var cleaned = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();

  // 객체 형태 시도 { existing: ..., newSlides: ... }
  var objStart = cleaned.indexOf('{');
  var objEnd = cleaned.lastIndexOf('}');
  if (objStart !== -1 && objEnd !== -1) {
    var jsonStr = cleaned.substring(objStart, objEnd + 1);
    try {
      var parsed = JSON.parse(jsonStr);
      if (parsed.existing && Array.isArray(parsed.existing)) {
        return parsed;
      }
      // 객체지만 existing 키가 없으면 배열 형태 시도
    } catch (e) {
      // 객체 파싱 실패 — 배열 형태 시도
    }
  }

  // 배열 형태 시도 (하위 호환)
  var arrStart = cleaned.indexOf('[');
  var arrEnd = cleaned.lastIndexOf(']');
  if (arrStart === -1 || arrEnd === -1) {
    throw new Error('AI 응답에서 JSON을 찾을 수 없습니다.');
  }

  var arrStr = cleaned.substring(arrStart, arrEnd + 1);
  try {
    var arr = JSON.parse(arrStr);
    return { existing: arr, newSlides: [] };
  } catch (e) {
    throw new Error('AI 응답 JSON 파싱 실패: ' + e.message);
  }
}

/**
 * AI 응답을 슬라이드 데이터에 매핑
 * aiParsed: { existing: [...], newSlides: [...] }
 */
function mapAIResponseToSlides(aiParsed, currentSlides) {
  var existingData = aiParsed.existing || [];
  var newSlideRequests = aiParsed.newSlides || [];

  // 1) 기존 슬라이드에 데이터 매핑
  var resultSlides = currentSlides.map(function(slide) {
    return { id: slide.id, templateId: slide.templateId, data: { ...(slide.data || {}) } };
  });

  existingData.forEach(function(item) {
    var idx = item.slideIndex;
    if (idx < 0 || idx >= resultSlides.length) return;
    if (!item.data) return;

    var slideData = resultSlides[idx].data;
    Object.keys(item.data).forEach(function(key) {
      slideData[key] = item.data[key];
    });
  });

  // 2) 새 슬라이드 삽입 (뒤에서부터 삽입하여 인덱스 밀림 방지)
  // 유효성 검증 + 최대 5개 제한
  var validNewSlides = newSlideRequests.filter(function(ns) {
    return ns.templateId && ALL_TEMPLATES[ns.templateId] && ns.data &&
      typeof ns.insertAfter === 'number' && ns.insertAfter >= 0;
  }).slice(0, 5);

  // insertAfter 기준 내림차순 정렬 (뒤에서부터 삽입)
  validNewSlides.sort(function(a, b) { return b.insertAfter - a.insertAfter; });

  validNewSlides.forEach(function(ns) {
    var insertIdx = Math.min(ns.insertAfter + 1, resultSlides.length);
    var newSlide = {
      id: 'ai_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      templateId: ns.templateId,
      data: ns.data || {}
    };
    resultSlides.splice(insertIdx, 0, newSlide);
  });

  return resultSlides;
}

/**
 * 전체 AI 콘텐츠 매핑 오케스트레이터
 */
async function mapContentToSlides(provider, apiKey, slides, documentText) {
  var schema = buildSlideSchema(slides);
  var prompt = buildAIPrompt(schema, documentText);

  var aiResponse;
  if (provider === 'openai') {
    aiResponse = await callOpenAI(apiKey, prompt);
  } else if (provider === 'gemini') {
    aiResponse = await callGemini(apiKey, prompt);
  } else {
    throw new Error('지원하지 않는 AI 제공자입니다.');
  }

  return mapAIResponseToSlides(aiResponse, slides);
}
