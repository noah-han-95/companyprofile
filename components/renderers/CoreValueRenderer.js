// CoreValueRenderer: corevalue01 ~ corevalue05 렌더링
// Uses ImageArea + makeImageHandlers from shared modules

function CoreValueRenderer({ template, data, onUpdate, handleTextEdit, handleImageClick, handleDeleteSection, containerRef, getPageNumber, currentSlideIndex, dragState }) {
  const { isDraggingImg, setIsDraggingImg, draggingImageKey, setDraggingImageKey, dragStart, setDragStart, dragOffset, setDragOffset } = dragState;

  // ─── Core Value Type 01 전용 렌더링 ───
  if (template.id === 'corevalue01') {
    const h = makeImageHandlers('image_left', data, onUpdate, dragState, { multiKey: false });

    return (
      <div className="w-full h-full relative" style={{ backgroundColor: template.elements[0]?.fill || '#FFFFFF' }}>
        {/* 좌측 풀 이미지 영역 */}
        <ImageArea
          imageSrc={h.imageSrc}
          imgTransform={h.imgTransform}
          imageKey="image_left"
          handlers={h}
          handleImageClick={handleImageClick}
          isDraggingImg={isDraggingImg}
          draggingImageKey={null}
          style={{
            position: 'absolute', left: '0', top: '0',
            width: '960px', height: '1080px',
            backgroundColor: h.imageSrc ? 'transparent' : '#F0F0F0'
          }}
          placeholderIconSize={64}
          placeholderTextSize="28px"
          placeholderBg="#F0F0F0"
          btnPadding="10px 24px"
          btnFontSize="16px"
          hintTop="20px"
          btnBottom="20px"
        />

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
    const h = makeImageHandlers('image_container', data, onUpdate, dragState, { multiKey: false });

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
        <ImageArea
          imageSrc={h.imageSrc}
          imgTransform={h.imgTransform}
          imageKey="image_container"
          handlers={h}
          handleImageClick={handleImageClick}
          isDraggingImg={isDraggingImg}
          draggingImageKey={null}
          style={{
            position: 'absolute', left: '120px', top: '400px',
            width: '1680px', height: '550px',
            backgroundColor: '#FFFFFF', borderRadius: '24px',
            overflow: 'hidden'
          }}
          placeholderIconSize={64}
          placeholderTextSize="28px"
          placeholderBg="transparent"
          placeholderRadius="24px"
          btnPadding="10px 24px"
          btnFontSize="16px"
          hintTop="20px"
          btnBottom="20px"
        >
          {/* 빈 이미지 placeholder에 border 표시용 - ImageArea 내부 children은 imageSrc 있을 때만 렌더 */}
        </ImageArea>

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
          const h = makeImageHandlers(container.key, data, onUpdate, dragState, { multiKey: true, skipEditable: true });
          const IMG_TOP = 240;
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
              <ImageArea
                imageSrc={h.imageSrc}
                imgTransform={h.imgTransform}
                imageKey={container.key}
                handlers={h}
                handleImageClick={handleImageClick}
                isDraggingImg={isDraggingImg}
                draggingImageKey={draggingImageKey}
                style={{
                  position: 'absolute', left: '40px', top: `${IMG_TOP}px`,
                  width: `${container.rect.w - 80}px`, height: `${container.rect.h - IMG_TOP - 40}px`,
                  overflow: 'hidden', borderRadius: '16px',
                  zIndex: 1
                }}
                placeholderIconSize={40}
                placeholderTextSize="20px"
                placeholderBg="#F0F0F0"
                placeholderRadius="16px"
                btnPadding="8px 20px"
                btnFontSize="14px"
                hintFontSize="12px"
                hintTop="12px"
                btnBottom="16px"
              />
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
          const h = makeImageHandlers(container.key, data, onUpdate, dragState, { multiKey: true, skipEditable: true });
          const IMG_TOP = 240;
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
              <ImageArea
                imageSrc={h.imageSrc}
                imgTransform={h.imgTransform}
                imageKey={container.key}
                handlers={h}
                handleImageClick={handleImageClick}
                isDraggingImg={isDraggingImg}
                draggingImageKey={draggingImageKey}
                style={{
                  position: 'absolute', left: '40px', top: `${IMG_TOP}px`,
                  width: `${container.rect.w - 80}px`, height: `${container.rect.h - IMG_TOP - 40}px`,
                  overflow: 'hidden', borderRadius: '16px',
                  zIndex: 1
                }}
                placeholderIconSize={40}
                placeholderTextSize="20px"
                placeholderBg="#F0F0F0"
                placeholderRadius="16px"
                btnPadding="8px 20px"
                btnFontSize="14px"
                hintFontSize="12px"
                hintTop="12px"
                btnBottom="16px"
              />
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

  // ─── Core Value Type 05 전용 렌더링 (4 컨테이너, 2x2, 우측 이미지) ───
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

        {/* 4개 컨테이너 (2x2) */}
        {containers.map((container) => {
          const h = makeImageHandlers(container.key, data, onUpdate, dragState, { multiKey: true, skipEditable: true });
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
              <ImageArea
                imageSrc={h.imageSrc}
                imgTransform={h.imgTransform}
                imageKey={container.key}
                handlers={h}
                handleImageClick={handleImageClick}
                isDraggingImg={isDraggingImg}
                draggingImageKey={draggingImageKey}
                style={{
                  position: 'absolute', left: `${IMG_LEFT}px`, top: '40px',
                  width: `${IMG_WIDTH}px`, height: `${IMG_HEIGHT}px`,
                  overflow: 'hidden', borderRadius: '16px',
                  zIndex: 1
                }}
                placeholderIconSize={32}
                placeholderTextSize="16px"
                placeholderBg="#F0F0F0"
                placeholderRadius="16px"
                btnPadding="6px 16px"
                btnFontSize="14px"
                hintFontSize="11px"
                hintTop="8px"
                btnBottom="12px"
              />
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

  return null;
}
