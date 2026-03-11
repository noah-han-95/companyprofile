function TableRenderer({ template, data, onUpdate, handleTextEdit, getPageNumber, currentSlideIndex }) {

  if (template.id === 'table01' && template.dynamicTable) {
    const tableData = data.tableData || template.defaultTable;
    const headers = tableData.headers;
    const rows = tableData.rows;

    // 테이블 레이아웃 상수
    const TABLE_X = 120;
    const TABLE_Y = 200;
    const TABLE_WIDTH = 1680;
    const HEADER_HEIGHT = 100;
    const LABEL_COL_WIDTH = 240;
    const DATA_WIDTH = TABLE_WIDTH - LABEL_COL_WIDTH;
    const colWidth = DATA_WIDTH / headers.length;
    const TABLE_MAX_HEIGHT = 750;
    const rowHeight = (TABLE_MAX_HEIGHT - HEADER_HEIGHT) / rows.length;

    const updateTable = (newTable) => {
      onUpdate('tableData', newTable);
    };

    const handleHeaderEdit = (colIdx, text) => {
      const newHeaders = [...headers];
      newHeaders[colIdx] = text;
      updateTable({ headers: newHeaders, rows });
    };

    const handleLabelEdit = (rowIdx, text) => {
      const newRows = rows.map((r, i) => i === rowIdx ? { ...r, label: text } : r);
      updateTable({ headers, rows: newRows });
    };

    const handleCellEdit = (rowIdx, colIdx, text) => {
      const newRows = rows.map((r, i) => {
        if (i !== rowIdx) return r;
        const newCells = [...r.cells];
        newCells[colIdx] = text;
        return { ...r, cells: newCells };
      });
      updateTable({ headers, rows: newRows });
    };

    const addRow = () => {
      if (rows.length >= 8) return;
      const newRow = { label: '항목', cells: headers.map(() => '본문 텍스트') };
      updateTable({ headers, rows: [...rows, newRow] });
    };

    const deleteRow = (rowIdx) => {
      if (rows.length <= 1) return;
      updateTable({ headers, rows: rows.filter((_, i) => i !== rowIdx) });
    };

    const addColumn = () => {
      if (headers.length >= 4) return;
      const newHeaders = [...headers, '타이틀'];
      const newRows = rows.map(r => ({ ...r, cells: [...r.cells, '본문 텍스트'] }));
      updateTable({ headers: newHeaders, rows: newRows });
    };

    const deleteColumn = (colIdx) => {
      if (headers.length <= 1) return;
      const newHeaders = headers.filter((_, i) => i !== colIdx);
      const newRows = rows.map(r => ({ ...r, cells: r.cells.filter((_, i) => i !== colIdx) }));
      updateTable({ headers: newHeaders, rows: newRows });
    };

    // 열 병합: row.mergedCols = [colIdx, ...] → colIdx와 colIdx+1을 병합
    const mergeCols = (rowIdx, colIdx) => {
      if (colIdx >= headers.length - 1) return;
      const newRows = rows.map((r, i) => {
        if (i !== rowIdx) return r;
        const mergedCols = r.mergedCols ? [...r.mergedCols] : [];
        if (!mergedCols.includes(colIdx)) mergedCols.push(colIdx);
        return { ...r, mergedCols };
      });
      updateTable({ headers, rows: newRows });
    };

    const unmergeCols = (rowIdx, colIdx) => {
      const newRows = rows.map((r, i) => {
        if (i !== rowIdx) return r;
        const mergedCols = (r.mergedCols || []).filter(c => c !== colIdx);
        return { ...r, mergedCols };
      });
      updateTable({ headers, rows: newRows });
    };

    const singleRowHeight = (TABLE_MAX_HEIGHT - HEADER_HEIGHT) / rows.length;

    return (
      <div className="w-full h-full relative" style={{ backgroundColor: '#F7F7F7' }}>
        {/* 타이틀 */}
        <div
          className="editable-field"
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => handleTextEdit('text_1', e)}
          style={{
            position: 'absolute', left: '120px', top: '100px',
            fontSize: '48px', fontWeight: '700', color: '#333333',
            fontFamily: 'Pretendard', letterSpacing: '-0.48px', lineHeight: 1.3
          }}>
          {data['text_1'] || template.elements[1].content}
        </div>

        {/* 행/열 추가 버튼 */}
        <div style={{ position: 'absolute', right: '120px', top: '100px', display: 'flex', gap: '12px', zIndex: 10 }}>
          <button
            onClick={addColumn}
            disabled={headers.length >= 4}
            style={{
              padding: '12px 24px', backgroundColor: headers.length >= 4 ? '#CCCCCC' : '#333333',
              color: '#FFFFFF', borderRadius: '8px', border: 'none', fontSize: '16px',
              fontWeight: '600', cursor: headers.length >= 4 ? 'not-allowed' : 'pointer', fontFamily: 'Pretendard'
            }}>
            + 열 추가
          </button>
          <button
            onClick={addRow}
            disabled={rows.length >= 8}
            style={{
              padding: '12px 24px', backgroundColor: rows.length >= 8 ? '#CCCCCC' : '#333333',
              color: '#FFFFFF', borderRadius: '8px', border: 'none', fontSize: '16px',
              fontWeight: '600', cursor: rows.length >= 8 ? 'not-allowed' : 'pointer', fontFamily: 'Pretendard'
            }}>
            + 행 추가
          </button>
        </div>

        {/* 테이블 (CSS Grid) */}
        <div style={{
          position: 'absolute', left: `${TABLE_X}px`, top: `${TABLE_Y}px`, width: `${TABLE_WIDTH}px`,
          display: 'grid',
          gridTemplateColumns: `${LABEL_COL_WIDTH}px repeat(${headers.length}, 1fr)`,
          gridTemplateRows: `${HEADER_HEIGHT}px repeat(${rows.length}, ${singleRowHeight}px)`
        }}>
          {/* 좌상단 빈 셀 */}
          <div style={{
            backgroundColor: '#E5E5E5', border: '1px solid #CCCCCC'
          }} />
          {/* 헤더 컬럼들 */}
          {headers.map((header, colIdx) => (
            <div key={`h-${colIdx}`} className="table01-header-cell" style={{
              backgroundColor: '#E5E5E5', border: '1px solid #CCCCCC',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative'
            }}>
              <div
                className="editable-field"
                contentEditable suppressContentEditableWarning
                onBlur={(e) => handleHeaderEdit(colIdx, e.target.innerText)}
                style={{
                  fontSize: '32px', fontWeight: '700', color: '#333333',
                  fontFamily: 'Pretendard', letterSpacing: '-0.32px',
                  textAlign: 'center', width: '100%', padding: '0 20px'
                }}>
                {header}
              </div>
              {headers.length > 1 && (
                <button
                  onClick={() => deleteColumn(colIdx)}
                  className="col-delete-btn"
                  style={{
                    position: 'absolute', top: '-16px', right: '-16px',
                    width: '32px', height: '32px', borderRadius: '50%',
                    backgroundColor: '#333333', color: '#FFFFFF', border: 'none',
                    cursor: 'pointer', fontSize: '18px', fontWeight: '600',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    opacity: 0, transition: 'opacity 0.2s ease', zIndex: 10
                  }}>
                  ×
                </button>
              )}
            </div>
          ))}

          {/* 데이터 행들 */}
          {rows.map((row, rowIdx) => {
            const mergedCols = row.mergedCols || [];
            return (
              <React.Fragment key={`r-${rowIdx}`}>
                {/* 라벨 셀 */}
                <div className="table01-data-row" style={{
                  backgroundColor: '#FFFFFF', border: '1px solid #CCCCCC',
                  display: 'flex', alignItems: 'center', padding: '0 30px',
                  position: 'relative'
                }}>
                  <div
                    className="editable-field"
                    contentEditable suppressContentEditableWarning
                    onBlur={(e) => handleLabelEdit(rowIdx, e.target.innerText)}
                    style={{
                      fontSize: '32px', fontWeight: '700', color: '#333333',
                      fontFamily: 'Pretendard', letterSpacing: '-0.32px', opacity: 0.89
                    }}>
                    {row.label}
                  </div>
                  {/* 행 삭제 버튼 */}
                  {rows.length > 1 && (
                    <button
                      onClick={() => deleteRow(rowIdx)}
                      className="row-delete-btn"
                      style={{
                        position: 'absolute', left: '-48px', top: '50%', transform: 'translateY(-50%)',
                        width: '32px', height: '32px', borderRadius: '50%',
                        backgroundColor: '#333333', color: '#FFFFFF', border: 'none',
                        cursor: 'pointer', fontSize: '18px', fontWeight: '600',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        opacity: 0, transition: 'opacity 0.2s ease', zIndex: 10
                      }}>
                      ×
                    </button>
                  )}
                </div>
                {/* 데이터 셀들 */}
                {(() => {
                  const cells = [];
                  for (let colIdx = 0; colIdx < row.cells.length; colIdx++) {
                    const isMergeSource = mergedCols.includes(colIdx);
                    const isMergeTarget = mergedCols.includes(colIdx - 1);

                    // 병합 타겟은 건너뛰기 (소스가 span 2로 차지)
                    if (isMergeTarget) continue;

                    const span = isMergeSource ? 2 : 1;
                    const canMerge = colIdx < headers.length - 1 && !isMergeSource;

                    cells.push(
                      <div key={`c-${rowIdx}-${colIdx}`} className="table01-cell" style={{
                        gridColumn: `span ${span}`,
                        backgroundColor: '#FFFFFF', border: '1px solid #CCCCCC',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: '15px 30px', position: 'relative'
                      }}>
                        <div
                          className="editable-field"
                          contentEditable suppressContentEditableWarning
                          onBlur={(e) => handleCellEdit(rowIdx, colIdx, e.target.innerText)}
                          style={{
                            fontSize: '32px', fontWeight: '700', color: '#333333',
                            fontFamily: 'Pretendard', letterSpacing: '-0.32px',
                            lineHeight: 1.6, textAlign: 'center', width: '100%',
                            whiteSpace: 'pre-wrap', wordBreak: 'break-word'
                          }}>
                          {row.cells[colIdx]}
                        </div>
                        {/* 병합 해제 버튼 */}
                        {isMergeSource && (
                          <button
                            onClick={() => unmergeCols(rowIdx, colIdx)}
                            className="merge-undo-btn"
                            style={{
                              position: 'absolute', top: '6px', right: '6px',
                              padding: '4px 10px', borderRadius: '4px',
                              backgroundColor: '#333333', color: '#FFFFFF', border: 'none',
                              cursor: 'pointer', fontSize: '12px', fontWeight: '600',
                              fontFamily: 'Pretendard', opacity: 0, transition: 'opacity 0.2s ease', zIndex: 10
                            }}>
                            해제
                          </button>
                        )}
                        {/* 열 병합 버튼 */}
                        {canMerge && !mergedCols.includes(colIdx + 1) && (
                          <div className="table01-col-merge-zone" style={{
                            position: 'absolute', right: '-14px', top: '0', bottom: '0',
                            width: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10,
                            cursor: 'pointer'
                          }}
                          onClick={() => mergeCols(rowIdx, colIdx)}>
                            <div className="merge-hint" style={{
                              position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                              opacity: 0.3, transition: 'opacity 0.2s ease'
                            }}>
                              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <path d="M4 10H16M4 10L7 7M4 10L7 13M16 10L13 7M16 10L13 13" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </div>
                            <button
                              className="merge-btn"
                              style={{
                                padding: '8px 4px', borderRadius: '4px',
                                backgroundColor: '#4F46E5', color: '#FFFFFF', border: 'none',
                                cursor: 'pointer', fontSize: '18px', fontWeight: '600',
                                opacity: 0, transition: 'opacity 0.2s ease',
                                lineHeight: 1, writingMode: 'vertical-rl',
                                position: 'relative', zIndex: 1
                              }}>
                              병합
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  }
                  return cells;
                })()}
              </React.Fragment>
            );
          })}
        </div>

        {/* 호버 시 삭제 버튼 표시 CSS */}
        <style>{`
          .table01-header-cell:hover .col-delete-btn { opacity: 1 !important; }
          .table01-data-row:hover .row-delete-btn { opacity: 1 !important; }
          .table01-cell:hover .merge-undo-btn { opacity: 1 !important; }
          .table01-col-merge-zone:hover .merge-hint { opacity: 0 !important; }
          .table01-col-merge-zone:hover .merge-btn { opacity: 1 !important; }
          .col-delete-btn:hover { background-color: #000000 !important; }
          .row-delete-btn:hover { background-color: #000000 !important; }
          .merge-undo-btn:hover { background-color: #000000 !important; }
          .merge-btn:hover { background-color: #3730A3 !important; }
        `}</style>

        {/* Footer */}
        <div style={{ position: 'absolute', left: '120px', top: '991px', width: '118px', height: '20px' }}>
          <img src="assets/icons/yeogi-logo.svg" alt="" className="w-full h-full object-contain" />
        </div>
        <div style={{ position: 'absolute', left: '260px', top: '990px', fontSize: '20px', fontWeight: '500', color: '#BBBBBB', fontFamily: 'Pretendard', letterSpacing: '-0.2px', lineHeight: 1.4 }}>
          2026 © GC Company Corp. All rights reserved.
        </div>
        <div className="editable-field" contentEditable={false}
          style={{ position: 'absolute', left: '1680px', top: '990px', fontSize: '20px', fontWeight: '500', color: '#999999', fontFamily: 'Pretendard', letterSpacing: '-0.2px', lineHeight: 1.4, textAlign: 'right', width: '120px', cursor: 'default' }}>
          {getPageNumber(currentSlideIndex)}
        </div>
      </div>
    );
  }

  return null;
}
