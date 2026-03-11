function GenericThumb({ template, data, thumbnailScale, containerRef, slideIndex, getPageNumber }) {
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
