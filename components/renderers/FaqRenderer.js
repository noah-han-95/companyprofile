function FaqRenderer({ template, data, onUpdate, handleTextEdit, getPageNumber, currentSlideIndex, faq01Items, setFaq01Items, faq02Items, setFaq02Items }) {

  if (template.id === 'faq01') {
    const items = faq01Items;
    const CARD_START_Y = 256;
    const CARD_ROW_GAP = 175;
    const CARD_W = 820;
    const CARD_H = 160;
    const COL_LEFT = 120;
    const COL_RIGHT = 980;
    const CARD_RADIUS = 20;
    const CARD_PAD_X = 43;
    const Q_OFFSET_Y = 34;
    const A_OFFSET_Y = 92;

    const handleAddFaqItem = () => {
      if (items.length >= 8) return;
      const num = items.length + 1;
      const newItems = [...items, { id: `faq${Date.now()}`, question: `Q${num}. 질문을 입력하세요.`, answer: '답변을 입력하세요.' }];
      setFaq01Items(newItems);
      onUpdate('faqItems', newItems);
    };

    const handleDeleteFaqItem = (itemId) => {
      if (items.length <= 4) return;
      const newItems = items.filter(it => it.id !== itemId);
      setFaq01Items(newItems);
      onUpdate('faqItems', newItems);
    };

    const handleFaqQuestionEdit = (itemId, newText) => {
      const newItems = items.map(it => it.id === itemId ? { ...it, question: newText } : it);
      setFaq01Items(newItems);
      onUpdate('faqItems', newItems);
    };

    const handleFaqAnswerEdit = (itemId, newText) => {
      const newItems = items.map(it => it.id === itemId ? { ...it, answer: newText } : it);
      setFaq01Items(newItems);
      onUpdate('faqItems', newItems);
    };

    return (
      <div className="w-full h-full relative" style={{ backgroundColor: '#FFFFFF' }}>
        {/* 배경 */}
        <div style={{ position: 'absolute', left: '0', top: '0', width: '1920px', height: '1080px', backgroundColor: '#FFFFFF' }} />

        {/* 카테고리 */}
        <div
          className="editable-field"
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => handleTextEdit('text_1', e)}
          style={{
            position: 'absolute', left: '120px', top: '100px',
            fontSize: '32px', fontWeight: '700', color: '#BBBBBB',
            fontFamily: 'Pretendard', letterSpacing: '-0.32px', lineHeight: 1.3
          }}>
          {data['text_1'] || template.elements[1].content}
        </div>

        {/* 타이틀 */}
        <div
          className="editable-field"
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => handleTextEdit('text_2', e)}
          style={{
            position: 'absolute', left: '120px', top: '152px',
            fontSize: '48px', fontWeight: '700', color: '#333333',
            fontFamily: 'Pretendard', letterSpacing: '-0.48px', lineHeight: 1.3
          }}>
          {data['text_2'] || template.elements[2].content}
        </div>

        {/* FAQ 추가 버튼 */}
        <div style={{ position: 'absolute', right: '120px', top: '100px', display: 'flex', gap: '12px', zIndex: 10 }}>
          <button
            onClick={handleAddFaqItem}
            disabled={items.length >= 8}
            style={{
              padding: '12px 24px', backgroundColor: items.length >= 8 ? '#EEEEEE' : '#4F46E5',
              color: items.length >= 8 ? '#999999' : '#FFFFFF', borderRadius: '8px', border: 'none',
              fontSize: '16px', fontWeight: '600', cursor: items.length >= 8 ? 'not-allowed' : 'pointer',
              fontFamily: 'Pretendard', transition: 'all 0.2s ease'
            }}>
            + FAQ 추가
          </button>
        </div>

        {/* FAQ 카드 렌더링 */}
        {items.map((item, index) => {
          const col = index % 2;
          const row = Math.floor(index / 2);
          const x = col === 0 ? COL_LEFT : COL_RIGHT;
          const y = CARD_START_Y + row * CARD_ROW_GAP;

          return (
            <div key={item.id} className="delete-section-wrapper" style={{
              position: 'absolute', left: `${x}px`, top: `${y}px`,
              width: `${CARD_W}px`, height: `${CARD_H}px`,
              backgroundColor: '#F7F7F7', borderRadius: `${CARD_RADIUS}px`
            }}>
              {/* 질문 */}
              <div
                className="editable-field"
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => handleFaqQuestionEdit(item.id, e.target.innerText.replace(/^Q\d+\.\s*/, ''))}
                style={{
                  position: 'absolute', left: `${CARD_PAD_X}px`, top: `${Q_OFFSET_Y}px`,
                  fontSize: '32px', fontWeight: '700', color: '#333333',
                  fontFamily: 'Pretendard', letterSpacing: '-0.32px', lineHeight: 1.5,
                  width: `${CARD_W - CARD_PAD_X * 2 - 40}px`, whiteSpace: 'nowrap',
                  overflow: 'hidden', textOverflow: 'ellipsis'
                }}>
                {`Q${index + 1}. ${item.question.replace(/^Q\d+\.\s*/, '')}`}
              </div>

              {/* 답변 */}
              <div
                className="editable-field"
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => handleFaqAnswerEdit(item.id, e.target.innerText)}
                style={{
                  position: 'absolute', left: `${CARD_PAD_X}px`, top: `${A_OFFSET_Y}px`,
                  fontSize: '20px', fontWeight: '500', color: '#666666',
                  fontFamily: 'Pretendard', letterSpacing: '-0.2px', lineHeight: 1.5,
                  width: `${CARD_W - CARD_PAD_X * 2}px`, whiteSpace: 'nowrap',
                  overflow: 'hidden', textOverflow: 'ellipsis'
                }}>
                {item.answer}
              </div>

              {/* 삭제 버튼 */}
              {items.length > 4 && (
                <button
                  onClick={() => handleDeleteFaqItem(item.id)}
                  className="delete-section-btn"
                  style={{
                    position: 'absolute', top: '8px', right: '8px',
                    width: '32px', height: '32px', borderRadius: '6px',
                    backgroundColor: 'rgba(0,0,0,0.08)', color: '#999999', border: 'none',
                    cursor: 'pointer', fontSize: '18px', fontWeight: 'normal',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    opacity: 0, transition: 'opacity 0.2s ease'
                  }}
                  title="FAQ 삭제">
                  ×
                </button>
              )}
            </div>
          );
        })}

        {/* 푸터 - 로고 */}
        <div style={{ position: 'absolute', left: '120px', top: '991px', width: '118px', height: '20px' }}>
          <img src={template.elements[template.elements.length - 3].url} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
        {/* 푸터 - 카피라이트 */}
        <div style={{ position: 'absolute', left: '260px', top: '990px', fontSize: '20px', fontWeight: '500', color: '#BBBBBB', fontFamily: 'Pretendard', letterSpacing: '-0.2px', lineHeight: 1.4 }}>
          {template.elements[template.elements.length - 2].content}
        </div>
        {/* 푸터 - 페이지 번호 */}
        <div className="editable-field" contentEditable={false}
          style={{ position: 'absolute', left: '1680px', top: '990px', fontSize: '20px', fontWeight: '500', color: '#999999', fontFamily: 'Pretendard', letterSpacing: '-0.2px', lineHeight: 1.4, textAlign: 'right', width: '120px', cursor: 'default' }}>
          {getPageNumber(currentSlideIndex)}
        </div>
      </div>
    );
  }

  // ─── FAQ Type 02 전용 렌더링 (동적 추가/삭제) ───
  if (template.id === 'faq02') {
    const items = faq02Items;
    const LIST_X = 700;
    const LIST_START_Y = 120;
    const BLOCK_GAP = 140;
    const Q_TO_A = 52;
    const A_TO_LINE = 60;
    const LINE_X2 = 1800;

    const handleAddFaq02 = () => {
      if (items.length >= 6) return;
      const num = items.length + 1;
      const newItems = [...items, { id: `faq${Date.now()}`, question: `Q${num}. 질문을 입력하세요.`, answer: '답변을 입력하세요.' }];
      setFaq02Items(newItems);
      onUpdate('faqItems', newItems);
    };

    const handleDeleteFaq02 = (itemId) => {
      if (items.length <= 3) return;
      const newItems = items.filter(it => it.id !== itemId);
      setFaq02Items(newItems);
      onUpdate('faqItems', newItems);
    };

    const handleFaq02QuestionEdit = (itemId, newText) => {
      const newItems = items.map(it => it.id === itemId ? { ...it, question: newText } : it);
      setFaq02Items(newItems);
      onUpdate('faqItems', newItems);
    };

    const handleFaq02AnswerEdit = (itemId, newText) => {
      const newItems = items.map(it => it.id === itemId ? { ...it, answer: newText } : it);
      setFaq02Items(newItems);
      onUpdate('faqItems', newItems);
    };

    return (
      <div className="w-full h-full relative" style={{ backgroundColor: '#FFFFFF' }}>
        <div style={{ position: 'absolute', left: '0', top: '0', width: '1920px', height: '1080px', backgroundColor: '#FFFFFF' }} />

        {/* 카테고리 */}
        <div
          className="editable-field"
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => handleTextEdit('text_1', e)}
          style={{
            position: 'absolute', left: '120px', top: '100px',
            fontSize: '32px', fontWeight: '700', color: '#BBBBBB',
            fontFamily: 'Pretendard', letterSpacing: '-0.32px', lineHeight: 1.3
          }}>
          {data['text_1'] || template.elements[1].content}
        </div>

        {/* 타이틀 */}
        <div
          className="editable-field"
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => handleTextEdit('text_2', e)}
          style={{
            position: 'absolute', left: '120px', top: '152px',
            fontSize: '48px', fontWeight: '700', color: '#333333',
            fontFamily: 'Pretendard', letterSpacing: '-0.48px', lineHeight: 1.3
          }}>
          {data['text_2'] || template.elements[2].content}
        </div>

        {/* FAQ 추가 버튼 */}
        <div style={{ position: 'absolute', right: '120px', top: '100px', display: 'flex', gap: '12px', zIndex: 10 }}>
          <button
            onClick={handleAddFaq02}
            disabled={items.length >= 6}
            style={{
              padding: '12px 24px', backgroundColor: items.length >= 6 ? '#EEEEEE' : '#4F46E5',
              color: items.length >= 6 ? '#999999' : '#FFFFFF', borderRadius: '8px', border: 'none',
              fontSize: '16px', fontWeight: '600', cursor: items.length >= 6 ? 'not-allowed' : 'pointer',
              fontFamily: 'Pretendard', transition: 'all 0.2s ease'
            }}>
            + FAQ 추가
          </button>
        </div>

        {/* FAQ 리스트 렌더링 */}
        {items.map((item, index) => {
          const y = LIST_START_Y + index * BLOCK_GAP;
          const isLast = index === items.length - 1;

          return (
            <div key={item.id} className="delete-section-wrapper" style={{
              position: 'absolute', left: `${LIST_X}px`, top: `${y}px`
            }}>
              {/* 질문 */}
              <div
                className="editable-field"
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => handleFaq02QuestionEdit(item.id, e.target.innerText.replace(/^Q\d+\.\s*/, ''))}
                style={{
                  fontSize: '32px', fontWeight: '700', color: '#333333',
                  fontFamily: 'Pretendard', letterSpacing: '-0.32px', lineHeight: 1.5,
                  width: '1060px', whiteSpace: 'nowrap',
                  overflow: 'hidden', textOverflow: 'ellipsis'
                }}>
                {`Q${index + 1}. ${item.question.replace(/^Q\d+\.\s*/, '')}`}
              </div>

              {/* 답변 */}
              <div
                className="editable-field"
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => handleFaq02AnswerEdit(item.id, e.target.innerText)}
                style={{
                  marginTop: '4px',
                  fontSize: '20px', fontWeight: '500', color: '#666666',
                  fontFamily: 'Pretendard', letterSpacing: '-0.2px', lineHeight: 1.5,
                  width: '1060px', whiteSpace: 'nowrap',
                  overflow: 'hidden', textOverflow: 'ellipsis'
                }}>
                {item.answer}
              </div>

              {/* 구분선 (마지막 아이템 제외) */}
              {!isLast && (
                <div style={{
                  position: 'absolute', left: '0', top: `${Q_TO_A + A_TO_LINE}px`,
                  width: `${LINE_X2 - LIST_X}px`, height: '1px',
                  backgroundColor: '#DCDCDC'
                }} />
              )}

              {/* 삭제 버튼 */}
              {items.length > 3 && (
                <button
                  onClick={() => handleDeleteFaq02(item.id)}
                  className="delete-section-btn"
                  style={{
                    position: 'absolute', top: '0', right: '-40px',
                    width: '32px', height: '32px', borderRadius: '6px',
                    backgroundColor: 'rgba(0,0,0,0.08)', color: '#999999', border: 'none',
                    cursor: 'pointer', fontSize: '18px', fontWeight: 'normal',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    opacity: 0, transition: 'opacity 0.2s ease'
                  }}
                  title="FAQ 삭제">
                  ×
                </button>
              )}
            </div>
          );
        })}

        {/* 푸터 - 로고 */}
        <div style={{ position: 'absolute', left: '120px', top: '991px', width: '118px', height: '20px' }}>
          <img src={template.elements[template.elements.length - 3].url} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
        {/* 푸터 - 카피라이트 */}
        <div style={{ position: 'absolute', left: '260px', top: '990px', fontSize: '20px', fontWeight: '500', color: '#BBBBBB', fontFamily: 'Pretendard', letterSpacing: '-0.2px', lineHeight: 1.4 }}>
          {template.elements[template.elements.length - 2].content}
        </div>
        {/* 푸터 - 페이지 번호 */}
        <div className="editable-field" contentEditable={false}
          style={{ position: 'absolute', left: '1680px', top: '990px', fontSize: '20px', fontWeight: '500', color: '#999999', fontFamily: 'Pretendard', letterSpacing: '-0.2px', lineHeight: 1.4, textAlign: 'right', width: '120px', cursor: 'default' }}>
          {getPageNumber(currentSlideIndex)}
        </div>
      </div>
    );
  }

  return null;
}
