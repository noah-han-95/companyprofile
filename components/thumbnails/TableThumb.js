function TableThumb({ template, data, ThumbnailWrapper }) {
  const tableData = data?.tableData || template.defaultTable;
  const headers = tableData.headers;
  const rows = tableData.rows;
  const TABLE_X = 120, TABLE_Y = 200, TABLE_WIDTH = 1680, HEADER_HEIGHT = 100, LABEL_COL_WIDTH = 240;
  const TABLE_MAX_HEIGHT = 750;
  const singleRowHeight = (TABLE_MAX_HEIGHT - HEADER_HEIGHT) / rows.length;

  return (
    <ThumbnailWrapper bgColor="#F7F7F7">
      <div style={{
        position: 'absolute', left: '120px', top: '100px',
        fontSize: '48px', fontWeight: '700', color: '#333333',
        fontFamily: 'Pretendard', letterSpacing: '-0.48px'
      }}>
        {data?.text_1 || template.elements.find(e => e.type === 'text' && e.editable)?.content || '\uC11C\uBE44\uC2A4 \uBE44\uAD50 \uBD84\uC11D'}
      </div>
      <div style={{
        position: 'absolute', left: `${TABLE_X}px`, top: `${TABLE_Y}px`, width: `${TABLE_WIDTH}px`,
        display: 'grid',
        gridTemplateColumns: `${LABEL_COL_WIDTH}px repeat(${headers.length}, 1fr)`,
        gridTemplateRows: `${HEADER_HEIGHT}px repeat(${rows.length}, ${singleRowHeight}px)`
      }}>
        <div style={{ backgroundColor: '#E5E5E5', border: '1px solid #CCCCCC' }} />
        {headers.map((h, i) => (
          <div key={i} style={{
            backgroundColor: '#E5E5E5', border: '1px solid #CCCCCC',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '32px', fontWeight: '700', color: '#333333', fontFamily: 'Pretendard'
          }}>{h}</div>
        ))}
        {rows.map((row, ri) => {
          const mergedCols = row.mergedCols || [];
          const cells = [];
          cells.push(
            <div key={`l-${ri}`} style={{
              backgroundColor: '#FFFFFF', border: '1px solid #CCCCCC',
              display: 'flex', alignItems: 'center', padding: '0 30px',
              fontSize: '32px', fontWeight: '700', color: '#333333', fontFamily: 'Pretendard', opacity: 0.89
            }}>{row.label}</div>
          );
          for (let ci = 0; ci < row.cells.length; ci++) {
            if (mergedCols.includes(ci - 1)) continue;
            const span = mergedCols.includes(ci) ? 2 : 1;
            cells.push(
              <div key={`c-${ri}-${ci}`} style={{
                gridColumn: `span ${span}`,
                backgroundColor: '#FFFFFF', border: '1px solid #CCCCCC',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '15px 30px', fontSize: '32px', fontWeight: '700', color: '#333333',
                fontFamily: 'Pretendard', textAlign: 'center', whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: 1.6
              }}>{row.cells[ci]}</div>
            );
          }
          return cells;
        })}
      </div>
      {template.elements.filter(e => e.type === 'image' && !e.editable).map((el, i) => (
        <div key={`img-${i}`} style={{ position: 'absolute', left: `${el.x}px`, top: `${el.y}px`, width: `${el.width}px`, height: `${el.height}px` }}>
          <img src={el.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
      ))}
    </ThumbnailWrapper>
  );
}
