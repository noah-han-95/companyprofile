function SlideCanvas({ template, data, onUpdate, onImageUpload, currentSlideIndex, slides }) {
  const textRefs = useRef({});
  const containerRef = useRef(null);
  const [, forceRender] = useState(0);
  const [undoStack, setUndoStack] = useState([]);

  // 이미지 선택 팝업 상태: mode = 'select' | 'prompt' | 'generating'
  const [imagePopup, setImagePopup] = useState({ show: false, elementId: null, x: 0, y: 0, mode: 'select' });
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiImageError, setAiImageError] = useState('');

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

  const closeImagePopup = () => {
    setImagePopup({ show: false, elementId: null, x: 0, y: 0, mode: 'select' });
    setAiPrompt('');
    setAiImageError('');
  };

  const handleImageClick = (elementId, e) => {
    let x = window.innerWidth / 2, y = window.innerHeight / 2;
    if (e && e.clientX !== undefined) {
      x = e.clientX;
      y = e.clientY;
    }
    setImagePopup({ show: true, elementId, x, y, mode: 'select' });
  };

  const handleImageUploadDirect = () => {
    const elementId = imagePopup.elementId;
    closeImagePopup();
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      if (e.target.files[0]) onImageUpload(elementId, e.target.files[0]);
    };
    input.click();
  };

  const handleImageAIGenerate = async () => {
    if (!aiPrompt.trim()) return;
    const elementId = imagePopup.elementId;
    setAiImageError('');
    setImagePopup(prev => ({ ...prev, mode: 'generating' }));

    try {
      const dataUrl = await generateAIImage(aiPrompt.trim());
      onUpdate(elementId, dataUrl);
      closeImagePopup();
    } catch (err) {
      setAiImageError(err.message);
      setImagePopup(prev => ({ ...prev, mode: 'prompt' }));
    }
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

  // 이미지 팝업 외부 클릭 닫기 (생성중에는 닫지 않음)
  useEffect(() => {
    if (!imagePopup.show || imagePopup.mode === 'generating') return;
    const handleClickOutside = () => closeImagePopup();
    const timer = setTimeout(() => window.addEventListener('click', handleClickOutside), 0);
    return () => { clearTimeout(timer); window.removeEventListener('click', handleClickOutside); };
  }, [imagePopup.show, imagePopup.mode]);

  // 이미지 선택 팝업 렌더링
  const imagePopupOverlay = imagePopup.show && (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/30 backdrop-blur-sm"
      onClick={(e) => { if (imagePopup.mode !== 'generating') { e.stopPropagation(); closeImagePopup(); } }}
    >
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-[520px] max-w-[90vw] overflow-hidden"
        onClick={(e) => e.stopPropagation()}>

        {/* 모드: 선택 */}
        {imagePopup.mode === 'select' && <>
          <div className="px-8 pt-7 pb-4">
            <p className="text-base font-bold text-slate-600 tracking-wide">이미지 추가 방법</p>
          </div>
          <div className="pb-5 px-2">
            <button
              onClick={handleImageUploadDirect}
              className="w-full px-8 py-5 text-left text-xl font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition flex items-center gap-5 rounded-2xl"
            >
              <span className="text-3xl">📁</span> 직접 업로드
            </button>
            <button
              onClick={() => setImagePopup(prev => ({ ...prev, mode: 'prompt' }))}
              className="w-full px-8 py-5 text-left text-xl font-bold text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition flex items-center gap-5 rounded-2xl"
            >
              <span className="text-3xl">✨</span> AI로 생성
            </button>
          </div>
        </>}

        {/* 모드: 프롬프트 입력 */}
        {imagePopup.mode === 'prompt' && <>
          <div className="px-8 pt-7 pb-3 flex items-center gap-3">
            <button onClick={() => { setImagePopup(prev => ({ ...prev, mode: 'select' })); setAiImageError(''); }}
              className="text-slate-400 hover:text-slate-600 text-xl">←</button>
            <p className="text-base font-bold text-slate-600 tracking-wide">AI 이미지 생성</p>
          </div>
          <div className="px-8 pb-7 pt-3">
            <p className="text-sm text-slate-400 mb-4">원하는 이미지를 설명해주세요.</p>
            <textarea
              value={aiPrompt}
              onChange={(e) => { setAiPrompt(e.target.value); setAiImageError(''); }}
              placeholder="예: 현대적인 오피스 환경에서 협업하는 팀원들"
              className="w-full px-5 py-4 border-2 border-slate-200 rounded-xl text-base focus:border-purple-400 focus:outline-none resize-none"
              rows={4}
              autoFocus
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleImageAIGenerate(); } }}
            />
            {aiImageError && (
              <div className="mt-3 p-3 bg-red-50 rounded-xl">
                <p className="text-sm text-red-500 font-medium">{aiImageError}</p>
              </div>
            )}
            <button
              onClick={handleImageAIGenerate}
              disabled={!aiPrompt.trim()}
              className={`w-full mt-4 py-4 rounded-xl font-bold text-base transition shadow-lg ${
                aiPrompt.trim()
                  ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-200'
                  : 'bg-slate-100 text-slate-300 cursor-not-allowed shadow-none'
              }`}
            >
              {aiImageError ? '다시 시도하기' : '이미지 생성하기'}
            </button>
          </div>
        </>}

        {/* 모드: 생성중 */}
        {imagePopup.mode === 'generating' && <>
          <div className="px-8 py-14 text-center">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-purple-100"></div>
              <div className="absolute inset-0 rounded-full border-4 border-purple-500 border-t-transparent animate-spin"></div>
              <span className="absolute inset-0 flex items-center justify-center text-3xl">✨</span>
            </div>
            <p className="font-bold text-slate-700 text-xl">AI가 이미지를 생성하고 있어요</p>
            <p className="text-base text-slate-400 mt-3">잠시만 기다려주세요...</p>
            <div className="mt-5 mx-auto w-64 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-400 to-indigo-500 rounded-full" style={{ animation: 'progressIndeterminate 2s ease-in-out infinite' }}></div>
            </div>
            <p className="text-sm text-slate-300 mt-4 truncate px-6">"{aiPrompt}"</p>
          </div>
        </>}
      </div>
    </div>
  );

  // 공통 props
  const common = { template, data, onUpdate, handleTextEdit, handleImageClick, getPageNumber, currentSlideIndex };

  // 라우팅
  const id = template.id;
  let content;

  if (id === 'index02') {
    content = <IndexRenderer {...common} handleDeleteSection={handleDeleteSection} dragState={dragState}
      tocItems={tocItems} setTocItems={setTocItems} tocDraggedIndex={tocDraggedIndex} setTocDraggedIndex={setTocDraggedIndex}
      index02Sections={index02Sections} setIndex02Sections={setIndex02Sections} />;
  } else if (id === 'maincover01' || id === 'maincover02' || id === 'maincover03' || id === 'finalcover02' || id === 'finalcover03') {
    content = <CoverRenderer {...common} dragState={dragState} />;
  } else if (id === 'table01' && template.dynamicTable) {
    content = <TableRenderer {...common} />;
  } else if (id.startsWith('corevalue')) {
    content = <CoreValueRenderer {...common} handleDeleteSection={handleDeleteSection} containerRef={containerRef} dragState={dragState} />;
  } else if (id === 'faq01' || id === 'faq02') {
    content = <FaqRenderer {...common}
      faq01Items={faq01Items} setFaq01Items={setFaq01Items}
      faq02Items={faq02Items} setFaq02Items={setFaq02Items} />;
  } else if (id === 'section03') {
    content = <SectionRenderer {...common} section03Rows={section03Rows} setSection03Rows={setSection03Rows} />;
  } else if (id.startsWith('mobile')) {
    content = <MobileRenderer {...common} textRefs={textRefs} dragState={dragState} />;
  } else if (id.startsWith('pc')) {
    content = <PcRenderer {...common} textRefs={textRefs} dragState={dragState} />;
  } else {
    content = <GenericRenderer {...common} handleDeleteSection={handleDeleteSection} containerRef={containerRef} textRefs={textRefs} />;
  }

  return <>
    {content}
    {imagePopupOverlay}
  </>;
}
