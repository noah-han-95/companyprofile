// 공통 이미지 영역 컴포넌트 (모든 렌더러에서 공유)
// props: { imageSrc, imgTransform, imageKey, handlers, handleImageClick, isDraggingImg, draggingImageKey,
//          style, placeholderIconSize, placeholderTextSize, btnClassName, hintClassName }
function ImageArea(props) {
  var imageSrc = props.imageSrc;
  var imgTransform = props.imgTransform;
  var imageKey = props.imageKey;
  var h = props.handlers;
  var handleImageClick = props.handleImageClick;
  var isDraggingImg = props.isDraggingImg;
  var draggingImageKey = props.draggingImageKey;
  var style = props.style || {};
  var iconSize = props.placeholderIconSize || 40;
  var textSize = props.placeholderTextSize || '18px';
  var btnClass = props.btnClassName || 'cv01-img-change-btn';
  var hintClass = props.hintClassName || 'cv01-img-hint';
  var btnPad = props.btnPadding || '8px 20px';
  var btnFont = props.btnFontSize || '14px';
  var hintFont = props.hintFontSize || '12px';
  var hintTop = props.hintTop || '12px';
  var btnBottom = props.btnBottom || '16px';
  var placeholderBg = props.placeholderBg || '#F0F0F0';
  var placeholderRadius = props.placeholderRadius || '0';
  var hidePlaceholder = props.hidePlaceholder || false;
  var children = props.children;

  var isActive = isDraggingImg && (draggingImageKey === imageKey || !draggingImageKey);
  var cursorStyle = imageSrc ? (isActive ? 'grabbing' : 'grab') : 'pointer';

  return React.createElement('div', {
    style: Object.assign({
      overflow: 'hidden',
      cursor: cursorStyle
    }, style),
    onClick: function(e) { e.stopPropagation(); if (!imageSrc) handleImageClick(imageKey, e); },
    onMouseDown: imageSrc && h ? h.onMouseDown : undefined,
    onMouseMove: imageSrc && h ? h.onMouseMove : undefined,
    onMouseUp: imageSrc && h ? h.onMouseUp : undefined,
    onMouseLeave: imageSrc && h ? h.onMouseUp : undefined,
    onWheel: imageSrc && h ? h.onWheel : undefined
  },
    imageSrc ? React.createElement('div', { style: { position: 'relative', width: '100%', height: '100%' } },
      React.createElement('img', { src: imageSrc, alt: '', style: {
        position: 'absolute', left: '50%', top: '50%',
        transform: 'translate(calc(-50% + ' + imgTransform.x + 'px), calc(-50% + ' + imgTransform.y + 'px)) scale(' + imgTransform.scale + ')',
        maxWidth: '100%', maxHeight: '100%', objectFit: 'contain',
        userSelect: 'none', pointerEvents: 'none'
      }}),
      React.createElement('button', {
        onClick: function(e) { e.stopPropagation(); handleImageClick(imageKey, e); },
        className: btnClass,
        style: {
          position: 'absolute', bottom: btnBottom, left: '50%', transform: 'translateX(-50%)',
          padding: btnPad, borderRadius: '8px',
          backgroundColor: 'rgba(0,0,0,0.6)', color: '#FFFFFF', border: 'none',
          cursor: 'pointer', fontSize: btnFont, fontWeight: '600', fontFamily: 'Pretendard',
          opacity: 0, transition: 'opacity 0.2s ease', zIndex: 10, pointerEvents: 'auto'
        }
      }, '이미지 변경'),
      React.createElement('div', {
        className: hintClass,
        style: {
          position: 'absolute', top: hintTop, left: '50%', transform: 'translateX(-50%)',
          padding: '4px 12px', borderRadius: '6px',
          backgroundColor: 'rgba(0,0,0,0.5)', color: '#FFFFFF',
          fontSize: hintFont, fontWeight: '500', fontFamily: 'Pretendard',
          opacity: 0, transition: 'opacity 0.2s ease', pointerEvents: 'none',
          whiteSpace: 'nowrap', zIndex: 10
        }
      }, '드래그: 위치 이동 · 스크롤: 크기 조절'),
      children
    ) : React.createElement('div', {
      style: {
        width: '100%', height: '100%',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: '12px',
        backgroundColor: placeholderBg, borderRadius: placeholderRadius
      }
    },
      !hidePlaceholder && React.createElement('svg', { width: iconSize, height: iconSize, viewBox: '0 0 24 24', fill: 'none', stroke: '#BBBBBB', strokeWidth: '1.5', strokeLinecap: 'round', strokeLinejoin: 'round' },
        React.createElement('rect', { x: '3', y: '3', width: '18', height: '18', rx: '2', ry: '2' }),
        React.createElement('circle', { cx: '8.5', cy: '8.5', r: '1.5' }),
        React.createElement('polyline', { points: '21 15 16 10 5 21' })
      ),
      !hidePlaceholder && React.createElement('span', { style: { fontSize: textSize, fontWeight: '600', color: '#BBBBBB', fontFamily: 'Pretendard' } }, '클릭하여 이미지 추가')
    )
  );
}

