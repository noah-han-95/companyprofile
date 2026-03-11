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

  // Table 템플릿 전용 썸네일
  if (template.dynamicTable) {
    const tableData = data?.tableData || template.defaultTable;
    const headers = tableData.headers;
    const rows = tableData.rows;
    const TABLE_X = 120, TABLE_Y = 200, TABLE_WIDTH = 1680, HEADER_HEIGHT = 100, LABEL_COL_WIDTH = 240;
    const TABLE_MAX_HEIGHT = 750;
    const singleRowHeight = (TABLE_MAX_HEIGHT - HEADER_HEIGHT) / rows.length;

    return (
      <div ref={containerRef} className="thumbnail-preview">
        <div className="thumbnail-canvas" style={{ backgroundColor: '#F7F7F7' }}>
          <div style={{
            width: '1920px', height: '1080px',
            transform: `scale(${thumbnailScale})`, transformOrigin: 'top left',
            position: 'absolute', top: 0, left: 0
          }}>
            {/* 타이틀 */}
            <div style={{
              position: 'absolute', left: '120px', top: '100px',
              fontSize: '48px', fontWeight: '700', color: '#333333',
              fontFamily: 'Pretendard', letterSpacing: '-0.48px'
            }}>
              {data?.text_1 || template.elements.find(e => e.type === 'text' && e.editable)?.content || '서비스 비교 분석'}
            </div>
            {/* 테이블 그리드 */}
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
            {/* 푸터 */}
            {template.elements.filter(e => e.type === 'image' && !e.editable).map((el, i) => (
              <div key={`img-${i}`} style={{ position: 'absolute', left: `${el.x}px`, top: `${el.y}px`, width: `${el.width}px`, height: `${el.height}px` }}>
                <img src={el.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Main Cover & Final Cover Type 01, 02, 03 전용 렌더링
  const isMainCoverFlexbox = template.id === 'maincover01' || template.id === 'maincover02' || template.id === 'maincover03' || template.id === 'finalcover02' || template.id === 'finalcover03';

  if (isMainCoverFlexbox) {
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
            {/* 배경 rect와 로고 이미지 렌더링 */}
            {template.elements.map((element, idx) => {
              if (element.type === 'rect') {
                return <div key={idx} style={{ position: 'absolute', left: `${element.x}px`, top: `${element.y}px`, width: `${element.width}px`, height: `${element.height}px`, backgroundColor: element.fill }} />;
              }
              if (element.type === 'image' && !element.editable) {
                return (
                  <div key={idx} style={{ position: 'absolute', left: `${element.x}px`, top: `${element.y}px`, width: `${element.width}px`, height: `${element.height}px` }}>
                    <img src={element.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
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
                    <div
                      key={elementId}
                      style={{
                        fontSize: `${element.fontSize}px`,
                        fontWeight: element.fontWeight,
                        color: element.fill,
                        fontFamily: element.fontFamily,
                        letterSpacing: `${element.letterSpacing}px`,
                        lineHeight: element.lineHeight,
                        width: element.width ? `${element.width}px` : 'auto',
                        textAlign: element.textAlign || 'left',
                        marginBottom,
                        whiteSpace: 'pre-wrap',
                        ...maxLinesStyle
                      }}
                    >
                      {content}
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    );
  }

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
          {template.elements.slice(0, 15).map((element, idx) => {
            const elementId = `${element.type}_${idx}`;

            if (element.type === 'rect') {
              return <div key={idx} style={{ position: 'absolute', left: `${element.x}px`, top: `${element.y}px`, width: `${element.width}px`, height: `${element.height}px`, backgroundColor: element.fill, borderRadius: element.cornerRadius ? `${element.cornerRadius}px` : '0', border: element.stroke ? `${element.strokeWidth}px solid ${element.stroke}` : 'none' }} />;
            }
            if (element.type === 'text') {
              // 페이지 번호 자동 계산 (x:1680, y:990 위치)
              const isPageNumber = element.x === 1680 && element.y === 990;
              const autoPageNumber = isPageNumber && slideIndex !== undefined ? getPageNumber(slideIndex) : null;

              // 실시간 편집 데이터 반영
              let content = element.editable && data && data[elementId] !== undefined ? data[elementId] : element.content;
              if (autoPageNumber !== null) {
                content = autoPageNumber;
              }

              const isCenterAlignedWithoutWidth = element.textAlign === 'center' && !element.width;

              // maxLines 제한을 위한 추가 스타일
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
              // 실시간 이미지 데이터 반영
              const imageSrc = element.editable && data && data[elementId] ? data[elementId] : (element.placeholder ? 'https://via.placeholder.com/' + element.width + 'x' + element.height + '/f0f0f0/999999?text=Image' : element.url);
              return (
                <div key={idx} style={{ position: 'absolute', left: `${element.x}px`, top: `${element.y}px`, width: `${element.width}px`, height: `${element.height}px`, backgroundColor: '#f0f0f0', backgroundImage: imageSrc ? `url(${imageSrc})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center' }} />
              );
            }
            return null;
          })}
        </div>
      </div>
    </div>
  );
}
