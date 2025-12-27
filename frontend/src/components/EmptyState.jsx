const EmptyState = ({ title = 'Nothing here yet', hint }) => (
  <div style={{ padding: '1rem 0', opacity: 0.8 }}>
    <p style={{ margin: 0, fontWeight: 600 }}>{title}</p>
    {hint && <p style={{ margin: '0.25rem 0 0', color: '#555' }}>{hint}</p>}
  </div>
)

export default EmptyState