// 프레임 이미지 렌더링 (mobile/pc에서 공유)
function FrameImage(props) {
  var f = props.frame;
  var h = props.handlers;
  var handleImageClick = props.handleImageClick;
  var isDraggingImg = props.isDraggingImg;
  var draggingImageKey = props.draggingImageKey;

  return React.createElement('div', {
    key: f.key,
    style: {
      position: 'absolute',
      left: f.frame.x + 'px', top: f.frame.y + 'px',
      width: f.frame.w + 'px', height: f.frame.h + 'px',
      borderRadius: f.frame.r + 'px',
      border: f.frame.sw + 'px solid #333333',
      overflow: 'hidden', backgroundColor: '#FFFFFF'
    }
  },
    React.createElement(ImageArea, {
      imageSrc: h.imageSrc,
      imgTransform: h.imgTransform,
      imageKey: f.key,
      handlers: h,
      handleImageClick: handleImageClick,
      isDraggingImg: isDraggingImg,
      draggingImageKey: draggingImageKey,
      style: {
        position: 'absolute',
        left: (f.img.x - f.frame.x - f.frame.sw) + 'px',
        top: (f.img.y - f.frame.y - f.frame.sw) + 'px',
        width: f.img.w + 'px',
        height: f.img.h + 'px'
      }
    })
  );
}

// 프레임 썸네일 렌더링 (TemplateThumbnail에서 공유)
function FrameThumb(props) {
  var f = props.frame;
  var imgSrc = props.imgSrc;
  var imgT = props.imgTransform || { x: 0, y: 0, scale: 1 };

  return React.createElement('div', {
    key: f.key,
    style: {
      position: 'absolute',
      left: f.frame.x + 'px', top: f.frame.y + 'px',
      width: f.frame.w + 'px', height: f.frame.h + 'px',
      borderRadius: f.frame.r + 'px',
      border: f.frame.sw + 'px solid #333333',
      overflow: 'hidden', backgroundColor: '#FFFFFF'
    }
  },
    React.createElement('div', {
      style: {
        position: 'absolute',
        left: (f.img.x - f.frame.x - f.frame.sw) + 'px',
        top: (f.img.y - f.frame.y - f.frame.sw) + 'px',
        width: f.img.w + 'px', height: f.img.h + 'px',
        overflow: 'hidden', backgroundColor: imgSrc ? 'transparent' : '#f0f0f0'
      }
    },
      imgSrc
        ? React.createElement('img', { src: imgSrc, alt: '', style: {
            position: 'absolute', left: '50%', top: '50%',
            transform: 'translate(calc(-50% + ' + imgT.x + 'px), calc(-50% + ' + imgT.y + 'px)) scale(' + imgT.scale + ')',
            maxWidth: '100%', maxHeight: '100%', objectFit: 'contain'
          }})
        : React.createElement('div', { style: { width: '100%', height: '100%', backgroundColor: '#f0f0f0' } })
    )
  );
}
