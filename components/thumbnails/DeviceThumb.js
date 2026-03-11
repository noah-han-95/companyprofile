// Mobile/PC 썸네일 — globals: mobileFrames, pcFrames, calcFrameSkipIndices, FrameThumb
function DeviceThumb({ template, data, ThumbnailWrapper, slideIndex, getPageNumber }) {
  const isMobile = template.id.startsWith('mobile');
  const frameMap = isMobile ? mobileFrames : pcFrames;
  const frames = frameMap[template.id];
  const skip = calcFrameSkipIndices(template.elements, frames);

  return (
    <ThumbnailWrapper bgColor={template.elements[0]?.fill || '#FFFFFF'}>
      {template.elements.map((element, idx) => {
        if (skip.frameRectIndices.has(idx) || skip.frameImgIndices.has(idx)) return null;
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
        return <FrameThumb key={f.key} frame={f} imgSrc={imgSrc} imgTransform={imgT} />;
      })}
    </ThumbnailWrapper>
  );
}
