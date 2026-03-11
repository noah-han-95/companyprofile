// React hooks (shared across all component files)
var { useState, useEffect, useRef } = React;

// PDF.js 초기화
if (window.pdfjsLib) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

// ==================== 통합 소개서 템플릿 (완전 동일하게) ====================
var TEMPLATES = {
  // Mobile Templates (4개)
  mobile01: {
    id: 'mobile01',
    name: 'Type 01',
    category: 'Mobile',
    penId: 'x7DJW',
    elements: [
      { type: 'rect', x: 0, y: 0, width: 1920, height: 1080, fill: '#FFFFFF' },
      { type: 'text', x: 120, y: 100, content: '주요장점', fontSize: 32, fontWeight: '700', fill: '#BBBBBB', fontFamily: 'Pretendard', letterSpacing: -0.32, lineHeight: 1.3, editable: true },
      { type: 'text', x: 120, y: 152, content: '모바일로 더 편리하게', fontSize: 48, fontWeight: '700', fill: '#333333', fontFamily: 'Pretendard', letterSpacing: -0.48, lineHeight: 1.3, editable: true },
      { type: 'text', x: 120, y: 241, content: '모바일 환경에 최적화된 인터페이스로 더욱 편리하게 이용할 수 있습니다.', fontSize: 32, fontWeight: '500', fill: '#666666', fontFamily: 'Pretendard', letterSpacing: -0.32, lineHeight: 1.5, width: 418, editable: true },
      { type: 'rect', x: 745, y: 195, width: 375, height: 730, fill: '#FFFFFF', cornerRadius: 24, stroke: '#333333', strokeWidth: 12 },
      { type: 'image', x: 757, y: 207, width: 351, height: 706, placeholder: true, editable: true },
      { type: 'text', x: 1250, y: 280, content: '빠른 예약 처리', fontSize: 32, fontWeight: '700', fill: '#333333', fontFamily: 'Pretendard', letterSpacing: -0.32, lineHeight: 1.5, editable: true },
      { type: 'text', x: 1250, y: 332, content: '실시간으로 예약을 확인하고\n언제 어디서나 빠르게 관리할 수 있습니다', fontSize: 20, fontWeight: '500', fill: '#666666', fontFamily: 'Pretendard', letterSpacing: -0.2, lineHeight: 1.4, editable: true },
      { type: 'text', x: 1250, y: 500, content: '간편한 관리 시스템', fontSize: 32, fontWeight: '700', fill: '#333333', fontFamily: 'Pretendard', letterSpacing: -0.32, lineHeight: 1.5, editable: true },
      { type: 'text', x: 1250, y: 552, content: '모든 예약 정보를 한눈에 확인하고\n효율적으로 운영할 수 있습니다', fontSize: 20, fontWeight: '500', fill: '#666666', fontFamily: 'Pretendard', letterSpacing: -0.2, lineHeight: 1.4, editable: true },
      { type: 'text', x: 1250, y: 720, content: '스마트 알림', fontSize: 32, fontWeight: '700', fill: '#333333', fontFamily: 'Pretendard', letterSpacing: -0.32, lineHeight: 1.5, editable: true },
      { type: 'text', x: 1250, y: 772, content: '예약 변경 및 새로운 예약 발생 시\n즉시 알림을 받아볼 수 있습니다', fontSize: 20, fontWeight: '500', fill: '#666666', fontFamily: 'Pretendard', letterSpacing: -0.2, lineHeight: 1.4, editable: true },
      { type: 'image', x: 120, y: 991, width: 118, height: 20, url: 'assets/icons/yeogi-logo.svg' },
      { type: 'text', x: 260, y: 990, content: '2026 © GC Company Corp. All rights reserved.', fontSize: 20, fontWeight: '500', fill: '#BBBBBB', fontFamily: 'Pretendard', letterSpacing: -0.2, lineHeight: 1.4 },
      { type: 'text', x: 1680, y: 990, content: 'P1', fontSize: 20, fontWeight: '500', fill: '#999999', fontFamily: 'Pretendard', letterSpacing: -0.2, lineHeight: 1.4, editable: true, textAlign: 'right', width: 120 }
    ]
  },
  mobile02: {
    id: 'mobile02',
    name: 'Type 02',
    category: 'Mobile',
    penId: '5rx6P',
    elements: [
      { type: 'rect', x: 0, y: 0, width: 1920, height: 1080, fill: '#FFFFFF' },
      { type: 'rect', x: 611, y: 0, width: 1309, height: 1080, fill: '#F7F7F7' },
      { type: 'text', x: 120, y: 100, content: '주요장점', fontSize: 32, fontWeight: '700', fill: '#BBBBBB', fontFamily: 'Pretendard', letterSpacing: -0.32, lineHeight: 1.3, editable: true },
      { type: 'text', x: 120, y: 152, content: '서비스 비교 분석', fontSize: 48, fontWeight: '700', fill: '#333333', fontFamily: 'Pretendard', letterSpacing: -0.48, lineHeight: 1.3, editable: true },
      { type: 'text', x: 120, y: 241, content: '두 가지 버전을 비교하여 사용자 경험의 차이를 명확하게 확인할 수 있습니다.', fontSize: 32, fontWeight: '500', fill: '#666666', fontFamily: 'Pretendard', letterSpacing: -0.32, lineHeight: 1.5, width: 418, editable: true },
      { type: 'text', x: 829, y: 118, content: '01. 첫 번째 화면', fontSize: 32, fontWeight: '700', fill: '#333333', fontFamily: 'Pretendard', letterSpacing: -0.32, lineHeight: 1.5, width: 375, editable: true },
      { type: 'text', x: 829, y: 179, content: '주요 기능을 한눈에 확인하고 빠르게 접근', fontSize: 20, fontWeight: '500', fill: '#666666', fontFamily: 'Pretendard', letterSpacing: -0.2, lineHeight: 1.5, width: 375, editable: true },
      { type: 'rect', x: 829, y: 256, width: 375, height: 705, fill: '#FFFFFF', cornerRadius: 24, stroke: '#333333', strokeWidth: 12 },
      { type: 'image', x: 841, y: 268, width: 351, height: 681, placeholder: true, editable: true },
      { type: 'text', x: 1328, y: 118, content: '02. 두 번째 화면', fontSize: 32, fontWeight: '700', fill: '#333333', fontFamily: 'Pretendard', letterSpacing: -0.32, lineHeight: 1.5, width: 375, editable: true },
      { type: 'text', x: 1328, y: 179, content: '주요 기능을 한눈에 확인하고 빠르게 접근', fontSize: 20, fontWeight: '500', fill: '#666666', fontFamily: 'Pretendard', letterSpacing: -0.2, lineHeight: 1.5, width: 375, editable: true },
      { type: 'rect', x: 1328, y: 256, width: 375, height: 705, fill: '#FFFFFF', cornerRadius: 24, stroke: '#333333', strokeWidth: 12 },
      { type: 'image', x: 1340, y: 268, width: 351, height: 681, placeholder: true, editable: true },
      { type: 'image', x: 120, y: 991, width: 118, height: 20, url: 'assets/icons/yeogi-logo.svg' },
      { type: 'text', x: 260, y: 990, content: '2026 © GC Company Corp. All rights reserved.', fontSize: 20, fontWeight: '500', fill: '#BBBBBB', fontFamily: 'Pretendard', letterSpacing: -0.2, lineHeight: 1.4 },
      { type: 'text', x: 1680, y: 990, content: 'P1', fontSize: 20, fontWeight: '500', fill: '#999999', fontFamily: 'Pretendard', letterSpacing: -0.2, lineHeight: 1.4, editable: true, textAlign: 'right', width: 120 }
    ]
  },
  mobile03: {
    id: 'mobile03',
    name: 'Type 03',
    category: 'Mobile',
    penId: 'E4jLR',
    elements: [
      { type: 'rect', x: 0, y: 0, width: 1920, height: 1080, fill: '#FFFFFF' },
      { type: 'text', x: 120, y: 100, content: '주요장점', fontSize: 32, fontWeight: '700', fill: '#BBBBBB', fontFamily: 'Pretendard', letterSpacing: -0.32, lineHeight: 1.3, editable: true },
      { type: 'text', x: 120, y: 152, content: '다양한 화면 구성', fontSize: 48, fontWeight: '700', fill: '#333333', fontFamily: 'Pretendard', letterSpacing: -0.48, lineHeight: 1.3, editable: true },
      { type: 'text', x: 134, y: 295, content: '01. 첫 번째 화면', fontSize: 32, fontWeight: '700', fill: '#333333', fontFamily: 'Pretendard', letterSpacing: -0.32, lineHeight: 1.5, width: 480, editable: true },
      { type: 'text', x: 134, y: 356, content: '주요 기능을 한눈에 확인하고 빠르게 접근할 수 있습니다.\n직관적인 인터페이스로 원하는 작업을 쉽게 시작하세요.', fontSize: 20, fontWeight: '500', fill: '#666666', fontFamily: 'Pretendard', letterSpacing: -0.24, lineHeight: 1.5, width: 480, editable: true },
      { type: 'rect', x: 134, y: 467, width: 480, height: 792, fill: '#FFFFFF', cornerRadius: 24, stroke: '#333333', strokeWidth: 12 },
      { type: 'image', x: 146, y: 479, width: 456, height: 768, placeholder: true, editable: true },
      { type: 'text', x: 720, y: 295, content: '02. 두 번째 화면', fontSize: 32, fontWeight: '700', fill: '#333333', fontFamily: 'Pretendard', letterSpacing: -0.32, lineHeight: 1.5, width: 480, editable: true },
      { type: 'text', x: 720, y: 356, content: '상세 정보를 확인하고 필요한 작업을 수행합니다. 다양한 옵션과 설정을 통해 세밀한 조정이 가능합니다.', fontSize: 20, fontWeight: '500', fill: '#666666', fontFamily: 'Pretendard', letterSpacing: -0.24, lineHeight: 1.5, width: 480, editable: true },
      { type: 'rect', x: 720, y: 467, width: 480, height: 792, fill: '#FFFFFF', cornerRadius: 24, stroke: '#333333', strokeWidth: 12 },
      { type: 'image', x: 732, y: 479, width: 456, height: 768, placeholder: true, editable: true },
      { type: 'text', x: 1306, y: 295, content: '03. 세 번째 화면', fontSize: 32, fontWeight: '700', fill: '#333333', fontFamily: 'Pretendard', letterSpacing: -0.32, lineHeight: 1.5, width: 480, editable: true },
      { type: 'text', x: 1306, y: 356, content: '최종 결과를 확인하고 완료할 수 있습니다. 모든 변경사항을 검토하고 안전하게 저장하세요.', fontSize: 20, fontWeight: '500', fill: '#666666', fontFamily: 'Pretendard', letterSpacing: -0.24, lineHeight: 1.5, width: 480, editable: true },
      { type: 'rect', x: 1306, y: 467, width: 480, height: 792, fill: '#FFFFFF', cornerRadius: 24, stroke: '#333333', strokeWidth: 12 },
      { type: 'image', x: 1318, y: 479, width: 456, height: 768, placeholder: true, editable: true }
    ]
  },
  mobile04: {
    id: 'mobile04',
    name: 'Type 04',
    category: 'Mobile',
    penId: 'vyNMw',
    elements: [
      { type: 'rect', x: 0, y: 0, width: 1920, height: 1080, fill: '#FFFFFF' },
      { type: 'rect', x: 0, y: 375, width: 1920, height: 705, fill: '#F7F7F7' },
      { type: 'text', x: 120, y: 100, content: '주요장점', fontSize: 32, fontWeight: '700', fill: '#BBBBBB', fontFamily: 'Pretendard', letterSpacing: -0.32, lineHeight: 1.3, editable: true },
      { type: 'text', x: 120, y: 152, content: '예약률을 높이는\n다양한 노출 구좌', fontSize: 48, fontWeight: '700', fill: '#333333', fontFamily: 'Pretendard', letterSpacing: -0.48, lineHeight: 1.3, editable: true },
      { type: 'text', x: 739, y: 132, content: '원하는 기간동안 추가 수수료를 설정하여 다양한 노출 구좌를 확보해보세요.\n추천 영역, B2B 기획전 등 다양한 노출 혜택을 통해\n더 많은 고객에게 내 숙소를 알리고, 예약률을 높일 수 있어요.', fontSize: 32, fontWeight: '500', fill: '#666666', fontFamily: 'Pretendard', letterSpacing: -0.32, lineHeight: 1.5, editable: true },
      { type: 'text', x: 120, y: 478, content: 'Step 1', fontSize: 20, fontWeight: '700', fill: '#333333', fontFamily: 'Pretendard', letterSpacing: -0.24, editable: true },
      { type: 'text', x: 120, y: 513, content: '추가 노출을 통해 예약 기회 확대', fontSize: 20, fontWeight: '500', fill: '#666666', fontFamily: 'Pretendard', letterSpacing: -0.24, editable: true },
      { type: 'rect', x: 120, y: 586, width: 346, height: 600, fill: '#FFFFFF', cornerRadius: 24, stroke: '#333333', strokeWidth: 12 },
      { type: 'image', x: 132, y: 598, width: 322, height: 576, placeholder: true, editable: true },
      { type: 'text', x: 566, y: 478, content: 'Step 2', fontSize: 20, fontWeight: '700', fill: '#333333', fontFamily: 'Pretendard', letterSpacing: -0.24, editable: true },
      { type: 'text', x: 566, y: 513, content: '기업 고객 대상 특별 프로모션', fontSize: 20, fontWeight: '500', fill: '#666666', fontFamily: 'Pretendard', letterSpacing: -0.24, editable: true },
      { type: 'rect', x: 566, y: 586, width: 346, height: 600, fill: '#FFFFFF', cornerRadius: 24, stroke: '#333333', strokeWidth: 12 },
      { type: 'image', x: 578, y: 598, width: 322, height: 576, placeholder: true, editable: true },
      { type: 'text', x: 1012, y: 478, content: 'Step 3', fontSize: 20, fontWeight: '700', fill: '#333333', fontFamily: 'Pretendard', letterSpacing: -0.24, editable: true },
      { type: 'text', x: 1012, y: 513, content: '상위 랭킹으로 가시성 향상', fontSize: 20, fontWeight: '500', fill: '#666666', fontFamily: 'Pretendard', letterSpacing: -0.24, editable: true },
      { type: 'rect', x: 1012, y: 586, width: 346, height: 600, fill: '#FFFFFF', cornerRadius: 24, stroke: '#333333', strokeWidth: 12 },
      { type: 'image', x: 1024, y: 598, width: 322, height: 576, placeholder: true, editable: true },
      { type: 'text', x: 1458, y: 478, content: 'Step 4', fontSize: 20, fontWeight: '700', fill: '#333333', fontFamily: 'Pretendard', letterSpacing: -0.24, editable: true },
      { type: 'text', x: 1458, y: 513, content: '타겟 고객에게 직접 리치', fontSize: 20, fontWeight: '500', fill: '#666666', fontFamily: 'Pretendard', letterSpacing: -0.24, editable: true },
      { type: 'rect', x: 1458, y: 586, width: 346, height: 600, fill: '#FFFFFF', cornerRadius: 24, stroke: '#333333', strokeWidth: 12 },
      { type: 'image', x: 1470, y: 598, width: 322, height: 576, placeholder: true, editable: true }
    ]
  },

  // PC Templates (4개)
  pc01: {
    id: 'pc01',
    name: 'Type 01',
    category: 'PC',
    penId: '1au4g',
    elements: [
      { type: 'rect', x: 0, y: 0, width: 1920, height: 1080, fill: '#FFFFFF' },
      { type: 'text', x: 120, y: 100, content: '주요장점', fontSize: 32, fontWeight: '700', fill: '#BBBBBB', fontFamily: 'Pretendard', letterSpacing: -0.32, lineHeight: 1.3, editable: true },
      { type: 'text', x: 120, y: 152, content: 'PC 버전 메인 화면 소개', fontSize: 48, fontWeight: '700', fill: '#333333', fontFamily: 'Pretendard', letterSpacing: -0.48, lineHeight: 1.3, editable: true },
      { type: 'text', x: 739, y: 132, content: '원하는 기간동안 추가 수수료를 설정하여 다양한 노출 구좌를 확보해보세요.\n추천 영역, B2B 기획전 등 다양한 노출 혜택을 통해\n더 많은 고객에게 내 숙소를 알리고, 예약률을 높일 수 있어요.', fontSize: 32, fontWeight: '500', fill: '#666666', fontFamily: 'Pretendard', letterSpacing: -0.32, lineHeight: 1.5, editable: true },
      { type: 'rect', x: 335, y: 399, width: 1250, height: 918, fill: '#FFFFFF', cornerRadius: 24, stroke: '#333333', strokeWidth: 11 },
      { type: 'image', x: 346, y: 410, width: 1228, height: 896, placeholder: true, editable: true },
      { type: 'image', x: 120, y: 991, width: 118, height: 20, url: 'assets/icons/yeogi-logo.svg' },
      { type: 'text', x: 260, y: 990, content: '2026 © GC Company Corp. All rights reserved.', fontSize: 20, fontWeight: '500', fill: '#BBBBBB', fontFamily: 'Pretendard', letterSpacing: -0.2, lineHeight: 1.4 },
      { type: 'text', x: 1680, y: 990, content: 'P1', fontSize: 20, fontWeight: '500', fill: '#999999', fontFamily: 'Pretendard', letterSpacing: -0.2, lineHeight: 1.4, editable: true, textAlign: 'right', width: 120 }
    ]
  },
  pc02: {
    id: 'pc02',
    name: 'Type 02',
    category: 'PC',
    penId: '6x9U1',
    elements: [
      { type: 'rect', x: 0, y: 0, width: 1920, height: 1080, fill: '#FFFFFF' },
      { type: 'text', x: 120, y: 100, content: '주요장점', fontSize: 32, fontWeight: '700', fill: '#BBBBBB', fontFamily: 'Pretendard', letterSpacing: -0.32, lineHeight: 1.3, editable: true },
      { type: 'text', x: 120, y: 152, content: '서비스 비교 분석 화면', fontSize: 48, fontWeight: '700', fill: '#333333', fontFamily: 'Pretendard', letterSpacing: -0.48, lineHeight: 1.3, editable: true },
      { type: 'text', x: 739, y: 132, content: '원하는 기간동안 추가 수수료를 설정하여 다양한 노출 구좌를 확보해보세요.\n추천 영역, B2B 기획전 등 다양한 노출 혜택을 통해\n더 많은 고객에게 내 숙소를 알리고, 예약률을 높일 수 있어요.', fontSize: 32, fontWeight: '500', fill: '#666666', fontFamily: 'Pretendard', letterSpacing: -0.32, lineHeight: 1.5, editable: true },
      { type: 'rect', x: 137, y: 400, width: 805, height: 539, fill: '#FFFFFF', cornerRadius: 24, stroke: '#333333', strokeWidth: 11 },
      { type: 'rect', x: 148, y: 411, width: 783, height: 60, fill: '#FFF3E0' },
      { type: 'image', x: 148, y: 471, width: 783, height: 457, placeholder: true, editable: true },
      { type: 'rect', x: 1005, y: 400, width: 805, height: 539, fill: '#FFFFFF', cornerRadius: 24, stroke: '#333333', strokeWidth: 11 },
      { type: 'rect', x: 1016, y: 411, width: 783, height: 60, fill: '#E8F5E9' },
      { type: 'image', x: 1016, y: 471, width: 783, height: 457, placeholder: true, editable: true },
      { type: 'image', x: 120, y: 991, width: 118, height: 20, url: 'assets/icons/yeogi-logo.svg' },
      { type: 'text', x: 260, y: 990, content: '2026 © GC Company Corp. All rights reserved.', fontSize: 20, fontWeight: '500', fill: '#BBBBBB', fontFamily: 'Pretendard', letterSpacing: -0.2, lineHeight: 1.4 },
      { type: 'text', x: 1680, y: 990, content: 'P1', fontSize: 20, fontWeight: '500', fill: '#999999', fontFamily: 'Pretendard', letterSpacing: -0.2, lineHeight: 1.4, editable: true, textAlign: 'right', width: 120 }
    ]
  },
  pc03: {
    id: 'pc03',
    name: 'Type 03',
    category: 'PC',
    penId: 'pq3Xe',
    elements: [
      { type: 'rect', x: 0, y: 0, width: 1920, height: 1080, fill: '#FFFFFF' },
      { type: 'text', x: 120, y: 100, content: '주요장점', fontSize: 32, fontWeight: '700', fill: '#BBBBBB', fontFamily: 'Pretendard', letterSpacing: -0.32, lineHeight: 1.3, editable: true },
      { type: 'text', x: 120, y: 152, content: '반응형 디자인 구현 사례', fontSize: 48, fontWeight: '700', fill: '#333333', fontFamily: 'Pretendard', letterSpacing: -0.48, lineHeight: 1.3, editable: true },
      { type: 'text', x: 739, y: 132, content: '원하는 기간동안 추가 수수료를 설정하여 다양한 노출 구좌를 확보해보세요.\n추천 영역, B2B 기획전 등 다양한 노출 혜택을 통해\n더 많은 고객에게 내 숙소를 알리고, 예약률을 높일 수 있어요.', fontSize: 32, fontWeight: '500', fill: '#666666', fontFamily: 'Pretendard', letterSpacing: -0.32, lineHeight: 1.5, editable: true },
      { type: 'rect', x: 237, y: 400, width: 1084, height: 539, fill: '#FFFFFF', cornerRadius: 24, stroke: '#333333', strokeWidth: 11 },
      { type: 'rect', x: 248, y: 411, width: 1062, height: 70, fill: '#F3E5F5' },
      { type: 'image', x: 248, y: 481, width: 1062, height: 447, placeholder: true, editable: true },
      { type: 'rect', x: 1384, y: 400, width: 299, height: 539, fill: '#FFFFFF', cornerRadius: 24, stroke: '#333333', strokeWidth: 11 },
      { type: 'rect', x: 1395, y: 411, width: 277, height: 70, fill: '#E3F2FD' },
      { type: 'image', x: 1395, y: 481, width: 277, height: 447, placeholder: true, editable: true },
      { type: 'image', x: 120, y: 991, width: 118, height: 20, url: 'assets/icons/yeogi-logo.svg' },
      { type: 'text', x: 260, y: 990, content: '2026 © GC Company Corp. All rights reserved.', fontSize: 20, fontWeight: '500', fill: '#BBBBBB', fontFamily: 'Pretendard', letterSpacing: -0.2, lineHeight: 1.4 },
      { type: 'text', x: 1680, y: 990, content: 'P1', fontSize: 20, fontWeight: '500', fill: '#999999', fontFamily: 'Pretendard', letterSpacing: -0.2, lineHeight: 1.4, editable: true, textAlign: 'right', width: 120 }
    ]
  },
  pc04: {
    id: 'pc04',
    name: 'Type 04',
    category: 'PC',
    penId: 'iUFcs',
    elements: [
      { type: 'rect', x: 0, y: 0, width: 1920, height: 1080, fill: '#FFFFFF' },
      { type: 'text', x: 120, y: 100, content: '주요장점', fontSize: 32, fontWeight: '700', fill: '#BBBBBB', fontFamily: 'Pretendard', letterSpacing: -0.32, lineHeight: 1.3, editable: true },
      { type: 'text', x: 120, y: 152, content: '주요 기능 상세 설명', fontSize: 48, fontWeight: '700', fill: '#333333', fontFamily: 'Pretendard', letterSpacing: -0.48, lineHeight: 1.3, editable: true },
      { type: 'text', x: 739, y: 132, content: '원하는 기간동안 추가 수수료를 설정하여 다양한 노출 구좌를 확보해보세요.\n추천 영역, B2B 기획전 등 다양한 노출 혜택을 통해\n더 많은 고객에게 내 숙소를 알리고, 예약률을 높일 수 있어요.', fontSize: 32, fontWeight: '500', fill: '#666666', fontFamily: 'Pretendard', letterSpacing: -0.32, lineHeight: 1.5, editable: true },
      { type: 'rect', x: 120, y: 400, width: 720, height: 321, fill: '#FFFFFF', cornerRadius: 12, stroke: '#333333', strokeWidth: 11 },
      { type: 'text', x: 160, y: 450, content: '주요 기능 목록', fontSize: 32, fontWeight: '700', fill: '#333333', fontFamily: 'Pretendard', letterSpacing: -0.32, lineHeight: 1.5, editable: true },
      { type: 'rect', x: 903, y: 400, width: 900, height: 539, fill: '#FFFFFF', cornerRadius: 24, stroke: '#333333', strokeWidth: 11 },
      { type: 'rect', x: 914, y: 411, width: 878, height: 60, fill: '#FFF9C4' },
      { type: 'image', x: 914, y: 471, width: 878, height: 457, placeholder: true, editable: true },
      { type: 'image', x: 120, y: 991, width: 118, height: 20, url: 'assets/icons/yeogi-logo.svg' },
      { type: 'text', x: 260, y: 990, content: '2026 © GC Company Corp. All rights reserved.', fontSize: 20, fontWeight: '500', fill: '#BBBBBB', fontFamily: 'Pretendard', letterSpacing: -0.2, lineHeight: 1.4 },
      { type: 'text', x: 1680, y: 990, content: 'P1', fontSize: 20, fontWeight: '500', fill: '#999999', fontFamily: 'Pretendard', letterSpacing: -0.2, lineHeight: 1.4, editable: true, textAlign: 'right', width: 120 }
    ]
  },

  // FAQ Templates (2개)
  faq01: {
    id: 'faq01',
    name: 'Type 01',
    category: 'FAQ',
    penId: 'BZVHu',
    elements: [
      { type: 'rect', x: 0, y: 0, width: 1920, height: 1080, fill: '#FFFFFF' },
      { type: 'text', x: 120, y: 100, content: '고객지원', fontSize: 32, fontWeight: '700', fill: '#BBBBBB', fontFamily: 'Pretendard', letterSpacing: -0.32, lineHeight: 1.3, editable: true },
      { type: 'text', x: 120, y: 152, content: '자주 묻는 질문', fontSize: 48, fontWeight: '700', fill: '#333333', fontFamily: 'Pretendard', letterSpacing: -0.48, lineHeight: 1.3, editable: true },
      { type: 'rect', x: 120, y: 256, width: 820, height: 160, fill: '#F7F7F7', cornerRadius: 20 },
      { type: 'text', x: 163, y: 290, content: 'Q1. 질문을 입력하세요.', fontSize: 32, fontWeight: '700', fill: '#333333', fontFamily: 'Pretendard', letterSpacing: -0.32, lineHeight: 1.5, width: 657, editable: true },
      { type: 'text', x: 163, y: 348, content: '답변을 입력하세요.', fontSize: 20, fontWeight: '500', fill: '#666666', fontFamily: 'Pretendard', letterSpacing: -0.2, lineHeight: 1.5, width: 585, editable: true },
      { type: 'rect', x: 980, y: 256, width: 820, height: 160, fill: '#F7F7F7', cornerRadius: 20 },
      { type: 'text', x: 1023, y: 290, content: 'Q2. 질문을 입력하세요.', fontSize: 32, fontWeight: '700', fill: '#333333', fontFamily: 'Pretendard', letterSpacing: -0.32, lineHeight: 1.5, width: 657, editable: true },
      { type: 'text', x: 1023, y: 348, content: '답변을 입력하세요.', fontSize: 20, fontWeight: '500', fill: '#666666', fontFamily: 'Pretendard', letterSpacing: -0.2, lineHeight: 1.5, width: 414, editable: true },
      { type: 'rect', x: 120, y: 436, width: 820, height: 160, fill: '#F7F7F7', cornerRadius: 20 },
      { type: 'text', x: 163, y: 470, content: 'Q3. 질문을 입력하세요.', fontSize: 32, fontWeight: '700', fill: '#333333', fontFamily: 'Pretendard', letterSpacing: -0.32, lineHeight: 1.5, width: 657, editable: true },
      { type: 'text', x: 163, y: 528, content: '답변을 입력하세요.', fontSize: 20, fontWeight: '500', fill: '#666666', fontFamily: 'Pretendard', letterSpacing: -0.2, lineHeight: 1.5, width: 588, editable: true },
      { type: 'rect', x: 980, y: 436, width: 820, height: 160, fill: '#F7F7F7', cornerRadius: 20 },
      { type: 'text', x: 1023, y: 470, content: 'Q4. 질문을 입력하세요.', fontSize: 32, fontWeight: '700', fill: '#333333', fontFamily: 'Pretendard', letterSpacing: -0.32, lineHeight: 1.5, width: 657, editable: true },
      { type: 'text', x: 1023, y: 528, content: '답변을 입력하세요.', fontSize: 20, fontWeight: '500', fill: '#666666', fontFamily: 'Pretendard', letterSpacing: -0.2, lineHeight: 1.5, width: 663, editable: true },
      { type: 'rect', x: 120, y: 616, width: 820, height: 160, fill: '#F7F7F7', cornerRadius: 20 },
      { type: 'text', x: 163, y: 650, content: 'Q5. 질문을 입력하세요.', fontSize: 32, fontWeight: '700', fill: '#333333', fontFamily: 'Pretendard', letterSpacing: -0.32, lineHeight: 1.5, width: 657, editable: true },
      { type: 'text', x: 163, y: 708, content: '답변을 입력하세요.', fontSize: 20, fontWeight: '500', fill: '#666666', fontFamily: 'Pretendard', letterSpacing: -0.2, lineHeight: 1.5, width: 663, editable: true },
      { type: 'rect', x: 980, y: 616, width: 820, height: 160, fill: '#F7F7F7', cornerRadius: 20 },
      { type: 'text', x: 1023, y: 650, content: 'Q6. 질문을 입력하세요.', fontSize: 32, fontWeight: '700', fill: '#333333', fontFamily: 'Pretendard', letterSpacing: -0.32, lineHeight: 1.5, width: 657, editable: true },
      { type: 'text', x: 1023, y: 708, content: '답변을 입력하세요.', fontSize: 20, fontWeight: '500', fill: '#666666', fontFamily: 'Pretendard', letterSpacing: -0.2, lineHeight: 1.5, width: 663, editable: true },
      { type: 'rect', x: 120, y: 796, width: 820, height: 160, fill: '#F7F7F7', cornerRadius: 20 },
      { type: 'text', x: 163, y: 830, content: 'Q7. 질문을 입력하세요.', fontSize: 32, fontWeight: '700', fill: '#333333', fontFamily: 'Pretendard', letterSpacing: -0.32, lineHeight: 1.5, width: 657, editable: true },
      { type: 'text', x: 163, y: 888, content: '답변을 입력하세요.', fontSize: 20, fontWeight: '500', fill: '#666666', fontFamily: 'Pretendard', letterSpacing: -0.2, lineHeight: 1.5, width: 663, editable: true },
      { type: 'rect', x: 980, y: 796, width: 820, height: 160, fill: '#F7F7F7', cornerRadius: 20 },
      { type: 'text', x: 1023, y: 830, content: 'Q8. 질문을 입력하세요.', fontSize: 32, fontWeight: '700', fill: '#333333', fontFamily: 'Pretendard', letterSpacing: -0.32, lineHeight: 1.5, width: 657, editable: true },
      { type: 'text', x: 1023, y: 888, content: '답변을 입력하세요.', fontSize: 20, fontWeight: '500', fill: '#666666', fontFamily: 'Pretendard', letterSpacing: -0.2, lineHeight: 1.5, width: 663, editable: true },
      { type: 'image', x: 120, y: 991, width: 118, height: 20, url: 'assets/icons/yeogi-logo.svg' },
      { type: 'text', x: 260, y: 990, content: '2026 © GC Company Corp. All rights reserved.', fontSize: 20, fontWeight: '500', fill: '#BBBBBB', fontFamily: 'Pretendard', letterSpacing: -0.2, lineHeight: 1.4 },
      { type: 'text', x: 1680, y: 990, content: 'P1', fontSize: 20, fontWeight: '500', fill: '#999999', fontFamily: 'Pretendard', letterSpacing: -0.2, lineHeight: 1.4, editable: true, textAlign: 'right', width: 120 }
    ]
  },
  faq02: {
    id: 'faq02',
    name: 'Type 02',
    category: 'FAQ',
    penId: 'TFgFS',
    elements: [
      { type: 'rect', x: 0, y: 0, width: 1920, height: 1080, fill: '#FFFFFF' },
      { type: 'text', x: 120, y: 100, content: '고객지원', fontSize: 32, fontWeight: '700', fill: '#BBBBBB', fontFamily: 'Pretendard', letterSpacing: -0.32, lineHeight: 1.3, editable: true },
      { type: 'text', x: 120, y: 152, content: '자주 묻는 질문', fontSize: 48, fontWeight: '700', fill: '#333333', fontFamily: 'Pretendard', letterSpacing: -0.48, lineHeight: 1.3, editable: true },
      { type: 'text', x: 700, y: 120, content: 'Q1. 질문을 입력하세요.', fontSize: 32, fontWeight: '700', fill: '#333333', fontFamily: 'Pretendard', letterSpacing: -0.32, lineHeight: 1.5, editable: true },
      { type: 'text', x: 700, y: 172, content: '답변을 입력하세요.', fontSize: 20, fontWeight: '500', fill: '#666666', fontFamily: 'Pretendard', letterSpacing: -0.2, lineHeight: 1.5, editable: true },
      { type: 'line', x1: 700, y1: 232, x2: 1800, y2: 232, stroke: '#DCDCDC', strokeWidth: 1 },
      { type: 'text', x: 700, y: 272, content: 'Q2. 질문을 입력하세요.', fontSize: 32, fontWeight: '700', fill: '#333333', fontFamily: 'Pretendard', letterSpacing: -0.32, lineHeight: 1.5, editable: true },
      { type: 'text', x: 700, y: 324, content: '답변을 입력하세요.', fontSize: 20, fontWeight: '500', fill: '#666666', fontFamily: 'Pretendard', letterSpacing: -0.2, lineHeight: 1.5, editable: true },
      { type: 'line', x1: 700, y1: 384, x2: 1800, y2: 384, stroke: '#DCDCDC', strokeWidth: 1 },
      { type: 'text', x: 700, y: 424, content: 'Q3. 질문을 입력하세요.', fontSize: 32, fontWeight: '700', fill: '#333333', fontFamily: 'Pretendard', letterSpacing: -0.32, lineHeight: 1.5, editable: true },
      { type: 'text', x: 700, y: 476, content: '답변을 입력하세요.', fontSize: 20, fontWeight: '500', fill: '#666666', fontFamily: 'Pretendard', letterSpacing: -0.2, lineHeight: 1.5, editable: true },
      { type: 'line', x1: 700, y1: 536, x2: 1800, y2: 536, stroke: '#DCDCDC', strokeWidth: 1 },
      { type: 'text', x: 700, y: 576, content: 'Q4. 질문을 입력하세요.', fontSize: 32, fontWeight: '700', fill: '#333333', fontFamily: 'Pretendard', letterSpacing: -0.32, lineHeight: 1.5, editable: true },
      { type: 'text', x: 700, y: 628, content: '답변을 입력하세요.', fontSize: 20, fontWeight: '500', fill: '#666666', fontFamily: 'Pretendard', letterSpacing: -0.2, lineHeight: 1.5, editable: true },
      { type: 'line', x1: 700, y1: 688, x2: 1800, y2: 688, stroke: '#DCDCDC', strokeWidth: 1 },
      { type: 'text', x: 700, y: 728, content: 'Q5. 질문을 입력하세요.', fontSize: 32, fontWeight: '700', fill: '#333333', fontFamily: 'Pretendard', letterSpacing: -0.32, lineHeight: 1.5, editable: true },
      { type: 'text', x: 700, y: 780, content: '답변을 입력하세요.', fontSize: 20, fontWeight: '500', fill: '#666666', fontFamily: 'Pretendard', letterSpacing: -0.2, lineHeight: 1.5, editable: true },
      { type: 'image', x: 120, y: 991, width: 118, height: 20, url: 'assets/icons/yeogi-logo.svg' },
      { type: 'text', x: 260, y: 990, content: '2026 © GC Company Corp. All rights reserved.', fontSize: 20, fontWeight: '500', fill: '#BBBBBB', fontFamily: 'Pretendard', letterSpacing: -0.2, lineHeight: 1.4 },
      { type: 'text', x: 1680, y: 990, content: 'P1', fontSize: 20, fontWeight: '500', fill: '#999999', fontFamily: 'Pretendard', letterSpacing: -0.2, lineHeight: 1.4, editable: true, textAlign: 'right', width: 120 }
    ]
  },

  // Core Value Templates (5개)
  corevalue01: {
    id: 'corevalue01',
    name: 'Type 01',
    category: 'Core Value',
    penId: 'JRWAo',
    elements: [
      { type: 'rect', x: 0, y: 0, width: 1920, height: 1080, fill: '#FFFFFF' },

      // titleGroup (x:1050, y:140, gap:12)
      { type: 'text', x: 1050, y: 140, content: '핵심가치', fontSize: 32, fontWeight: '700', fill: '#BBBBBB', fontFamily: 'Pretendard', letterSpacing: -0.32, lineHeight: 1.3, editable: true },
      { type: 'text', x: 1050, y: 184, content: '메인 타이틀 최대 1줄', fontSize: 48, fontWeight: '700', fill: '#333333', fontFamily: 'Pretendard', letterSpacing: -0.48, lineHeight: 1.3, editable: true, maxLines: 1, width: 750 },

      // bodyText
      { type: 'text', x: 1050, y: 281, content: '최대 2줄 영역입니다. 핵심만 담아 전달력을 높여 보세요. 간결한 문구는 시선을 사로잡고 정보를 명확히 전달합니다.', fontSize: 20, fontWeight: '500', fill: '#666666', fontFamily: 'Pretendard', letterSpacing: -0.2, lineHeight: 1.5, editable: true, maxLines: 2, width: 750 },

      // infoContent box (x:1050, y:381, width:750, padding:40, gap:40)
      // 컨테이너 높이 계산: padding 40 + (타이틀 48 + gap 16 + 본문 60) × 3 + 아이템간 gap 40 × 2 + padding 40 = 532
      { type: 'rect', x: 1050, y: 381, width: 750, height: 532, fill: '#F7F7F7', cornerRadius: 24 },

      // item 1 (padding:40 → starts at y:476)
      { type: 'text', x: 1090, y: 476, content: '타이틀 최대 1줄', fontSize: 32, fontWeight: '700', fill: '#333333', fontFamily: 'Pretendard', letterSpacing: -0.32, lineHeight: 1.5, editable: true, maxLines: 1, width: 670 },
      { type: 'text', x: 1090, y: 540, content: '최대 2줄 영역입니다. 핵심만 담아 전달력을 높여 보세요. 간결한 문구는 시선을 사로잡고 정보를 명확히 전달합니다.', fontSize: 20, fontWeight: '500', fill: '#666666', fontFamily: 'Pretendard', letterSpacing: -0.2, lineHeight: 1.5, editable: true, maxLines: 2, width: 670 },

      // item 2 (item1 y:476 + 타이틀 48 + gap 16 + 본문 60 + 아이템간 gap 40 = 640)
      { type: 'text', x: 1090, y: 640, content: '타이틀 최대 1줄', fontSize: 32, fontWeight: '700', fill: '#333333', fontFamily: 'Pretendard', letterSpacing: -0.32, lineHeight: 1.5, editable: true, maxLines: 1, width: 670 },
      { type: 'text', x: 1090, y: 704, content: '최대 2줄 영역입니다. 핵심만 담아 전달력을 높여 보세요. 간결한 문구는 시선을 사로잡고 정보를 명확히 전달합니다.', fontSize: 20, fontWeight: '500', fill: '#666666', fontFamily: 'Pretendard', letterSpacing: -0.2, lineHeight: 1.5, editable: true, maxLines: 2, width: 670 },

      // item 3 (item2 y:640 + 타이틀 48 + gap 16 + 본문 60 + 아이템간 gap 40 = 804)
      { type: 'text', x: 1090, y: 804, content: '타이틀 최대 1줄', fontSize: 32, fontWeight: '700', fill: '#333333', fontFamily: 'Pretendard', letterSpacing: -0.32, lineHeight: 1.5, editable: true, maxLines: 1, width: 670 },
      { type: 'text', x: 1090, y: 868, content: '최대 2줄 영역입니다. 핵심만 담아 전달력을 높여 보세요. 간결한 문구는 시선을 사로잡고 정보를 명확히 전달합니다.', fontSize: 20, fontWeight: '500', fill: '#666666', fontFamily: 'Pretendard', letterSpacing: -0.2, lineHeight: 1.5, editable: true, maxLines: 2, width: 670 },

      { type: 'image', x: 120, y: 991, width: 118, height: 20, url: 'assets/icons/yeogi-logo.svg' },
      { type: 'text', x: 260, y: 990, content: '2026 © GC Company Corp. All rights reserved.', fontSize: 20, fontWeight: '500', fill: '#BBBBBB', fontFamily: 'Pretendard', letterSpacing: -0.2, lineHeight: 1.4 },
      { type: 'text', x: 1680, y: 990, content: 'P1', fontSize: 20, fontWeight: '500', fill: '#999999', fontFamily: 'Pretendard', letterSpacing: -0.2, lineHeight: 1.4, editable: true, textAlign: 'right', width: 120 }
    ]
  },
  corevalue02: {
    id: 'corevalue02',
    name: 'Type 02',
    category: 'Core Value',
    penId: 'f4RrF',
    elements: [
      { type: 'rect', x: 0, y: 0, width: 1920, height: 1080, fill: '#F7F7F7' },
      { type: 'text', x: 120, y: 100, content: '핵심가치', fontSize: 32, fontWeight: '700', fill: '#BBBBBB', fontFamily: 'Pretendard', letterSpacing: -0.32, lineHeight: 1.3, editable: true },
      { type: 'text', x: 120, y: 144, content: '메인 타이틀 최대 10자 이내', fontSize: 48, fontWeight: '700', fill: '#333333', fontFamily: 'Pretendard', letterSpacing: -0.48, lineHeight: 1.3, editable: true },
      { type: 'text', x: 739, y: 132, content: '최대 3줄 이내의 공간에 핵심 정보만 담아 메시지의 전달력을 극대화하십시오.\n간결하게 정돈된 문구는 사용자의 시선을 사로잡고 정보를 명확하게 전달합니다.', fontSize: 32, fontWeight: '500', fill: '#666666', fontFamily: 'Pretendard', letterSpacing: -0.32, lineHeight: 1.5, width: 1061, editable: true },
      { type: 'rect', x: 120, y: 400, width: 1680, height: 550, fill: '#FFFFFF', cornerRadius: 24 },
      { type: 'image', x: 120, y: 991, width: 118, height: 20, url: 'assets/icons/yeogi-logo.svg' },
      { type: 'text', x: 260, y: 990, content: '2026 © GC Company Corp. All rights reserved.', fontSize: 20, fontWeight: '500', fill: '#BBBBBB', fontFamily: 'Pretendard', letterSpacing: -0.2, lineHeight: 1.4 },
      { type: 'text', x: 1680, y: 990, content: 'P1', fontSize: 20, fontWeight: '500', fill: '#999999', fontFamily: 'Pretendard', letterSpacing: -0.2, lineHeight: 1.4, editable: true, textAlign: 'right', width: 120 }
    ]
  },
  corevalue03: {
    id: 'corevalue03',
    name: 'Type 03',
    category: 'Core Value',
    penId: 'uo644',
    elements: [
      { type: 'rect', x: 0, y: 0, width: 1920, height: 1080, fill: '#F7F7F7' },

      // titleGroup (x:120, y:100, gap:12)
      { type: 'text', x: 120, y: 100, content: '핵심가치', fontSize: 32, fontWeight: '700', fill: '#BBBBBB', fontFamily: 'Pretendard', letterSpacing: -0.32, lineHeight: 1.3, editable: true },
      { type: 'text', x: 120, y: 144, content: '메인 타이틀 최대 10자 이내', fontSize: 48, fontWeight: '700', fill: '#333333', fontFamily: 'Pretendard', letterSpacing: -0.48, lineHeight: 1.3, editable: true },

      // bodyText
      { type: 'text', x: 739, y: 132, content: '최대 3줄 이내의 공간에 핵심 정보만 담아 메시지의 전달력을 극대화하십시오.\n간결하게 정돈된 문구는 사용자의 시선을 사로잡고 정보를 명확하게 전달합니다.', fontSize: 32, fontWeight: '500', fill: '#666666', fontFamily: 'Pretendard', letterSpacing: -0.32, lineHeight: 1.5, width: 1061, editable: true },

      // leftContainer (x:120, y:400, width:820, height:550, padding:80, gap:32)
      { type: 'rect', x: 120, y: 400, width: 820, height: 550, fill: '#FFFFFF', cornerRadius: 24 },
      // leftContent (padding:80, gap:16) → starts at y:480
      { type: 'text', x: 200, y: 480, content: '명확한 커뮤니케이션', fontSize: 32, fontWeight: '700', fill: '#333333', fontFamily: 'Pretendard', letterSpacing: -0.32, lineHeight: 1.5, width: 660, editable: true },
      { type: 'text', x: 200, y: 544, content: '모든 과정을 투명하게 공개하고 고객과 지속적으로 소통합니다. 정확한 정보 전달로 신뢰를 구축합니다.', fontSize: 20, fontWeight: '500', fill: '#666666', fontFamily: 'Pretendard', letterSpacing: -0.2, lineHeight: 1.5, width: 660, editable: true },

      // rightContainer (x:980, y:400, width:820, height:550, padding:80, gap:32)
      { type: 'rect', x: 980, y: 400, width: 820, height: 550, fill: '#FFFFFF', cornerRadius: 24 },
      // rightContent (padding:80, gap:16) → starts at y:480
      { type: 'text', x: 1060, y: 480, content: '책임감 있는 실행', fontSize: 32, fontWeight: '700', fill: '#333333', fontFamily: 'Pretendard', letterSpacing: -0.32, lineHeight: 1.5, width: 660, editable: true },
      { type: 'text', x: 1060, y: 544, content: '약속한 일정과 품질을 반드시 지키며, 문제 발생 시 신속하게 대응하고 해결합니다.', fontSize: 20, fontWeight: '500', fill: '#666666', fontFamily: 'Pretendard', letterSpacing: -0.2, lineHeight: 1.5, width: 660, editable: true },

      { type: 'image', x: 120, y: 991, width: 118, height: 20, url: 'assets/icons/yeogi-logo.svg' },
      { type: 'text', x: 260, y: 990, content: '2026 © GC Company Corp. All rights reserved.', fontSize: 20, fontWeight: '500', fill: '#BBBBBB', fontFamily: 'Pretendard', letterSpacing: -0.2, lineHeight: 1.4 },
      { type: 'text', x: 1680, y: 990, content: 'P1', fontSize: 20, fontWeight: '500', fill: '#999999', fontFamily: 'Pretendard', letterSpacing: -0.2, lineHeight: 1.4, editable: true, textAlign: 'right', width: 120 }
    ]
  },
  corevalue04: {
    id: 'corevalue04',
    name: 'Type 04',
    category: 'Core Value',
    penId: '3pmjw',
    elements: [
      { type: 'rect', x: 0, y: 0, width: 1920, height: 1080, fill: '#F7F7F7' },

      // titleGroup
      { type: 'text', x: 120, y: 100, content: '핵심가치', fontSize: 32, fontWeight: '700', fill: '#BBBBBB', fontFamily: 'Pretendard', letterSpacing: -0.32, lineHeight: 1.3, editable: true },
      { type: 'text', x: 120, y: 144, content: '메인 타이틀 최대 10자 이내', fontSize: 48, fontWeight: '700', fill: '#333333', fontFamily: 'Pretendard', letterSpacing: -0.48, lineHeight: 1.3, editable: true },

      // bodyText
      { type: 'text', x: 739, y: 132, content: '최대 3줄 이내의 공간에 핵심 정보만 담아 메시지의 전달력을 극대화하십시오.\n간결하게 정돈된 문구는 사용자의 시선을 사로잡고 정보를 명확하게 전달합니다.', fontSize: 32, fontWeight: '500', fill: '#666666', fontFamily: 'Pretendard', letterSpacing: -0.32, lineHeight: 1.5, width: 1061, editable: true },

      // container 1 (width:533, padding:80 → text x:+80, width:373)
      { type: 'rect', x: 120, y: 400, width: 533, height: 550, fill: '#FFFFFF', cornerRadius: 24 },
      { type: 'text', x: 200, y: 480, content: '01. 전문성', fontSize: 32, fontWeight: '700', fill: '#333333', fontFamily: 'Pretendard', letterSpacing: -0.32, lineHeight: 1.5, width: 373, editable: true },
      { type: 'text', x: 200, y: 544, content: '10년 이상의 경험과 노하우로 최고의 서비스를 제공합니다', fontSize: 20, fontWeight: '500', fill: '#666666', fontFamily: 'Pretendard', letterSpacing: -0.2, lineHeight: 1.5, width: 373, editable: true },

      // container 2 (width:534, padding:80 → text x:+80, width:374)
      { type: 'rect', x: 693, y: 400, width: 534, height: 550, fill: '#FFFFFF', cornerRadius: 24 },
      { type: 'text', x: 773, y: 480, content: '02. 신속성', fontSize: 32, fontWeight: '700', fill: '#333333', fontFamily: 'Pretendard', letterSpacing: -0.32, lineHeight: 1.5, width: 374, editable: true },
      { type: 'text', x: 773, y: 544, content: '빠른 대응과 실행으로 고객의 시간을 절약합니다', fontSize: 20, fontWeight: '500', fill: '#666666', fontFamily: 'Pretendard', letterSpacing: -0.2, lineHeight: 1.5, width: 374, editable: true },

      // container 3 (width:533, padding:80 → text x:+80, width:373)
      { type: 'rect', x: 1267, y: 400, width: 533, height: 550, fill: '#FFFFFF', cornerRadius: 24 },
      { type: 'text', x: 1347, y: 480, content: '03. 안정성', fontSize: 32, fontWeight: '700', fill: '#333333', fontFamily: 'Pretendard', letterSpacing: -0.32, lineHeight: 1.5, width: 373, editable: true },
      { type: 'text', x: 1347, y: 544, content: '검증된 시스템과 프로세스로 안정적인 운영을 보장합니다', fontSize: 20, fontWeight: '500', fill: '#666666', fontFamily: 'Pretendard', letterSpacing: -0.2, lineHeight: 1.5, width: 373, editable: true },

      { type: 'image', x: 120, y: 991, width: 118, height: 20, url: 'assets/icons/yeogi-logo.svg' },
      { type: 'text', x: 260, y: 990, content: '2026 © GC Company Corp. All rights reserved.', fontSize: 20, fontWeight: '500', fill: '#BBBBBB', fontFamily: 'Pretendard', letterSpacing: -0.2, lineHeight: 1.4 },
      { type: 'text', x: 1680, y: 990, content: 'P1', fontSize: 20, fontWeight: '500', fill: '#999999', fontFamily: 'Pretendard', letterSpacing: -0.2, lineHeight: 1.4, editable: true, textAlign: 'right', width: 120 }
    ]
  },
  corevalue05: {
    id: 'corevalue05',
    name: 'Type 05',
    category: 'Core Value',
    penId: 'vLS3n',
    elements: [
      { type: 'rect', x: 0, y: 0, width: 1920, height: 1080, fill: '#F7F7F7' },

      // titleGroup
      { type: 'text', x: 120, y: 100, content: '핵심가치', fontSize: 32, fontWeight: '700', fill: '#BBBBBB', fontFamily: 'Pretendard', letterSpacing: -0.32, lineHeight: 1.3, editable: true },
      { type: 'text', x: 120, y: 144, content: '메인 타이틀 최대 10자 이내', fontSize: 48, fontWeight: '700', fill: '#333333', fontFamily: 'Pretendard', letterSpacing: -0.48, lineHeight: 1.3, editable: true },

      // bodyText
      { type: 'text', x: 739, y: 132, content: '최대 3줄 이내의 공간에 핵심 정보만 담아 메시지의 전달력을 극대화하십시오.\n간결하게 정돈된 문구는 사용자의 시선을 사로잡고 정보를 명확하게 전달합니다.', fontSize: 32, fontWeight: '500', fill: '#666666', fontFamily: 'Pretendard', letterSpacing: -0.32, lineHeight: 1.5, width: 1061, editable: true },

      // topRow (x:120, y:400, gap:40) - 2 containers with padding:80
      { type: 'rect', x: 120, y: 400, width: 820, height: 255, fill: '#FFFFFF', cornerRadius: 24 },
      { type: 'text', x: 200, y: 480, content: '01. 기획', fontSize: 32, fontWeight: '700', fill: '#333333', fontFamily: 'Pretendard', letterSpacing: -0.32, lineHeight: 1.5, width: 660, editable: true },
      { type: 'text', x: 200, y: 544, content: '체계적인 프로젝트 설계', fontSize: 20, fontWeight: '500', fill: '#666666', fontFamily: 'Pretendard', letterSpacing: -0.2, lineHeight: 1.5, width: 660, editable: true },

      { type: 'rect', x: 980, y: 400, width: 820, height: 255, fill: '#FFFFFF', cornerRadius: 24 },
      { type: 'text', x: 1060, y: 480, content: '02. 개발', fontSize: 32, fontWeight: '700', fill: '#333333', fontFamily: 'Pretendard', letterSpacing: -0.32, lineHeight: 1.5, width: 660, editable: true },
      { type: 'text', x: 1060, y: 544, content: '최신 기술로 안정적 구현', fontSize: 20, fontWeight: '500', fill: '#666666', fontFamily: 'Pretendard', letterSpacing: -0.2, lineHeight: 1.5, width: 660, editable: true },

      // middleRow (x:120, y:695, gap:40) - 2 containers with padding:80
      { type: 'rect', x: 120, y: 695, width: 820, height: 255, fill: '#FFFFFF', cornerRadius: 24 },
      { type: 'text', x: 200, y: 775, content: '03. 디자인', fontSize: 32, fontWeight: '700', fill: '#333333', fontFamily: 'Pretendard', letterSpacing: -0.32, lineHeight: 1.5, width: 660, editable: true },
      { type: 'text', x: 200, y: 839, content: '사용자 중심의 UI/UX 제공', fontSize: 20, fontWeight: '500', fill: '#666666', fontFamily: 'Pretendard', letterSpacing: -0.2, lineHeight: 1.5, width: 660, editable: true },

      { type: 'rect', x: 980, y: 695, width: 820, height: 255, fill: '#FFFFFF', cornerRadius: 24 },
      { type: 'text', x: 1060, y: 775, content: '04. 운영', fontSize: 32, fontWeight: '700', fill: '#333333', fontFamily: 'Pretendard', letterSpacing: -0.32, lineHeight: 1.5, width: 660, editable: true },
      { type: 'text', x: 1060, y: 839, content: '지속적인 유지보수와 관리', fontSize: 20, fontWeight: '500', fill: '#666666', fontFamily: 'Pretendard', letterSpacing: -0.2, lineHeight: 1.5, width: 660, editable: true },

      { type: 'image', x: 120, y: 991, width: 118, height: 20, url: 'assets/icons/yeogi-logo.svg' },
      { type: 'text', x: 260, y: 990, content: '2026 © GC Company Corp. All rights reserved.', fontSize: 20, fontWeight: '500', fill: '#BBBBBB', fontFamily: 'Pretendard', letterSpacing: -0.2, lineHeight: 1.4 },
      { type: 'text', x: 1680, y: 990, content: 'P1', fontSize: 20, fontWeight: '500', fill: '#999999', fontFamily: 'Pretendard', letterSpacing: -0.2, lineHeight: 1.4, editable: true, textAlign: 'right', width: 120 }
    ]
  },
  // Table Templates (1개)
  table01: {
    id: 'table01',
    name: 'Type 01',
    category: 'Table',
    penId: 'I3ceg',
    dynamicTable: true,
    defaultTable: {
      headers: ['타이틀', '타이틀'],
      rows: [
        { label: '항목', cells: ['본문 텍스트', '본문 텍스트'] },
        { label: '항목', cells: ['본문 텍스트', '본문 텍스트'] },
        { label: '항목', cells: ['본문 텍스트', '본문 텍스트'] },
        { label: '항목', cells: ['본문 텍스트', '본문 텍스트'] }
      ]
    },
    elements: [
      { type: 'rect', x: 0, y: 0, width: 1920, height: 1080, fill: '#F7F7F7' },
      { type: 'text', x: 120, y: 100, content: '서비스 비교 분석', fontSize: 48, fontWeight: '700', fill: '#333333', fontFamily: 'Pretendard', letterSpacing: -0.48, lineHeight: 1.3, editable: true },
      { type: 'image', x: 120, y: 991, width: 118, height: 20, url: 'assets/icons/yeogi-logo.svg' },
      { type: 'text', x: 260, y: 990, content: '2026 © GC Company Corp. All rights reserved.', fontSize: 20, fontWeight: '500', fill: '#BBBBBB', fontFamily: 'Pretendard', letterSpacing: -0.2, lineHeight: 1.4 },
      { type: 'text', x: 1680, y: 990, content: 'P1', fontSize: 20, fontWeight: '500', fill: '#999999', fontFamily: 'Pretendard', letterSpacing: -0.2, lineHeight: 1.4, editable: true, textAlign: 'right', width: 120 }
    ]
  },

  // Section Cover Templates (3개)
  section01: {
    id: 'section01',
    name: 'Type 01',
    category: 'Section Cover',
    penId: '30Xqu',
    elements: [
      { type: 'rect', x: 0, y: 0, width: 1920, height: 1080, fill: '#FFFFFF' },
      { type: 'text', x: 120, y: 100, content: '섹션 소개', fontSize: 32, fontWeight: '700', fill: '#BBBBBB', fontFamily: 'Pretendard', letterSpacing: -0.32, lineHeight: 1.3, editable: true },
      { type: 'text', x: 120, y: 152, content: '적용된 쿠폰은 \n어디에 노출되나요?', fontSize: 90, fontWeight: '700', fill: '#333333', fontFamily: 'Pretendard', letterSpacing: -0.9, lineHeight: 1.3, editable: true },
      { type: 'image', x: 120, y: 991, width: 118, height: 20, url: 'assets/icons/yeogi-logo.svg' },
      { type: 'text', x: 260, y: 990, content: '2026 © GC Company Corp. All rights reserved.', fontSize: 20, fontWeight: '500', fill: '#BBBBBB', fontFamily: 'Pretendard', letterSpacing: -0.2, lineHeight: 1.4 },
      { type: 'text', x: 1680, y: 990, content: 'P1', fontSize: 20, fontWeight: '500', fill: '#999999', fontFamily: 'Pretendard', letterSpacing: -0.2, lineHeight: 1.4, editable: true, textAlign: 'right', width: 120 }
    ]
  },
  section02: {
    id: 'section02',
    name: 'Type 02',
    category: 'Section Cover',
    penId: 'iBM3X',
    elements: [
      { type: 'rect', x: 0, y: 0, width: 1920, height: 1080, fill: '#FFFFFF' },
      { type: 'text', x: 434, y: 400, content: '섹션 소개', fontSize: 32, fontWeight: '700', fill: '#BBBBBB', fontFamily: 'Pretendard', letterSpacing: -0.32, lineHeight: 1.3, textAlign: 'center', editable: true },
      { type: 'text', x: 434, y: 452, content: '어떻게 예약하나요?', fontSize: 90, fontWeight: '700', fill: '#333333', fontFamily: 'Pretendard', letterSpacing: -0.9, lineHeight: 1.3, textAlign: 'center', width: 1052, editable: true },
      { type: 'image', x: 120, y: 991, width: 118, height: 20, url: 'assets/icons/yeogi-logo.svg' },
      { type: 'text', x: 260, y: 990, content: '2026 © GC Company Corp. All rights reserved.', fontSize: 20, fontWeight: '500', fill: '#BBBBBB', fontFamily: 'Pretendard', letterSpacing: -0.2, lineHeight: 1.4 },
      { type: 'text', x: 1680, y: 990, content: 'P1', fontSize: 20, fontWeight: '500', fill: '#999999', fontFamily: 'Pretendard', letterSpacing: -0.2, lineHeight: 1.4, editable: true, textAlign: 'right', width: 120 }
    ]
  },
  section03: {
    id: 'section03',
    name: 'Type 03',
    category: 'Section Cover',
    penId: 'wY8Zs',
    elements: [
      { type: 'rect', x: 0, y: 0, width: 1920, height: 1080, fill: '#333333' },
      { type: 'text', x: 933, y: 283, content: '1', fontSize: 32, fontWeight: '700', fill: '#FFFFFF', fontFamily: 'Pretendard', editable: true },
      { type: 'text', x: 1021, y: 283, content: '타이틀 텍스트', fontSize: 48, fontWeight: '700', fill: '#FFFFFF', fontFamily: 'Pretendard', letterSpacing: -0.48, lineHeight: 1.3, editable: true },
      { type: 'text', x: 933, y: 395, content: '2', fontSize: 32, fontWeight: '700', fill: '#FFFFFF', fontFamily: 'Pretendard', opacity: 0.3, editable: true },
      { type: 'text', x: 1021, y: 395, content: '타이틀 텍스트', fontSize: 48, fontWeight: '700', fill: '#FFFFFF', fontFamily: 'Pretendard', letterSpacing: -0.48, lineHeight: 1.3, opacity: 0.3, editable: true },
      { type: 'text', x: 933, y: 507, content: '3', fontSize: 32, fontWeight: '700', fill: '#FFFFFF', fontFamily: 'Pretendard', opacity: 0.3, editable: true },
      { type: 'text', x: 1021, y: 507, content: '타이틀 텍스트', fontSize: 48, fontWeight: '700', fill: '#FFFFFF', fontFamily: 'Pretendard', letterSpacing: -0.48, lineHeight: 1.3, opacity: 0.3, editable: true },
      { type: 'text', x: 933, y: 619, content: '4', fontSize: 32, fontWeight: '700', fill: '#FFFFFF', fontFamily: 'Pretendard', opacity: 0.3, editable: true },
      { type: 'text', x: 1021, y: 619, content: '타이틀 텍스트', fontSize: 48, fontWeight: '700', fill: '#FFFFFF', fontFamily: 'Pretendard', letterSpacing: -0.48, lineHeight: 1.3, opacity: 0.3, editable: true },
      { type: 'text', x: 933, y: 731, content: '5', fontSize: 32, fontWeight: '700', fill: '#FFFFFF', fontFamily: 'Pretendard', opacity: 0.3, editable: true },
      { type: 'text', x: 1021, y: 731, content: '타이틀 텍스트', fontSize: 48, fontWeight: '700', fill: '#FFFFFF', fontFamily: 'Pretendard', letterSpacing: -0.48, lineHeight: 1.3, opacity: 0.3, editable: true },
      { type: 'image', x: 120, y: 991, width: 118, height: 20, url: 'assets/icons/yeogi-logo.svg' },
      { type: 'text', x: 260, y: 990, content: '2026 © GC Company Corp. All rights reserved.', fontSize: 20, fontWeight: '500', fill: '#BBBBBB', fontFamily: 'Pretendard', letterSpacing: -0.2, lineHeight: 1.4 },
      { type: 'text', x: 1680, y: 990, content: 'P1', fontSize: 20, fontWeight: '500', fill: '#999999', fontFamily: 'Pretendard', letterSpacing: -0.2, lineHeight: 1.4, editable: true, textAlign: 'right', width: 120 }
    ]
  },

  // Index Templates (2개)
  index01: {
    id: 'index01',
    name: 'Type 01',
    category: 'Index',
    penId: 'HvKwz',
    elements: [
      { type: 'rect', x: 0, y: 0, width: 1920, height: 1080, fill: '#F7F7F7' },
      { type: 'text', x: 120, y: 100, content: '목차', fontSize: 90, fontWeight: '700', fill: '#333333', fontFamily: 'Pretendard', letterSpacing: -0.9, lineHeight: 1.3, editable: true },
      // Item 01 (y:384)
      { type: 'text', x: 800, y: 384, content: '01', fontSize: 32, fontWeight: '700', fill: '#666666', fontFamily: 'Pretendard', letterSpacing: -0.32, editable: true },
      { type: 'text', x: 868, y: 384, content: '타이틀 텍스트', fontSize: 32, fontWeight: '700', fill: '#333333', fontFamily: 'Pretendard', letterSpacing: -0.32, lineHeight: 1.3, editable: true },
      { type: 'text', x: 1680, y: 384, content: 'P1', fontSize: 32, fontWeight: '500', fill: '#BBBBBB', fontFamily: 'Pretendard', letterSpacing: -0.32, textAlign: 'right', width: 120, editable: true },
      // Item 02 (y:468)
      { type: 'text', x: 800, y: 468, content: '02', fontSize: 32, fontWeight: '700', fill: '#666666', fontFamily: 'Pretendard', letterSpacing: -0.32, editable: true },
      { type: 'text', x: 868, y: 468, content: '타이틀 텍스트', fontSize: 32, fontWeight: '700', fill: '#333333', fontFamily: 'Pretendard', letterSpacing: -0.32, lineHeight: 1.3, editable: true },
      { type: 'text', x: 1680, y: 468, content: 'P5', fontSize: 32, fontWeight: '500', fill: '#BBBBBB', fontFamily: 'Pretendard', letterSpacing: -0.32, textAlign: 'right', width: 120, editable: true },
      // Item 03 (y:552)
      { type: 'text', x: 800, y: 552, content: '03', fontSize: 32, fontWeight: '700', fill: '#666666', fontFamily: 'Pretendard', letterSpacing: -0.32, editable: true },
      { type: 'text', x: 868, y: 552, content: '타이틀 텍스트', fontSize: 32, fontWeight: '700', fill: '#333333', fontFamily: 'Pretendard', letterSpacing: -0.32, lineHeight: 1.3, editable: true },
      { type: 'text', x: 1680, y: 552, content: 'P10', fontSize: 32, fontWeight: '500', fill: '#BBBBBB', fontFamily: 'Pretendard', letterSpacing: -0.32, textAlign: 'right', width: 120, editable: true },
      // Item 04 (y:636)
      { type: 'text', x: 800, y: 636, content: '04', fontSize: 32, fontWeight: '700', fill: '#666666', fontFamily: 'Pretendard', letterSpacing: -0.32, editable: true },
      { type: 'text', x: 868, y: 636, content: '타이틀 텍스트', fontSize: 32, fontWeight: '700', fill: '#333333', fontFamily: 'Pretendard', letterSpacing: -0.32, lineHeight: 1.3, editable: true },
      { type: 'text', x: 1680, y: 636, content: 'P15', fontSize: 32, fontWeight: '500', fill: '#BBBBBB', fontFamily: 'Pretendard', letterSpacing: -0.32, textAlign: 'right', width: 120, editable: true },
      // Item 05 (y:720)
      { type: 'text', x: 800, y: 720, content: '05', fontSize: 32, fontWeight: '700', fill: '#666666', fontFamily: 'Pretendard', letterSpacing: -0.32, editable: true },
      { type: 'text', x: 868, y: 720, content: '타이틀 텍스트', fontSize: 32, fontWeight: '700', fill: '#333333', fontFamily: 'Pretendard', letterSpacing: -0.32, lineHeight: 1.3, editable: true },
      { type: 'text', x: 1680, y: 720, content: 'P20', fontSize: 32, fontWeight: '500', fill: '#BBBBBB', fontFamily: 'Pretendard', letterSpacing: -0.32, textAlign: 'right', width: 120, editable: true },
      // Item 06 (y:804)
      { type: 'text', x: 800, y: 804, content: '06', fontSize: 32, fontWeight: '700', fill: '#666666', fontFamily: 'Pretendard', letterSpacing: -0.32, editable: true },
      { type: 'text', x: 868, y: 804, content: '타이틀 텍스트', fontSize: 32, fontWeight: '700', fill: '#333333', fontFamily: 'Pretendard', letterSpacing: -0.32, lineHeight: 1.3, editable: true },
      { type: 'text', x: 1680, y: 804, content: 'P25', fontSize: 32, fontWeight: '500', fill: '#BBBBBB', fontFamily: 'Pretendard', letterSpacing: -0.32, textAlign: 'right', width: 120, editable: true },
      // Item 07 (y:888)
      { type: 'text', x: 800, y: 888, content: '07', fontSize: 32, fontWeight: '700', fill: '#666666', fontFamily: 'Pretendard', letterSpacing: -0.32, editable: true },
      { type: 'text', x: 868, y: 888, content: '타이틀 텍스트', fontSize: 32, fontWeight: '700', fill: '#333333', fontFamily: 'Pretendard', letterSpacing: -0.32, lineHeight: 1.3, editable: true },
      { type: 'text', x: 1680, y: 888, content: 'P30', fontSize: 32, fontWeight: '500', fill: '#BBBBBB', fontFamily: 'Pretendard', letterSpacing: -0.32, textAlign: 'right', width: 120, editable: true },
      // Footer
      { type: 'image', x: 120, y: 991, width: 118, height: 20, url: 'assets/icons/yeogi-logo.svg' },
      { type: 'text', x: 260, y: 990, content: '2026 © GC Company Corp. All rights reserved.', fontSize: 20, fontWeight: '500', fill: '#BBBBBB', fontFamily: 'Pretendard', letterSpacing: -0.2, lineHeight: 1.4 },
      { type: 'text', x: 1680, y: 990, content: 'P1', fontSize: 20, fontWeight: '500', fill: '#999999', fontFamily: 'Pretendard', letterSpacing: -0.2, lineHeight: 1.4, editable: true, textAlign: 'right', width: 120 }
    ]
  },
  index02: {
    id: 'index02',
    name: 'Type 02',
    category: 'Index',
    penId: '2HaSQ',
    elements: [
      { type: 'rect', x: 0, y: 0, width: 1920, height: 1080, fill: '#F7F7F7' },
      { type: 'text', x: 120, y: 100, content: '목차', fontSize: 90, fontWeight: '700', fill: '#333333', fontFamily: 'Pretendard', letterSpacing: -0.9, lineHeight: 1.3, editable: true },

      // Section 1: 01. 지면 광고 (y:210)
      { type: 'text', x: 960, y: 210, content: '01. 지면 광고', fontSize: 32, fontWeight: '700', fill: '#333333', fontFamily: 'Pretendard', letterSpacing: -0.32, lineHeight: 1.3, width: 360, editable: true, className: 'index02-section-title' },
      { type: 'text', x: 1344, y: 210, content: '광고 노출 지면', fontSize: 32, fontWeight: '700', fill: '#666666', fontFamily: 'Pretendard', letterSpacing: -0.32, lineHeight: 1.5, editable: true, className: 'index02-subtitle' },
      { type: 'text', x: 1344, y: 272, content: '상품 개요', fontSize: 32, fontWeight: '700', fill: '#666666', fontFamily: 'Pretendard', letterSpacing: -0.32, lineHeight: 1.5, editable: true, className: 'index02-subtitle' },
      { type: 'text', x: 1344, y: 334, content: '상품 세부 소개', fontSize: 32, fontWeight: '700', fill: '#666666', fontFamily: 'Pretendard', letterSpacing: -0.32, lineHeight: 1.5, editable: true, className: 'index02-subtitle' },
      { type: 'text', x: 1344, y: 396, content: '광고 효과 분석', fontSize: 32, fontWeight: '700', fill: '#666666', fontFamily: 'Pretendard', letterSpacing: -0.32, lineHeight: 1.5, editable: true, className: 'index02-subtitle' },

      // Section 2: 02. 부속 상품 (노출형) (y:516)
      { type: 'text', x: 960, y: 516, content: '02. 부속 상품 (노출형)', fontSize: 32, fontWeight: '700', fill: '#333333', fontFamily: 'Pretendard', letterSpacing: -0.32, lineHeight: 1.3, width: 360, editable: true, className: 'index02-section-title' },
      { type: 'text', x: 1344, y: 516, content: '슈퍼셀렉트 퍼스트', fontSize: 32, fontWeight: '700', fill: '#666666', fontFamily: 'Pretendard', letterSpacing: -0.32, lineHeight: 1.5, editable: true, className: 'index02-subtitle' },
      { type: 'text', x: 1344, y: 578, content: '기획전 (숙박 / 대실)', fontSize: 32, fontWeight: '700', fill: '#666666', fontFamily: 'Pretendard', letterSpacing: -0.32, lineHeight: 1.5, editable: true, className: 'index02-subtitle' },
      { type: 'text', x: 1344, y: 640, content: '검색 · 주변 광고', fontSize: 32, fontWeight: '700', fill: '#666666', fontFamily: 'Pretendard', letterSpacing: -0.32, lineHeight: 1.5, editable: true, className: 'index02-subtitle' },
      { type: 'text', x: 1344, y: 702, content: '프리미엄 배너 광고', fontSize: 32, fontWeight: '700', fill: '#666666', fontFamily: 'Pretendard', letterSpacing: -0.32, lineHeight: 1.5, editable: true, className: 'index02-subtitle' },

      // Section 3: 03. 부속 상품 (할인형) (y:822)
      { type: 'text', x: 960, y: 822, content: '03. 부속 상품 (할인형)', fontSize: 32, fontWeight: '700', fill: '#333333', fontFamily: 'Pretendard', letterSpacing: -0.32, lineHeight: 1.3, width: 360, editable: true, className: 'index02-section-title' },
      { type: 'text', x: 1344, y: 822, content: '플러스 쿠폰', fontSize: 32, fontWeight: '700', fill: '#666666', fontFamily: 'Pretendard', letterSpacing: -0.32, lineHeight: 1.5, editable: true, className: 'index02-subtitle' },
      { type: 'text', x: 1344, y: 884, content: '부스트 쿠폰', fontSize: 32, fontWeight: '700', fill: '#666666', fontFamily: 'Pretendard', letterSpacing: -0.32, lineHeight: 1.5, editable: true, className: 'index02-subtitle' },
      { type: 'text', x: 1344, y: 946, content: '선불형 쿠폰', fontSize: 32, fontWeight: '700', fill: '#666666', fontFamily: 'Pretendard', letterSpacing: -0.32, lineHeight: 1.5, editable: true, className: 'index02-subtitle' },
      { type: 'text', x: 1344, y: 1008, content: '후불형 쿠폰', fontSize: 32, fontWeight: '700', fill: '#666666', fontFamily: 'Pretendard', letterSpacing: -0.32, lineHeight: 1.5, editable: true, className: 'index02-subtitle' },

      // Footer
      { type: 'image', x: 120, y: 991, width: 118, height: 20, url: 'assets/icons/yeogi-logo.svg' },
      { type: 'text', x: 260, y: 990, content: '2026 © GC Company Corp. All rights reserved.', fontSize: 20, fontWeight: '500', fill: '#BBBBBB', fontFamily: 'Pretendard', letterSpacing: -0.2, lineHeight: 1.4 },
      { type: 'text', x: 1680, y: 990, content: 'P1', fontSize: 20, fontWeight: '500', fill: '#999999', fontFamily: 'Pretendard', letterSpacing: -0.2, lineHeight: 1.4, editable: true, textAlign: 'right', width: 120 }
    ],
    dynamicSections: true
  },

  // Final Cover Templates (3개)
  finalcover01: {
    id: 'finalcover01',
    name: 'Type 01',
    category: 'Final Cover',
    penId: 'roD4k',
    elements: [
      { type: 'rect', x: 0, y: 0, width: 1920, height: 1080, fill: '#FFFFFF' },
      { type: 'image', x: 683, y: 450, width: 554, height: 94, url: 'assets/icons/yeogi-logo.svg' },
      { type: 'text', x: 360, y: 912, content: '최대 1줄 이내로 작성하는 것을 권장합니다.', fontSize: 48, fontWeight: '500', fill: '#BBBBBB', fontFamily: 'Pretendard', letterSpacing: -0.48, lineHeight: 1.3, width: 1200, textAlign: 'center', editable: true, maxLines: 1 }
    ]
  },
  finalcover02: {
    id: 'finalcover02',
    name: 'Type 02',
    category: 'Final Cover',
    penId: 'OshxU',
    elements: [
      { type: 'rect', x: 0, y: 0, width: 1920, height: 1080, fill: '#FFFFFF' },
      { type: 'rect', x: 820, y: 0, width: 1100, height: 1080, fill: '#F7F7F7' },
      { type: 'text', x: 120, y: 177, content: '메인 타이틀을 입력하세요\n최대 3줄까지 입력 가능합니다.', fontSize: 90, fontWeight: '700', fill: '#333333', fontFamily: 'Pretendard', letterSpacing: -0.9, lineHeight: 1.3, width: 1200, editable: true, maxLines: 3 },
      { type: 'image', x: 120, y: 940, width: 216.89, height: 36.83, url: 'assets/icons/yeogi-logo.svg' },
      { type: 'text', x: 120, y: 100, content: '카테고리 입력', fontSize: 48, fontWeight: '700', fill: '#BBBBBB', fontFamily: 'Pretendard', letterSpacing: -0.48, lineHeight: 1.3, editable: true, maxLines: 1 }
    ]
  },
  finalcover03: {
    id: 'finalcover03',
    name: 'Type 03',
    category: 'Final Cover',
    penId: 'NQa5K',
    elements: [
      { type: 'rect', x: 0, y: 0, width: 1920, height: 1080, fill: '#f7f7f7' },
      { type: 'text', x: 660, y: 395, content: '메인 타이틀 최대 1줄', fontSize: 90, fontWeight: '700', fill: '#333333', fontFamily: 'Pretendard', letterSpacing: -0.9, lineHeight: 1.3, textAlign: 'center', editable: true, maxLines: 1, width: 1200 },
      { type: 'text', x: 434, y: 537, content: '최대 1줄 이내로 작성하는 것을 권장합니다.', fontSize: 48, fontWeight: '500', fill: '#666666', fontFamily: 'Pretendard', letterSpacing: -0.48, lineHeight: 1.5, width: 1200, textAlign: 'center', editable: true, maxLines: 1 },
      { type: 'image', x: 852, y: 940, width: 216.89, height: 36.83, url: 'assets/icons/yeogi-logo.svg' }
    ]
  },

  // Contact Template (1개)
  contact01: {
    id: 'contact01',
    name: 'Type 01',
    category: 'Contact',
    penId: 'ceGVD',
    elements: [
      { type: 'rect', x: 0, y: 0, width: 1920, height: 1080, fill: '#FFFFFF' },
      { type: 'text', x: 120, y: 510, content: '여기어때 파트너센터 문의', fontSize: 48, fontWeight: '700', fill: '#333333', fontFamily: 'Pretendard', letterSpacing: -0.48, lineHeight: 1.3, editable: true },
      { type: 'text', x: 120, y: 650, content: '대표번호', fontSize: 32, fontWeight: '700', fill: '#333333', fontFamily: 'Pretendard', letterSpacing: -0.32, lineHeight: 1.5, editable: true },
      { type: 'text', x: 120, y: 694, content: '02-1234-5678', fontSize: 32, fontWeight: '500', fill: '#666666', fontFamily: 'Pretendard', letterSpacing: -0.32, lineHeight: 1.5, editable: true },
      { type: 'text', x: 120, y: 770, content: '이메일', fontSize: 32, fontWeight: '700', fill: '#333333', fontFamily: 'Pretendard', letterSpacing: -0.32, lineHeight: 1.5, editable: true },
      { type: 'text', x: 120, y: 814, content: 'contact@example.com', fontSize: 32, fontWeight: '500', fill: '#666666', fontFamily: 'Pretendard', letterSpacing: -0.32, lineHeight: 1.5, editable: true },
      { type: 'text', x: 820, y: 650, content: '운영시간', fontSize: 32, fontWeight: '700', fill: '#333333', fontFamily: 'Pretendard', letterSpacing: -0.32, lineHeight: 1.5, editable: true },
      { type: 'text', x: 820, y: 694, content: '평일 09:00 - 18:00', fontSize: 32, fontWeight: '500', fill: '#666666', fontFamily: 'Pretendard', letterSpacing: -0.32, lineHeight: 1.5, editable: true },
      { type: 'text', x: 820, y: 770, content: '주소', fontSize: 32, fontWeight: '700', fill: '#333333', fontFamily: 'Pretendard', letterSpacing: -0.32, lineHeight: 1.5, editable: true },
      { type: 'text', x: 820, y: 814, content: '서울특별시 강남구 테헤란로 123', fontSize: 32, fontWeight: '500', fill: '#666666', fontFamily: 'Pretendard', letterSpacing: -0.32, lineHeight: 1.5, editable: true },
      { type: 'image', x: 120, y: 991, width: 118, height: 20, url: 'assets/icons/yeogi-logo.svg' },
      { type: 'text', x: 260, y: 990, content: '2026 © GC Company Corp. All rights reserved.', fontSize: 20, fontWeight: '500', fill: '#BBBBBB', fontFamily: 'Pretendard', letterSpacing: -0.2, lineHeight: 1.4 },
      { type: 'text', x: 1680, y: 990, content: 'P1', fontSize: 20, fontWeight: '500', fill: '#999999', fontFamily: 'Pretendard', letterSpacing: -0.2, lineHeight: 1.4, editable: true, textAlign: 'right', width: 120 }
    ]
  }
};

