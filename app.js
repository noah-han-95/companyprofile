function PresentationBuilder() {
  const [currentTheme, setCurrentTheme] = useState('light');
  const [scale, setScale] = useState(0.4);
  const [statusMessage, setStatusMessage] = useState(null);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dropTargetIndex, setDropTargetIndex] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(true);

  // 기본 슬라이드 (data는 항상 초기화, templateId는 localStorage에서 복원)
  const defaultSlides = [
    { id: 's1', templateId: 'maincover01' },
    { id: 's2', templateId: 'index01' },
    { id: 's3', templateId: 'corevalue01' },
    { id: 's4', templateId: 'table01' },
    { id: 's5', templateId: 'section01' },
    { id: 's6', templateId: 'mobile01' },
    { id: 's7', templateId: 'pc01' },
    { id: 's8', templateId: 'faq01' },
    { id: 's9', templateId: 'contact01' },
    { id: 's10', templateId: 'finalcover01' }
  ];
  const [slides, setSlides] = useState(() => {
    const savedTypes = localStorage.getItem('transformtrack-templateIds-v2');
    if (savedTypes) {
      try {
        const typeMap = JSON.parse(savedTypes);
        const savedIds = Object.keys(typeMap);
        if (savedIds.length === defaultSlides.length) {
          // 기본 슬라이드 수와 같으면 기존 방식으로 복원
          return defaultSlides.map(s => ({ ...s, templateId: typeMap[s.id] || s.templateId, data: {} }));
        } else if (savedIds.length > defaultSlides.length) {
          // AI가 추가한 슬라이드가 있는 경우 — 전체 구조 복원
          return savedIds.map(id => ({ id, templateId: typeMap[id], data: {} }));
        }
      } catch(e) {}
    }
    return defaultSlides.map(s => ({ ...s, data: {} }));
  });
  const [currentSlideIndex, setCurrentSlideIndex] = useState(() => {
    const saved = localStorage.getItem('transformtrack-currentSlideIndex');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [copiedSlide, setCopiedSlide] = useState(null);

  const containerRef = useRef(null);
  const slideRef = useRef(null);
  const thumbnailRefs = useRef([]);

  const themes = {
    light: { name: '라이트 모드', navBg: 'bg-white', workspaceBg: 'bg-slate-50', slideBg: 'bg-white', textMain: 'text-slate-900', textSub: 'text-slate-500', accent: 'bg-white', uiAccent: 'bg-slate-900', border: 'border-slate-200', tabBg: 'bg-slate-100', activeTabBg: 'bg-white text-slate-900 shadow-sm' },
    dark: { name: '다크 모드', navBg: 'bg-slate-900', workspaceBg: 'bg-black', slideBg: 'bg-slate-900', textMain: 'text-white', textSub: 'text-slate-400', accent: 'bg-black', uiAccent: 'bg-indigo-500', border: 'border-slate-800', tabBg: 'bg-slate-800', activeTabBg: 'bg-slate-700 text-white' }
  };

  const theme = themes[currentTheme];

  const showStatus = (msg) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleZoom = (newScale) => {
    const constrainedScale = Math.max(0.1, Math.min(newScale, 1.5));
    setScale(constrainedScale);
  };

  const addSlide = (templateId) => {
    const newSlide = { id: `s${Date.now()}`, templateId, data: {} };
    const newSlides = [...slides];
    newSlides.splice(currentSlideIndex + 1, 0, newSlide);
    setSlides(newSlides);
    setCurrentSlideIndex(currentSlideIndex + 1);
    setShowTemplateModal(false);
    setSelectedCategory(null);
    showStatus('슬라이드가 추가되었습니다! ✨');
  };

  const replaceCurrentSlide = (templateId) => {
    const newSlides = [...slides];
    newSlides[currentSlideIndex] = { ...newSlides[currentSlideIndex], templateId, data: {} };
    setSlides(newSlides);
    setSelectedCategory(null);
  };

  const deleteSlide = () => {
    if (slides.length <= 1) {
      showStatus('최소 1개의 슬라이드가 필요합니다.');
      return;
    }
    const newSlides = slides.filter((_, idx) => idx !== currentSlideIndex);
    setSlides(newSlides);
    setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1));
    showStatus('슬라이드가 삭제되었습니다.');
  };

  const resetSlide = () => {
    const newSlides = [...slides];
    newSlides[currentSlideIndex] = {
      ...newSlides[currentSlideIndex],
      data: {}
    };
    setSlides(newSlides);
    showStatus('슬라이드가 초기화되었습니다! 🔄');
  };

  // 페이지 번호 자동 계산 (Main Cover, Final Cover, Index 제외)
  const getPageNumber = (slideIndex) => {
    if (!slides[slideIndex]) return '';

    // Main Cover, Final Cover, Index 개수만 제외하고 순차 카운트
    let pageNumber = 1;
    for (let i = 0; i < slideIndex; i++) {
      const templateId = slides[i].templateId;
      if (!templateId.startsWith('maincover') && !templateId.startsWith('finalcover') && !templateId.startsWith('index')) {
        pageNumber++;
      }
    }

    // 현재 슬라이드가 Main Cover, Final Cover, Index면 빈 문자열 반환
    const currentTemplateId = slides[slideIndex].templateId;
    if (currentTemplateId.startsWith('maincover') || currentTemplateId.startsWith('finalcover') || currentTemplateId.startsWith('index')) {
      return '';
    }

    return `P${pageNumber}`;
  };

  const duplicateSlide = () => {
    const currentSlide = slides[currentSlideIndex];
    const duplicatedSlide = {
      id: `s${Date.now()}`,
      templateId: currentSlide.templateId,
      data: { ...currentSlide.data }
    };
    const newSlides = [...slides];
    newSlides.splice(currentSlideIndex + 1, 0, duplicatedSlide);
    setSlides(newSlides);
    setCurrentSlideIndex(currentSlideIndex + 1);
    showStatus('슬라이드가 복제되었습니다! 📋');
  };

  // 드래그 앤 드롭 핸들러
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (draggedIndex !== null && draggedIndex !== index) {
      setDropTargetIndex(index);
    }
  };

  const handleDragLeave = () => {
    setDropTargetIndex(null);
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDropTargetIndex(null);
      return;
    }

    const newSlides = [...slides];
    const [draggedSlide] = newSlides.splice(draggedIndex, 1);
    newSlides.splice(dropIndex, 0, draggedSlide);

    setSlides(newSlides);
    setDraggedIndex(null);
    setDropTargetIndex(null);
    showStatus('슬라이드 순서가 변경되었습니다!');
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDropTargetIndex(null);
  };

  // AI 온보딩 완료 핸들러
  const handleOnboardingComplete = (newSlides) => {
    const addedCount = newSlides.length - slides.length;
    setSlides(newSlides);
    setShowOnboarding(false);
    if (addedCount > 0) {
      showStatus('AI가 슬라이드를 채우고 ' + addedCount + '개의 슬라이드를 추가했습니다! ✨');
    } else {
      showStatus('AI가 슬라이드를 자동으로 채웠습니다! ✨');
    }
  };

  const updateSlideData = (elementId, value) => {
    const newSlides = [...slides];
    if (!newSlides[currentSlideIndex].data) newSlides[currentSlideIndex].data = {};
    newSlides[currentSlideIndex].data[elementId] = value;
    setSlides(newSlides);
  };

  const handleImageUpload = (elementId, file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      updateSlideData(elementId, e.target.result);
      showStatus('이미지가 업로드되었습니다! 🖼️');
    };
    reader.readAsDataURL(file);
  };

  const exportToPDF = async () => {
    if (!window.html2canvas || !window.jspdf) {
      showStatus('라이브러리 로딩 중...');
      return;
    }
    showStatus('PDF 생성 중... ⏳');
    const pdf = new window.jspdf.jsPDF({ orientation: 'landscape', unit: 'px', format: [1920, 1080] });
    for (let i = 0; i < slides.length; i++) {
      setCurrentSlideIndex(i);
      await new Promise(resolve => setTimeout(resolve, 500));
      const canvas = await window.html2canvas(slideRef.current, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      if (i > 0) pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, 0, 1920, 1080);
    }
    pdf.save('TransformTrack-Presentation.pdf');
    showStatus('PDF 다운로드 완료! 📥');
  };


  // currentSlideIndex + templateId 저장 (새로고침 시 위치와 Type 복원, data는 초기화)
  useEffect(() => {
    localStorage.setItem('transformtrack-currentSlideIndex', currentSlideIndex.toString());
  }, [currentSlideIndex]);

  useEffect(() => {
    const typeMap = {};
    slides.forEach(s => { typeMap[s.id] = s.templateId; });
    localStorage.setItem('transformtrack-templateIds-v2', JSON.stringify(typeMap));
  }, [slides]);

  // 현재 슬라이드로 자동 스크롤
  useEffect(() => {
    if (thumbnailRefs.current[currentSlideIndex]) {
      thumbnailRefs.current[currentSlideIndex].scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }, [currentSlideIndex]);

  // 키보드 단축키 이벤트 핸들러
  useEffect(() => {
    const handleKeyDown = (e) => {
      // 입력 필드에서는 단축키 비활성화
      const isInputFocused = document.activeElement.tagName === 'INPUT' ||
                             document.activeElement.tagName === 'TEXTAREA' ||
                             document.activeElement.contentEditable === 'true';

      // ESC: 모달 닫기
      if (e.key === 'Escape') {
        if (showTemplateModal) {
          setShowTemplateModal(false);
          setSelectedCategory(null);
        }
        if (showOnboarding) {
          setShowOnboarding(false);
        }
        return;
      }

      if (isInputFocused) return;

      // Cmd/Ctrl + C: 슬라이드 복사
      if ((e.metaKey || e.ctrlKey) && e.key === 'c') {
        e.preventDefault();
        setCopiedSlide(slides[currentSlideIndex]);
        showStatus('슬라이드가 복사되었습니다! 📋');
        return;
      }

      // Cmd/Ctrl + V: 슬라이드 붙여넣기
      if ((e.metaKey || e.ctrlKey) && e.key === 'v') {
        e.preventDefault();
        if (copiedSlide) {
          const newSlide = {
            id: `s${Date.now()}`,
            templateId: copiedSlide.templateId,
            data: JSON.parse(JSON.stringify(copiedSlide.data || {}))
          };
          const newSlides = [...slides];
          newSlides.splice(currentSlideIndex + 1, 0, newSlide);
          setSlides(newSlides);
          setCurrentSlideIndex(currentSlideIndex + 1);
          showStatus('슬라이드가 붙여넣기 되었습니다! ✨');
        } else {
          showStatus('복사된 슬라이드가 없습니다.');
        }
        return;
      }

      // Cmd/Ctrl + D: 슬라이드 복제
      if ((e.metaKey || e.ctrlKey) && e.key === 'd') {
        e.preventDefault();
        duplicateSlide();
        return;
      }

      // ArrowUp: 이전 슬라이드
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (currentSlideIndex > 0) {
          setCurrentSlideIndex(currentSlideIndex - 1);
        }
        return;
      }

      // ArrowDown: 다음 슬라이드
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (currentSlideIndex < slides.length - 1) {
          setCurrentSlideIndex(currentSlideIndex + 1);
        }
        return;
      }

      // ArrowLeft / ArrowRight: 같은 카테고리 내 Type 전환
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        const currentSlide = slides[currentSlideIndex];
        const currentTpl = ALL_TEMPLATES[currentSlide?.templateId];
        if (!currentTpl) return;
        const categoryTemplates = Object.values(ALL_TEMPLATES).filter(t => t.category === currentTpl.category);
        if (categoryTemplates.length <= 1) return;
        const currentIdx = categoryTemplates.findIndex(t => t.id === currentTpl.id);
        let nextIdx;
        if (e.key === 'ArrowLeft') {
          nextIdx = currentIdx <= 0 ? categoryTemplates.length - 1 : currentIdx - 1;
        } else {
          nextIdx = currentIdx >= categoryTemplates.length - 1 ? 0 : currentIdx + 1;
        }
        e.preventDefault();
        replaceCurrentSlide(categoryTemplates[nextIdx].id);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlideIndex, slides, copiedSlide, showTemplateModal, showOnboarding]);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        const scaleW = (clientWidth - 20) / 1920;
        const scaleH = (clientHeight - 130) / 1080;
        setScale(Math.min(scaleW, scaleH, 1.4));
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const currentSlide = slides[currentSlideIndex];
  const currentTemplate = currentSlide ? ALL_TEMPLATES[currentSlide.templateId] : null;

  const templatesByCategory = Object.values(ALL_TEMPLATES).reduce((acc, template) => {
    if (!acc[template.category]) acc[template.category] = [];
    acc[template.category].push(template);
    return acc;
  }, {});

  // 카테고리 순서 정의
  const categoryOrder = ['Main Cover', 'Index', 'Core Value', 'Table', 'Section', 'Mobile', 'PC', 'FAQ', 'Contact', 'Final Cover'];
  const orderedCategories = categoryOrder.filter(cat => templatesByCategory[cat]);

  // 현재 슬라이드의 카테고리 템플릿들만 가져오기
  const currentCategory = currentTemplate?.category;
  const currentCategoryTemplates = currentCategory ? templatesByCategory[currentCategory] : [];

  return (
    <div className={`h-screen flex flex-col overflow-hidden font-sans`}>
      <nav className={`${theme.navBg} border-b ${theme.border} px-6 flex items-center justify-between z-50 shadow-sm py-3`}>
        <div className="flex items-center gap-3">
          <span className={`font-bold ${theme.textMain} tracking-tight text-base`}>TransformTrack 소개서 빌더</span>
          <div className={`hidden sm:flex px-2 py-0.5 rounded text-[10px] font-bold border ${theme.border} ${theme.textSub}`}>1920 x 1080</div>
          <button onClick={() => setShowOnboarding(true)} className="px-3 py-1.5 text-xs font-bold bg-indigo-100 text-indigo-600 hover:bg-indigo-200 rounded-lg">🤖 AI 자동생성</button>
        </div>

        {/* 현재 카테고리의 템플릿 Type 선택 */}
        <div className="flex-1 flex items-center justify-center gap-3 overflow-x-auto no-scrollbar">
          {currentCategory && (
            <>
              <span className="text-sm font-bold text-slate-700 mr-1">{currentCategory}:</span>
              {currentCategoryTemplates.map((template) => {
                const isCurrentTemplate = currentSlide?.templateId === template.id;
                return (
                  <button
                    key={template.id}
                    onClick={() => replaceCurrentSlide(template.id)}
                    className={`px-4 py-2 text-sm font-bold rounded-lg whitespace-nowrap ${
                      isCurrentTemplate
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {template.name}
                  </button>
                );
              })}
            </>
          )}
        </div>

        <div className="flex items-center gap-4 border-l pl-4 border-slate-200 ml-2">
          <div className="flex gap-2">
            {Object.keys(themes).map((t) => (
              <button key={t} onClick={() => setCurrentTheme(t)} className={`w-6 h-6 rounded-full border ${currentTheme === t ? 'ring-2 ring-indigo-500 ring-offset-2' : 'border-slate-300'} ${themes[t].accent}`} />
            ))}
          </div>
        </div>
      </nav>

      <main className="flex-1 flex overflow-hidden">
        <div className="w-64 bg-white border-r border-slate-200 flex flex-col flex-shrink-0">
          <div className="flex items-center justify-between p-4 pb-3">
            <h3 className="font-bold text-slate-700 text-sm">슬라이드</h3>
            <button onClick={() => setShowTemplateModal(true)} className="px-3 py-1.5 text-xs font-bold bg-indigo-100 text-indigo-600 hover:bg-indigo-200 rounded-lg transition">+ 추가</button>
          </div>
          <div className="flex-1 overflow-y-auto no-scrollbar px-4 pt-2 pb-4 space-y-3">
            {slides.map((slide, idx) => {
              const template = ALL_TEMPLATES[slide.templateId];
              const isDragging = draggedIndex === idx;
              const isDropTarget = dropTargetIndex === idx;
              const showTopIndicator = isDropTarget && draggedIndex !== null && draggedIndex > idx;
              const showBottomIndicator = isDropTarget && draggedIndex !== null && draggedIndex < idx;

              return (
                <div
                  key={slide.id}
                  ref={(el) => (thumbnailRefs.current[idx] = el)}
                  draggable
                  onDragStart={(e) => handleDragStart(e, idx)}
                  onDragOver={(e) => handleDragOver(e, idx)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, idx)}
                  onDragEnd={handleDragEnd}
                  onClick={() => setCurrentSlideIndex(idx)}
                  className={`thumbnail p-3 border-2 rounded-lg cursor-grab transition-all ${
                    idx === currentSlideIndex ? 'active' : 'border-slate-200'
                  } ${isDragging ? 'dragging' : ''} ${
                    showTopIndicator ? 'drop-indicator-top' : ''
                  } ${showBottomIndicator ? 'drop-indicator-bottom' : ''}`}
                >
                  <TemplateThumbnail template={template} data={slide.data} slideIndex={idx} slides={slides} />
                  <div className="text-xs font-semibold text-slate-600 text-center truncate mt-2">{idx + 1}. {template?.category}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div ref={containerRef} className={`flex-1 ${theme.workspaceBg} flex flex-col items-center justify-center relative overflow-hidden p-1 pb-20`}>
          <div ref={slideRef} className={`${theme.slideBg} shadow-2xl relative overflow-hidden border ${theme.border}`} style={{ width: '1920px', height: '1080px', transform: `scale(${scale})`, flexShrink: 0, transformOrigin: 'center center' }}>
            {currentTemplate && <SlideCanvas template={currentTemplate} data={currentSlide.data} onUpdate={updateSlideData} onImageUpload={handleImageUpload} currentSlideIndex={currentSlideIndex} slides={slides} />}
          </div>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/95 backdrop-blur-md p-2 rounded-2xl shadow-[0_10px_50px_rgba(0,0,0,0.1)] border border-white/50 z-[100] w-max max-w-[98vw] overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-2.5 px-3">
              <button onClick={() => handleZoom(scale - 0.05)} className="p-1 hover:bg-slate-100 rounded text-slate-500 flex items-center justify-center text-lg font-bold">−</button>
              <div className="flex items-center gap-2 min-w-[140px]">
                <input type="range" min="0.1" max="1.5" step="0.05" value={scale} onChange={(e) => handleZoom(parseFloat(e.target.value))} className="flex-1 accent-indigo-600 h-1 cursor-pointer appearance-none bg-slate-200 rounded-full" />
                <span className="text-[10px] font-black text-slate-500 tabular-nums w-8 text-right">{Math.round(scale * 100)}%</span>
              </div>
              <button onClick={() => handleZoom(scale + 0.05)} className="p-1 hover:bg-slate-100 rounded text-slate-500 flex items-center justify-center text-lg font-bold">+</button>
            </div>
            <div className="w-px h-6 bg-slate-200 mx-1" />
            <button onClick={resetSlide} className="px-3 py-2 hover:bg-blue-100 text-blue-600 rounded-lg font-bold text-sm">새로고침</button>
            <div className="w-px h-6 bg-slate-200 mx-1" />
            <button onClick={deleteSlide} className="px-3 py-2 hover:bg-red-100 text-red-600 rounded-lg font-bold text-sm">삭제</button>
            <div className="w-px h-6 bg-slate-200 mx-1" />
            <button onClick={exportToPDF} className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md shadow-emerald-100"><span className="text-[11px] whitespace-nowrap">📥 PDF</span></button>
          </div>
        </div>
      </main>

      {showTemplateModal && (
        <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-indigo-50/30">
              <h3 className="font-bold text-sm uppercase tracking-widest text-indigo-600">템플릿 선택 (총 23개)</h3>
              <button onClick={() => setShowTemplateModal(false)} className="text-slate-400 hover:text-slate-600 p-1 text-xl">✕</button>
            </div>
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              {orderedCategories.map((category) => {
                const templates = templatesByCategory[category];
                return (
                  <div key={category} className="mb-6">
                    <h4 className="font-bold text-slate-700 mb-3 text-sm">{category} ({templates.length}개)</h4>
                    <div className="grid grid-cols-3 gap-3">
                      {templates.map((template) => (
                        <button key={template.id} onClick={() => addSlide(template.id)} className="p-4 border-2 border-slate-200 rounded-xl hover:border-indigo-500 hover:shadow-lg text-center group">
                          <TemplateThumbnail template={template} data={{}} />
                          <div className="font-semibold text-slate-700 text-xs mt-2">{template.name}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* AI 온보딩 모달 */}
      {showOnboarding && (
        <OnboardingModal
          slides={slides}
          onComplete={handleOnboardingComplete}
          onSkip={() => setShowOnboarding(false)}
        />
      )}

      {statusMessage && <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white px-5 py-2 rounded-full shadow-2xl flex items-center gap-2.5 z-[300]"><span className="text-xs font-medium">{statusMessage}</span></div>}
    </div>
  );
}

ReactDOM.render(<PresentationBuilder />, document.getElementById('root'));
