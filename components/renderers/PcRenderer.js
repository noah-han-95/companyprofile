function PcRenderer({ template, data, onUpdate, handleTextEdit, handleImageClick, textRefs, getPageNumber, currentSlideIndex, dragState }) {
  const { isDraggingImg, setIsDraggingImg, draggingImageKey, setDraggingImageKey, dragStart, setDragStart, dragOffset, setDragOffset } = dragState;

  const frames = pcFrames[template.id];
  const { frameRectIndices, frameImgIndices } = calcFrameSkipIndices(template.elements, frames);

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '100%',
      background: template.elements[0]?.fill || '#FFFFFF'
    }}>
      {template.elements.map((element, idx) => {
        if (frameRectIndices.has(idx) || frameImgIndices.has(idx)) return null;
        return renderGenericElement(element, idx, data, handleTextEdit, textRefs, getPageNumber, currentSlideIndex);
      })}
      {frames.map((f, fi) => {
        const h = makeImageHandlers(f.key, data, onUpdate, dragState, { multiKey: true });
        return (
          <FrameImage
            key={f.key || fi}
            frame={f}
            handlers={h}
            handleImageClick={handleImageClick}
            isDraggingImg={isDraggingImg}
            draggingImageKey={draggingImageKey}
          />
        );
      })}
    </div>
  );
}