// ==================== Main Cover Templates (3개) ====================
var MAIN_COVER_TEMPLATE = {
  maincover03: {
    id: 'maincover03',
    name: 'Type 01',
    category: 'Main Cover',
    penId: 'XtSqT',
    elements: [
      { type: 'rect', x: 0, y: 0, width: 1920, height: 1080, fill: '#f7f7f7' },
      { type: 'text', x: 660, y: 395, content: '메인 타이틀 최대 1줄', fontSize: 90, fontWeight: '700', fill: '#333333', fontFamily: 'Pretendard', letterSpacing: -0.9, lineHeight: 1.3, textAlign: 'center', editable: true, maxLines: 1, width: 1200 },
      { type: 'text', x: 434, y: 537, content: '최대 1줄 이내로 작성하는 것을 권장합니다.', fontSize: 48, fontWeight: '500', fill: '#666666', fontFamily: 'Pretendard', letterSpacing: -0.48, lineHeight: 1.5, width: 1200, textAlign: 'center', editable: true, maxLines: 1 },
      { type: 'image', x: 852, y: 940, width: 216.89, height: 36.83, url: 'assets/icons/yeogi-logo.svg' }
    ]
  },
  maincover02: {
    id: 'maincover02',
    name: 'Type 02',
    category: 'Main Cover',
    penId: '6UkwD',
    elements: [
      { type: 'rect', x: 0, y: 0, width: 1920, height: 1080, fill: '#FFFFFF' },
      { type: 'rect', x: 820, y: 0, width: 1100, height: 1080, fill: '#F7F7F7' },
      { type: 'text', x: 120, y: 177, content: '메인 타이틀을 입력하세요\n최대 3줄까지 입력 가능합니다.', fontSize: 90, fontWeight: '700', fill: '#333333', fontFamily: 'Pretendard', letterSpacing: -0.9, lineHeight: 1.3, width: 1200, editable: true, maxLines: 3 },
      { type: 'image', x: 120, y: 940, width: 216.89, height: 36.83, url: 'assets/icons/yeogi-logo.svg' },
      { type: 'text', x: 120, y: 100, content: '카테고리 입력', fontSize: 48, fontWeight: '700', fill: '#BBBBBB', fontFamily: 'Pretendard', letterSpacing: -0.48, lineHeight: 1.3, editable: true, maxLines: 1 }
    ]
  },
  maincover01: {
    id: 'maincover01',
    name: 'Type 03',
    category: 'Main Cover',
    penId: '0eUOG',
    elements: [
      { type: 'rect', x: 0, y: 0, width: 1920, height: 1080, fill: '#FFFFFF' },
      { type: 'text', x: 120, y: 319, content: '최대 2줄 이내로 작성하는 것을 권장합니다.', fontSize: 48, fontWeight: '500', fill: '#666666', fontFamily: 'Pretendard', letterSpacing: -0.48, lineHeight: 1.5, width: 1200, editable: true, maxLines: 2 },
      { type: 'rect', x: 820, y: 0, width: 1100, height: 1080, fill: '#F7F7F7' },
      { type: 'text', x: 120, y: 177, content: '메인 타이틀을 입력하세요\n최대 2줄까지 입력 가능합니다.', fontSize: 90, fontWeight: '700', fill: '#333333', fontFamily: 'Pretendard', letterSpacing: -0.9, lineHeight: 1.3, width: 1200, editable: true, maxLines: 2 },
      { type: 'text', x: 120, y: 100, content: '카테고리 입력', fontSize: 48, fontWeight: '700', fill: '#BBBBBB', fontFamily: 'Pretendard', letterSpacing: -0.48, lineHeight: 1.3, editable: true, maxLines: 1 },
      { type: 'image', x: 120, y: 940, width: 216.89, height: 36.83, url: 'assets/icons/yeogi-logo.svg' }
    ]
  }
};

// TEMPLATES에 Main Cover 추가
var ALL_TEMPLATES = { ...MAIN_COVER_TEMPLATE, ...TEMPLATES };
