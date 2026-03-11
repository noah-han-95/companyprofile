function CoverThumb({ template, data, ThumbnailWrapper }) {
  const hasRightImage = template.id === 'maincover01' || template.id === 'maincover02' || template.id === 'finalcover02';
  const hasFullBgImage = template.id === 'maincover03' || template.id === 'finalcover03';
  const mcImageKey = hasRightImage ? 'image_right' : (hasFullBgImage ? 'image_bg' : null);
  const mcImageSrc = mcImageKey && data ? data[mcImageKey] : null;
  const mcImgTransform = mcImageKey && data ? (data[`${mcImageKey}_transform`] || { x: 0, y: 0, scale: 1 }) : null;

  return (
    <ThumbnailWrapper bgColor={template.elements[0]?.fill || '#FFFFFF'}>
      {/* \uBC30\uACBD rect (fullBg\uC77C \uB54C \uC774\uBBF8\uC9C0\uB85C \uB300\uCCB4) */}
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

      {/* \uC804\uCCB4 \uBC30\uACBD \uC774\uBBF8\uC9C0 */}
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

      {/* \uC6B0\uCE21 \uC774\uBBF8\uC9C0 \uC601\uC5ED */}
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

      {/* Flexbox \uD14D\uC2A4\uD2B8 */}
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
