function IndexRenderer({ template, data, onUpdate, handleTextEdit, handleImageClick, handleDeleteSection, getPageNumber, currentSlideIndex, tocItems, setTocItems, tocDraggedIndex, setTocDraggedIndex, index02Sections, setIndex02Sections, dragState }) {

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

  return null;
}
