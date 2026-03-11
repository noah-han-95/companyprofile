function SectionRenderer({ template, data, onUpdate, handleTextEdit, getPageNumber, currentSlideIndex, section03Rows, setSection03Rows }) {

  if (template.id === 'section03') {
    const rows = section03Rows;
    const ROW_GAP = 112;
    const ROW_HEIGHT = 62;
    const totalBlockHeight = (rows.length - 1) * ROW_GAP + ROW_HEIGHT;
    const ROW_START_Y = Math.round((1080 - totalBlockHeight) / 2);

    const handleAddRow = () => {
      if (rows.length >= 6) return;
      const newRows = [...rows, { id: `r${Date.now()}`, title: '타이틀 텍스트', highlighted: false }];
      setSection03Rows(newRows);
      onUpdate('rows', newRows);
    };

    const handleDeleteRow = (rowId) => {
      if (rows.length <= 1) return;
      const newRows = rows.filter(r => r.id !== rowId);
      setSection03Rows(newRows);
      onUpdate('rows', newRows);
    };

    const handleRowTitleEdit = (rowId, newTitle) => {
      const newRows = rows.map(r => r.id === rowId ? { ...r, title: newTitle } : r);
      setSection03Rows(newRows);
      onUpdate('rows', newRows);
    };

    const handleToggleHighlight = (rowId) => {
      const newRows = rows.map(r => r.id === rowId ? { ...r, highlighted: !r.highlighted } : r);
      setSection03Rows(newRows);
      onUpdate('rows', newRows);
    };

    const handleMoveRow = (index, direction) => {
      const newIndex = index + direction;
      if (newIndex < 0 || newIndex >= rows.length) return;
      const newRows = [...rows];
      [newRows[index], newRows[newIndex]] = [newRows[newIndex], newRows[index]];
      setSection03Rows(newRows);
      onUpdate('rows', newRows);
    };

    return (
      <div className="w-full h-full relative" style={{ backgroundColor: '#333333' }}>
        <div style={{ position: 'absolute', left: '0', top: '0', width: '1920px', height: '1080px', backgroundColor: '#333333' }} />

        {/* 행 추가 버튼 */}
        <div style={{ position: 'absolute', right: '120px', top: '100px', display: 'flex', gap: '12px', zIndex: 10 }}>
          <button
            onClick={handleAddRow}
            disabled={rows.length >= 6}
            style={{
              padding: '12px 24px', backgroundColor: rows.length >= 6 ? '#555555' : '#FFFFFF',
              color: rows.length >= 6 ? '#999999' : '#333333', borderRadius: '8px', border: 'none',
              fontSize: '16px', fontWeight: '600', cursor: rows.length >= 6 ? 'not-allowed' : 'pointer',
              fontFamily: 'Pretendard', transition: 'all 0.2s ease'
            }}>
            + 행 추가
          </button>
        </div>

        {/* 동적 행 렌더링 - 세로 가운데 정렬, 좌측 정렬 */}
        {rows.map((row, index) => {
          const y = ROW_START_Y + index * ROW_GAP;
          const isHighlighted = row.highlighted !== undefined ? row.highlighted : (index === 0);
          const rowOpacity = isHighlighted ? 1 : 0.3;

          return (
            <div key={row.id} className="delete-section-wrapper" style={{
              position: 'absolute', left: '933px', top: `${y}px`,
              display: 'flex', alignItems: 'center'
            }}>
              {/* 강조 토글 버튼 */}
              <button
                onClick={() => handleToggleHighlight(row.id)}
                style={{
                  marginRight: '16px', width: '32px', height: '32px', borderRadius: '50%',
                  backgroundColor: isHighlighted ? '#FFFFFF' : 'transparent',
                  border: isHighlighted ? '2px solid #FFFFFF' : '2px solid rgba(255,255,255,0.4)',
                  cursor: 'pointer', padding: 0, transition: 'all 0.2s ease',
                  flexShrink: 0
                }}
                title={isHighlighted ? '강조 해제' : '강조'}
              />

              {/* 넘버링 */}
              <div style={{
                fontSize: '32px', fontWeight: '700', color: '#FFFFFF',
                fontFamily: 'Pretendard', opacity: rowOpacity,
                width: '88px', cursor: 'default', transition: 'opacity 0.2s ease',
                flexShrink: 0
              }}>
                {index + 1}
              </div>

              {/* 타이틀 */}
              <div
                className="editable-field"
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => handleRowTitleEdit(row.id, e.target.innerText)}
                style={{
                  fontSize: '48px', fontWeight: '700', color: '#FFFFFF',
                  fontFamily: 'Pretendard', letterSpacing: '-0.48px', lineHeight: 1.3,
                  opacity: rowOpacity, whiteSpace: 'nowrap', transition: 'opacity 0.2s ease'
                }}>
                {row.title}
              </div>

              {/* 순서 변경 & 삭제 버튼 */}
              <div className="delete-section-btn" style={{
                marginLeft: '20px', display: 'flex', gap: '6px', alignItems: 'center',
                opacity: 0, transition: 'opacity 0.2s ease'
              }}>
                {index > 0 && (
                  <button
                    onClick={() => handleMoveRow(index, -1)}
                    style={{
                      width: '36px', height: '36px', borderRadius: '6px',
                      backgroundColor: 'rgba(255,255,255,0.15)', color: '#FFFFFF', border: 'none',
                      cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                    title="위로 이동">▲</button>
                )}
                {index < rows.length - 1 && (
                  <button
                    onClick={() => handleMoveRow(index, 1)}
                    style={{
                      width: '36px', height: '36px', borderRadius: '6px',
                      backgroundColor: 'rgba(255,255,255,0.15)', color: '#FFFFFF', border: 'none',
                      cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                    title="아래로 이동">▼</button>
                )}
                {rows.length > 1 && (
                  <button
                    onClick={() => handleDeleteRow(row.id)}
                    style={{
                      width: '36px', height: '36px', borderRadius: '6px',
                      backgroundColor: 'rgba(255,255,255,0.15)', color: '#FFFFFF', border: 'none',
                      cursor: 'pointer', fontSize: '20px', fontWeight: 'normal',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                    title="행 삭제">×</button>
                )}
              </div>
            </div>
          );
        })}

        {/* 푸터 - 로고 */}
        <div style={{ position: 'absolute', left: '120px', top: '991px', width: '118px', height: '20px' }}>
          <img src={template.elements[11].url} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
        {/* 푸터 - 카피라이트 */}
        <div style={{ position: 'absolute', left: '260px', top: '990px', fontSize: '20px', fontWeight: '500', color: '#BBBBBB', fontFamily: 'Pretendard', letterSpacing: '-0.2px', lineHeight: 1.4 }}>
          {template.elements[12].content}
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
