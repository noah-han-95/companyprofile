function TemplateThumbnail({ template, data, slideIndex, slides }) {
  const containerRef = useRef(null);
  const [thumbnailScale, setThumbnailScale] = useState(0.1);

  useEffect(() => {
    if (containerRef.current) {
      const width = containerRef.current.offsetWidth;
      const scale = width / 1920;
      setThumbnailScale(scale);
    }
  }, []);

  // 페이지 번호 계산 함수 (썸네일용)
  const getPageNumber = (idx) => {
    if (!slides || !slides[idx]) return '';

    let pageNumber = 1;
    for (let i = 0; i < idx; i++) {
      const templateId = slides[i].templateId;
      if (!templateId.startsWith('maincover') && !templateId.startsWith('finalcover') && !templateId.startsWith('index')) {
        pageNumber++;
      }
    }

    const currentTemplateId = slides[idx].templateId;
    if (currentTemplateId.startsWith('maincover') || currentTemplateId.startsWith('finalcover') || currentTemplateId.startsWith('index')) {
      return '';
    }

    return `P${pageNumber}`;
  };

  if (!template) return <div className="thumbnail-preview bg-slate-100"></div>;

  // 공통 래퍼
  const ThumbnailWrapper = ({ bgColor, children }) => (
    <div ref={containerRef} className="thumbnail-preview">
      <div className="thumbnail-canvas" style={{ backgroundColor: bgColor || '#FFFFFF' }}>
        <div style={{
          width: '1920px', height: '1080px',
          transform: `scale(${thumbnailScale})`, transformOrigin: 'top left',
          position: 'absolute', top: 0, left: 0
        }}>
          {children}
        </div>
      </div>
    </div>
  );

  // 공통 푸터 렌더링
  const renderFooter = (elements) => {
    const footerElements = elements.slice(-3);
    return footerElements.map((el, i) => {
      if (el.type === 'image') {
        return (
          <div key={`footer-${i}`} style={{ position: 'absolute', left: `${el.x}px`, top: `${el.y}px`, width: `${el.width}px`, height: `${el.height}px` }}>
            <img src={el.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
        );
      }
      if (el.type === 'text') {
        const isPageNum = el.x === 1680 && el.y === 990;
        return (
          <div key={`footer-${i}`} style={{
            position: 'absolute', left: `${el.x}px`, top: `${el.y}px`,
            fontSize: `${el.fontSize}px`, fontWeight: el.fontWeight, color: el.fill,
            fontFamily: el.fontFamily, letterSpacing: `${el.letterSpacing}px`, lineHeight: el.lineHeight,
            textAlign: el.textAlign || 'left', width: el.width ? `${el.width}px` : 'auto'
          }}>{isPageNum && slideIndex !== undefined ? getPageNumber(slideIndex) : el.content}</div>
        );
      }
      return null;
    });
  };

  // ─── Table 템플릿 전용 썸네일 ───
  if (template.dynamicTable) {
    const tableData = data?.tableData || template.defaultTable;
    const headers = tableData.headers;
    const rows = tableData.rows;
    const TABLE_X = 120, TABLE_Y = 200, TABLE_WIDTH = 1680, HEADER_HEIGHT = 100, LABEL_COL_WIDTH = 240;
    const TABLE_MAX_HEIGHT = 750;
    const singleRowHeight = (TABLE_MAX_HEIGHT - HEADER_HEIGHT) / rows.length;

    return (
      <ThumbnailWrapper bgColor="#F7F7F7">
        <div style={{
          position: 'absolute', left: '120px', top: '100px',
          fontSize: '48px', fontWeight: '700', color: '#333333',
          fontFamily: 'Pretendard', letterSpacing: '-0.48px'
        }}>
          {data?.text_1 || template.elements.find(e => e.type === 'text' && e.editable)?.content || '서비스 비교 분석'}
        </div>
        <div style={{
          position: 'absolute', left: `${TABLE_X}px`, top: `${TABLE_Y}px`, width: `${TABLE_WIDTH}px`,
          display: 'grid',
          gridTemplateColumns: `${LABEL_COL_WIDTH}px repeat(${headers.length}, 1fr)`,
          gridTemplateRows: `${HEADER_HEIGHT}px repeat(${rows.length}, ${singleRowHeight}px)`
        }}>
          <div style={{ backgroundColor: '#E5E5E5', border: '1px solid #CCCCCC' }} />
          {headers.map((h, i) => (
            <div key={i} style={{
              backgroundColor: '#E5E5E5', border: '1px solid #CCCCCC',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '32px', fontWeight: '700', color: '#333333', fontFamily: 'Pretendard'
            }}>{h}</div>
          ))}
          {rows.map((row, ri) => {
            const mergedCols = row.mergedCols || [];
            const cells = [];
            cells.push(
              <div key={`l-${ri}`} style={{
                backgroundColor: '#FFFFFF', border: '1px solid #CCCCCC',
                display: 'flex', alignItems: 'center', padding: '0 30px',
                fontSize: '32px', fontWeight: '700', color: '#333333', fontFamily: 'Pretendard', opacity: 0.89
              }}>{row.label}</div>
            );
            for (let ci = 0; ci < row.cells.length; ci++) {
              if (mergedCols.includes(ci - 1)) continue;
              const span = mergedCols.includes(ci) ? 2 : 1;
              cells.push(
                <div key={`c-${ri}-${ci}`} style={{
                  gridColumn: `span ${span}`,
                  backgroundColor: '#FFFFFF', border: '1px solid #CCCCCC',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '15px 30px', fontSize: '32px', fontWeight: '700', color: '#333333',
                  fontFamily: 'Pretendard', textAlign: 'center', whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: 1.6
                }}>{row.cells[ci]}</div>
              );
            }
            return cells;
          })}
        </div>
        {template.elements.filter(e => e.type === 'image' && !e.editable).map((el, i) => (
          <div key={`img-${i}`} style={{ position: 'absolute', left: `${el.x}px`, top: `${el.y}px`, width: `${el.width}px`, height: `${el.height}px` }}>
            <img src={el.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
        ))}
      </ThumbnailWrapper>
    );
  }

  // ─── Main Cover & Final Cover 전용 썸네일 ───
  const isMainCoverFlexbox = template.id === 'maincover01' || template.id === 'maincover02' || template.id === 'maincover03' || template.id === 'finalcover02' || template.id === 'finalcover03';

  if (isMainCoverFlexbox) {
    const hasRightImage = template.id === 'maincover01' || template.id === 'maincover02' || template.id === 'finalcover02';
    const hasFullBgImage = template.id === 'maincover03' || template.id === 'finalcover03';
    const mcImageKey = hasRightImage ? 'image_right' : (hasFullBgImage ? 'image_bg' : null);
    const mcImageSrc = mcImageKey && data ? data[mcImageKey] : null;
    const mcImgTransform = mcImageKey && data ? (data[`${mcImageKey}_transform`] || { x: 0, y: 0, scale: 1 }) : null;

    return (
      <ThumbnailWrapper bgColor={template.elements[0]?.fill || '#FFFFFF'}>
        {/* 배경 rect (fullBg일 때 이미지로 대체) */}
        {template.elements.map((element, idx) => {
          if (element.type === 'rect') {
            if (hasFullBgImage && element.x === 0 && element.width === 1920) return null;
            if (hasRightImage && element.x === 820 && element.width === 1100) return null;
            return <div key={idx} style={{ position: 'absolute', left: `${element.x}px`, top: `${element.y}px`, width: `${element.width}px`, height: `${element.height}px`, backgroundColor: element.fill }} />;
          }
          if (element.type === 'image' && !element.editable) {
            return (
              <div key={idx} style={{ position: 'absolute', left: `${element.x}px`, top: `${element.y}px`, width: `${element.width}px`, height: `${element.height}px`, zIndex: 3 }}>
                <img src={element.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
            );
          }
          return null;
        })}

        {/* 전체 배경 이미지 */}
        {hasFullBgImage && mcImageSrc && (
          <div style={{ position: 'absolute', left: '0', top: '0', width: '1920px', height: '1080px', overflow: 'hidden', zIndex: 0 }}>
            <img src={mcImageSrc} alt="" style={{
              position: 'absolute', left: '50%', top: '50%',
              transform: `translate(calc(-50% + ${mcImgTransform.x}px), calc(-50% + ${mcImgTransform.y}px)) scale(${mcImgTransform.scale})`,
              maxWidth: '100%', maxHeight: '100%', objectFit: 'contain'
            }} />
          </div>
        )}
        {hasFullBgImage && !mcImageSrc && (
          <div style={{ position: 'absolute', left: '0', top: '0', width: '1920px', height: '1080px', backgroundColor: template.elements[0]?.fill || '#f7f7f7' }} />
        )}

        {/* 우측 이미지 영역 */}
        {hasRightImage && (
          <div style={{ position: 'absolute', left: '820px', top: '0', width: '1100px', height: '1080px', backgroundColor: '#F7F7F7', overflow: 'hidden' }}>
            {mcImageSrc && (
              <img src={mcImageSrc} alt="" style={{
                position: 'absolute', left: '50%', top: '50%',
                transform: `translate(calc(-50% + ${mcImgTransform.x}px), calc(-50% + ${mcImgTransform.y}px)) scale(${mcImgTransform.scale})`,
                maxWidth: '100%', maxHeight: '100%', objectFit: 'contain'
              }} />
            )}
          </div>
        )}

        {/* Flexbox 텍스트 */}
        <div style={{
          position: 'absolute',
          left: (template.id === 'maincover03' || template.id === 'finalcover03') ? '50%' : '120px',
          top: (template.id === 'maincover03' || template.id === 'finalcover03') ? '395px' : '100px',
          transform: (template.id === 'maincover03' || template.id === 'finalcover03') ? 'translateX(-50%)' : 'none',
          display: 'flex', flexDirection: 'column',
          gap: (template.id === 'maincover03' || template.id === 'finalcover03') ? '25px' : '0px',
          zIndex: 2
        }}>
          {template.elements
            .map((el, originalIdx) => ({ el, originalIdx }))
            .filter(({ el }) => el.type === 'text' && el.editable)
            .sort((a, b) => a.el.y - b.el.y)
            .map(({ el: element, originalIdx }, textIdx) => {
              const elementId = `text_${originalIdx}`;
              const content = data && data[elementId] !== undefined ? data[elementId] : element.content;

              let marginBottom = '0px';
              if (template.id === 'maincover01' || template.id === 'maincover02' || template.id === 'finalcover02') {
                if (textIdx === 0) marginBottom = '12px';
                if (textIdx === 1) marginBottom = '30px';
              }

              const maxLinesStyle = element.maxLines ? {
                display: '-webkit-box',
                WebkitLineClamp: element.maxLines,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              } : {};

              return (
                <div key={elementId} style={{
                  fontSize: `${element.fontSize}px`, fontWeight: element.fontWeight,
                  color: element.fill, fontFamily: element.fontFamily,
                  letterSpacing: `${element.letterSpacing}px`, lineHeight: element.lineHeight,
                  width: element.width ? `${element.width}px` : 'auto',
                  textAlign: element.textAlign || 'left', marginBottom,
                  whiteSpace: 'pre-wrap', ...maxLinesStyle
                }}>{content}</div>
              );
            })}
        </div>
      </ThumbnailWrapper>
    );
  }

  // ─── FAQ Type 01 전용 썸네일 ───
  if (template.id === 'faq01') {
    const items = data?.faqItems || [
      { id: 'faq1', question: 'Q1. 질문을 입력하세요.', answer: '답변을 입력하세요.' },
      { id: 'faq2', question: 'Q2. 질문을 입력하세요.', answer: '답변을 입력하세요.' },
      { id: 'faq3', question: 'Q3. 질문을 입력하세요.', answer: '답변을 입력하세요.' },
      { id: 'faq4', question: 'Q4. 질문을 입력하세요.', answer: '답변을 입력하세요.' },
      { id: 'faq5', question: 'Q5. 질문을 입력하세요.', answer: '답변을 입력하세요.' },
      { id: 'faq6', question: 'Q6. 질문을 입력하세요.', answer: '답변을 입력하세요.' },
      { id: 'faq7', question: 'Q7. 질문을 입력하세요.', answer: '답변을 입력하세요.' },
      { id: 'faq8', question: 'Q8. 질문을 입력하세요.', answer: '답변을 입력하세요.' }
    ];
    const CARD_START_Y = 256, CARD_ROW_GAP = 175, CARD_W = 820, CARD_H = 160;
    const COL_LEFT = 120, COL_RIGHT = 980, CARD_RADIUS = 20, CARD_PAD_X = 43;

    return (
      <ThumbnailWrapper bgColor="#FFFFFF">
        <div style={{ position: 'absolute', left: '120px', top: '100px', fontSize: '32px', fontWeight: '700', color: '#BBBBBB', fontFamily: 'Pretendard' }}>
          {data?.text_1 || template.elements[1].content}
        </div>
        <div style={{ position: 'absolute', left: '120px', top: '152px', fontSize: '48px', fontWeight: '700', color: '#333333', fontFamily: 'Pretendard' }}>
          {data?.text_2 || template.elements[2].content}
        </div>
        {items.map((item, index) => {
          const col = index % 2;
          const row = Math.floor(index / 2);
          const x = col === 0 ? COL_LEFT : COL_RIGHT;
          const y = CARD_START_Y + row * CARD_ROW_GAP;
          return (
            <div key={item.id} style={{
              position: 'absolute', left: `${x}px`, top: `${y}px`,
              width: `${CARD_W}px`, height: `${CARD_H}px`,
              backgroundColor: '#F7F7F7', borderRadius: `${CARD_RADIUS}px`
            }}>
              <div style={{
                position: 'absolute', left: `${CARD_PAD_X}px`, top: '34px',
                fontSize: '32px', fontWeight: '700', color: '#333333', fontFamily: 'Pretendard',
                width: `${CARD_W - CARD_PAD_X * 2}px`, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
              }}>{`Q${index + 1}. ${item.question.replace(/^Q\d+\.\s*/, '')}`}</div>
              <div style={{
                position: 'absolute', left: `${CARD_PAD_X}px`, top: '92px',
                fontSize: '20px', fontWeight: '500', color: '#666666', fontFamily: 'Pretendard',
                width: `${CARD_W - CARD_PAD_X * 2}px`, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
              }}>{item.answer}</div>
            </div>
          );
        })}
        {renderFooter(template.elements)}
      </ThumbnailWrapper>
    );
  }

  // ─── FAQ Type 02 전용 썸네일 ───
  if (template.id === 'faq02') {
    const items = data?.faqItems || [
      { id: 'faq1', question: 'Q1. 질문을 입력하세요.', answer: '답변을 입력하세요.' },
      { id: 'faq2', question: 'Q2. 질문을 입력하세요.', answer: '답변을 입력하세요.' },
      { id: 'faq3', question: 'Q3. 질문을 입력하세요.', answer: '답변을 입력하세요.' },
      { id: 'faq4', question: 'Q4. 질문을 입력하세요.', answer: '답변을 입력하세요.' },
      { id: 'faq5', question: 'Q5. 질문을 입력하세요.', answer: '답변을 입력하세요.' }
    ];
    const LIST_X = 700, LIST_START_Y = 120, BLOCK_GAP = 140;

    return (
      <ThumbnailWrapper bgColor="#FFFFFF">
        <div style={{ position: 'absolute', left: '120px', top: '100px', fontSize: '32px', fontWeight: '700', color: '#BBBBBB', fontFamily: 'Pretendard' }}>
          {data?.text_1 || template.elements[1].content}
        </div>
        <div style={{ position: 'absolute', left: '120px', top: '152px', fontSize: '48px', fontWeight: '700', color: '#333333', fontFamily: 'Pretendard' }}>
          {data?.text_2 || template.elements[2].content}
        </div>
        {items.map((item, index) => {
          const y = LIST_START_Y + index * BLOCK_GAP;
          const isLast = index === items.length - 1;
          return (
            <div key={item.id} style={{ position: 'absolute', left: `${LIST_X}px`, top: `${y}px` }}>
              <div style={{
                fontSize: '32px', fontWeight: '700', color: '#333333', fontFamily: 'Pretendard',
                letterSpacing: '-0.32px', lineHeight: 1.5
              }}>{`Q${index + 1}. ${item.question.replace(/^Q\d+\.\s*/, '')}`}</div>
              <div style={{
                marginTop: '4px', fontSize: '20px', fontWeight: '500', color: '#666666',
                fontFamily: 'Pretendard', letterSpacing: '-0.2px', lineHeight: 1.5
              }}>{item.answer}</div>
              {!isLast && (
                <div style={{
                  position: 'absolute', left: '0', top: '112px',
                  width: '1100px', height: '1px', backgroundColor: '#DCDCDC'
                }} />
              )}
            </div>
          );
        })}
        {renderFooter(template.elements)}
      </ThumbnailWrapper>
    );
  }

  // ─── Section Cover Type 03 전용 썸네일 ───
  if (template.id === 'section03') {
    const rows = data?.rows || [
      { id: 'r1', title: '타이틀 텍스트', highlighted: true },
      { id: 'r2', title: '타이틀 텍스트', highlighted: false },
      { id: 'r3', title: '타이틀 텍스트', highlighted: false },
      { id: 'r4', title: '타이틀 텍스트', highlighted: false },
      { id: 'r5', title: '타이틀 텍스트', highlighted: false }
    ];
    const ROW_GAP = 112;
    const ROW_HEIGHT = 62;
    const totalBlockHeight = (rows.length - 1) * ROW_GAP + ROW_HEIGHT;
    const ROW_START_Y = Math.round((1080 - totalBlockHeight) / 2);

    return (
      <ThumbnailWrapper bgColor="#333333">
        {rows.map((row, index) => {
          const y = ROW_START_Y + index * ROW_GAP;
          const isHighlighted = row.highlighted !== undefined ? row.highlighted : (index === 0);
          const rowOpacity = isHighlighted ? 1 : 0.3;
          return (
            <div key={row.id} style={{
              position: 'absolute', left: '933px', top: `${y}px`,
              display: 'flex', alignItems: 'center'
            }}>
              <div style={{
                fontSize: '32px', fontWeight: '700', color: '#FFFFFF',
                fontFamily: 'Pretendard', opacity: rowOpacity, width: '88px'
              }}>{index + 1}</div>
              <div style={{
                fontSize: '48px', fontWeight: '700', color: '#FFFFFF',
                fontFamily: 'Pretendard', letterSpacing: '-0.48px', lineHeight: 1.3,
                opacity: rowOpacity, whiteSpace: 'nowrap'
              }}>{row.title}</div>
            </div>
          );
        })}
        {renderFooter(template.elements)}
      </ThumbnailWrapper>
    );
  }

  // ─── Mobile 템플릿 전용 썸네일 ───
  if (template.id === 'mobile01' || template.id === 'mobile02' || template.id === 'mobile03' || template.id === 'mobile04') {
    const mobileFrames = {
      mobile01: [
        { key: 'mobile_img_0', frame: { x: 745, y: 195, w: 375, h: 730, r: 24, sw: 12 }, img: { x: 757, y: 207, w: 351, h: 706 } }
      ],
      mobile02: [
        { key: 'mobile_img_0', frame: { x: 829, y: 256, w: 375, h: 705, r: 24, sw: 12 }, img: { x: 841, y: 268, w: 351, h: 681 } },
        { key: 'mobile_img_1', frame: { x: 1328, y: 256, w: 375, h: 705, r: 24, sw: 12 }, img: { x: 1340, y: 268, w: 351, h: 681 } }
      ],
      mobile03: [
        { key: 'mobile_img_0', frame: { x: 134, y: 467, w: 480, h: 792, r: 24, sw: 12 }, img: { x: 146, y: 479, w: 456, h: 768 } },
        { key: 'mobile_img_1', frame: { x: 720, y: 467, w: 480, h: 792, r: 24, sw: 12 }, img: { x: 732, y: 479, w: 456, h: 768 } },
        { key: 'mobile_img_2', frame: { x: 1306, y: 467, w: 480, h: 792, r: 24, sw: 12 }, img: { x: 1318, y: 479, w: 456, h: 768 } }
      ],
      mobile04: [
        { key: 'mobile_img_0', frame: { x: 120, y: 586, w: 346, h: 600, r: 24, sw: 12 }, img: { x: 132, y: 598, w: 322, h: 576 } },
        { key: 'mobile_img_1', frame: { x: 566, y: 586, w: 346, h: 600, r: 24, sw: 12 }, img: { x: 578, y: 598, w: 322, h: 576 } },
        { key: 'mobile_img_2', frame: { x: 1012, y: 586, w: 346, h: 600, r: 24, sw: 12 }, img: { x: 1024, y: 598, w: 322, h: 576 } },
        { key: 'mobile_img_3', frame: { x: 1458, y: 586, w: 346, h: 600, r: 24, sw: 12 }, img: { x: 1470, y: 598, w: 322, h: 576 } }
      ]
    };
    const frames = mobileFrames[template.id];
    const frameRectSet = new Set();
    const frameImgSet = new Set();
    template.elements.forEach((el, idx) => {
      if (el.type === 'rect' && el.stroke && el.cornerRadius) {
        frames.forEach(f => {
          if (el.x === f.frame.x && el.y === f.frame.y && el.width === f.frame.w && el.height === f.frame.h) frameRectSet.add(idx);
        });
      }
      if (el.type === 'image' && el.placeholder && el.editable) {
        frames.forEach(f => {
          if (el.x === f.img.x && el.y === f.img.y && el.width === f.img.w && el.height === f.img.h) frameImgSet.add(idx);
        });
      }
    });

    return (
      <ThumbnailWrapper bgColor={template.elements[0]?.fill || '#FFFFFF'}>
        {/* 일반 요소 (프레임/프레임이미지 제외) */}
        {template.elements.map((element, idx) => {
          if (frameRectSet.has(idx) || frameImgSet.has(idx)) return null;
          const elementId = `${element.type}_${idx}`;
          if (element.type === 'rect') {
            return <div key={idx} style={{ position: 'absolute', left: `${element.x}px`, top: `${element.y}px`, width: `${element.width}px`, height: `${element.height}px`, backgroundColor: element.fill, borderRadius: element.cornerRadius ? `${element.cornerRadius}px` : '0', border: element.stroke ? `${element.strokeWidth}px solid ${element.stroke}` : 'none' }} />;
          }
          if (element.type === 'text') {
            const isPageNumber = element.x === 1680 && element.y === 990;
            const autoPageNumber = isPageNumber && slideIndex !== undefined ? getPageNumber(slideIndex) : null;
            let content = element.editable && data && data[elementId] !== undefined ? data[elementId] : element.content;
            if (autoPageNumber !== null) content = autoPageNumber;
            return (
              <div key={idx} style={{ position: 'absolute', left: `${element.x}px`, top: `${element.y}px`, fontSize: `${element.fontSize}px`, fontWeight: element.fontWeight, color: element.fill, fontFamily: element.fontFamily, letterSpacing: element.letterSpacing ? `${element.letterSpacing}px` : 'normal', whiteSpace: 'pre-wrap', width: element.width ? `${element.width}px` : 'auto', textAlign: element.textAlign || 'left', lineHeight: element.lineHeight || 1.5 }}>{content}</div>
            );
          }
          if (element.type === 'image' && !element.editable) {
            return (
              <div key={idx} className="absolute" style={{ left: `${element.x}px`, top: `${element.y}px`, width: `${element.width}px`, height: `${element.height}px` }}>
                <img src={element.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
            );
          }
          return null;
        })}
        {/* 모바일 프레임 + 이미지 */}
        {frames.map((f) => {
          const imgSrc = data ? data[f.key] : null;
          const imgT = data ? (data[`${f.key}_transform`] || { x: 0, y: 0, scale: 1 }) : { x: 0, y: 0, scale: 1 };
          return (
            <div key={f.key} style={{
              position: 'absolute',
              left: `${f.frame.x}px`, top: `${f.frame.y}px`,
              width: `${f.frame.w}px`, height: `${f.frame.h}px`,
              borderRadius: `${f.frame.r}px`,
              border: `${f.frame.sw}px solid #333333`,
              overflow: 'hidden', backgroundColor: '#FFFFFF'
            }}>
              <div style={{
                position: 'absolute',
                left: `${f.img.x - f.frame.x - f.frame.sw}px`,
                top: `${f.img.y - f.frame.y - f.frame.sw}px`,
                width: `${f.img.w}px`, height: `${f.img.h}px`,
                overflow: 'hidden', backgroundColor: imgSrc ? 'transparent' : '#f0f0f0'
              }}>
                {imgSrc ? (
                  <img src={imgSrc} alt="" style={{
                    position: 'absolute', left: '50%', top: '50%',
                    transform: `translate(calc(-50% + ${imgT.x}px), calc(-50% + ${imgT.y}px)) scale(${imgT.scale})`,
                    maxWidth: '100%', maxHeight: '100%', objectFit: 'contain'
                  }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', backgroundColor: '#f0f0f0' }} />
                )}
              </div>
            </div>
          );
        })}
      </ThumbnailWrapper>
    );
  }

  // ─── PC 템플릿 전용 썸네일 ───
  if (template.id === 'pc01' || template.id === 'pc02' || template.id === 'pc03' || template.id === 'pc04') {
    const pcFrames = {
      pc01: [
        { key: 'pc_img_0', frame: { x: 335, y: 399, w: 1250, h: 918, r: 24, sw: 11 }, img: { x: 346, y: 410, w: 1228, h: 896 } }
      ],
      pc02: [
        { key: 'pc_img_0', frame: { x: 137, y: 400, w: 805, h: 539, r: 24, sw: 11 }, img: { x: 148, y: 411, w: 783, h: 517 } },
        { key: 'pc_img_1', frame: { x: 1005, y: 400, w: 805, h: 539, r: 24, sw: 11 }, img: { x: 1016, y: 411, w: 783, h: 517 } }
      ],
      pc03: [
        { key: 'pc_img_0', frame: { x: 237, y: 400, w: 1084, h: 539, r: 24, sw: 11 }, img: { x: 248, y: 411, w: 1062, h: 517 } },
        { key: 'pc_img_1', frame: { x: 1384, y: 400, w: 299, h: 539, r: 24, sw: 11 }, img: { x: 1395, y: 411, w: 277, h: 517 } }
      ],
      pc04: [
        { key: 'pc_img_0', frame: { x: 120, y: 400, w: 720, h: 539, r: 24, sw: 11 }, img: { x: 131, y: 411, w: 698, h: 517 } },
        { key: 'pc_img_1', frame: { x: 903, y: 400, w: 900, h: 539, r: 24, sw: 11 }, img: { x: 914, y: 411, w: 878, h: 517 } }
      ]
    };
    const frames = pcFrames[template.id];
    const frameRectSet = new Set();
    const frameImgSet = new Set();
    template.elements.forEach((el, idx) => {
      if (el.type === 'rect' && el.stroke && el.cornerRadius) {
        frames.forEach(f => {
          if (el.x === f.frame.x && el.y === f.frame.y && el.width === f.frame.w && el.height === f.frame.h) frameRectSet.add(idx);
        });
      }
      if (el.type === 'image' && el.placeholder && el.editable) {
        frames.forEach(f => {
          if (el.x === f.img.x && el.y === f.img.y && el.width === f.img.w && el.height === f.img.h) frameImgSet.add(idx);
        });
      }
    });

    return (
      <ThumbnailWrapper bgColor={template.elements[0]?.fill || '#FFFFFF'}>
        {template.elements.map((element, idx) => {
          if (frameRectSet.has(idx) || frameImgSet.has(idx)) return null;
          const elementId = `${element.type}_${idx}`;
          if (element.type === 'rect') {
            return <div key={idx} style={{ position: 'absolute', left: `${element.x}px`, top: `${element.y}px`, width: `${element.width}px`, height: `${element.height}px`, backgroundColor: element.fill, borderRadius: element.cornerRadius ? `${element.cornerRadius}px` : '0', border: element.stroke ? `${element.strokeWidth}px solid ${element.stroke}` : 'none' }} />;
          }
          if (element.type === 'text') {
            const isPageNumber = element.x === 1680 && element.y === 990;
            const autoPageNumber = isPageNumber && slideIndex !== undefined ? getPageNumber(slideIndex) : null;
            let content = element.editable && data && data[elementId] !== undefined ? data[elementId] : element.content;
            if (autoPageNumber !== null) content = autoPageNumber;
            return (
              <div key={idx} style={{ position: 'absolute', left: `${element.x}px`, top: `${element.y}px`, fontSize: `${element.fontSize}px`, fontWeight: element.fontWeight, color: element.fill, fontFamily: element.fontFamily, letterSpacing: element.letterSpacing ? `${element.letterSpacing}px` : 'normal', whiteSpace: 'pre-wrap', width: element.width ? `${element.width}px` : 'auto', textAlign: element.textAlign || 'left', lineHeight: element.lineHeight || 1.5 }}>{content}</div>
            );
          }
          if (element.type === 'image' && !element.editable) {
            return (
              <div key={idx} className="absolute" style={{ left: `${element.x}px`, top: `${element.y}px`, width: `${element.width}px`, height: `${element.height}px` }}>
                <img src={element.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
            );
          }
          return null;
        })}
        {frames.map((f) => {
          const imgSrc = data ? data[f.key] : null;
          const imgT = data ? (data[`${f.key}_transform`] || { x: 0, y: 0, scale: 1 }) : { x: 0, y: 0, scale: 1 };
          return (
            <div key={f.key} style={{
              position: 'absolute',
              left: `${f.frame.x}px`, top: `${f.frame.y}px`,
              width: `${f.frame.w}px`, height: `${f.frame.h}px`,
              borderRadius: `${f.frame.r}px`,
              border: `${f.frame.sw}px solid #333333`,
              overflow: 'hidden', backgroundColor: '#FFFFFF'
            }}>
              <div style={{
                position: 'absolute',
                left: `${f.img.x - f.frame.x - f.frame.sw}px`,
                top: `${f.img.y - f.frame.y - f.frame.sw}px`,
                width: `${f.img.w}px`, height: `${f.img.h}px`,
                overflow: 'hidden', backgroundColor: imgSrc ? 'transparent' : '#f0f0f0'
              }}>
                {imgSrc ? (
                  <img src={imgSrc} alt="" style={{
                    position: 'absolute', left: '50%', top: '50%',
                    transform: `translate(calc(-50% + ${imgT.x}px), calc(-50% + ${imgT.y}px)) scale(${imgT.scale})`,
                    maxWidth: '100%', maxHeight: '100%', objectFit: 'contain'
                  }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', backgroundColor: '#f0f0f0' }} />
                )}
              </div>
            </div>
          );
        })}
      </ThumbnailWrapper>
    );
  }

  // ─── 제네릭 썸네일 (모든 요소 렌더링) ───
  return (
    <div ref={containerRef} className="thumbnail-preview">
      <div className="thumbnail-canvas" style={{ backgroundColor: template.elements[0]?.fill || '#FFFFFF' }}>
        <div style={{
          width: '1920px',
          height: '1080px',
          transform: `scale(${thumbnailScale})`,
          transformOrigin: 'top left',
          position: 'absolute',
          top: 0,
          left: 0
        }}>
          {template.elements.map((element, idx) => {
            const elementId = `${element.type}_${idx}`;

            if (element.type === 'rect') {
              return <div key={idx} style={{ position: 'absolute', left: `${element.x}px`, top: `${element.y}px`, width: `${element.width}px`, height: `${element.height}px`, backgroundColor: element.fill, borderRadius: element.cornerRadius ? `${element.cornerRadius}px` : '0', border: element.stroke ? `${element.strokeWidth}px solid ${element.stroke}` : 'none' }} />;
            }
            if (element.type === 'text') {
              const isPageNumber = element.x === 1680 && element.y === 990;
              const autoPageNumber = isPageNumber && slideIndex !== undefined ? getPageNumber(slideIndex) : null;

              let content = element.editable && data && data[elementId] !== undefined ? data[elementId] : element.content;
              if (autoPageNumber !== null) {
                content = autoPageNumber;
              }

              const isCenterAlignedWithoutWidth = element.textAlign === 'center' && !element.width;

              const maxLinesStyle = element.maxLines ? {
                display: '-webkit-box',
                WebkitLineClamp: element.maxLines,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              } : {};

              return (
                <div key={idx} style={{
                  position: 'absolute',
                  left: isCenterAlignedWithoutWidth ? '50%' : `${element.x}px`,
                  transform: isCenterAlignedWithoutWidth ? 'translateX(-50%)' : 'none',
                  top: `${element.y}px`,
                  fontSize: `${element.fontSize}px`,
                  fontWeight: element.fontWeight,
                  color: element.fill,
                  fontFamily: element.fontFamily,
                  letterSpacing: element.letterSpacing ? `${element.letterSpacing}px` : 'normal',
                  opacity: element.opacity || 1,
                  whiteSpace: 'pre-wrap',
                  width: element.width ? `${element.width}px` : 'auto',
                  textAlign: element.textAlign || 'left',
                  maxWidth: element.width ? `${element.width}px` : 'none',
                  lineHeight: element.lineHeight || 1.5,
                  ...maxLinesStyle
                }}>{content}</div>
              );
            }
            if (element.type === 'image') {
              const imageSrc = element.editable && data && data[elementId] ? data[elementId] : (element.placeholder ? 'https://via.placeholder.com/' + element.width + 'x' + element.height + '/f0f0f0/999999?text=Image' : element.url);
              return (
                <div key={idx} style={{ position: 'absolute', left: `${element.x}px`, top: `${element.y}px`, width: `${element.width}px`, height: `${element.height}px`, backgroundColor: '#f0f0f0', backgroundImage: imageSrc ? `url(${imageSrc})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center' }} />
              );
            }
            if (element.type === 'line') {
              return (
                <div key={idx} style={{
                  position: 'absolute',
                  left: `${element.x1}px`, top: `${element.y1}px`,
                  width: `${element.x2 - element.x1}px`, height: `${element.strokeWidth || 1}px`,
                  backgroundColor: element.stroke || '#DCDCDC'
                }} />
              );
            }
            return null;
          })}
        </div>
      </div>
    </div>
  );
}
