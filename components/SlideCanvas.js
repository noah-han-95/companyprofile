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

  // Index Type 01 TOC 상태
  const [tocItems, setTocItems] = useState(template.tocItems || []);
  const [tocDraggedIndex, setTocDraggedIndex] = useState(null);

  // FAQ Type 02 동적 아이템 상태
  const [faq02Items, setFaq02Items] = useState(() => {
    if (template.id !== 'faq02') return [];
    if (data.faqItems) return data.faqItems;
    return [
      { id: 'faq1', question: 'Q1. 질문을 입력하세요.', answer: '답변을 입력하세요.' },
      { id: 'faq2', question: 'Q2. 질문을 입력하세요.', answer: '답변을 입력하세요.' },
      { id: 'faq3', question: 'Q3. 질문을 입력하세요.', answer: '답변을 입력하세요.' },
      { id: 'faq4', question: 'Q4. 질문을 입력하세요.', answer: '답변을 입력하세요.' },
      { id: 'faq5', question: 'Q5. 질문을 입력하세요.', answer: '답변을 입력하세요.' }
    ];
  });

  // FAQ Type 01 동적 아이템 상태
  const [faq01Items, setFaq01Items] = useState(() => {
    if (template.id !== 'faq01') return [];
    if (data.faqItems) return data.faqItems;
    return [
      { id: 'faq1', question: 'Q1. 질문을 입력하세요.', answer: '답변을 입력하세요.' },
      { id: 'faq2', question: 'Q2. 질문을 입력하세요.', answer: '답변을 입력하세요.' },
      { id: 'faq3', question: 'Q3. 질문을 입력하세요.', answer: '답변을 입력하세요.' },
      { id: 'faq4', question: 'Q4. 질문을 입력하세요.', answer: '답변을 입력하세요.' },
      { id: 'faq5', question: 'Q5. 질문을 입력하세요.', answer: '답변을 입력하세요.' },
      { id: 'faq6', question: 'Q6. 질문을 입력하세요.', answer: '답변을 입력하세요.' },
      { id: 'faq7', question: 'Q7. 질문을 입력하세요.', answer: '답변을 입력하세요.' },
      { id: 'faq8', question: 'Q8. 질문을 입력하세요.', answer: '답변을 입력하세요.' }
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

  // 페이지 번호 계산 함수
  const getPageNumber = (slideIndex) => {
    if (!slides || !slides[slideIndex]) return '';

    let pageNumber = 1;
    for (let i = 0; i < slideIndex; i++) {
      const templateId = slides[i].templateId;
      if (!templateId.startsWith('maincover') && !templateId.startsWith('finalcover') && !templateId.startsWith('index')) {
        pageNumber++;
      }
    }

    const currentTemplateId = slides[slideIndex].templateId;
    if (currentTemplateId.startsWith('maincover') || currentTemplateId.startsWith('finalcover') || currentTemplateId.startsWith('index')) {
      return '';
    }

    return `P${pageNumber}`;
  };

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
    // Undo 스택에 현재 상태 저장
    setUndoStack(prev => [...prev, { key: sectionKey, value: false }]);

    // 삭제 애니메이션을 위한 상태 (fade-out)
    const element = document.querySelector(`[data-section="${sectionKey}"]`);
    if (element) {
      element.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      element.style.opacity = '0';
      element.style.transform = 'scale(0.95)';

      setTimeout(() => {
        onUpdate(sectionKey, true);
      }, 300);
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

  // Index Type 02용 섹션 상태 - 항상 선언 (React hooks 규칙)
  const [index02Sections, setIndex02Sections] = useState(() => {
    if (template.id !== 'index02') return [];
    if (data.sections) return data.sections;

    return [
      {
        id: 'section_1',
        title: '타이틀 텍스트',
        subtitles: ['서브 타이틀 텍스트', '서브 타이틀 텍스트', '서브 타이틀 텍스트', '서브 타이틀 텍스트']
      },
      {
        id: 'section_2',
        title: '타이틀 텍스트',
        subtitles: ['서브 타이틀 텍스트', '서브 타이틀 텍스트', '서브 타이틀 텍스트', '서브 타이틀 텍스트']
      },
      {
        id: 'section_3',
        title: '타이틀 텍스트',
        subtitles: ['서브 타이틀 텍스트', '서브 타이틀 텍스트', '서브 타이틀 텍스트', '서브 타이틀 텍스트']
      }
    ];
  });

  // template이 index02로 전환될 때 sections 재초기화
  useEffect(() => {
    if (template.id === 'index02' && index02Sections.length === 0) {
      const defaultSections = data.sections || [
        { id: 'section_1', title: '타이틀 텍스트', subtitles: ['서브 타이틀 텍스트', '서브 타이틀 텍스트', '서브 타이틀 텍스트', '서브 타이틀 텍스트'] },
        { id: 'section_2', title: '타이틀 텍스트', subtitles: ['서브 타이틀 텍스트', '서브 타이틀 텍스트', '서브 타이틀 텍스트', '서브 타이틀 텍스트'] },
        { id: 'section_3', title: '타이틀 텍스트', subtitles: ['서브 타이틀 텍스트', '서브 타이틀 텍스트', '서브 타이틀 텍스트', '서브 타이틀 텍스트'] }
      ];
      setIndex02Sections(defaultSections);
    }
  }, [template.id]);

  // template이 faq02으로 전환될 때 재초기화
  useEffect(() => {
    if (template.id === 'faq02' && faq02Items.length === 0) {
      const defaultItems = data.faqItems || [
        { id: 'faq1', question: 'Q1. 질문을 입력하세요.', answer: '답변을 입력하세요.' },
        { id: 'faq2', question: 'Q2. 질문을 입력하세요.', answer: '답변을 입력하세요.' },
        { id: 'faq3', question: 'Q3. 질문을 입력하세요.', answer: '답변을 입력하세요.' },
        { id: 'faq4', question: 'Q4. 질문을 입력하세요.', answer: '답변을 입력하세요.' },
        { id: 'faq5', question: 'Q5. 질문을 입력하세요.', answer: '답변을 입력하세요.' }
      ];
      setFaq02Items(defaultItems);
    }
  }, [template.id]);

  // template이 faq01으로 전환될 때 재초기화
  useEffect(() => {
    if (template.id === 'faq01' && faq01Items.length === 0) {
      const defaultItems = data.faqItems || [
        { id: 'faq1', question: 'Q1. 질문을 입력하세요.', answer: '답변을 입력하세요.' },
        { id: 'faq2', question: 'Q2. 질문을 입력하세요.', answer: '답변을 입력하세요.' },
        { id: 'faq3', question: 'Q3. 질문을 입력하세요.', answer: '답변을 입력하세요.' },
        { id: 'faq4', question: 'Q4. 질문을 입력하세요.', answer: '답변을 입력하세요.' },
        { id: 'faq5', question: 'Q5. 질문을 입력하세요.', answer: '답변을 입력하세요.' },
        { id: 'faq6', question: 'Q6. 질문을 입력하세요.', answer: '답변을 입력하세요.' },
        { id: 'faq7', question: 'Q7. 질문을 입력하세요.', answer: '답변을 입력하세요.' },
        { id: 'faq8', question: 'Q8. 질문을 입력하세요.', answer: '답변을 입력하세요.' }
      ];
      setFaq01Items(defaultItems);
    }
  }, [template.id]);

  // template이 section03으로 전환될 때 rows 재초기화
  useEffect(() => {
    if (template.id === 'section03' && section03Rows.length === 0) {
      const defaultRows = data.rows || [
        { id: 'r1', title: '타이틀 텍스트', highlighted: true },
        { id: 'r2', title: '타이틀 텍스트', highlighted: false },
        { id: 'r3', title: '타이틀 텍스트', highlighted: false },
        { id: 'r4', title: '타이틀 텍스트', highlighted: false },
        { id: 'r5', title: '타이틀 텍스트', highlighted: false }
      ];
      setSection03Rows(defaultRows);
    }
  }, [template.id]);

  // Index Type 02 (Dynamic Sections) 전용 렌더링
  if (template.id === 'index02') {
    const sections = index02Sections;

    // 섹션 추가 (최대 3개)
    const handleAddSection = () => {
      if (sections.length >= 3) {
        alert('최대 3개의 섹션만 추가할 수 있습니다.');
        return;
      }

      const newSection = {
        id: `section_${Date.now()}`,
        title: '타이틀 텍스트',
        subtitles: ['서브 타이틀 텍스트', '서브 타이틀 텍스트', '서브 타이틀 텍스트', '서브 타이틀 텍스트']
      };

      setIndex02Sections([...sections, newSection]);
      onUpdate('sections', [...sections, newSection]);
    };

    // 섹션 삭제
    const handleDeleteSection = (sectionId) => {
      if (sections.length <= 1) {
        alert('최소 1개의 섹션은 유지되어야 합니다.');
        return;
      }

      const newSections = sections.filter(s => s.id !== sectionId);
      setIndex02Sections(newSections);
      onUpdate('sections', newSections);
    };

    // 타이틀 수정
    const handleTitleEdit = (sectionId, newTitle) => {
      const newSections = sections.map(s =>
        s.id === sectionId ? { ...s, title: newTitle } : s
      );
      setIndex02Sections(newSections);
      onUpdate('sections', newSections);
    };

    // 보조 타이틀 수정
    const handleSubtitleEdit = (sectionId, subtitleIndex, newSubtitle) => {
      const newSections = sections.map(s => {
        if (s.id === sectionId) {
          const newSubtitles = [...s.subtitles];
          newSubtitles[subtitleIndex] = newSubtitle;
          return { ...s, subtitles: newSubtitles };
        }
        return s;
      });
      setIndex02Sections(newSections);
      onUpdate('sections', newSections);
    };

    // 보조 타이틀 삭제
    const handleDeleteSubtitle = (sectionId, subtitleIndex) => {
      const newSections = sections.map(s => {
        if (s.id === sectionId) {
          if (s.subtitles.length <= 1) {
            alert('최소 1개의 보조 타이틀은 유지되어야 합니다.');
            return s;
          }
          const newSubtitles = s.subtitles.filter((_, idx) => idx !== subtitleIndex);
          return { ...s, subtitles: newSubtitles };
        }
        return s;
      });
      setIndex02Sections(newSections);
      onUpdate('sections', newSections);
    };

    // 보조 타이틀 추가
    const handleAddSubtitle = (sectionId) => {
      const newSections = sections.map(s => {
        if (s.id === sectionId) {
          if (s.subtitles.length >= 4) {
            alert('최대 4개의 보조 타이틀만 추가할 수 있습니다.');
            return s;
          }
          return { ...s, subtitles: [...s.subtitles, '서브 타이틀 텍스트'] };
        }
        return s;
      });
      setIndex02Sections(newSections);
      onUpdate('sections', newSections);
    };

    return (
      <div className="w-full h-full relative" style={{ backgroundColor: '#F7F7F7' }}>
        {/* 배경 */}
        <div style={{ position: 'absolute', left: '0px', top: '0px', width: '1920px', height: '1080px', backgroundColor: '#F7F7F7' }} />

        {/* 목차 타이틀 */}
        <div
          className="editable-field"
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => handleTextEdit('main_title', e)}
          style={{
            position: 'absolute',
            left: '120px',
            top: '100px',
            fontSize: '90px',
            fontWeight: '700',
            color: '#333333',
            fontFamily: 'Pretendard',
            letterSpacing: '-0.9px',
            lineHeight: 1.3,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
          {data['main_title'] || '목차'}
        </div>

        {/* 섹션 추가/삭제 버튼 - 우측 상단 */}
        <div style={{ position: 'absolute', right: '120px', top: '100px', display: 'flex', gap: '12px', zIndex: 10 }}>
          <button
            onClick={handleAddSection}
            disabled={sections.length >= 3}
            style={{
              padding: '12px 24px',
              backgroundColor: sections.length >= 3 ? '#CCCCCC' : '#333333',
              color: '#FFFFFF',
              borderRadius: '8px',
              border: 'none',
              fontSize: '16px',
              fontWeight: '600',
              cursor: sections.length >= 3 ? 'not-allowed' : 'pointer',
              fontFamily: 'Pretendard',
              transition: 'all 0.2s ease'
            }}
            title={sections.length >= 3 ? '최대 3개까지만 추가 가능합니다' : '섹션 추가'}>
            + 섹션 추가
          </button>
        </div>

        {/* 동적 섹션 렌더링 */}
        {sections.map((section, sectionIndex) => {
          // 섹션별 시작 Y 좌표 계산 (목차보다 조금 아래)
          let sectionStartY = 150;
          for (let i = 0; i < sectionIndex; i++) {
            sectionStartY += 62 * (1 + sections[i].subtitles.length);
          }

          return (
            <div key={section.id} className="index02-section-wrapper">
              {/* 섹션 타이틀 */}
              <div
                className="index02-title-row"
                style={{
                  position: 'absolute',
                  left: '960px',
                  top: `${sectionStartY}px`,
                  width: '360px',
                  height: '62px',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                {/* 번호 (편집 불가) */}
                <span
                  style={{
                    fontSize: '32px',
                    fontWeight: '700',
                    color: '#333333',
                    fontFamily: 'Pretendard',
                    letterSpacing: '-0.32px',
                    lineHeight: 1.3,
                    marginRight: '8px',
                    flexShrink: 0
                  }}>
                  {String(sectionIndex + 1).padStart(2, '0')}.
                </span>

                {/* 타이틀 텍스트 (편집 가능) */}
                <div
                  className="editable-field"
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => handleTitleEdit(section.id, e.target.innerText)}
                  style={{
                    fontSize: '32px',
                    fontWeight: '700',
                    color: '#333333',
                    fontFamily: 'Pretendard',
                    letterSpacing: '-0.32px',
                    lineHeight: 1.3,
                    flex: 1,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                  {section.title}
                </div>

                {/* 섹션 삭제 버튼 - 호버 시에만 표시 */}
                <button
                  onClick={() => handleDeleteSection(section.id)}
                  className="section-delete-btn"
                  style={{
                    position: 'absolute',
                    left: '-110px',
                    padding: '10px 16px',
                    backgroundColor: '#333333',
                    color: '#FFFFFF',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontFamily: 'Pretendard',
                    transition: 'all 0.2s ease',
                    opacity: 0,
                    pointerEvents: sections.length <= 1 ? 'none' : 'auto'
                  }}
                  title="섹션 전체 삭제">
                  섹션 삭제
                </button>
              </div>

              {/* 보조 타이틀들 - 타이틀과 같은 행부터 시작 */}
              {section.subtitles.map((subtitle, subIndex) => (
                <div
                  key={subIndex}
                  className="index02-subtitle-row"
                  style={{
                    position: 'absolute',
                    left: '1344px',
                    top: `${sectionStartY + (subIndex * 62)}px`,
                    width: '456px',
                    height: '62px',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                  <div
                    className="editable-field"
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => handleSubtitleEdit(section.id, subIndex, e.target.innerText)}
                    style={{
                      fontSize: '32px',
                      fontWeight: '700',
                      color: '#666666',
                      fontFamily: 'Pretendard',
                      letterSpacing: '-0.32px',
                      lineHeight: 1.5,
                      flex: 1,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                    {subtitle}
                  </div>

                  {/* 행 삭제 버튼 - 호버 시에만 표시 */}
                  <button
                    onClick={() => handleDeleteSubtitle(section.id, subIndex)}
                    className="row-delete-btn"
                    style={{
                      marginLeft: '16px',
                      padding: '8px 14px',
                      backgroundColor: '#333333',
                      color: '#FFFFFF',
                      borderRadius: '5px',
                      border: 'none',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      fontFamily: 'Pretendard',
                      transition: 'all 0.2s ease',
                      opacity: 0,
                      pointerEvents: section.subtitles.length <= 1 ? 'none' : 'auto'
                    }}
                    title="행 삭제">
                    ×
                  </button>
                </div>
              ))}
            </div>
          );
        })}

        {/* CSS for hover effects */}
        <style jsx>{`
          .index02-title-row:hover .section-delete-btn {
            opacity: 1 !important;
          }
          .index02-subtitle-row:hover .row-delete-btn {
            opacity: 1 !important;
          }
          .section-delete-btn:hover {
            background-color: #000000 !important;
          }
          .row-delete-btn:hover {
            background-color: #000000 !important;
          }
        `}</style>

        {/* Footer - 로고 */}
        <div style={{ position: 'absolute', left: '120px', top: '991px', width: '118px', height: '20px' }}>
          <img src="assets/icons/yeogi-logo.svg" alt="" className="w-full h-full object-contain" />
        </div>

        {/* Footer - 카피라이트 */}
        <div style={{
          position: 'absolute',
          left: '260px',
          top: '990px',
          fontSize: '20px',
          fontWeight: '500',
          color: '#BBBBBB',
          fontFamily: 'Pretendard',
          letterSpacing: '-0.2px',
          lineHeight: 1.4
        }}>
          2026 © GC Company Corp. All rights reserved.
        </div>

        {/* Footer - 페이지 번호 */}
        <div className="editable-field" contentEditable={false}
          style={{
          position: 'absolute',
          left: '1680px',
          top: '990px',
          fontSize: '20px',
          fontWeight: '500',
          color: '#999999',
          fontFamily: 'Pretendard',
          letterSpacing: '-0.2px',
          lineHeight: 1.4,
          textAlign: 'right',
          width: '120px',
          cursor: 'default'
        }}>
          {getPageNumber(currentSlideIndex)}
        </div>
      </div>
    );
  }

  // Index Type 01 (Draggable TOC) 전용 렌더링
  if (template.id === 'index01' && template.isDraggable) {

    // 드래그 시작
    const handleDragStart = (index) => {
      setTocDraggedIndex(index);
    };

    // 드래그 중
    const handleDragOver = (e, index) => {
      e.preventDefault();
    };

    // 드롭
    const handleDrop = (e, dropIndex) => {
      e.preventDefault();
      if (tocDraggedIndex === null || tocDraggedIndex === dropIndex) return;

      const newItems = [...tocItems];
      const [removed] = newItems.splice(tocDraggedIndex, 1);
      newItems.splice(dropIndex, 0, removed);

      setTocItems(newItems);
      setTocDraggedIndex(null);
    };

    // 항목 삭제
    const handleDeleteItem = (index) => {
      const newItems = tocItems.filter((_, i) => i !== index);
      setTocItems(newItems);
    };

    return (
      <div className="w-full h-full relative" style={{ backgroundColor: template.elements[0]?.fill || '#F7F7F7' }}>
        {/* 배경 및 고정 요소들 */}
        {template.elements.map((element, idx) => {
          if (element.type === 'rect') {
            return <div key={idx} style={{ position: 'absolute', left: `${element.x}px`, top: `${element.y}px`, width: `${element.width}px`, height: `${element.height}px`, backgroundColor: element.fill }} />;
          }
          if (element.type === 'image') {
            return (
              <div key={idx} style={{ position: 'absolute', left: `${element.x}px`, top: `${element.y}px`, width: `${element.width}px`, height: `${element.height}px` }}>
                <img src={element.url} alt="" className="w-full h-full object-contain" />
              </div>
            );
          }
          if (element.type === 'text') {
            const elementId = `text_${idx}`;
            const value = data[elementId] || element.content;
            return (
              <div
                key={elementId}
                className="editable-field"
                contentEditable={element.editable !== false}
                suppressContentEditableWarning
                onBlur={(e) => element.editable !== false && handleTextEdit(elementId, e)}
                style={{
                  position: 'absolute',
                  left: `${element.x}px`,
                  top: `${element.y}px`,
                  fontSize: `${element.fontSize}px`,
                  fontWeight: element.fontWeight,
                  color: element.fill,
                  fontFamily: element.fontFamily,
                  letterSpacing: `${element.letterSpacing}px`,
                  lineHeight: element.lineHeight,
                  width: element.width ? `${element.width}px` : 'auto',
                  textAlign: element.textAlign || 'left'
                }}>
                {value}
              </div>
            );
          }
          return null;
        })}

        {/* 드래그 가능한 목차 항목들 */}
        <div style={{ position: 'absolute', left: '120px', top: '280px', width: '1680px' }}>
          {tocItems.map((item, index) => (
            <div
              key={item.id}
              className={`toc-row ${tocDraggedIndex === index ? 'dragging' : ''}`}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={() => setTocDraggedIndex(null)}
            >
              {/* 드래그 핸들 */}
              <div className="drag-handle">
                <span></span>
                <span></span>
                <span></span>
              </div>

              {/* 번호 */}
              <div
                className="toc-number editable-field"
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => {
                  const newItems = [...tocItems];
                  newItems[index].number = e.target.innerText;
                  setTocItems(newItems);
                }}
              >
                {item.number}
              </div>

              {/* 제목 */}
              <div
                className="toc-title editable-field"
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => {
                  const newItems = [...tocItems];
                  newItems[index].title = e.target.innerText;
                  setTocItems(newItems);
                }}
              >
                {item.title}
              </div>

              {/* 페이지 */}
              <div
                className="toc-page editable-field"
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => {
                  const newItems = [...tocItems];
                  newItems[index].page = e.target.innerText;
                  setTocItems(newItems);
                }}
              >
                {item.page}
              </div>

              {/* 삭제 버튼 */}
              <div className="toc-delete-btn" onClick={() => handleDeleteItem(index)}>
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Main Cover & Final Cover Type 02, 03 전용 렌더링 (Type 01, 02, 03)
  if (template.id === 'maincover01' || template.id === 'maincover02' || template.id === 'maincover03' || template.id === 'finalcover02' || template.id === 'finalcover03') {
    // maincover01(Type03), maincover02(Type02), finalcover02(Type02) 우측 이미지 영역
    const hasRightImage = template.id === 'maincover01' || template.id === 'maincover02' || template.id === 'finalcover02';
    // maincover03(Type01), finalcover03(Type03) 전체 배경 이미지 영역
    const hasFullBgImage = template.id === 'maincover03' || template.id === 'finalcover03';

    const mcImageKey = hasRightImage ? 'image_right' : (hasFullBgImage ? 'image_bg' : null);
    const mcImageSrc = mcImageKey ? data[mcImageKey] : null;
    const mcImgTransform = mcImageKey ? (data[`${mcImageKey}_transform`] || { x: 0, y: 0, scale: 1 }) : null;

    const handleMcImgMouseDown = (e) => {
      if (!mcImageSrc) return;
      e.preventDefault();
      e.stopPropagation();
      setIsDraggingImg(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      setDragOffset({ x: mcImgTransform.x, y: mcImgTransform.y });
    };

    const handleMcImgMouseMove = (e) => {
      if (!isDraggingImg) return;
      const slideEl = e.currentTarget.closest('.w-full.h-full');
      const rect = slideEl?.getBoundingClientRect();
      const currentScale = rect ? rect.width / 1920 : 1;
      const dx = (e.clientX - dragStart.x) / currentScale;
      const dy = (e.clientY - dragStart.y) / currentScale;
      onUpdate(`${mcImageKey}_transform`, { ...mcImgTransform, x: dragOffset.x + dx, y: dragOffset.y + dy });
    };

    const handleMcImgMouseUp = () => {
      setIsDraggingImg(false);
    };

    const handleMcImgWheel = (e) => {
      if (!mcImageSrc) return;
      e.preventDefault();
      e.stopPropagation();
      const delta = e.deltaY > 0 ? -0.05 : 0.05;
      const newScale = Math.max(0.5, Math.min(3, mcImgTransform.scale + delta));
      onUpdate(`${mcImageKey}_transform`, { ...mcImgTransform, scale: newScale });
    };

    return (
      <div className="w-full h-full relative" style={{ backgroundColor: template.elements[0]?.fill || '#FFFFFF' }}>
        {/* maincover03(Type01) 전체 배경 이미지 영역 */}
        {hasFullBgImage && (
          <div
            style={{
              position: 'absolute', left: '0', top: '0',
              width: '1920px', height: '1080px',
              backgroundColor: template.elements[0]?.fill || '#f7f7f7',
              overflow: 'hidden',
              cursor: mcImageSrc ? (isDraggingImg ? 'grabbing' : 'grab') : 'pointer',
              zIndex: 0
            }}
            onClick={() => !mcImageSrc && handleImageClick(mcImageKey)}
            onMouseDown={mcImageSrc ? handleMcImgMouseDown : undefined}
            onMouseMove={mcImageSrc ? handleMcImgMouseMove : undefined}
            onMouseUp={mcImageSrc ? handleMcImgMouseUp : undefined}
            onMouseLeave={mcImageSrc ? handleMcImgMouseUp : undefined}
            onWheel={mcImageSrc ? handleMcImgWheel : undefined}
          >
            {mcImageSrc ? (
              <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                <img src={mcImageSrc} alt="" style={{
                  position: 'absolute',
                  left: '50%', top: '50%',
                  transform: `translate(calc(-50% + ${mcImgTransform.x}px), calc(-50% + ${mcImgTransform.y}px)) scale(${mcImgTransform.scale})`,
                  maxWidth: '100%', maxHeight: '100%',
                  objectFit: 'contain',
                  userSelect: 'none', pointerEvents: 'none'
                }} />
                <button
                  onClick={(e) => { e.stopPropagation(); handleImageClick(mcImageKey); }}
                  style={{
                    position: 'absolute', bottom: '20px', right: '20px',
                    padding: '10px 24px', borderRadius: '8px',
                    backgroundColor: 'rgba(0,0,0,0.6)', color: '#FFFFFF', border: 'none',
                    cursor: 'pointer', fontSize: '16px', fontWeight: '600', fontFamily: 'Pretendard',
                    opacity: 0, transition: 'opacity 0.2s ease', zIndex: 10,
                    pointerEvents: 'auto'
                  }}
                  className="cv01-img-change-btn">
                  이미지 변경
                </button>
                <div style={{
                  position: 'absolute', top: '20px', right: '20px',
                  padding: '6px 16px', borderRadius: '6px',
                  backgroundColor: 'rgba(0,0,0,0.5)', color: '#FFFFFF',
                  fontSize: '14px', fontWeight: '500', fontFamily: 'Pretendard',
                  opacity: 0, transition: 'opacity 0.2s ease', pointerEvents: 'none',
                  whiteSpace: 'nowrap'
                }} className="cv01-img-hint">
                  드래그: 위치 이동 · 스크롤: 크기 조절
                </div>
              </div>
            ) : null}
          </div>
        )}

        {!hasFullBgImage && template.elements.map((element, idx) => {
          // 배경 rect 렌더링 (우측 패널은 hasRightImage일 때 이미지 영역으로 대체)
          if (element.type === 'rect') {
            if (hasRightImage && element.x === 820 && element.width === 1100) {
              return null;
            }
            return <div key={idx} style={{ position: 'absolute', left: `${element.x}px`, top: `${element.y}px`, width: `${element.width}px`, height: `${element.height}px`, backgroundColor: element.fill }} />;
          }
          return null;
        })}

        {/* 로고 이미지 렌더링 */}
        {template.elements.map((element, idx) => {
          if (element.type === 'image' && !element.editable) {
            return (
              <div key={`img-${idx}`} className="absolute" style={{ left: `${element.x}px`, top: `${element.y}px`, width: `${element.width}px`, height: `${element.height}px`, zIndex: 3 }}>
                <img src={element.url} alt="" className="w-full h-full object-contain" />
              </div>
            );
          }
          return null;
        })}

        {/* 우측 이미지 영역 (maincover01, maincover02) */}
        {hasRightImage && (
          <div
            style={{
              position: 'absolute', left: '820px', top: '0px',
              width: '1100px', height: '1080px',
              backgroundColor: '#F7F7F7',
              overflow: 'hidden',
              cursor: mcImageSrc ? (isDraggingImg ? 'grabbing' : 'grab') : 'pointer'
            }}
            onClick={() => !mcImageSrc && handleImageClick(mcImageKey)}
            onMouseDown={mcImageSrc ? handleMcImgMouseDown : undefined}
            onMouseMove={mcImageSrc ? handleMcImgMouseMove : undefined}
            onMouseUp={mcImageSrc ? handleMcImgMouseUp : undefined}
            onMouseLeave={mcImageSrc ? handleMcImgMouseUp : undefined}
            onWheel={mcImageSrc ? handleMcImgWheel : undefined}
          >
            {mcImageSrc ? (
              <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                <img src={mcImageSrc} alt="" style={{
                  position: 'absolute',
                  left: '50%', top: '50%',
                  transform: `translate(calc(-50% + ${mcImgTransform.x}px), calc(-50% + ${mcImgTransform.y}px)) scale(${mcImgTransform.scale})`,
                  maxWidth: '100%', maxHeight: '100%',
                  objectFit: 'contain',
                  userSelect: 'none', pointerEvents: 'none'
                }} />
                <button
                  onClick={(e) => { e.stopPropagation(); handleImageClick(mcImageKey); }}
                  style={{
                    position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)',
                    padding: '10px 24px', borderRadius: '8px',
                    backgroundColor: 'rgba(0,0,0,0.6)', color: '#FFFFFF', border: 'none',
                    cursor: 'pointer', fontSize: '16px', fontWeight: '600', fontFamily: 'Pretendard',
                    opacity: 0, transition: 'opacity 0.2s ease', zIndex: 10,
                    pointerEvents: 'auto'
                  }}
                  className="cv01-img-change-btn">
                  이미지 변경
                </button>
                <div style={{
                  position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)',
                  padding: '6px 16px', borderRadius: '6px',
                  backgroundColor: 'rgba(0,0,0,0.5)', color: '#FFFFFF',
                  fontSize: '14px', fontWeight: '500', fontFamily: 'Pretendard',
                  opacity: 0, transition: 'opacity 0.2s ease', pointerEvents: 'none',
                  whiteSpace: 'nowrap'
                }} className="cv01-img-hint">
                  드래그: 위치 이동 · 스크롤: 크기 조절
                </div>
              </div>
            ) : (
              <div style={{
                width: '100%', height: '100%',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: '16px'
              }}>
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#CCCCCC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
                <span style={{ fontSize: '28px', fontWeight: '600', color: '#CCCCCC', fontFamily: 'Pretendard' }}>
                  클릭하여 이미지 추가
                </span>
              </div>
            )}
          </div>
        )}

        {/* Flexbox 텍스트 컨테이너 */}
        <div style={{
          position: 'absolute',
          left: (template.id === 'maincover03' || template.id === 'finalcover03') ? '50%' : '120px',
          top: (template.id === 'maincover03' || template.id === 'finalcover03') ? '395px' : '100px',
          transform: (template.id === 'maincover03' || template.id === 'finalcover03') ? 'translateX(-50%)' : 'none',
          display: 'flex',
          flexDirection: 'column',
          gap: (template.id === 'maincover03' || template.id === 'finalcover03') ? '25px' : '0px',
          zIndex: 2
        }}>
          {template.elements
            .map((el, originalIdx) => ({ el, originalIdx }))
            .filter(({ el }) => el.type === 'text' && el.editable)
            .sort((a, b) => a.el.y - b.el.y)
            .map(({ el: element, originalIdx }, textIdx) => {
              const elementId = `text_${originalIdx}`;
              const value = data[elementId] || element.content;

              // Type 1, 2 & Final Cover 2의 간격 계산: 카테고리 → 타이틀 → 본문
              let marginBottom = '0px';
              if (template.id === 'maincover01' || template.id === 'maincover02' || template.id === 'finalcover02') {
                if (textIdx === 0) marginBottom = '12px'; // 카테고리 다음
                if (textIdx === 1) marginBottom = '30px'; // 타이틀 다음
              }

              return (
                <div
                  key={elementId}
                  className="editable-field"
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => handleTextEdit(elementId, e)}
                  style={{
                    fontSize: `${element.fontSize}px`,
                    fontWeight: element.fontWeight,
                    color: element.fill,
                    fontFamily: element.fontFamily,
                    letterSpacing: `${element.letterSpacing}px`,
                    lineHeight: element.lineHeight,
                    width: element.width ? `${element.width}px` : 'auto',
                    textAlign: element.textAlign || 'left',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    marginBottom: marginBottom
                  }}>
                  {value}
                </div>
              );
            })}
        </div>
      </div>
    );
  }

  // Core Value Type 06 (동적 테이블) 전용 렌더링
  if (template.id === 'table01' && template.dynamicTable) {
    const tableData = data.tableData || template.defaultTable;
    const headers = tableData.headers;
    const rows = tableData.rows;

    // 테이블 레이아웃 상수
    const TABLE_X = 120;
    const TABLE_Y = 200;
    const TABLE_WIDTH = 1680;
    const HEADER_HEIGHT = 100;
    const LABEL_COL_WIDTH = 240;
    const DATA_WIDTH = TABLE_WIDTH - LABEL_COL_WIDTH;
    const colWidth = DATA_WIDTH / headers.length;
    const TABLE_MAX_HEIGHT = 750;
    const rowHeight = (TABLE_MAX_HEIGHT - HEADER_HEIGHT) / rows.length;

    const updateTable = (newTable) => {
      onUpdate('tableData', newTable);
    };

    const handleHeaderEdit = (colIdx, text) => {
      const newHeaders = [...headers];
      newHeaders[colIdx] = text;
      updateTable({ headers: newHeaders, rows });
    };

    const handleLabelEdit = (rowIdx, text) => {
      const newRows = rows.map((r, i) => i === rowIdx ? { ...r, label: text } : r);
      updateTable({ headers, rows: newRows });
    };

    const handleCellEdit = (rowIdx, colIdx, text) => {
      const newRows = rows.map((r, i) => {
        if (i !== rowIdx) return r;
        const newCells = [...r.cells];
        newCells[colIdx] = text;
        return { ...r, cells: newCells };
      });
      updateTable({ headers, rows: newRows });
    };

    const addRow = () => {
      if (rows.length >= 8) return;
      const newRow = { label: '항목', cells: headers.map(() => '본문 텍스트') };
      updateTable({ headers, rows: [...rows, newRow] });
    };

    const deleteRow = (rowIdx) => {
      if (rows.length <= 1) return;
      updateTable({ headers, rows: rows.filter((_, i) => i !== rowIdx) });
    };

    const addColumn = () => {
      if (headers.length >= 4) return;
      const newHeaders = [...headers, '타이틀'];
      const newRows = rows.map(r => ({ ...r, cells: [...r.cells, '본문 텍스트'] }));
      updateTable({ headers: newHeaders, rows: newRows });
    };

    const deleteColumn = (colIdx) => {
      if (headers.length <= 1) return;
      const newHeaders = headers.filter((_, i) => i !== colIdx);
      const newRows = rows.map(r => ({ ...r, cells: r.cells.filter((_, i) => i !== colIdx) }));
      updateTable({ headers: newHeaders, rows: newRows });
    };

    // 열 병합: row.mergedCols = [colIdx, ...] → colIdx와 colIdx+1을 병합
    const mergeCols = (rowIdx, colIdx) => {
      if (colIdx >= headers.length - 1) return;
      const newRows = rows.map((r, i) => {
        if (i !== rowIdx) return r;
        const mergedCols = r.mergedCols ? [...r.mergedCols] : [];
        if (!mergedCols.includes(colIdx)) mergedCols.push(colIdx);
        return { ...r, mergedCols };
      });
      updateTable({ headers, rows: newRows });
    };

    const unmergeCols = (rowIdx, colIdx) => {
      const newRows = rows.map((r, i) => {
        if (i !== rowIdx) return r;
        const mergedCols = (r.mergedCols || []).filter(c => c !== colIdx);
        return { ...r, mergedCols };
      });
      updateTable({ headers, rows: newRows });
    };

    const singleRowHeight = (TABLE_MAX_HEIGHT - HEADER_HEIGHT) / rows.length;

    return (
      <div className="w-full h-full relative" style={{ backgroundColor: '#F7F7F7' }}>
        {/* 타이틀 */}
        <div
          className="editable-field"
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => handleTextEdit('text_1', e)}
          style={{
            position: 'absolute', left: '120px', top: '100px',
            fontSize: '48px', fontWeight: '700', color: '#333333',
            fontFamily: 'Pretendard', letterSpacing: '-0.48px', lineHeight: 1.3
          }}>
          {data['text_1'] || template.elements[1].content}
        </div>

        {/* 행/열 추가 버튼 */}
        <div style={{ position: 'absolute', right: '120px', top: '100px', display: 'flex', gap: '12px', zIndex: 10 }}>
          <button
            onClick={addColumn}
            disabled={headers.length >= 4}
            style={{
              padding: '12px 24px', backgroundColor: headers.length >= 4 ? '#CCCCCC' : '#333333',
              color: '#FFFFFF', borderRadius: '8px', border: 'none', fontSize: '16px',
              fontWeight: '600', cursor: headers.length >= 4 ? 'not-allowed' : 'pointer', fontFamily: 'Pretendard'
            }}>
            + 열 추가
          </button>
          <button
            onClick={addRow}
            disabled={rows.length >= 8}
            style={{
              padding: '12px 24px', backgroundColor: rows.length >= 8 ? '#CCCCCC' : '#333333',
              color: '#FFFFFF', borderRadius: '8px', border: 'none', fontSize: '16px',
              fontWeight: '600', cursor: rows.length >= 8 ? 'not-allowed' : 'pointer', fontFamily: 'Pretendard'
            }}>
            + 행 추가
          </button>
        </div>

        {/* 테이블 (CSS Grid) */}
        <div style={{
          position: 'absolute', left: `${TABLE_X}px`, top: `${TABLE_Y}px`, width: `${TABLE_WIDTH}px`,
          display: 'grid',
          gridTemplateColumns: `${LABEL_COL_WIDTH}px repeat(${headers.length}, 1fr)`,
          gridTemplateRows: `${HEADER_HEIGHT}px repeat(${rows.length}, ${singleRowHeight}px)`
        }}>
          {/* 좌상단 빈 셀 */}
          <div style={{
            backgroundColor: '#E5E5E5', border: '1px solid #CCCCCC'
          }} />
          {/* 헤더 컬럼들 */}
          {headers.map((header, colIdx) => (
            <div key={`h-${colIdx}`} className="table01-header-cell" style={{
              backgroundColor: '#E5E5E5', border: '1px solid #CCCCCC',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative'
            }}>
              <div
                className="editable-field"
                contentEditable suppressContentEditableWarning
                onBlur={(e) => handleHeaderEdit(colIdx, e.target.innerText)}
                style={{
                  fontSize: '32px', fontWeight: '700', color: '#333333',
                  fontFamily: 'Pretendard', letterSpacing: '-0.32px',
                  textAlign: 'center', width: '100%', padding: '0 20px'
                }}>
                {header}
              </div>
              {headers.length > 1 && (
                <button
                  onClick={() => deleteColumn(colIdx)}
                  className="col-delete-btn"
                  style={{
                    position: 'absolute', top: '-16px', right: '-16px',
                    width: '32px', height: '32px', borderRadius: '50%',
                    backgroundColor: '#333333', color: '#FFFFFF', border: 'none',
                    cursor: 'pointer', fontSize: '18px', fontWeight: '600',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    opacity: 0, transition: 'opacity 0.2s ease', zIndex: 10
                  }}>
                  ×
                </button>
              )}
            </div>
          ))}

          {/* 데이터 행들 */}
          {rows.map((row, rowIdx) => {
            const mergedCols = row.mergedCols || [];
            return (
              <React.Fragment key={`r-${rowIdx}`}>
                {/* 라벨 셀 */}
                <div className="table01-data-row" style={{
                  backgroundColor: '#FFFFFF', border: '1px solid #CCCCCC',
                  display: 'flex', alignItems: 'center', padding: '0 30px',
                  position: 'relative'
                }}>
                  <div
                    className="editable-field"
                    contentEditable suppressContentEditableWarning
                    onBlur={(e) => handleLabelEdit(rowIdx, e.target.innerText)}
                    style={{
                      fontSize: '32px', fontWeight: '700', color: '#333333',
                      fontFamily: 'Pretendard', letterSpacing: '-0.32px', opacity: 0.89
                    }}>
                    {row.label}
                  </div>
                  {/* 행 삭제 버튼 */}
                  {rows.length > 1 && (
                    <button
                      onClick={() => deleteRow(rowIdx)}
                      className="row-delete-btn"
                      style={{
                        position: 'absolute', left: '-48px', top: '50%', transform: 'translateY(-50%)',
                        width: '32px', height: '32px', borderRadius: '50%',
                        backgroundColor: '#333333', color: '#FFFFFF', border: 'none',
                        cursor: 'pointer', fontSize: '18px', fontWeight: '600',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        opacity: 0, transition: 'opacity 0.2s ease', zIndex: 10
                      }}>
                      ×
                    </button>
                  )}
                </div>
                {/* 데이터 셀들 */}
                {(() => {
                  const cells = [];
                  for (let colIdx = 0; colIdx < row.cells.length; colIdx++) {
                    const isMergeSource = mergedCols.includes(colIdx);
                    const isMergeTarget = mergedCols.includes(colIdx - 1);

                    // 병합 타겟은 건너뛰기 (소스가 span 2로 차지)
                    if (isMergeTarget) continue;

                    const span = isMergeSource ? 2 : 1;
                    const canMerge = colIdx < headers.length - 1 && !isMergeSource;

                    cells.push(
                      <div key={`c-${rowIdx}-${colIdx}`} className="table01-cell" style={{
                        gridColumn: `span ${span}`,
                        backgroundColor: '#FFFFFF', border: '1px solid #CCCCCC',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: '15px 30px', position: 'relative'
                      }}>
                        <div
                          className="editable-field"
                          contentEditable suppressContentEditableWarning
                          onBlur={(e) => handleCellEdit(rowIdx, colIdx, e.target.innerText)}
                          style={{
                            fontSize: '32px', fontWeight: '700', color: '#333333',
                            fontFamily: 'Pretendard', letterSpacing: '-0.32px',
                            lineHeight: 1.6, textAlign: 'center', width: '100%',
                            whiteSpace: 'pre-wrap', wordBreak: 'break-word'
                          }}>
                          {row.cells[colIdx]}
                        </div>
                        {/* 병합 해제 버튼 */}
                        {isMergeSource && (
                          <button
                            onClick={() => unmergeCols(rowIdx, colIdx)}
                            className="merge-undo-btn"
                            style={{
                              position: 'absolute', top: '6px', right: '6px',
                              padding: '4px 10px', borderRadius: '4px',
                              backgroundColor: '#333333', color: '#FFFFFF', border: 'none',
                              cursor: 'pointer', fontSize: '12px', fontWeight: '600',
                              fontFamily: 'Pretendard', opacity: 0, transition: 'opacity 0.2s ease', zIndex: 10
                            }}>
                            해제
                          </button>
                        )}
                        {/* 열 병합 버튼 */}
                        {canMerge && !mergedCols.includes(colIdx + 1) && (
                          <div className="table01-col-merge-zone" style={{
                            position: 'absolute', right: '-14px', top: '0', bottom: '0',
                            width: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10,
                            cursor: 'pointer'
                          }}
                          onClick={() => mergeCols(rowIdx, colIdx)}>
                            <div className="merge-hint" style={{
                              position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                              opacity: 0.3, transition: 'opacity 0.2s ease'
                            }}>
                              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <path d="M4 10H16M4 10L7 7M4 10L7 13M16 10L13 7M16 10L13 13" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </div>
                            <button
                              className="merge-btn"
                              style={{
                                padding: '8px 4px', borderRadius: '4px',
                                backgroundColor: '#4F46E5', color: '#FFFFFF', border: 'none',
                                cursor: 'pointer', fontSize: '18px', fontWeight: '600',
                                opacity: 0, transition: 'opacity 0.2s ease',
                                lineHeight: 1, writingMode: 'vertical-rl',
                                position: 'relative', zIndex: 1
                              }}>
                              병합
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  }
                  return cells;
                })()}
              </React.Fragment>
            );
          })}
        </div>

        {/* 호버 시 삭제 버튼 표시 CSS */}
        <style>{`
          .table01-header-cell:hover .col-delete-btn { opacity: 1 !important; }
          .table01-data-row:hover .row-delete-btn { opacity: 1 !important; }
          .table01-cell:hover .merge-undo-btn { opacity: 1 !important; }
          .table01-col-merge-zone:hover .merge-hint { opacity: 0 !important; }
          .table01-col-merge-zone:hover .merge-btn { opacity: 1 !important; }
          .col-delete-btn:hover { background-color: #000000 !important; }
          .row-delete-btn:hover { background-color: #000000 !important; }
          .merge-undo-btn:hover { background-color: #000000 !important; }
          .merge-btn:hover { background-color: #3730A3 !important; }
        `}</style>

        {/* Footer */}
        <div style={{ position: 'absolute', left: '120px', top: '991px', width: '118px', height: '20px' }}>
          <img src="assets/icons/yeogi-logo.svg" alt="" className="w-full h-full object-contain" />
        </div>
        <div style={{ position: 'absolute', left: '260px', top: '990px', fontSize: '20px', fontWeight: '500', color: '#BBBBBB', fontFamily: 'Pretendard', letterSpacing: '-0.2px', lineHeight: 1.4 }}>
          2026 © GC Company Corp. All rights reserved.
        </div>
        <div className="editable-field" contentEditable={false}
          style={{ position: 'absolute', left: '1680px', top: '990px', fontSize: '20px', fontWeight: '500', color: '#999999', fontFamily: 'Pretendard', letterSpacing: '-0.2px', lineHeight: 1.4, textAlign: 'right', width: '120px', cursor: 'default' }}>
          {getPageNumber(currentSlideIndex)}
        </div>
      </div>
    );
  }

  // Core Value Type 01 전용 렌더링
  if (template.id === 'corevalue01') {
    const leftImageSrc = data['image_left'];
    const imgTransform = data['image_left_transform'] || { x: 0, y: 0, scale: 1 };

    const handleImgMouseDown = (e) => {
      if (!leftImageSrc) return;
      e.preventDefault();
      e.stopPropagation();
      setIsDraggingImg(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      setDragOffset({ x: imgTransform.x, y: imgTransform.y });
    };

    const handleImgMouseMove = (e) => {
      if (!isDraggingImg) return;
      // slideRef의 scale을 고려하여 delta 보정
      const slideEl = e.currentTarget.closest('.w-full.h-full');
      const rect = slideEl?.getBoundingClientRect();
      const currentScale = rect ? rect.width / 1920 : 1;
      const dx = (e.clientX - dragStart.x) / currentScale;
      const dy = (e.clientY - dragStart.y) / currentScale;
      onUpdate('image_left_transform', { ...imgTransform, x: dragOffset.x + dx, y: dragOffset.y + dy });
    };

    const handleImgMouseUp = () => {
      setIsDraggingImg(false);
    };

    const handleImgWheel = (e) => {
      if (!leftImageSrc) return;
      e.preventDefault();
      e.stopPropagation();
      const delta = e.deltaY > 0 ? -0.05 : 0.05;
      const newScale = Math.max(0.5, Math.min(3, imgTransform.scale + delta));
      onUpdate('image_left_transform', { ...imgTransform, scale: newScale });
    };

    return (
      <div className="w-full h-full relative" style={{ backgroundColor: template.elements[0]?.fill || '#FFFFFF' }}>
        {/* 좌측 풀 이미지 영역 */}
        <div
          style={{
            position: 'absolute', left: '0', top: '0',
            width: '960px', height: '1080px',
            backgroundColor: leftImageSrc ? 'transparent' : '#F0F0F0',
            overflow: 'hidden', cursor: leftImageSrc ? (isDraggingImg ? 'grabbing' : 'grab') : 'pointer'
          }}
          onClick={() => !leftImageSrc && handleImageClick('image_left')}
          onMouseDown={leftImageSrc ? handleImgMouseDown : undefined}
          onMouseMove={leftImageSrc ? handleImgMouseMove : undefined}
          onMouseUp={leftImageSrc ? handleImgMouseUp : undefined}
          onMouseLeave={leftImageSrc ? handleImgMouseUp : undefined}
          onWheel={leftImageSrc ? handleImgWheel : undefined}
        >
          {leftImageSrc ? (
            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
              <img src={leftImageSrc} alt="" style={{
                position: 'absolute',
                left: '50%', top: '50%',
                transform: `translate(calc(-50% + ${imgTransform.x}px), calc(-50% + ${imgTransform.y}px)) scale(${imgTransform.scale})`,
                maxWidth: '100%', maxHeight: '100%',
                objectFit: 'contain',
                userSelect: 'none', pointerEvents: 'none'
              }} />
              {/* 이미지 변경 버튼 */}
              <button
                onClick={(e) => { e.stopPropagation(); handleImageClick('image_left'); }}
                style={{
                  position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)',
                  padding: '10px 24px', borderRadius: '8px',
                  backgroundColor: 'rgba(0,0,0,0.6)', color: '#FFFFFF', border: 'none',
                  cursor: 'pointer', fontSize: '16px', fontWeight: '600', fontFamily: 'Pretendard',
                  opacity: 0, transition: 'opacity 0.2s ease', zIndex: 10,
                  pointerEvents: 'auto'
                }}
                className="cv01-img-change-btn">
                이미지 변경
              </button>
              {/* 조작 힌트 */}
              <div style={{
                position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)',
                padding: '6px 16px', borderRadius: '6px',
                backgroundColor: 'rgba(0,0,0,0.5)', color: '#FFFFFF',
                fontSize: '14px', fontWeight: '500', fontFamily: 'Pretendard',
                opacity: 0, transition: 'opacity 0.2s ease', pointerEvents: 'none',
                whiteSpace: 'nowrap'
              }} className="cv01-img-hint">
                드래그: 위치 이동 · 스크롤: 크기 조절
              </div>
            </div>
          ) : (
            <div style={{
              width: '100%', height: '100%',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: '16px'
            }}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#BBBBBB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
              <span style={{ fontSize: '28px', fontWeight: '600', color: '#BBBBBB', fontFamily: 'Pretendard' }}>
                클릭하여 이미지 추가
              </span>
            </div>
          )}
        </div>

        {/* 상단 영역 + 컨테이너를 flexbox로 */}
        <div style={{
          position: 'absolute',
          left: '1050px',
          top: '100px',
          display: 'flex',
          flexDirection: 'column',
          gap: '0px'
        }}>
          {/* 핵심가치 */}
          <div
            className="editable-field"
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => handleTextEdit('text_1', e)}
            style={{
              fontSize: '32px',
              fontWeight: '700',
              color: '#BBBBBB',
              fontFamily: 'Pretendard',
              letterSpacing: '-0.32px',
              lineHeight: 1.3,
              marginBottom: '2px'
            }}>
            {data['text_1'] || template.elements[1].content}
          </div>

          {/* 메인 타이틀 */}
          <div
            className="editable-field"
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => handleTextEdit('text_2', e)}
            style={{
              fontSize: '48px',
              fontWeight: '700',
              color: '#333333',
              fontFamily: 'Pretendard',
              letterSpacing: '-0.48px',
              lineHeight: 1.3,
              width: '750px',
              marginBottom: '24px'
            }}>
            {data['text_2'] || template.elements[2].content}
          </div>

          {/* 본문 - 여기가 줄어들면 아래 컨테이너가 올라감 */}
          <div
            className="editable-field"
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => handleTextEdit('text_3', e)}
            style={{
              fontSize: '20px',
              fontWeight: '500',
              color: '#666666',
              fontFamily: 'Pretendard',
              letterSpacing: '-0.2px',
              lineHeight: 1.5,
              width: '750px',
              marginBottom: '28px'
            }}>
            {data['text_3'] || template.elements[3].content}
          </div>

          {/* 컨테이너 */}
          <div
            ref={containerRef}
            style={{
              width: '750px',
              backgroundColor: '#F7F7F7',
              borderRadius: '24px',
              padding: '40px',
              display: 'flex',
              flexDirection: 'column'
            }}>
            {/* item 1 */}
            {(!data['hidden_item_1']) && (
              <div data-section="hidden_item_1" className="delete-section-wrapper" style={{marginBottom: '40px', position: 'relative', opacity: 1, transform: 'scale(1)', transition: 'opacity 0.3s ease, transform 0.3s ease'}}>
                <button
                  onClick={() => handleDeleteSection('hidden_item_1')}
                  className="delete-section-btn"
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.8)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.6)'}
                  style={{
                    position: 'absolute',
                    top: '5px',
                    right: '5px',
                    width: '24px',
                    height: '24px',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: 'normal',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10,
                    opacity: 0,
                    transition: 'opacity 0.2s ease, background-color 0.15s ease'
                  }}
                  title="섹션 삭제 (Ctrl+Z로 복원)">
                  ×
                </button>
                <div
                  className="editable-field"
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => handleTextEdit('text_5', e)}
                  style={{fontSize: '32px', fontWeight: '700', color: '#333333', fontFamily: 'Pretendard', letterSpacing: '-0.32px', lineHeight: 1.5, width: '670px', marginBottom: '16px'}}>
                  {data['text_5'] || template.elements[5].content}
                </div>
                <div
                  className="editable-field"
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => handleTextEdit('text_6', e)}
                  style={{fontSize: '20px', fontWeight: '500', color: '#666666', fontFamily: 'Pretendard', letterSpacing: '-0.2px', lineHeight: 1.5, width: '670px'}}>
                  {data['text_6'] || template.elements[6].content}
                </div>
              </div>
            )}

            {/* item 2 */}
            {(!data['hidden_item_2']) && (
              <div data-section="hidden_item_2" className="delete-section-wrapper" style={{marginBottom: '40px', position: 'relative', opacity: 1, transform: 'scale(1)', transition: 'opacity 0.3s ease, transform 0.3s ease'}}>
                <button
                  onClick={() => handleDeleteSection('hidden_item_2')}
                  className="delete-section-btn"
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.8)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.6)'}
                  style={{
                    position: 'absolute',
                    top: '5px',
                    right: '5px',
                    width: '24px',
                    height: '24px',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: 'normal',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10,
                    opacity: 0,
                    transition: 'opacity 0.2s ease, background-color 0.15s ease'
                  }}
                  title="섹션 삭제 (Ctrl+Z로 복원)">
                  ×
                </button>
                <div
                  className="editable-field"
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => handleTextEdit('text_7', e)}
                  style={{fontSize: '32px', fontWeight: '700', color: '#333333', fontFamily: 'Pretendard', letterSpacing: '-0.32px', lineHeight: 1.5, width: '670px', marginBottom: '16px'}}>
                  {data['text_7'] || template.elements[7].content}
                </div>
                <div
                  className="editable-field"
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => handleTextEdit('text_8', e)}
                  style={{fontSize: '20px', fontWeight: '500', color: '#666666', fontFamily: 'Pretendard', letterSpacing: '-0.2px', lineHeight: 1.5, width: '670px'}}>
                  {data['text_8'] || template.elements[8].content}
                </div>
              </div>
            )}

            {/* item 3 */}
            {(!data['hidden_item_3']) && (
              <div data-section="hidden_item_3" className="delete-section-wrapper" style={{position: 'relative', opacity: 1, transform: 'scale(1)', transition: 'opacity 0.3s ease, transform 0.3s ease'}}>
                <button
                  onClick={() => handleDeleteSection('hidden_item_3')}
                  className="delete-section-btn"
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.8)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.6)'}
                  style={{
                    position: 'absolute',
                    top: '5px',
                    right: '5px',
                    width: '24px',
                    height: '24px',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: 'normal',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10,
                    opacity: 0,
                    transition: 'opacity 0.2s ease, background-color 0.15s ease'
                  }}
                  title="섹션 삭제 (Ctrl+Z로 복원)">
                  ×
                </button>
                <div
                  className="editable-field"
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => handleTextEdit('text_9', e)}
                  style={{fontSize: '32px', fontWeight: '700', color: '#333333', fontFamily: 'Pretendard', letterSpacing: '-0.32px', lineHeight: 1.5, width: '670px', marginBottom: '16px'}}>
                  {data['text_9'] || template.elements[9].content}
                </div>
                <div
                  className="editable-field"
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => handleTextEdit('text_10', e)}
                  style={{fontSize: '20px', fontWeight: '500', color: '#666666', fontFamily: 'Pretendard', letterSpacing: '-0.2px', lineHeight: 1.5, width: '670px'}}>
                  {data['text_10'] || template.elements[10].content}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 푸터 - 로고 */}
        <div className="absolute" style={{ left: '1050px', top: '991px', width: '118px', height: '20px', zIndex: 5 }}>
          <img src={template.elements[11].url} alt="" className="w-full h-full object-contain" />
        </div>

        {/* 푸터 - 카피라이트 */}
        <div className="absolute whitespace-pre-wrap" style={{ left: '1190px', top: '990px', fontSize: '20px', fontWeight: '500', color: '#BBBBBB', fontFamily: 'Pretendard', letterSpacing: '-0.2px', lineHeight: 1.4, zIndex: 5 }}>
          {template.elements[12].content}
        </div>

        {/* 푸터 - 페이지 번호 (자동 계산) */}
        <div
          className="editable-field absolute"
          contentEditable={false}
          style={{ left: '1680px', top: '990px', fontSize: '20px', fontWeight: '500', color: '#999999', fontFamily: 'Pretendard', letterSpacing: '-0.2px', lineHeight: 1.4, textAlign: 'right', width: '120px', cursor: 'default', zIndex: 5 }}>
          {getPageNumber(currentSlideIndex)}
        </div>
      </div>
    );
  }

  // ─── Core Value Type 02 전용 렌더링 ───
  if (template.id === 'corevalue02') {
    const containerImageSrc = data['image_container'];
    const containerImgTransform = data['image_container_transform'] || { x: 0, y: 0, scale: 1 };

    const handleContainerImgMouseDown = (e) => {
      if (!containerImageSrc) return;
      e.preventDefault();
      e.stopPropagation();
      setIsDraggingImg(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      setDragOffset({ x: containerImgTransform.x, y: containerImgTransform.y });
    };

    const handleContainerImgMouseMove = (e) => {
      if (!isDraggingImg) return;
      const slideEl = e.currentTarget.closest('.w-full.h-full');
      const rect = slideEl?.getBoundingClientRect();
      const currentScale = rect ? rect.width / 1920 : 1;
      const dx = (e.clientX - dragStart.x) / currentScale;
      const dy = (e.clientY - dragStart.y) / currentScale;
      onUpdate('image_container_transform', { ...containerImgTransform, x: dragOffset.x + dx, y: dragOffset.y + dy });
    };

    const handleContainerImgMouseUp = () => {
      setIsDraggingImg(false);
    };

    const handleContainerImgWheel = (e) => {
      if (!containerImageSrc) return;
      e.preventDefault();
      e.stopPropagation();
      const delta = e.deltaY > 0 ? -0.05 : 0.05;
      const newScale = Math.max(0.5, Math.min(3, containerImgTransform.scale + delta));
      onUpdate('image_container_transform', { ...containerImgTransform, scale: newScale });
    };

    return (
      <div className="w-full h-full relative" style={{ backgroundColor: '#F7F7F7' }}>
        {/* 배경 */}
        <div style={{ position: 'absolute', left: '0', top: '0', width: '1920px', height: '1080px', backgroundColor: '#F7F7F7' }} />

        {/* 핵심가치 */}
        <div
          className="editable-field"
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => handleTextEdit('text_1', e)}
          style={{
            position: 'absolute', left: '120px', top: '100px',
            fontSize: '32px', fontWeight: '700', color: '#BBBBBB',
            fontFamily: 'Pretendard', letterSpacing: '-0.32px', lineHeight: 1.3
          }}>
          {data['text_1'] || template.elements[1].content}
        </div>

        {/* 메인 타이틀 */}
        <div
          className="editable-field"
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => handleTextEdit('text_2', e)}
          style={{
            position: 'absolute', left: '120px', top: '144px',
            fontSize: '48px', fontWeight: '700', color: '#333333',
            fontFamily: 'Pretendard', letterSpacing: '-0.48px', lineHeight: 1.3
          }}>
          {data['text_2'] || template.elements[2].content}
        </div>

        {/* 본문 설명 */}
        <div
          className="editable-field"
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => handleTextEdit('text_3', e)}
          style={{
            position: 'absolute', left: '739px', top: '132px',
            fontSize: '32px', fontWeight: '500', color: '#666666',
            fontFamily: 'Pretendard', letterSpacing: '-0.32px', lineHeight: 1.5,
            width: '1061px', whiteSpace: 'pre-wrap'
          }}>
          {data['text_3'] || template.elements[3].content}
        </div>

        {/* 이미지 컨테이너 (기존 흰색 rect 영역) */}
        <div
          style={{
            position: 'absolute', left: '120px', top: '400px',
            width: '1680px', height: '550px',
            backgroundColor: '#FFFFFF', borderRadius: '24px',
            overflow: 'hidden',
            cursor: containerImageSrc ? (isDraggingImg ? 'grabbing' : 'grab') : 'pointer'
          }}
          onClick={() => !containerImageSrc && handleImageClick('image_container')}
          onMouseDown={containerImageSrc ? handleContainerImgMouseDown : undefined}
          onMouseMove={containerImageSrc ? handleContainerImgMouseMove : undefined}
          onMouseUp={containerImageSrc ? handleContainerImgMouseUp : undefined}
          onMouseLeave={containerImageSrc ? handleContainerImgMouseUp : undefined}
          onWheel={containerImageSrc ? handleContainerImgWheel : undefined}
        >
          {containerImageSrc ? (
            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
              <img src={containerImageSrc} alt="" style={{
                position: 'absolute',
                left: '50%', top: '50%',
                transform: `translate(calc(-50% + ${containerImgTransform.x}px), calc(-50% + ${containerImgTransform.y}px)) scale(${containerImgTransform.scale})`,
                maxWidth: '100%', maxHeight: '100%',
                objectFit: 'contain',
                userSelect: 'none', pointerEvents: 'none'
              }} />
              {/* 이미지 변경 버튼 */}
              <button
                onClick={(e) => { e.stopPropagation(); handleImageClick('image_container'); }}
                style={{
                  position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)',
                  padding: '10px 24px', borderRadius: '8px',
                  backgroundColor: 'rgba(0,0,0,0.6)', color: '#FFFFFF', border: 'none',
                  cursor: 'pointer', fontSize: '16px', fontWeight: '600', fontFamily: 'Pretendard',
                  opacity: 0, transition: 'opacity 0.2s ease', zIndex: 10,
                  pointerEvents: 'auto'
                }}
                className="cv01-img-change-btn">
                이미지 변경
              </button>
              {/* 조작 힌트 */}
              <div style={{
                position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)',
                padding: '6px 16px', borderRadius: '6px',
                backgroundColor: 'rgba(0,0,0,0.5)', color: '#FFFFFF',
                fontSize: '14px', fontWeight: '500', fontFamily: 'Pretendard',
                opacity: 0, transition: 'opacity 0.2s ease', pointerEvents: 'none',
                whiteSpace: 'nowrap'
              }} className="cv01-img-hint">
                드래그: 위치 이동 · 스크롤: 크기 조절
              </div>
            </div>
          ) : (
            <div style={{
              width: '100%', height: '100%',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: '16px',
              border: '2px dashed #DDDDDD', borderRadius: '24px'
            }}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#CCCCCC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
              <span style={{ fontSize: '28px', fontWeight: '600', color: '#CCCCCC', fontFamily: 'Pretendard' }}>
                클릭하여 이미지 추가
              </span>
            </div>
          )}
        </div>

        {/* 푸터 - 로고 */}
        <div style={{ position: 'absolute', left: '120px', top: '991px', width: '118px', height: '20px' }}>
          <img src={template.elements[5].url} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>

        {/* 푸터 - 카피라이트 */}
        <div style={{ position: 'absolute', left: '260px', top: '990px', fontSize: '20px', fontWeight: '500', color: '#BBBBBB', fontFamily: 'Pretendard', letterSpacing: '-0.2px', lineHeight: 1.4, whiteSpace: 'pre-wrap' }}>
          {template.elements[6].content}
        </div>

        {/* 푸터 - 페이지 번호 */}
        <div
          className="editable-field"
          contentEditable={false}
          style={{ position: 'absolute', left: '1680px', top: '990px', fontSize: '20px', fontWeight: '500', color: '#999999', fontFamily: 'Pretendard', letterSpacing: '-0.2px', lineHeight: 1.4, textAlign: 'right', width: '120px', cursor: 'default' }}>
          {getPageNumber(currentSlideIndex)}
        </div>
      </div>
    );
  }

  // ─── Core Value Type 03 전용 렌더링 (2 컨테이너) ───
  if (template.id === 'corevalue03') {
    // 컨테이너별 이미지 데이터
    const containers = [
      { key: 'image_container_left', rect: { x: 120, y: 400, w: 820, h: 550 }, textElements: [
        { dataKey: 'text_5', el: template.elements[5], x: 200, y: 480 },
        { dataKey: 'text_6', el: template.elements[6], x: 200, y: 544 }
      ]},
      { key: 'image_container_right', rect: { x: 980, y: 400, w: 820, h: 550 }, textElements: [
        { dataKey: 'text_8', el: template.elements[8], x: 1060, y: 480 },
        { dataKey: 'text_9', el: template.elements[9], x: 1060, y: 544 }
      ]}
    ];

    const makeContainerHandlers = (imageKey) => {
      const imageSrc = data[imageKey];
      const imgTransform = data[`${imageKey}_transform`] || { x: 0, y: 0, scale: 1 };

      return {
        imageSrc, imgTransform,
        onMouseDown: (e) => {
          if (!imageSrc) return;
          if (e.target.closest('.editable-field')) return;
          e.preventDefault();
          e.stopPropagation();
          setIsDraggingImg(true);
          setDraggingImageKey(imageKey);
          setDragStart({ x: e.clientX, y: e.clientY });
          setDragOffset({ x: imgTransform.x, y: imgTransform.y });
        },
        onMouseMove: (e) => {
          if (!isDraggingImg || draggingImageKey !== imageKey) return;
          const slideEl = e.currentTarget.closest('.w-full.h-full');
          const rect = slideEl?.getBoundingClientRect();
          const currentScale = rect ? rect.width / 1920 : 1;
          const dx = (e.clientX - dragStart.x) / currentScale;
          const dy = (e.clientY - dragStart.y) / currentScale;
          onUpdate(`${imageKey}_transform`, { ...imgTransform, x: dragOffset.x + dx, y: dragOffset.y + dy });
        },
        onMouseUp: () => {
          if (draggingImageKey === imageKey) { setIsDraggingImg(false); setDraggingImageKey(null); }
        },
        onWheel: (e) => {
          if (!imageSrc) return;
          e.preventDefault(); e.stopPropagation();
          const delta = e.deltaY > 0 ? -0.05 : 0.05;
          const newScale = Math.max(0.5, Math.min(3, imgTransform.scale + delta));
          onUpdate(`${imageKey}_transform`, { ...imgTransform, scale: newScale });
        }
      };
    };

    return (
      <div className="w-full h-full relative" style={{ backgroundColor: '#F7F7F7' }}>
        <div style={{ position: 'absolute', left: '0', top: '0', width: '1920px', height: '1080px', backgroundColor: '#F7F7F7' }} />

        {/* 핵심가치 */}
        <div className="editable-field" contentEditable suppressContentEditableWarning
          onBlur={(e) => handleTextEdit('text_1', e)}
          style={{ position: 'absolute', left: '120px', top: '100px', fontSize: '32px', fontWeight: '700', color: '#BBBBBB', fontFamily: 'Pretendard', letterSpacing: '-0.32px', lineHeight: 1.3 }}>
          {data['text_1'] || template.elements[1].content}
        </div>

        {/* 메인 타이틀 */}
        <div className="editable-field" contentEditable suppressContentEditableWarning
          onBlur={(e) => handleTextEdit('text_2', e)}
          style={{ position: 'absolute', left: '120px', top: '144px', fontSize: '48px', fontWeight: '700', color: '#333333', fontFamily: 'Pretendard', letterSpacing: '-0.48px', lineHeight: 1.3 }}>
          {data['text_2'] || template.elements[2].content}
        </div>

        {/* 본문 설명 */}
        <div className="editable-field" contentEditable suppressContentEditableWarning
          onBlur={(e) => handleTextEdit('text_3', e)}
          style={{ position: 'absolute', left: '739px', top: '132px', fontSize: '32px', fontWeight: '500', color: '#666666', fontFamily: 'Pretendard', letterSpacing: '-0.32px', lineHeight: 1.5, width: '1061px', whiteSpace: 'pre-wrap' }}>
          {data['text_3'] || template.elements[3].content}
        </div>

        {/* 컨테이너들 */}
        {containers.map((container) => {
          const h = makeContainerHandlers(container.key);
          const IMG_TOP = 240;
          const IMG_HEIGHT = container.rect.h - IMG_TOP;
          return (
            <div key={container.key}
              style={{
                position: 'absolute',
                left: `${container.rect.x}px`, top: `${container.rect.y}px`,
                width: `${container.rect.w}px`, height: `${container.rect.h}px`,
                backgroundColor: '#FFFFFF', borderRadius: '24px', overflow: 'hidden'
              }}
            >
              {/* 텍스트 영역 (상단) */}
              {container.textElements.map((te) => (
                <div key={te.dataKey}
                  className="editable-field" contentEditable suppressContentEditableWarning
                  onBlur={(e) => handleTextEdit(te.dataKey, e)}
                  style={{
                    position: 'absolute',
                    left: `${te.x - container.rect.x}px`,
                    top: `${te.y - container.rect.y}px`,
                    fontSize: `${te.el.fontSize}px`, fontWeight: te.el.fontWeight,
                    color: te.el.fill, fontFamily: te.el.fontFamily,
                    letterSpacing: `${te.el.letterSpacing}px`, lineHeight: te.el.lineHeight,
                    width: te.el.width ? `${te.el.width}px` : 'auto',
                    whiteSpace: 'pre-wrap', zIndex: 2
                  }}>
                  {data[te.dataKey] || te.el.content}
                </div>
              ))}

              {/* 이미지 영역 (하단, 텍스트 아래) */}
              <div
                style={{
                  position: 'absolute', left: '40px', top: `${IMG_TOP}px`,
                  width: `${container.rect.w - 80}px`, height: `${container.rect.h - IMG_TOP - 40}px`,
                  overflow: 'hidden', borderRadius: '16px',
                  cursor: h.imageSrc ? (isDraggingImg && draggingImageKey === container.key ? 'grabbing' : 'grab') : 'pointer',
                  zIndex: 1
                }}
                onClick={(e) => { e.stopPropagation(); if (!h.imageSrc) handleImageClick(container.key); }}
                onMouseDown={h.imageSrc ? h.onMouseDown : undefined}
                onMouseMove={h.imageSrc ? h.onMouseMove : undefined}
                onMouseUp={h.imageSrc ? h.onMouseUp : undefined}
                onMouseLeave={h.imageSrc ? h.onMouseUp : undefined}
                onWheel={h.imageSrc ? h.onWheel : undefined}
              >
                {h.imageSrc ? (
                  <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                    <img src={h.imageSrc} alt="" style={{
                      position: 'absolute', left: '50%', top: '50%',
                      transform: `translate(calc(-50% + ${h.imgTransform.x}px), calc(-50% + ${h.imgTransform.y}px)) scale(${h.imgTransform.scale})`,
                      maxWidth: '100%', maxHeight: '100%', objectFit: 'contain',
                      userSelect: 'none', pointerEvents: 'none'
                    }} />
                    <button
                      onClick={(e) => { e.stopPropagation(); handleImageClick(container.key); }}
                      className="cv01-img-change-btn"
                      style={{
                        position: 'absolute', bottom: '16px', left: '50%', transform: 'translateX(-50%)',
                        padding: '8px 20px', borderRadius: '8px',
                        backgroundColor: 'rgba(0,0,0,0.6)', color: '#FFFFFF', border: 'none',
                        cursor: 'pointer', fontSize: '14px', fontWeight: '600', fontFamily: 'Pretendard',
                        opacity: 0, transition: 'opacity 0.2s ease', zIndex: 10, pointerEvents: 'auto'
                      }}>
                      이미지 변경
                    </button>
                    <div className="cv01-img-hint" style={{
                      position: 'absolute', top: '12px', left: '50%', transform: 'translateX(-50%)',
                      padding: '4px 12px', borderRadius: '6px',
                      backgroundColor: 'rgba(0,0,0,0.5)', color: '#FFFFFF',
                      fontSize: '12px', fontWeight: '500', fontFamily: 'Pretendard',
                      opacity: 0, transition: 'opacity 0.2s ease', pointerEvents: 'none',
                      whiteSpace: 'nowrap', zIndex: 10
                    }}>
                      드래그: 위치 이동 · 스크롤: 크기 조절
                    </div>
                  </div>
                ) : (
                  <div style={{
                    width: '100%', height: '100%',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', gap: '16px',
                    backgroundColor: '#F0F0F0', borderRadius: '16px',
                    margin: '0 16px', width: 'calc(100% - 32px)'
                  }}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#BBBBBB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                    <span style={{ fontSize: '20px', fontWeight: '600', color: '#BBBBBB', fontFamily: 'Pretendard' }}>
                      클릭하여 이미지 추가
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* 푸터 */}
        <div style={{ position: 'absolute', left: '120px', top: '991px', width: '118px', height: '20px' }}>
          <img src={template.elements[10].url} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
        <div style={{ position: 'absolute', left: '260px', top: '990px', fontSize: '20px', fontWeight: '500', color: '#BBBBBB', fontFamily: 'Pretendard', letterSpacing: '-0.2px', lineHeight: 1.4, whiteSpace: 'pre-wrap' }}>
          {template.elements[11].content}
        </div>
        <div className="editable-field" contentEditable={false}
          style={{ position: 'absolute', left: '1680px', top: '990px', fontSize: '20px', fontWeight: '500', color: '#999999', fontFamily: 'Pretendard', letterSpacing: '-0.2px', lineHeight: 1.4, textAlign: 'right', width: '120px', cursor: 'default' }}>
          {getPageNumber(currentSlideIndex)}
        </div>
      </div>
    );
  }

  // ─── Core Value Type 04 전용 렌더링 (3 컨테이너) ───
  if (template.id === 'corevalue04') {
    const containers = [
      { key: 'image_container_1', rect: { x: 120, y: 400, w: 533, h: 550 }, textElements: [
        { dataKey: 'text_5', el: template.elements[5], x: 200, y: 480 },
        { dataKey: 'text_6', el: template.elements[6], x: 200, y: 544 }
      ]},
      { key: 'image_container_2', rect: { x: 693, y: 400, w: 534, h: 550 }, textElements: [
        { dataKey: 'text_8', el: template.elements[8], x: 773, y: 480 },
        { dataKey: 'text_9', el: template.elements[9], x: 773, y: 544 }
      ]},
      { key: 'image_container_3', rect: { x: 1267, y: 400, w: 533, h: 550 }, textElements: [
        { dataKey: 'text_11', el: template.elements[11], x: 1347, y: 480 },
        { dataKey: 'text_12', el: template.elements[12], x: 1347, y: 544 }
      ]}
    ];

    const makeContainerHandlers = (imageKey) => {
      const imageSrc = data[imageKey];
      const imgTransform = data[`${imageKey}_transform`] || { x: 0, y: 0, scale: 1 };

      return {
        imageSrc, imgTransform,
        onMouseDown: (e) => {
          if (!imageSrc) return;
          if (e.target.closest('.editable-field')) return;
          e.preventDefault(); e.stopPropagation();
          setIsDraggingImg(true);
          setDraggingImageKey(imageKey);
          setDragStart({ x: e.clientX, y: e.clientY });
          setDragOffset({ x: imgTransform.x, y: imgTransform.y });
        },
        onMouseMove: (e) => {
          if (!isDraggingImg || draggingImageKey !== imageKey) return;
          const slideEl = e.currentTarget.closest('.w-full.h-full');
          const rect = slideEl?.getBoundingClientRect();
          const currentScale = rect ? rect.width / 1920 : 1;
          const dx = (e.clientX - dragStart.x) / currentScale;
          const dy = (e.clientY - dragStart.y) / currentScale;
          onUpdate(`${imageKey}_transform`, { ...imgTransform, x: dragOffset.x + dx, y: dragOffset.y + dy });
        },
        onMouseUp: () => {
          if (draggingImageKey === imageKey) { setIsDraggingImg(false); setDraggingImageKey(null); }
        },
        onWheel: (e) => {
          if (!imageSrc) return;
          e.preventDefault(); e.stopPropagation();
          const delta = e.deltaY > 0 ? -0.05 : 0.05;
          const newScale = Math.max(0.5, Math.min(3, imgTransform.scale + delta));
          onUpdate(`${imageKey}_transform`, { ...imgTransform, scale: newScale });
        }
      };
    };

    return (
      <div className="w-full h-full relative" style={{ backgroundColor: '#F7F7F7' }}>
        <div style={{ position: 'absolute', left: '0', top: '0', width: '1920px', height: '1080px', backgroundColor: '#F7F7F7' }} />

        {/* 핵심가치 */}
        <div className="editable-field" contentEditable suppressContentEditableWarning
          onBlur={(e) => handleTextEdit('text_1', e)}
          style={{ position: 'absolute', left: '120px', top: '100px', fontSize: '32px', fontWeight: '700', color: '#BBBBBB', fontFamily: 'Pretendard', letterSpacing: '-0.32px', lineHeight: 1.3 }}>
          {data['text_1'] || template.elements[1].content}
        </div>

        {/* 메인 타이틀 */}
        <div className="editable-field" contentEditable suppressContentEditableWarning
          onBlur={(e) => handleTextEdit('text_2', e)}
          style={{ position: 'absolute', left: '120px', top: '144px', fontSize: '48px', fontWeight: '700', color: '#333333', fontFamily: 'Pretendard', letterSpacing: '-0.48px', lineHeight: 1.3 }}>
          {data['text_2'] || template.elements[2].content}
        </div>

        {/* 본문 설명 */}
        <div className="editable-field" contentEditable suppressContentEditableWarning
          onBlur={(e) => handleTextEdit('text_3', e)}
          style={{ position: 'absolute', left: '739px', top: '132px', fontSize: '32px', fontWeight: '500', color: '#666666', fontFamily: 'Pretendard', letterSpacing: '-0.32px', lineHeight: 1.5, width: '1061px', whiteSpace: 'pre-wrap' }}>
          {data['text_3'] || template.elements[3].content}
        </div>

        {/* 3개 컨테이너 */}
        {containers.map((container) => {
          const h = makeContainerHandlers(container.key);
          const IMG_TOP = 240;
          const IMG_HEIGHT = container.rect.h - IMG_TOP;
          return (
            <div key={container.key}
              style={{
                position: 'absolute',
                left: `${container.rect.x}px`, top: `${container.rect.y}px`,
                width: `${container.rect.w}px`, height: `${container.rect.h}px`,
                backgroundColor: '#FFFFFF', borderRadius: '24px', overflow: 'hidden'
              }}
            >
              {/* 텍스트 영역 (상단) */}
              {container.textElements.map((te) => (
                <div key={te.dataKey}
                  className="editable-field" contentEditable suppressContentEditableWarning
                  onBlur={(e) => handleTextEdit(te.dataKey, e)}
                  style={{
                    position: 'absolute',
                    left: `${te.x - container.rect.x}px`,
                    top: `${te.y - container.rect.y}px`,
                    fontSize: `${te.el.fontSize}px`, fontWeight: te.el.fontWeight,
                    color: te.el.fill, fontFamily: te.el.fontFamily,
                    letterSpacing: `${te.el.letterSpacing}px`, lineHeight: te.el.lineHeight,
                    width: te.el.width ? `${te.el.width}px` : 'auto',
                    whiteSpace: 'pre-wrap', zIndex: 2
                  }}>
                  {data[te.dataKey] || te.el.content}
                </div>
              ))}

              {/* 이미지 영역 (하단, 텍스트 아래) */}
              <div
                style={{
                  position: 'absolute', left: '40px', top: `${IMG_TOP}px`,
                  width: `${container.rect.w - 80}px`, height: `${container.rect.h - IMG_TOP - 40}px`,
                  overflow: 'hidden', borderRadius: '16px',
                  cursor: h.imageSrc ? (isDraggingImg && draggingImageKey === container.key ? 'grabbing' : 'grab') : 'pointer',
                  zIndex: 1
                }}
                onClick={(e) => { e.stopPropagation(); if (!h.imageSrc) handleImageClick(container.key); }}
                onMouseDown={h.imageSrc ? h.onMouseDown : undefined}
                onMouseMove={h.imageSrc ? h.onMouseMove : undefined}
                onMouseUp={h.imageSrc ? h.onMouseUp : undefined}
                onMouseLeave={h.imageSrc ? h.onMouseUp : undefined}
                onWheel={h.imageSrc ? h.onWheel : undefined}
              >
                {h.imageSrc ? (
                  <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                    <img src={h.imageSrc} alt="" style={{
                      position: 'absolute', left: '50%', top: '50%',
                      transform: `translate(calc(-50% + ${h.imgTransform.x}px), calc(-50% + ${h.imgTransform.y}px)) scale(${h.imgTransform.scale})`,
                      maxWidth: '100%', maxHeight: '100%', objectFit: 'contain',
                      userSelect: 'none', pointerEvents: 'none'
                    }} />
                    <button
                      onClick={(e) => { e.stopPropagation(); handleImageClick(container.key); }}
                      className="cv01-img-change-btn"
                      style={{
                        position: 'absolute', bottom: '16px', left: '50%', transform: 'translateX(-50%)',
                        padding: '8px 20px', borderRadius: '8px',
                        backgroundColor: 'rgba(0,0,0,0.6)', color: '#FFFFFF', border: 'none',
                        cursor: 'pointer', fontSize: '14px', fontWeight: '600', fontFamily: 'Pretendard',
                        opacity: 0, transition: 'opacity 0.2s ease', zIndex: 10, pointerEvents: 'auto'
                      }}>
                      이미지 변경
                    </button>
                    <div className="cv01-img-hint" style={{
                      position: 'absolute', top: '12px', left: '50%', transform: 'translateX(-50%)',
                      padding: '4px 12px', borderRadius: '6px',
                      backgroundColor: 'rgba(0,0,0,0.5)', color: '#FFFFFF',
                      fontSize: '12px', fontWeight: '500', fontFamily: 'Pretendard',
                      opacity: 0, transition: 'opacity 0.2s ease', pointerEvents: 'none',
                      whiteSpace: 'nowrap', zIndex: 10
                    }}>
                      드래그: 위치 이동 · 스크롤: 크기 조절
                    </div>
                  </div>
                ) : (
                  <div style={{
                    width: '100%', height: '100%',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', gap: '16px',
                    backgroundColor: '#F0F0F0', borderRadius: '16px'
                  }}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#BBBBBB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                    <span style={{ fontSize: '20px', fontWeight: '600', color: '#BBBBBB', fontFamily: 'Pretendard' }}>
                      클릭하여 이미지 추가
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* 푸터 */}
        <div style={{ position: 'absolute', left: '120px', top: '991px', width: '118px', height: '20px' }}>
          <img src={template.elements[13].url} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
        <div style={{ position: 'absolute', left: '260px', top: '990px', fontSize: '20px', fontWeight: '500', color: '#BBBBBB', fontFamily: 'Pretendard', letterSpacing: '-0.2px', lineHeight: 1.4, whiteSpace: 'pre-wrap' }}>
          {template.elements[14].content}
        </div>
        <div className="editable-field" contentEditable={false}
          style={{ position: 'absolute', left: '1680px', top: '990px', fontSize: '20px', fontWeight: '500', color: '#999999', fontFamily: 'Pretendard', letterSpacing: '-0.2px', lineHeight: 1.4, textAlign: 'right', width: '120px', cursor: 'default' }}>
          {getPageNumber(currentSlideIndex)}
        </div>
      </div>
    );
  }

  // ─── Core Value Type 05 전용 렌더링 (4 컨테이너, 2×2, 우측 이미지) ───
  if (template.id === 'corevalue05') {
    const containers = [
      { key: 'image_container_1', rect: { x: 120, y: 400, w: 820, h: 255 }, textElements: [
        { dataKey: 'text_5', el: template.elements[5], x: 200, y: 480 },
        { dataKey: 'text_6', el: template.elements[6], x: 200, y: 544 }
      ]},
      { key: 'image_container_2', rect: { x: 980, y: 400, w: 820, h: 255 }, textElements: [
        { dataKey: 'text_8', el: template.elements[8], x: 1060, y: 480 },
        { dataKey: 'text_9', el: template.elements[9], x: 1060, y: 544 }
      ]},
      { key: 'image_container_3', rect: { x: 120, y: 695, w: 820, h: 255 }, textElements: [
        { dataKey: 'text_11', el: template.elements[11], x: 200, y: 775 },
        { dataKey: 'text_12', el: template.elements[12], x: 200, y: 839 }
      ]},
      { key: 'image_container_4', rect: { x: 980, y: 695, w: 820, h: 255 }, textElements: [
        { dataKey: 'text_14', el: template.elements[14], x: 1060, y: 775 },
        { dataKey: 'text_15', el: template.elements[15], x: 1060, y: 839 }
      ]}
    ];

    const makeContainerHandlers = (imageKey) => {
      const imageSrc = data[imageKey];
      const imgTransform = data[`${imageKey}_transform`] || { x: 0, y: 0, scale: 1 };

      return {
        imageSrc, imgTransform,
        onMouseDown: (e) => {
          if (!imageSrc) return;
          if (e.target.closest('.editable-field')) return;
          e.preventDefault(); e.stopPropagation();
          setIsDraggingImg(true);
          setDraggingImageKey(imageKey);
          setDragStart({ x: e.clientX, y: e.clientY });
          setDragOffset({ x: imgTransform.x, y: imgTransform.y });
        },
        onMouseMove: (e) => {
          if (!isDraggingImg || draggingImageKey !== imageKey) return;
          const slideEl = e.currentTarget.closest('.w-full.h-full');
          const rect = slideEl?.getBoundingClientRect();
          const currentScale = rect ? rect.width / 1920 : 1;
          const dx = (e.clientX - dragStart.x) / currentScale;
          const dy = (e.clientY - dragStart.y) / currentScale;
          onUpdate(`${imageKey}_transform`, { ...imgTransform, x: dragOffset.x + dx, y: dragOffset.y + dy });
        },
        onMouseUp: () => {
          if (draggingImageKey === imageKey) { setIsDraggingImg(false); setDraggingImageKey(null); }
        },
        onWheel: (e) => {
          if (!imageSrc) return;
          e.preventDefault(); e.stopPropagation();
          const delta = e.deltaY > 0 ? -0.05 : 0.05;
          const newScale = Math.max(0.5, Math.min(3, imgTransform.scale + delta));
          onUpdate(`${imageKey}_transform`, { ...imgTransform, scale: newScale });
        }
      };
    };

    return (
      <div className="w-full h-full relative" style={{ backgroundColor: '#F7F7F7' }}>
        <div style={{ position: 'absolute', left: '0', top: '0', width: '1920px', height: '1080px', backgroundColor: '#F7F7F7' }} />

        {/* 핵심가치 */}
        <div className="editable-field" contentEditable suppressContentEditableWarning
          onBlur={(e) => handleTextEdit('text_1', e)}
          style={{ position: 'absolute', left: '120px', top: '100px', fontSize: '32px', fontWeight: '700', color: '#BBBBBB', fontFamily: 'Pretendard', letterSpacing: '-0.32px', lineHeight: 1.3 }}>
          {data['text_1'] || template.elements[1].content}
        </div>

        {/* 메인 타이틀 */}
        <div className="editable-field" contentEditable suppressContentEditableWarning
          onBlur={(e) => handleTextEdit('text_2', e)}
          style={{ position: 'absolute', left: '120px', top: '144px', fontSize: '48px', fontWeight: '700', color: '#333333', fontFamily: 'Pretendard', letterSpacing: '-0.48px', lineHeight: 1.3 }}>
          {data['text_2'] || template.elements[2].content}
        </div>

        {/* 본문 설명 */}
        <div className="editable-field" contentEditable suppressContentEditableWarning
          onBlur={(e) => handleTextEdit('text_3', e)}
          style={{ position: 'absolute', left: '739px', top: '132px', fontSize: '32px', fontWeight: '500', color: '#666666', fontFamily: 'Pretendard', letterSpacing: '-0.32px', lineHeight: 1.5, width: '1061px', whiteSpace: 'pre-wrap' }}>
          {data['text_3'] || template.elements[3].content}
        </div>

        {/* 4개 컨테이너 (2×2) */}
        {containers.map((container) => {
          const h = makeContainerHandlers(container.key);
          const IMG_LEFT = 480;
          const IMG_WIDTH = container.rect.w - IMG_LEFT - 40;
          const IMG_HEIGHT = container.rect.h - 80;
          return (
            <div key={container.key}
              style={{
                position: 'absolute',
                left: `${container.rect.x}px`, top: `${container.rect.y}px`,
                width: `${container.rect.w}px`, height: `${container.rect.h}px`,
                backgroundColor: '#FFFFFF', borderRadius: '24px', overflow: 'hidden'
              }}
            >
              {/* 텍스트 영역 (좌측) */}
              {container.textElements.map((te) => (
                <div key={te.dataKey}
                  className="editable-field" contentEditable suppressContentEditableWarning
                  onBlur={(e) => handleTextEdit(te.dataKey, e)}
                  style={{
                    position: 'absolute',
                    left: `${te.x - container.rect.x}px`,
                    top: `${te.y - container.rect.y}px`,
                    fontSize: `${te.el.fontSize}px`, fontWeight: te.el.fontWeight,
                    color: te.el.fill, fontFamily: te.el.fontFamily,
                    letterSpacing: `${te.el.letterSpacing}px`, lineHeight: te.el.lineHeight,
                    width: '380px',
                    whiteSpace: 'pre-wrap', zIndex: 2
                  }}>
                  {data[te.dataKey] || te.el.content}
                </div>
              ))}

              {/* 이미지 영역 (우측) */}
              <div
                style={{
                  position: 'absolute', left: `${IMG_LEFT}px`, top: '40px',
                  width: `${IMG_WIDTH}px`, height: `${IMG_HEIGHT}px`,
                  overflow: 'hidden', borderRadius: '16px',
                  cursor: h.imageSrc ? (isDraggingImg && draggingImageKey === container.key ? 'grabbing' : 'grab') : 'pointer',
                  zIndex: 1
                }}
                onClick={(e) => { e.stopPropagation(); if (!h.imageSrc) handleImageClick(container.key); }}
                onMouseDown={h.imageSrc ? h.onMouseDown : undefined}
                onMouseMove={h.imageSrc ? h.onMouseMove : undefined}
                onMouseUp={h.imageSrc ? h.onMouseUp : undefined}
                onMouseLeave={h.imageSrc ? h.onMouseUp : undefined}
                onWheel={h.imageSrc ? h.onWheel : undefined}
              >
                {h.imageSrc ? (
                  <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                    <img src={h.imageSrc} alt="" style={{
                      position: 'absolute', left: '50%', top: '50%',
                      transform: `translate(calc(-50% + ${h.imgTransform.x}px), calc(-50% + ${h.imgTransform.y}px)) scale(${h.imgTransform.scale})`,
                      maxWidth: '100%', maxHeight: '100%', objectFit: 'contain',
                      userSelect: 'none', pointerEvents: 'none'
                    }} />
                    <button
                      onClick={(e) => { e.stopPropagation(); handleImageClick(container.key); }}
                      className="cv01-img-change-btn"
                      style={{
                        position: 'absolute', bottom: '12px', left: '50%', transform: 'translateX(-50%)',
                        padding: '6px 16px', borderRadius: '8px',
                        backgroundColor: 'rgba(0,0,0,0.6)', color: '#FFFFFF', border: 'none',
                        cursor: 'pointer', fontSize: '14px', fontWeight: '600', fontFamily: 'Pretendard',
                        opacity: 0, transition: 'opacity 0.2s ease', zIndex: 10, pointerEvents: 'auto'
                      }}>
                      이미지 변경
                    </button>
                    <div className="cv01-img-hint" style={{
                      position: 'absolute', top: '8px', left: '50%', transform: 'translateX(-50%)',
                      padding: '4px 10px', borderRadius: '6px',
                      backgroundColor: 'rgba(0,0,0,0.5)', color: '#FFFFFF',
                      fontSize: '11px', fontWeight: '500', fontFamily: 'Pretendard',
                      opacity: 0, transition: 'opacity 0.2s ease', pointerEvents: 'none',
                      whiteSpace: 'nowrap', zIndex: 10
                    }}>
                      드래그: 이동 · 스크롤: 크기
                    </div>
                  </div>
                ) : (
                  <div style={{
                    width: '100%', height: '100%',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', gap: '12px',
                    backgroundColor: '#F0F0F0', borderRadius: '16px'
                  }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#BBBBBB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                    <span style={{ fontSize: '16px', fontWeight: '600', color: '#BBBBBB', fontFamily: 'Pretendard' }}>
                      클릭하여 이미지 추가
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* 푸터 */}
        <div style={{ position: 'absolute', left: '120px', top: '991px', width: '118px', height: '20px' }}>
          <img src={template.elements[16].url} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
        <div style={{ position: 'absolute', left: '260px', top: '990px', fontSize: '20px', fontWeight: '500', color: '#BBBBBB', fontFamily: 'Pretendard', letterSpacing: '-0.2px', lineHeight: 1.4, whiteSpace: 'pre-wrap' }}>
          {template.elements[17].content}
        </div>
        <div className="editable-field" contentEditable={false}
          style={{ position: 'absolute', left: '1680px', top: '990px', fontSize: '20px', fontWeight: '500', color: '#999999', fontFamily: 'Pretendard', letterSpacing: '-0.2px', lineHeight: 1.4, textAlign: 'right', width: '120px', cursor: 'default' }}>
          {getPageNumber(currentSlideIndex)}
        </div>
      </div>
    );
  }

  // ─── FAQ Type 01 전용 렌더링 (동적 카드 추가/삭제) ───
  if (template.id === 'faq01') {
    const items = faq01Items;
    const CARD_START_Y = 256;
    const CARD_ROW_GAP = 175;
    const CARD_W = 820;
    const CARD_H = 160;
    const COL_LEFT = 120;
    const COL_RIGHT = 980;
    const CARD_RADIUS = 20;
    const CARD_PAD_X = 43;
    const Q_OFFSET_Y = 34;
    const A_OFFSET_Y = 92;

    const handleAddFaqItem = () => {
      if (items.length >= 8) return;
      const num = items.length + 1;
      const newItems = [...items, { id: `faq${Date.now()}`, question: `Q${num}. 질문을 입력하세요.`, answer: '답변을 입력하세요.' }];
      setFaq01Items(newItems);
      onUpdate('faqItems', newItems);
    };

    const handleDeleteFaqItem = (itemId) => {
      if (items.length <= 4) return;
      const newItems = items.filter(it => it.id !== itemId);
      setFaq01Items(newItems);
      onUpdate('faqItems', newItems);
    };

    const handleFaqQuestionEdit = (itemId, newText) => {
      const newItems = items.map(it => it.id === itemId ? { ...it, question: newText } : it);
      setFaq01Items(newItems);
      onUpdate('faqItems', newItems);
    };

    const handleFaqAnswerEdit = (itemId, newText) => {
      const newItems = items.map(it => it.id === itemId ? { ...it, answer: newText } : it);
      setFaq01Items(newItems);
      onUpdate('faqItems', newItems);
    };

    return (
      <div className="w-full h-full relative" style={{ backgroundColor: '#FFFFFF' }}>
        {/* 배경 */}
        <div style={{ position: 'absolute', left: '0', top: '0', width: '1920px', height: '1080px', backgroundColor: '#FFFFFF' }} />

        {/* 카테고리 */}
        <div
          className="editable-field"
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => handleTextEdit('text_1', e)}
          style={{
            position: 'absolute', left: '120px', top: '100px',
            fontSize: '32px', fontWeight: '700', color: '#BBBBBB',
            fontFamily: 'Pretendard', letterSpacing: '-0.32px', lineHeight: 1.3
          }}>
          {data['text_1'] || template.elements[1].content}
        </div>

        {/* 타이틀 */}
        <div
          className="editable-field"
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => handleTextEdit('text_2', e)}
          style={{
            position: 'absolute', left: '120px', top: '152px',
            fontSize: '48px', fontWeight: '700', color: '#333333',
            fontFamily: 'Pretendard', letterSpacing: '-0.48px', lineHeight: 1.3
          }}>
          {data['text_2'] || template.elements[2].content}
        </div>

        {/* FAQ 추가 버튼 */}
        <div style={{ position: 'absolute', right: '120px', top: '100px', display: 'flex', gap: '12px', zIndex: 10 }}>
          <button
            onClick={handleAddFaqItem}
            disabled={items.length >= 8}
            style={{
              padding: '12px 24px', backgroundColor: items.length >= 8 ? '#EEEEEE' : '#4F46E5',
              color: items.length >= 8 ? '#999999' : '#FFFFFF', borderRadius: '8px', border: 'none',
              fontSize: '16px', fontWeight: '600', cursor: items.length >= 8 ? 'not-allowed' : 'pointer',
              fontFamily: 'Pretendard', transition: 'all 0.2s ease'
            }}>
            + FAQ 추가
          </button>
        </div>

        {/* FAQ 카드 렌더링 */}
        {items.map((item, index) => {
          const col = index % 2;
          const row = Math.floor(index / 2);
          const x = col === 0 ? COL_LEFT : COL_RIGHT;
          const y = CARD_START_Y + row * CARD_ROW_GAP;

          return (
            <div key={item.id} className="delete-section-wrapper" style={{
              position: 'absolute', left: `${x}px`, top: `${y}px`,
              width: `${CARD_W}px`, height: `${CARD_H}px`,
              backgroundColor: '#F7F7F7', borderRadius: `${CARD_RADIUS}px`
            }}>
              {/* 질문 */}
              <div
                className="editable-field"
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => handleFaqQuestionEdit(item.id, e.target.innerText.replace(/^Q\d+\.\s*/, ''))}
                style={{
                  position: 'absolute', left: `${CARD_PAD_X}px`, top: `${Q_OFFSET_Y}px`,
                  fontSize: '32px', fontWeight: '700', color: '#333333',
                  fontFamily: 'Pretendard', letterSpacing: '-0.32px', lineHeight: 1.5,
                  width: `${CARD_W - CARD_PAD_X * 2 - 40}px`, whiteSpace: 'nowrap',
                  overflow: 'hidden', textOverflow: 'ellipsis'
                }}>
                {`Q${index + 1}. ${item.question.replace(/^Q\d+\.\s*/, '')}`}
              </div>

              {/* 답변 */}
              <div
                className="editable-field"
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => handleFaqAnswerEdit(item.id, e.target.innerText)}
                style={{
                  position: 'absolute', left: `${CARD_PAD_X}px`, top: `${A_OFFSET_Y}px`,
                  fontSize: '20px', fontWeight: '500', color: '#666666',
                  fontFamily: 'Pretendard', letterSpacing: '-0.2px', lineHeight: 1.5,
                  width: `${CARD_W - CARD_PAD_X * 2}px`, whiteSpace: 'nowrap',
                  overflow: 'hidden', textOverflow: 'ellipsis'
                }}>
                {item.answer}
              </div>

              {/* 삭제 버튼 */}
              {items.length > 4 && (
                <button
                  onClick={() => handleDeleteFaqItem(item.id)}
                  className="delete-section-btn"
                  style={{
                    position: 'absolute', top: '8px', right: '8px',
                    width: '32px', height: '32px', borderRadius: '6px',
                    backgroundColor: 'rgba(0,0,0,0.08)', color: '#999999', border: 'none',
                    cursor: 'pointer', fontSize: '18px', fontWeight: 'normal',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    opacity: 0, transition: 'opacity 0.2s ease'
                  }}
                  title="FAQ 삭제">
                  ×
                </button>
              )}
            </div>
          );
        })}

        {/* 푸터 - 로고 */}
        <div style={{ position: 'absolute', left: '120px', top: '991px', width: '118px', height: '20px' }}>
          <img src={template.elements[template.elements.length - 3].url} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
        {/* 푸터 - 카피라이트 */}
        <div style={{ position: 'absolute', left: '260px', top: '990px', fontSize: '20px', fontWeight: '500', color: '#BBBBBB', fontFamily: 'Pretendard', letterSpacing: '-0.2px', lineHeight: 1.4 }}>
          {template.elements[template.elements.length - 2].content}
        </div>
        {/* 푸터 - 페이지 번호 */}
        <div className="editable-field" contentEditable={false}
          style={{ position: 'absolute', left: '1680px', top: '990px', fontSize: '20px', fontWeight: '500', color: '#999999', fontFamily: 'Pretendard', letterSpacing: '-0.2px', lineHeight: 1.4, textAlign: 'right', width: '120px', cursor: 'default' }}>
          {getPageNumber(currentSlideIndex)}
        </div>
      </div>
    );
  }

  // ─── FAQ Type 02 전용 렌더링 (동적 추가/삭제) ───
  if (template.id === 'faq02') {
    const items = faq02Items;
    const LIST_X = 700;
    const LIST_START_Y = 120;
    const BLOCK_GAP = 140;
    const Q_TO_A = 52;
    const A_TO_LINE = 60;
    const LINE_X2 = 1800;

    const handleAddFaq02 = () => {
      if (items.length >= 6) return;
      const num = items.length + 1;
      const newItems = [...items, { id: `faq${Date.now()}`, question: `Q${num}. 질문을 입력하세요.`, answer: '답변을 입력하세요.' }];
      setFaq02Items(newItems);
      onUpdate('faqItems', newItems);
    };

    const handleDeleteFaq02 = (itemId) => {
      if (items.length <= 3) return;
      const newItems = items.filter(it => it.id !== itemId);
      setFaq02Items(newItems);
      onUpdate('faqItems', newItems);
    };

    const handleFaq02QuestionEdit = (itemId, newText) => {
      const newItems = items.map(it => it.id === itemId ? { ...it, question: newText } : it);
      setFaq02Items(newItems);
      onUpdate('faqItems', newItems);
    };

    const handleFaq02AnswerEdit = (itemId, newText) => {
      const newItems = items.map(it => it.id === itemId ? { ...it, answer: newText } : it);
      setFaq02Items(newItems);
      onUpdate('faqItems', newItems);
    };

    return (
      <div className="w-full h-full relative" style={{ backgroundColor: '#FFFFFF' }}>
        <div style={{ position: 'absolute', left: '0', top: '0', width: '1920px', height: '1080px', backgroundColor: '#FFFFFF' }} />

        {/* 카테고리 */}
        <div
          className="editable-field"
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => handleTextEdit('text_1', e)}
          style={{
            position: 'absolute', left: '120px', top: '100px',
            fontSize: '32px', fontWeight: '700', color: '#BBBBBB',
            fontFamily: 'Pretendard', letterSpacing: '-0.32px', lineHeight: 1.3
          }}>
          {data['text_1'] || template.elements[1].content}
        </div>

        {/* 타이틀 */}
        <div
          className="editable-field"
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => handleTextEdit('text_2', e)}
          style={{
            position: 'absolute', left: '120px', top: '152px',
            fontSize: '48px', fontWeight: '700', color: '#333333',
            fontFamily: 'Pretendard', letterSpacing: '-0.48px', lineHeight: 1.3
          }}>
          {data['text_2'] || template.elements[2].content}
        </div>

        {/* FAQ 추가 버튼 */}
        <div style={{ position: 'absolute', right: '120px', top: '100px', display: 'flex', gap: '12px', zIndex: 10 }}>
          <button
            onClick={handleAddFaq02}
            disabled={items.length >= 6}
            style={{
              padding: '12px 24px', backgroundColor: items.length >= 6 ? '#EEEEEE' : '#4F46E5',
              color: items.length >= 6 ? '#999999' : '#FFFFFF', borderRadius: '8px', border: 'none',
              fontSize: '16px', fontWeight: '600', cursor: items.length >= 6 ? 'not-allowed' : 'pointer',
              fontFamily: 'Pretendard', transition: 'all 0.2s ease'
            }}>
            + FAQ 추가
          </button>
        </div>

        {/* FAQ 리스트 렌더링 */}
        {items.map((item, index) => {
          const y = LIST_START_Y + index * BLOCK_GAP;
          const isLast = index === items.length - 1;

          return (
            <div key={item.id} className="delete-section-wrapper" style={{
              position: 'absolute', left: `${LIST_X}px`, top: `${y}px`
            }}>
              {/* 질문 */}
              <div
                className="editable-field"
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => handleFaq02QuestionEdit(item.id, e.target.innerText.replace(/^Q\d+\.\s*/, ''))}
                style={{
                  fontSize: '32px', fontWeight: '700', color: '#333333',
                  fontFamily: 'Pretendard', letterSpacing: '-0.32px', lineHeight: 1.5,
                  width: '1060px', whiteSpace: 'nowrap',
                  overflow: 'hidden', textOverflow: 'ellipsis'
                }}>
                {`Q${index + 1}. ${item.question.replace(/^Q\d+\.\s*/, '')}`}
              </div>

              {/* 답변 */}
              <div
                className="editable-field"
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => handleFaq02AnswerEdit(item.id, e.target.innerText)}
                style={{
                  marginTop: '4px',
                  fontSize: '20px', fontWeight: '500', color: '#666666',
                  fontFamily: 'Pretendard', letterSpacing: '-0.2px', lineHeight: 1.5,
                  width: '1060px', whiteSpace: 'nowrap',
                  overflow: 'hidden', textOverflow: 'ellipsis'
                }}>
                {item.answer}
              </div>

              {/* 구분선 (마지막 아이템 제외) */}
              {!isLast && (
                <div style={{
                  position: 'absolute', left: '0', top: `${Q_TO_A + A_TO_LINE}px`,
                  width: `${LINE_X2 - LIST_X}px`, height: '1px',
                  backgroundColor: '#DCDCDC'
                }} />
              )}

              {/* 삭제 버튼 */}
              {items.length > 3 && (
                <button
                  onClick={() => handleDeleteFaq02(item.id)}
                  className="delete-section-btn"
                  style={{
                    position: 'absolute', top: '0', right: '-40px',
                    width: '32px', height: '32px', borderRadius: '6px',
                    backgroundColor: 'rgba(0,0,0,0.08)', color: '#999999', border: 'none',
                    cursor: 'pointer', fontSize: '18px', fontWeight: 'normal',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    opacity: 0, transition: 'opacity 0.2s ease'
                  }}
                  title="FAQ 삭제">
                  ×
                </button>
              )}
            </div>
          );
        })}

        {/* 푸터 - 로고 */}
        <div style={{ position: 'absolute', left: '120px', top: '991px', width: '118px', height: '20px' }}>
          <img src={template.elements[template.elements.length - 3].url} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
        {/* 푸터 - 카피라이트 */}
        <div style={{ position: 'absolute', left: '260px', top: '990px', fontSize: '20px', fontWeight: '500', color: '#BBBBBB', fontFamily: 'Pretendard', letterSpacing: '-0.2px', lineHeight: 1.4 }}>
          {template.elements[template.elements.length - 2].content}
        </div>
        {/* 푸터 - 페이지 번호 */}
        <div className="editable-field" contentEditable={false}
          style={{ position: 'absolute', left: '1680px', top: '990px', fontSize: '20px', fontWeight: '500', color: '#999999', fontFamily: 'Pretendard', letterSpacing: '-0.2px', lineHeight: 1.4, textAlign: 'right', width: '120px', cursor: 'default' }}>
          {getPageNumber(currentSlideIndex)}
        </div>
      </div>
    );
  }

  // ─── Section Cover Type 03 전용 렌더링 (동적 행 추가/삭제/순서변경/강조) ───
  if (template.id === 'section03') {
    const rows = section03Rows;
    const ROW_GAP = 112;
    const ROW_HEIGHT = 62;
    const totalBlockHeight = (rows.length - 1) * ROW_GAP + ROW_HEIGHT;
    const ROW_START_Y = Math.round((1080 - totalBlockHeight) / 2);

    const handleAddRow = () => {
      if (rows.length >= 6) return;
      const newRows = [...rows, { id: `r${Date.now()}`, title: '타이틀 텍스트', highlighted: false }];
      setSection03Rows(newRows);
      onUpdate('rows', newRows);
    };

    const handleDeleteRow = (rowId) => {
      if (rows.length <= 1) return;
      const newRows = rows.filter(r => r.id !== rowId);
      setSection03Rows(newRows);
      onUpdate('rows', newRows);
    };

    const handleRowTitleEdit = (rowId, newTitle) => {
      const newRows = rows.map(r => r.id === rowId ? { ...r, title: newTitle } : r);
      setSection03Rows(newRows);
      onUpdate('rows', newRows);
    };

    const handleToggleHighlight = (rowId) => {
      const newRows = rows.map(r => r.id === rowId ? { ...r, highlighted: !r.highlighted } : r);
      setSection03Rows(newRows);
      onUpdate('rows', newRows);
    };

    const handleMoveRow = (index, direction) => {
      const newIndex = index + direction;
      if (newIndex < 0 || newIndex >= rows.length) return;
      const newRows = [...rows];
      [newRows[index], newRows[newIndex]] = [newRows[newIndex], newRows[index]];
      setSection03Rows(newRows);
      onUpdate('rows', newRows);
    };

    return (
      <div className="w-full h-full relative" style={{ backgroundColor: '#333333' }}>
        <div style={{ position: 'absolute', left: '0', top: '0', width: '1920px', height: '1080px', backgroundColor: '#333333' }} />

        {/* 행 추가 버튼 */}
        <div style={{ position: 'absolute', right: '120px', top: '100px', display: 'flex', gap: '12px', zIndex: 10 }}>
          <button
            onClick={handleAddRow}
            disabled={rows.length >= 6}
            style={{
              padding: '12px 24px', backgroundColor: rows.length >= 6 ? '#555555' : '#FFFFFF',
              color: rows.length >= 6 ? '#999999' : '#333333', borderRadius: '8px', border: 'none',
              fontSize: '16px', fontWeight: '600', cursor: rows.length >= 6 ? 'not-allowed' : 'pointer',
              fontFamily: 'Pretendard', transition: 'all 0.2s ease'
            }}>
            + 행 추가
          </button>
        </div>

        {/* 동적 행 렌더링 - 세로 가운데 정렬, 좌측 정렬 */}
        {rows.map((row, index) => {
          const y = ROW_START_Y + index * ROW_GAP;
          const isHighlighted = row.highlighted !== undefined ? row.highlighted : (index === 0);
          const rowOpacity = isHighlighted ? 1 : 0.3;

          return (
            <div key={row.id} className="delete-section-wrapper" style={{
              position: 'absolute', left: '933px', top: `${y}px`,
              display: 'flex', alignItems: 'center'
            }}>
              {/* 강조 토글 버튼 */}
              <button
                onClick={() => handleToggleHighlight(row.id)}
                style={{
                  marginRight: '16px', width: '32px', height: '32px', borderRadius: '50%',
                  backgroundColor: isHighlighted ? '#FFFFFF' : 'transparent',
                  border: isHighlighted ? '2px solid #FFFFFF' : '2px solid rgba(255,255,255,0.4)',
                  cursor: 'pointer', padding: 0, transition: 'all 0.2s ease',
                  flexShrink: 0
                }}
                title={isHighlighted ? '강조 해제' : '강조'}
              />

              {/* 넘버링 */}
              <div style={{
                fontSize: '32px', fontWeight: '700', color: '#FFFFFF',
                fontFamily: 'Pretendard', opacity: rowOpacity,
                width: '88px', cursor: 'default', transition: 'opacity 0.2s ease',
                flexShrink: 0
              }}>
                {index + 1}
              </div>

              {/* 타이틀 */}
              <div
                className="editable-field"
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => handleRowTitleEdit(row.id, e.target.innerText)}
                style={{
                  fontSize: '48px', fontWeight: '700', color: '#FFFFFF',
                  fontFamily: 'Pretendard', letterSpacing: '-0.48px', lineHeight: 1.3,
                  opacity: rowOpacity, whiteSpace: 'nowrap', transition: 'opacity 0.2s ease'
                }}>
                {row.title}
              </div>

              {/* 순서 변경 & 삭제 버튼 */}
              <div className="delete-section-btn" style={{
                marginLeft: '20px', display: 'flex', gap: '6px', alignItems: 'center',
                opacity: 0, transition: 'opacity 0.2s ease'
              }}>
                {index > 0 && (
                  <button
                    onClick={() => handleMoveRow(index, -1)}
                    style={{
                      width: '36px', height: '36px', borderRadius: '6px',
                      backgroundColor: 'rgba(255,255,255,0.15)', color: '#FFFFFF', border: 'none',
                      cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                    title="위로 이동">▲</button>
                )}
                {index < rows.length - 1 && (
                  <button
                    onClick={() => handleMoveRow(index, 1)}
                    style={{
                      width: '36px', height: '36px', borderRadius: '6px',
                      backgroundColor: 'rgba(255,255,255,0.15)', color: '#FFFFFF', border: 'none',
                      cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                    title="아래로 이동">▼</button>
                )}
                {rows.length > 1 && (
                  <button
                    onClick={() => handleDeleteRow(row.id)}
                    style={{
                      width: '36px', height: '36px', borderRadius: '6px',
                      backgroundColor: 'rgba(255,255,255,0.15)', color: '#FFFFFF', border: 'none',
                      cursor: 'pointer', fontSize: '20px', fontWeight: 'normal',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                    title="행 삭제">×</button>
                )}
              </div>
            </div>
          );
        })}

        {/* 푸터 - 로고 */}
        <div style={{ position: 'absolute', left: '120px', top: '991px', width: '118px', height: '20px' }}>
          <img src={template.elements[11].url} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
        {/* 푸터 - 카피라이트 */}
        <div style={{ position: 'absolute', left: '260px', top: '990px', fontSize: '20px', fontWeight: '500', color: '#BBBBBB', fontFamily: 'Pretendard', letterSpacing: '-0.2px', lineHeight: 1.4 }}>
          {template.elements[12].content}
        </div>
        {/* 푸터 - 페이지 번호 */}
        <div className="editable-field" contentEditable={false}
          style={{ position: 'absolute', left: '1680px', top: '990px', fontSize: '20px', fontWeight: '500', color: '#999999', fontFamily: 'Pretendard', letterSpacing: '-0.2px', lineHeight: 1.4, textAlign: 'right', width: '120px', cursor: 'default' }}>
          {getPageNumber(currentSlideIndex)}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative" style={{ backgroundColor: template.elements[0]?.fill || '#FFFFFF' }}>
      {template.elements.map((element, idx) => {
        const elementId = `${element.type}_${idx}`;

        if (element.type === 'rect') {
          // Core Value Type 01 컨테이너 - 내부에 텍스트를 포함
          if (template.id === 'corevalue01' && idx === 4) {
            return (
              <div
                key={idx}
                ref={containerRef}
                style={{
                  position: 'absolute',
                  left: `${element.x}px`,
                  top: `${element.y}px`,
                  width: `${element.width}px`,
                  backgroundColor: element.fill,
                  borderRadius: element.cornerRadius ? `${element.cornerRadius}px` : '0',
                  padding: '40px',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                {/* item 1 */}
                {(!data['hidden_item_1']) && (
                  <div data-section="hidden_item_1" className="delete-section-wrapper" style={{marginBottom: '40px', position: 'relative', opacity: 1, transform: 'scale(1)', transition: 'opacity 0.3s ease, transform 0.3s ease'}}>
                    <button
                      onClick={() => handleDeleteSection('hidden_item_1')}
                      className="delete-section-btn"
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.8)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.6)'}
                      style={{
                        position: 'absolute',
                        top: '5px',
                        right: '5px',
                        width: '24px',
                        height: '24px',
                        borderRadius: '4px',
                        backgroundColor: 'rgba(0, 0, 0, 0.6)',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '16px',
                        fontWeight: 'normal',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 10,
                        opacity: 0,
                        transition: 'opacity 0.2s ease, background-color 0.15s ease'
                      }}
                      title="섹션 삭제 (Ctrl+Z로 복원)">
                      ×
                    </button>
                    <div
                      className="editable-field"
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => handleTextEdit('text_5', e)}
                      style={{fontSize: '32px', fontWeight: '700', color: '#333333', fontFamily: 'Pretendard', letterSpacing: '-0.32px', lineHeight: 1.5, width: '670px', marginBottom: '16px'}}>
                      {data['text_5'] || template.elements[5].content}
                    </div>
                    <div
                      className="editable-field"
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => handleTextEdit('text_6', e)}
                      style={{fontSize: '20px', fontWeight: '500', color: '#666666', fontFamily: 'Pretendard', letterSpacing: '-0.2px', lineHeight: 1.5, width: '670px'}}>
                      {data['text_6'] || template.elements[6].content}
                    </div>
                  </div>
                )}

                {/* item 2 */}
                {(!data['hidden_item_2']) && (
                  <div data-section="hidden_item_2" className="delete-section-wrapper" style={{marginBottom: '40px', position: 'relative', opacity: 1, transform: 'scale(1)', transition: 'opacity 0.3s ease, transform 0.3s ease'}}>
                    <button
                      onClick={() => handleDeleteSection('hidden_item_2')}
                      className="delete-section-btn"
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.8)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.6)'}
                      style={{
                        position: 'absolute',
                        top: '5px',
                        right: '5px',
                        width: '24px',
                        height: '24px',
                        borderRadius: '4px',
                        backgroundColor: 'rgba(0, 0, 0, 0.6)',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '16px',
                        fontWeight: 'normal',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 10,
                        opacity: 0,
                        transition: 'opacity 0.2s ease, background-color 0.15s ease'
                      }}
                      title="섹션 삭제 (Ctrl+Z로 복원)">
                      ×
                    </button>
                    <div
                      className="editable-field"
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => handleTextEdit('text_7', e)}
                      style={{fontSize: '32px', fontWeight: '700', color: '#333333', fontFamily: 'Pretendard', letterSpacing: '-0.32px', lineHeight: 1.5, width: '670px', marginBottom: '16px'}}>
                      {data['text_7'] || template.elements[7].content}
                    </div>
                    <div
                      className="editable-field"
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => handleTextEdit('text_8', e)}
                      style={{fontSize: '20px', fontWeight: '500', color: '#666666', fontFamily: 'Pretendard', letterSpacing: '-0.2px', lineHeight: 1.5, width: '670px'}}>
                      {data['text_8'] || template.elements[8].content}
                    </div>
                  </div>
                )}

                {/* item 3 */}
                {(!data['hidden_item_3']) && (
                  <div data-section="hidden_item_3" className="delete-section-wrapper" style={{position: 'relative', opacity: 1, transform: 'scale(1)', transition: 'opacity 0.3s ease, transform 0.3s ease'}}>
                    <button
                      onClick={() => handleDeleteSection('hidden_item_3')}
                      className="delete-section-btn"
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.8)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.6)'}
                      style={{
                        position: 'absolute',
                        top: '5px',
                        right: '5px',
                        width: '24px',
                        height: '24px',
                        borderRadius: '4px',
                        backgroundColor: 'rgba(0, 0, 0, 0.6)',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '16px',
                        fontWeight: 'normal',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 10,
                        opacity: 0,
                        transition: 'opacity 0.2s ease, background-color 0.15s ease'
                      }}
                      title="섹션 삭제 (Ctrl+Z로 복원)">
                      ×
                    </button>
                    <div
                      className="editable-field"
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => handleTextEdit('text_9', e)}
                      style={{fontSize: '32px', fontWeight: '700', color: '#333333', fontFamily: 'Pretendard', letterSpacing: '-0.32px', lineHeight: 1.5, width: '670px', marginBottom: '16px'}}>
                      {data['text_9'] || template.elements[9].content}
                    </div>
                    <div
                      className="editable-field"
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => handleTextEdit('text_10', e)}
                      style={{fontSize: '20px', fontWeight: '500', color: '#666666', fontFamily: 'Pretendard', letterSpacing: '-0.2px', lineHeight: 1.5, width: '670px'}}>
                      {data['text_10'] || template.elements[10].content}
                    </div>
                  </div>
                )}
              </div>
            );
          }

          return (
            <div key={idx} style={{ position: 'absolute', left: `${element.x}px`, top: `${element.y}px`, width: `${element.width}px`, height: `${element.height}px`, backgroundColor: element.fill, borderRadius: element.cornerRadius ? `${element.cornerRadius}px` : '0', border: element.stroke ? `${element.strokeWidth}px solid ${element.stroke}` : 'none' }} />
          );
        }

        if (element.type === 'text' && element.editable) {
          // Core Value Type 01 컨테이너 내부 텍스트는 위에서 렌더링됨
          if (template.id === 'corevalue01' && idx >= 5 && idx <= 10) {
            return null;
          }

          // 페이지 번호 자동 계산 (x:1680, y:990 위치)
          const isPageNumber = element.x === 1680 && element.y === 990;
          const autoPageNumber = isPageNumber ? getPageNumber(currentSlideIndex) : null;

          let displayValue = data[elementId] || element.content;
          if (autoPageNumber !== null) {
            displayValue = autoPageNumber;
          }

          const isCenterAlignedWithoutWidth = element.textAlign === 'center' && !element.width;

          return (
            <div
              key={idx}
              ref={el => textRefs.current[elementId] = el}
              className="editable-field absolute"
              contentEditable={!isPageNumber}
              suppressContentEditableWarning
              onBlur={(e) => handleTextEdit(elementId, e)}
              style={{ left: isCenterAlignedWithoutWidth ? '50%' : `${element.x}px`, top: `${element.y}px`, fontSize: `${element.fontSize}px`, fontWeight: element.fontWeight, color: element.fill, maxWidth: element.width ? `${element.width}px` : 'none', width: element.width ? `${element.width}px` : 'auto', lineHeight: element.lineHeight || 1.5, fontFamily: element.fontFamily, letterSpacing: element.letterSpacing ? `${element.letterSpacing}px` : 'normal', textAlign: element.textAlign || 'left', opacity: element.opacity || 1, transform: isCenterAlignedWithoutWidth ? 'translateX(-50%)' : 'none', whiteSpace: 'pre-wrap', wordBreak: 'break-word', cursor: isPageNumber ? 'default' : 'text' }}>
              {displayValue}
            </div>
          );
        }

        if (element.type === 'text' && !element.editable) {
          const isCenterAlignedWithoutWidth = element.textAlign === 'center' && !element.width;
          return (
            <div key={idx} className="absolute whitespace-pre-wrap" style={{ left: isCenterAlignedWithoutWidth ? '50%' : `${element.x}px`, top: `${element.y}px`, fontSize: `${element.fontSize}px`, fontWeight: element.fontWeight, color: element.fill, maxWidth: element.width ? `${element.width}px` : 'none', width: element.width ? `${element.width}px` : 'auto', lineHeight: element.lineHeight || 1.5, fontFamily: element.fontFamily, letterSpacing: element.letterSpacing ? `${element.letterSpacing}px` : 'normal', textAlign: element.textAlign || 'left', opacity: element.opacity || 1, transform: isCenterAlignedWithoutWidth ? 'translateX(-50%)' : 'none' }}>
              {element.content}
            </div>
          );
        }

        if (element.type === 'image' && element.editable) {
          const value = data[elementId] || (element.placeholder ? 'https://via.placeholder.com/' + element.width + 'x' + element.height + '/f0f0f0/999999?text=Image' : element.url);
          return (
            <div key={idx} className="editable-image absolute" onClick={() => handleImageClick(elementId)} style={{ left: `${element.x}px`, top: `${element.y}px`, width: `${element.width}px`, height: `${element.height}px` }}>
              <img src={value} alt="" className="w-full h-full object-cover" />
            </div>
          );
        }

        if (element.type === 'image' && !element.editable) {
          const value = element.url;
          return (
            <div key={idx} className="absolute" style={{ left: `${element.x}px`, top: `${element.y}px`, width: `${element.width}px`, height: `${element.height}px` }}>
              <img src={value} alt="" className="w-full h-full object-contain" />
            </div>
          );
        }

        if (element.type === 'line') {
          return (
            <svg key={idx} style={{ position: 'absolute', left: `${Math.min(element.x1, element.x2)}px`, top: `${Math.min(element.y1, element.y2)}px`, width: `${Math.abs(element.x2 - element.x1)}px`, height: `${Math.abs(element.y2 - element.y1)}px`, overflow: 'visible' }}>
              <line x1={element.x1 < element.x2 ? 0 : Math.abs(element.x2 - element.x1)} y1={element.y1 < element.y2 ? 0 : Math.abs(element.y2 - element.y1)} x2={element.x1 < element.x2 ? Math.abs(element.x2 - element.x1) : 0} y2={element.y1 < element.y2 ? Math.abs(element.y2 - element.y1) : 0} stroke={element.stroke} strokeWidth={element.strokeWidth} />
            </svg>
          );
        }

        return null;
      })}
    </div>
  );
}
