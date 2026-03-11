function SectionThumb({ template, data, ThumbnailWrapper, renderFooter }) {
  const rows = data?.rows || [
    { id: 'r1', title: '\uD0C0\uC774\uD2C0 \uD14D\uC2A4\uD2B8', highlighted: true },
    { id: 'r2', title: '\uD0C0\uC774\uD2C0 \uD14D\uC2A4\uD2B8', highlighted: false },
    { id: 'r3', title: '\uD0C0\uC774\uD2C0 \uD14D\uC2A4\uD2B8', highlighted: false },
    { id: 'r4', title: '\uD0C0\uC774\uD2C0 \uD14D\uC2A4\uD2B8', highlighted: false },
    { id: 'r5', title: '\uD0C0\uC774\uD2C0 \uD14D\uC2A4\uD2B8', highlighted: false }
  ];
  const ROW_GAP = 112;
  const ROW_HEIGHT = 62;
  const totalBlockHeight = (rows.length - 1) * ROW_GAP + ROW_HEIGHT;
  const ROW_START_Y = Math.round((1080 - totalBlockHeight) / 2);

  return (
    <ThumbnailWrapper bgColor="#333333">
      {rows.map((row, index) => {
        const y = ROW_START_Y + index * ROW_GAP;
        const isHighlighted = row.highlighted !== undefined ? row.highlighted : (index === 0);
        const rowOpacity = isHighlighted ? 1 : 0.3;
        return (
          <div key={row.id} style={{
            position: 'absolute', left: '933px', top: `${y}px`,
            display: 'flex', alignItems: 'center'
          }}>
            <div style={{
              fontSize: '32px', fontWeight: '700', color: '#FFFFFF',
              fontFamily: 'Pretendard', opacity: rowOpacity, width: '88px'
            }}>{index + 1}</div>
            <div style={{
              fontSize: '48px', fontWeight: '700', color: '#FFFFFF',
              fontFamily: 'Pretendard', letterSpacing: '-0.48px', lineHeight: 1.3,
              opacity: rowOpacity, whiteSpace: 'nowrap'
            }}>{row.title}</div>
          </div>
        );
      })}
      {renderFooter(template.elements)}
    </ThumbnailWrapper>
  );
}
