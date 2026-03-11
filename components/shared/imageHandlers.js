// 이미지 드래그/줌 핸들러 팩토리 (모든 렌더러에서 공유)
// dragState: { isDraggingImg, setIsDraggingImg, draggingImageKey, setDraggingImageKey, dragStart, setDragStart, dragOffset, setDragOffset }
function makeImageHandlers(imageKey, data, onUpdate, dragState, opts) {
  var multiKey = opts && opts.multiKey !== undefined ? opts.multiKey : true;
  var skipEditable = opts && opts.skipEditable;
  var imageSrc = data[imageKey];
  var imgTransform = data[imageKey + '_transform'] || { x: 0, y: 0, scale: 1 };

  return {
    imageSrc: imageSrc,
    imgTransform: imgTransform,
    onMouseDown: function(e) {
      if (!imageSrc) return;
      if (skipEditable && e.target.closest('.editable-field')) return;
      e.preventDefault();
      e.stopPropagation();
      dragState.setIsDraggingImg(true);
      if (multiKey) dragState.setDraggingImageKey(imageKey);
      dragState.setDragStart({ x: e.clientX, y: e.clientY });
      dragState.setDragOffset({ x: imgTransform.x, y: imgTransform.y });
    },
    onMouseMove: function(e) {
      if (!dragState.isDraggingImg) return;
      if (multiKey && dragState.draggingImageKey !== imageKey) return;
      var slideEl = e.currentTarget.closest('.w-full.h-full');
      var rect = slideEl ? slideEl.getBoundingClientRect() : null;
      var currentScale = rect ? rect.width / 1920 : 1;
      var dx = (e.clientX - dragState.dragStart.x) / currentScale;
      var dy = (e.clientY - dragState.dragStart.y) / currentScale;
      onUpdate(imageKey + '_transform', { x: dragState.dragOffset.x + dx, y: dragState.dragOffset.y + dy, scale: imgTransform.scale });
    },
    onMouseUp: function() {
      if (multiKey) {
        if (dragState.draggingImageKey === imageKey) {
          dragState.setIsDraggingImg(false);
          dragState.setDraggingImageKey(null);
        }
      } else {
        dragState.setIsDraggingImg(false);
      }
    },
    onWheel: function(e) {
      if (!imageSrc) return;
      e.preventDefault();
      e.stopPropagation();
      var delta = e.deltaY > 0 ? -0.05 : 0.05;
      var newScale = Math.max(0.5, Math.min(3, imgTransform.scale + delta));
      onUpdate(imageKey + '_transform', { x: imgTransform.x, y: imgTransform.y, scale: newScale });
    }
  };
}
