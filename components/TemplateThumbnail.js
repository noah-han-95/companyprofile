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

  const getPageNumber = (idx) => calcPageNumber(idx, slides);

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

  const id = template.id;

  // Table
  if (template.dynamicTable) {
    return <TableThumb template={template} data={data} ThumbnailWrapper={ThumbnailWrapper} />;
  }

  // Cover (Main/Final)
  if (id === 'maincover01' || id === 'maincover02' || id === 'maincover03' || id === 'finalcover02' || id === 'finalcover03') {
    return <CoverThumb template={template} data={data} ThumbnailWrapper={ThumbnailWrapper} />;
  }

  // FAQ
  if (id === 'faq01' || id === 'faq02') {
    return <FaqThumb template={template} data={data} ThumbnailWrapper={ThumbnailWrapper} renderFooter={renderFooter} slideIndex={slideIndex} getPageNumber={getPageNumber} />;
  }

  // Section Cover Type 03
  if (id === 'section03') {
    return <SectionThumb template={template} data={data} ThumbnailWrapper={ThumbnailWrapper} renderFooter={renderFooter} />;
  }

  // Mobile / PC
  if (id.startsWith('mobile') || id.startsWith('pc')) {
    return <DeviceThumb template={template} data={data} ThumbnailWrapper={ThumbnailWrapper} slideIndex={slideIndex} getPageNumber={getPageNumber} />;
  }

  // 제네릭 폴백
  return <GenericThumb template={template} data={data} thumbnailScale={thumbnailScale} containerRef={containerRef} slideIndex={slideIndex} getPageNumber={getPageNumber} />;
}
