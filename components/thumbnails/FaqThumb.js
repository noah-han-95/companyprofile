function FaqThumb({ template, data, ThumbnailWrapper, renderFooter, slideIndex, getPageNumber }) {
  // ─── FAQ Type 01 ───
  if (template.id === 'faq01') {
    const items = data?.faqItems || [
      { id: 'faq1', question: 'Q1. \uC9C8\uBB38\uC744 \uC785\uB825\uD558\uC138\uC694.', answer: '\uB2F5\uBCC0\uC744 \uC785\uB825\uD558\uC138\uC694.' },
      { id: 'faq2', question: 'Q2. \uC9C8\uBB38\uC744 \uC785\uB825\uD558\uC138\uC694.', answer: '\uB2F5\uBCC0\uC744 \uC785\uB825\uD558\uC138\uC694.' },
      { id: 'faq3', question: 'Q3. \uC9C8\uBB38\uC744 \uC785\uB825\uD558\uC138\uC694.', answer: '\uB2F5\uBCC0\uC744 \uC785\uB825\uD558\uC138\uC694.' },
      { id: 'faq4', question: 'Q4. \uC9C8\uBB38\uC744 \uC785\uB825\uD558\uC138\uC694.', answer: '\uB2F5\uBCC0\uC744 \uC785\uB825\uD558\uC138\uC694.' },
      { id: 'faq5', question: 'Q5. \uC9C8\uBB38\uC744 \uC785\uB825\uD558\uC138\uC694.', answer: '\uB2F5\uBCC0\uC744 \uC785\uB825\uD558\uC138\uC694.' },
      { id: 'faq6', question: 'Q6. \uC9C8\uBB38\uC744 \uC785\uB825\uD558\uC138\uC694.', answer: '\uB2F5\uBCC0\uC744 \uC785\uB825\uD558\uC138\uC694.' },
      { id: 'faq7', question: 'Q7. \uC9C8\uBB38\uC744 \uC785\uB825\uD558\uC138\uC694.', answer: '\uB2F5\uBCC0\uC744 \uC785\uB825\uD558\uC138\uC694.' },
      { id: 'faq8', question: 'Q8. \uC9C8\uBB38\uC744 \uC785\uB825\uD558\uC138\uC694.', answer: '\uB2F5\uBCC0\uC744 \uC785\uB825\uD558\uC138\uC694.' }
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

  // ─── FAQ Type 02 ───
  if (template.id === 'faq02') {
    const items = data?.faqItems || [
      { id: 'faq1', question: 'Q1. \uC9C8\uBB38\uC744 \uC785\uB825\uD558\uC138\uC694.', answer: '\uB2F5\uBCC0\uC744 \uC785\uB825\uD558\uC138\uC694.' },
      { id: 'faq2', question: 'Q2. \uC9C8\uBB38\uC744 \uC785\uB825\uD558\uC138\uC694.', answer: '\uB2F5\uBCC0\uC744 \uC785\uB825\uD558\uC138\uC694.' },
      { id: 'faq3', question: 'Q3. \uC9C8\uBB38\uC744 \uC785\uB825\uD558\uC138\uC694.', answer: '\uB2F5\uBCC0\uC744 \uC785\uB825\uD558\uC138\uC694.' },
      { id: 'faq4', question: 'Q4. \uC9C8\uBB38\uC744 \uC785\uB825\uD558\uC138\uC694.', answer: '\uB2F5\uBCC0\uC744 \uC785\uB825\uD558\uC138\uC694.' },
      { id: 'faq5', question: 'Q5. \uC9C8\uBB38\uC744 \uC785\uB825\uD558\uC138\uC694.', answer: '\uB2F5\uBCC0\uC744 \uC785\uB825\uD558\uC138\uC694.' }
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

  return null;
}
