function GenericRenderer({ template, data, onUpdate, handleTextEdit, handleImageClick, handleDeleteSection, containerRef, textRefs, getPageNumber, currentSlideIndex }) {

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
            <div key={idx} className="editable-image absolute" onClick={(e) => handleImageClick(elementId, e)} style={{ left: `${element.x}px`, top: `${element.y}px`, width: `${element.width}px`, height: `${element.height}px` }}>
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
