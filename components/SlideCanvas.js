function SlideCanvas({ template, data, onUpdate, onImageUpload, currentSlideIndex, slides }) {
  const textRefs = useRef({});
  const containerRef = useRef(null);
  const [, forceRender] = useState(0);
  const [undoStack, setUndoStack] = useState([]);

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
        title: '지면 광고',
        subtitles: ['광고 노출 지면', '상품 개요', '상품 세부 소개', '광고 효과 분석']
      },
      {
        id: 'section_2',
        title: '부속 상품 (노출형)',
        subtitles: ['슈퍼셀렉트 퍼스트', '기획전 (숙박 / 대실)', '검색 · 주변 광고', '프리미엄 배너 광고']
      },
      {
        id: 'section_3',
        title: '부속 상품 (할인형)',
        subtitles: ['플러스 쿠폰', '부스트 쿠폰', '선불형 쿠폰', '후불형 쿠폰']
      }
    ];
  });

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
        subtitles: ['보조 텍스트', '보조 텍스트', '보조 텍스트', '보조 텍스트']
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
          return { ...s, subtitles: [...s.subtitles, '새 보조 타이틀'] };
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
        <div style={{
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
          width: '120px'
        }}>
          {getPageNumber(currentSlideIndex)}
        </div>
      </div>
    );
  }

  // Index Type 01 (Draggable TOC) 전용 렌더링
  if (template.id === 'index01' && template.isDraggable) {
    // TOC 항목 상태 관리
    const [tocItems, setTocItems] = useState(template.tocItems || []);
    const [draggedIndex, setDraggedIndex] = useState(null);

    // 드래그 시작
    const handleDragStart = (index) => {
      setDraggedIndex(index);
    };

    // 드래그 중
    const handleDragOver = (e, index) => {
      e.preventDefault();
    };

    // 드롭
    const handleDrop = (e, dropIndex) => {
      e.preventDefault();
      if (draggedIndex === null || draggedIndex === dropIndex) return;

      const newItems = [...tocItems];
      const [removed] = newItems.splice(draggedIndex, 1);
      newItems.splice(dropIndex, 0, removed);

      setTocItems(newItems);
      setDraggedIndex(null);
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
              className={`toc-row ${draggedIndex === index ? 'dragging' : ''}`}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={() => setDraggedIndex(null)}
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
    return (
      <div className="w-full h-full relative" style={{ backgroundColor: template.elements[0]?.fill || '#FFFFFF' }}>
        {template.elements.map((element, idx) => {
          const elementId = `${element.type}_${idx}`;

          // 배경 rect 렌더링
          if (element.type === 'rect') {
            return <div key={idx} style={{ position: 'absolute', left: `${element.x}px`, top: `${element.y}px`, width: `${element.width}px`, height: `${element.height}px`, backgroundColor: element.fill }} />;
          }

          // 로고 이미지 렌더링
          if (element.type === 'image' && !element.editable) {
            return (
              <div key={idx} className="absolute" style={{ left: `${element.x}px`, top: `${element.y}px`, width: `${element.width}px`, height: `${element.height}px` }}>
                <img src={element.url} alt="" className="w-full h-full object-contain" />
              </div>
            );
          }

          return null;
        })}

        {/* Flexbox 텍스트 컨테이너 */}
        <div style={{
          position: 'absolute',
          left: (template.id === 'maincover03' || template.id === 'finalcover03') ? '50%' : '120px',
          top: (template.id === 'maincover03' || template.id === 'finalcover03') ? '395px' : '100px',
          transform: (template.id === 'maincover03' || template.id === 'finalcover03') ? 'translateX(-50%)' : 'none',
          display: 'flex',
          flexDirection: 'column',
          gap: (template.id === 'maincover03' || template.id === 'finalcover03') ? '25px' : '0px'
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
        <div style={{ position: 'absolute', left: '1680px', top: '990px', fontSize: '20px', fontWeight: '500', color: '#999999', fontFamily: 'Pretendard', letterSpacing: '-0.2px', lineHeight: 1.4, textAlign: 'right', width: '120px' }}>
          {getPageNumber(currentSlideIndex)}
        </div>
      </div>
    );
  }

  // Core Value Type 01 전용 렌더링
  if (template.id === 'corevalue01') {
    return (
      <div className="w-full h-full relative" style={{ backgroundColor: template.elements[0]?.fill || '#FFFFFF' }}>
        {/* 배경 */}

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
        <div className="absolute" style={{ left: '120px', top: '991px', width: '118px', height: '20px' }}>
          <img src={template.elements[11].url} alt="" className="w-full h-full object-contain" />
        </div>

        {/* 푸터 - 카피라이트 */}
        <div className="absolute whitespace-pre-wrap" style={{ left: '260px', top: '990px', fontSize: '20px', fontWeight: '500', color: '#BBBBBB', fontFamily: 'Pretendard', letterSpacing: '-0.2px', lineHeight: 1.4 }}>
          {template.elements[12].content}
        </div>

        {/* 푸터 - 페이지 번호 (자동 계산) */}
        <div
          className="editable-field absolute"
          contentEditable={false}
          style={{ left: '1680px', top: '990px', fontSize: '20px', fontWeight: '500', color: '#999999', fontFamily: 'Pretendard', letterSpacing: '-0.2px', lineHeight: 1.4, textAlign: 'right', width: '120px', cursor: 'default' }}>
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
