function SlideCanvas({ template, data, onUpdate, onImageUpload, currentSlideIndex, slides }) {
  const textRefs = useRef({});
  const containerRef = useRef(null);
  const [, forceRender] = useState(0);
  const [undoStack, setUndoStack] = useState([]);

  // 이미지 드래그 상태
  const [isDraggingImg, setIsDraggingImg] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [draggingImageKey, setDraggingImageKey] = useState(null);

  const dragState = {
    isDraggingImg, setIsDraggingImg,
    draggingImageKey, setDraggingImageKey,
    dragStart, setDragStart,
    dragOffset, setDragOffset
  };

  // Index Type 01 TOC 상태
  const [tocItems, setTocItems] = useState(template.tocItems || []);
  const [tocDraggedIndex, setTocDraggedIndex] = useState(null);

  // FAQ 동적 아이템 상태
  const [faq02Items, setFaq02Items] = useState(() => {
    if (template.id !== 'faq02') return [];
    if (data.faqItems) return data.faqItems;
    return [
      { id: 'faq1', question: 'Q1. 질문을 입력하세요.', answer: '답변을 입력하세요.' },
      { id: 'faq2', question: 'Q2. 질문을 입력하세요.', answer: '답변을 입력하세요.' },
      { id: 'faq3', question: 'Q3. 질문을 입력하세요.', answer: '답변을 입력하세요.' },
      { id: 'faq4', question: 'Q4. 질문을 입력하세요.', answer: '답변을 입력하세요.' },
      { id: 'faq5', question: 'Q5. 질문을 입력하세요.', answer: '답변을 입력하세요.' },
      { id: 'faq6', question: 'Q6. 질문을 입력하세요.', answer: '답변을 입력하세요.' }
    ];
  });

  const [faq01Items, setFaq01Items] = useState(() => {
    if (template.id !== 'faq01') return [];
    if (data.faqItems) return data.faqItems;
    return [
      { id: 'faq1', question: 'Q1. 질문을 입력하세요.', answer: '답변을 입력하세요.' },
      { id: 'faq2', question: 'Q2. 질문을 입력하세요.', answer: '답변을 입력하세요.' },
      { id: 'faq3', question: 'Q3. 질문을 입력하세요.', answer: '답변을 입력하세요.' },
      { id: 'faq4', question: 'Q4. 질문을 입력하세요.', answer: '답변을 입력하세요.' },
      { id: 'faq5', question: 'Q5. 질문을 입력하세요.', answer: '답변을 입력하세요.' },
      { id: 'faq6', question: 'Q6. 질문을 입력하세요.', answer: '답변을 입력하세요.' }
    ];
  });

  // Section Cover Type 03 행 상태
  const [section03Rows, setSection03Rows] = useState(() => {
    if (template.id !== 'section03') return [];
    if (data.rows) return data.rows;
    return [
      { id: 'r1', title: '타이틀 텍스트', highlighted: true },
      { id: 'r2', title: '타이틀 텍스트', highlighted: false },
      { id: 'r3', title: '타이틀 텍스트', highlighted: false },
      { id: 'r4', title: '타이틀 텍스트', highlighted: false },
      { id: 'r5', title: '타이틀 텍스트', highlighted: false }
    ];
  });

  // Index Type 02용 섹션 상태
  const [index02Sections, setIndex02Sections] = useState(() => {
    if (template.id !== 'index02') return [];
    if (data.sections) return data.sections;
    return [
      { id: 'section_1', title: '타이틀 텍스트', subtitles: ['서브 타이틀 텍스트', '서브 타이틀 텍스트', '서브 타이틀 텍스트', '서브 타이틀 텍스트'] },
      { id: 'section_2', title: '타이틀 텍스트', subtitles: ['서브 타이틀 텍스트', '서브 타이틀 텍스트', '서브 타이틀 텍스트', '서브 타이틀 텍스트'] },
      { id: 'section_3', title: '타이틀 텍스트', subtitles: ['서브 타이틀 텍스트', '서브 타이틀 텍스트', '서브 타이틀 텍스트', '서브 타이틀 텍스트'] }
    ];
  });

  // 페이지 번호 계산
  const getPageNumber = (slideIndex) => calcPageNumber(slideIndex, slides);

  const handleTextEdit = (elementId, e) => {
    onUpdate(elementId, e.target.innerText);
  };

  const handleImageClick = (elementId) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      if (e.target.files[0]) onImageUpload(elementId, e.target.files[0]);
    };
    input.click();
  };

  // 섹션 삭제 핸들러 (애니메이션 + Undo 지원)
  const handleDeleteSection = (sectionKey) => {
    setUndoStack(prev => [...prev, { key: sectionKey, value: false }]);
    const element = document.querySelector(`[data-section="${sectionKey}"]`);
    if (element) {
      element.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      element.style.opacity = '0';
      element.style.transform = 'scale(0.95)';
      setTimeout(() => { onUpdate(sectionKey, true); }, 300);
    } else {
      onUpdate(sectionKey, true);
    }
  };

  // Ctrl+Z 키보드 이벤트
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        const isInputFocused = document.activeElement.tagName === 'INPUT' ||
                               document.activeElement.tagName === 'TEXTAREA' ||
                               document.activeElement.contentEditable === 'true';
        if (!isInputFocused && undoStack.length > 0) {
          e.preventDefault();
          const lastAction = undoStack[undoStack.length - 1];
          onUpdate(lastAction.key, false);
          setUndoStack(prev => prev.slice(0, -1));
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undoStack]);

  // 템플릿 전환 시 상태 재초기화
  useEffect(() => {
    if (template.id === 'index02' && index02Sections.length === 0) {
      setIndex02Sections(data.sections || [
        { id: 'section_1', title: '타이틀 텍스트', subtitles: ['서브 타이틀 텍스트', '서브 타이틀 텍스트', '서브 타이틀 텍스트', '서브 타이틀 텍스트'] },
        { id: 'section_2', title: '타이틀 텍스트', subtitles: ['서브 타이틀 텍스트', '서브 타이틀 텍스트', '서브 타이틀 텍스트', '서브 타이틀 텍스트'] },
        { id: 'section_3', title: '타이틀 텍스트', subtitles: ['서브 타이틀 텍스트', '서브 타이틀 텍스트', '서브 타이틀 텍스트', '서브 타이틀 텍스트'] }
      ]);
    }
  }, [template.id]);

  useEffect(() => {
    if (template.id === 'faq02' && faq02Items.length === 0) {
      setFaq02Items(data.faqItems || [
        { id: 'faq1', question: 'Q1. 질문을 입력하세요.', answer: '답변을 입력하세요.' },
        { id: 'faq2', question: 'Q2. 질문을 입력하세요.', answer: '답변을 입력하세요.' },
        { id: 'faq3', question: 'Q3. 질문을 입력하세요.', answer: '답변을 입력하세요.' },
        { id: 'faq4', question: 'Q4. 질문을 입력하세요.', answer: '답변을 입력하세요.' },
        { id: 'faq5', question: 'Q5. 질문을 입력하세요.', answer: '답변을 입력하세요.' },
        { id: 'faq6', question: 'Q6. 질문을 입력하세요.', answer: '답변을 입력하세요.' }
      ]);
    }
  }, [template.id]);

  useEffect(() => {
    if (template.id === 'faq01' && faq01Items.length === 0) {
      setFaq01Items(data.faqItems || [
        { id: 'faq1', question: 'Q1. 질문을 입력하세요.', answer: '답변을 입력하세요.' },
        { id: 'faq2', question: 'Q2. 질문을 입력하세요.', answer: '답변을 입력하세요.' },
        { id: 'faq3', question: 'Q3. 질문을 입력하세요.', answer: '답변을 입력하세요.' },
        { id: 'faq4', question: 'Q4. 질문을 입력하세요.', answer: '답변을 입력하세요.' },
        { id: 'faq5', question: 'Q5. 질문을 입력하세요.', answer: '답변을 입력하세요.' },
        { id: 'faq6', question: 'Q6. 질문을 입력하세요.', answer: '답변을 입력하세요.' }
      ]);
    }
  }, [template.id]);

  useEffect(() => {
    if (template.id === 'section03' && section03Rows.length === 0) {
      setSection03Rows(data.rows || [
        { id: 'r1', title: '타이틀 텍스트', highlighted: true },
        { id: 'r2', title: '타이틀 텍스트', highlighted: false },
        { id: 'r3', title: '타이틀 텍스트', highlighted: false },
        { id: 'r4', title: '타이틀 텍스트', highlighted: false },
        { id: 'r5', title: '타이틀 텍스트', highlighted: false }
      ]);
    }
  }, [template.id]);

  // 공통 props
  const common = { template, data, onUpdate, handleTextEdit, handleImageClick, getPageNumber, currentSlideIndex };

  // 라우팅
  const id = template.id;

  if (id === 'index02') {
    return <IndexRenderer {...common} handleDeleteSection={handleDeleteSection} dragState={dragState}
      tocItems={tocItems} setTocItems={setTocItems} tocDraggedIndex={tocDraggedIndex} setTocDraggedIndex={setTocDraggedIndex}
      index02Sections={index02Sections} setIndex02Sections={setIndex02Sections} />;
  }

  if (id === 'maincover01' || id === 'maincover02' || id === 'maincover03' || id === 'finalcover02' || id === 'finalcover03') {
    return <CoverRenderer {...common} dragState={dragState} />;
  }

  if (id === 'table01' && template.dynamicTable) {
    return <TableRenderer {...common} />;
  }

  if (id.startsWith('corevalue')) {
    return <CoreValueRenderer {...common} handleDeleteSection={handleDeleteSection} containerRef={containerRef} dragState={dragState} />;
  }

  if (id === 'faq01' || id === 'faq02') {
    return <FaqRenderer {...common}
      faq01Items={faq01Items} setFaq01Items={setFaq01Items}
      faq02Items={faq02Items} setFaq02Items={setFaq02Items} />;
  }

  if (id === 'section03') {
    return <SectionRenderer {...common} section03Rows={section03Rows} setSection03Rows={setSection03Rows} />;
  }

  if (id.startsWith('mobile')) {
    return <MobileRenderer {...common} textRefs={textRefs} dragState={dragState} />;
  }

  if (id.startsWith('pc')) {
    return <PcRenderer {...common} textRefs={textRefs} dragState={dragState} />;
  }

  // 제네릭 폴백
  return <GenericRenderer {...common} handleDeleteSection={handleDeleteSection} containerRef={containerRef} textRefs={textRefs} />;
}
