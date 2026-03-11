// CoverRenderer: maincover01/02/03, finalcover02/03 렌더링
// Uses ImageArea + makeImageHandlers from shared modules

function CoverRenderer({ template, data, onUpdate, handleTextEdit, handleImageClick, getPageNumber, currentSlideIndex, dragState }) {
  // maincover01(Type03), maincover02(Type02), finalcover02(Type02) 우측 이미지 영역
  const hasRightImage = template.id === 'maincover01' || template.id === 'maincover02' || template.id === 'finalcover02';
  // maincover03(Type01), finalcover03(Type03) 전체 배경 이미지 영역
  const hasFullBgImage = template.id === 'maincover03' || template.id === 'finalcover03';

  const mcImageKey = hasRightImage ? 'image_right' : (hasFullBgImage ? 'image_bg' : null);
  const mcImageSrc = mcImageKey ? data[mcImageKey] : null;
  const mcImgTransform = mcImageKey ? (data[`${mcImageKey}_transform`] || { x: 0, y: 0, scale: 1 }) : null;

  // Single-image handlers via shared factory
  const h = mcImageKey ? makeImageHandlers(mcImageKey, data, onUpdate, dragState, { multiKey: false }) : null;

  return (
    <div className="w-full h-full relative" style={{ backgroundColor: template.elements[0]?.fill || '#FFFFFF' }}>
      {/* maincover03(Type01), finalcover03(Type03) 전체 배경 이미지 영역 */}
      {hasFullBgImage && (
        <ImageArea
          imageSrc={mcImageSrc}
          imgTransform={mcImgTransform}
          imageKey={mcImageKey}
          handlers={h}
          handleImageClick={handleImageClick}
          isDraggingImg={dragState.isDraggingImg}
          draggingImageKey={null}
          style={{
            position: 'absolute', left: '0', top: '0',
            width: '1920px', height: '1080px',
            backgroundColor: template.elements[0]?.fill || '#f7f7f7',
            overflow: 'hidden',
            zIndex: 0
          }}
          placeholderIconSize={64}
          placeholderTextSize="28px"
          placeholderBg="#F7F7F7"
          hidePlaceholder={true}
          btnPadding="10px 24px"
          btnFontSize="16px"
          hintTop="20px"
          btnBottom="20px"
        />
      )}

      {/* 배경 rect 렌더링 (우측 패널은 hasRightImage일 때 이미지 영역으로 대체) */}
      {!hasFullBgImage && template.elements.map((element, idx) => {
        if (element.type === 'rect') {
          if (hasRightImage && element.x === 820 && element.width === 1100) {
            return null;
          }
          return (
            <div key={idx} style={{
              position: 'absolute',
              left: `${element.x}px`, top: `${element.y}px`,
              width: `${element.width}px`, height: `${element.height}px`,
              backgroundColor: element.fill
            }} />
          );
        }
        return null;
      })}

      {/* 로고 이미지 렌더링 */}
      {template.elements.map((element, idx) => {
        if (element.type === 'image' && !element.editable) {
          return (
            <div key={`img-${idx}`} className="absolute" style={{
              left: `${element.x}px`, top: `${element.y}px`,
              width: `${element.width}px`, height: `${element.height}px`,
              zIndex: 3
            }}>
              <img src={element.url} alt="" className="w-full h-full object-contain" />
            </div>
          );
        }
        return null;
      })}

      {/* 우측 이미지 영역 (maincover01, maincover02, finalcover02) */}
      {hasRightImage && (
        <ImageArea
          imageSrc={mcImageSrc}
          imgTransform={mcImgTransform}
          imageKey={mcImageKey}
          handlers={h}
          handleImageClick={handleImageClick}
          isDraggingImg={dragState.isDraggingImg}
          draggingImageKey={null}
          style={{
            position: 'absolute', left: '820px', top: '0px',
            width: '1100px', height: '1080px',
            backgroundColor: '#F7F7F7',
            overflow: 'hidden'
          }}
          placeholderIconSize={64}
          placeholderTextSize="28px"
          placeholderBg="#F7F7F7"
          btnPadding="10px 24px"
          btnFontSize="16px"
          hintTop="20px"
          btnBottom="20px"
        />
      )}

      {/* Flexbox 텍스트 컨테이너 */}
      <div style={{
        position: 'absolute',
        left: hasFullBgImage ? '50%' : '120px',
        top: hasFullBgImage ? '395px' : '100px',
        transform: hasFullBgImage ? 'translateX(-50%)' : 'none',
        display: 'flex',
        flexDirection: 'column',
        gap: hasFullBgImage ? '25px' : '0px',
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
