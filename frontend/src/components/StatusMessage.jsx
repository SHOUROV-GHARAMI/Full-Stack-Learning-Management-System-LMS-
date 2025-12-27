const palette = {
  info: { bg: '#e8f4ff', fg: '#0b4f85', border: '#8ac2ff' },
  success: { bg: '#e8f8f2', fg: '#1f6f4a', border: '#7fd0a5' },
  warning: { bg: '#fff8e1', fg: '#7a5300', border: '#ffd166' },
  error: { bg: '#ffecec', fg: '#8a1f1f', border: '#f2a3a3' },
}

const StatusMessage = ({ type = 'info', children, dense = false }) => {
  if (!children) return null
  const color = palette[type] || palette.info
  return (
    <div
      style={{
        margin: dense ? '0.25rem 0' : '0.75rem 0',
        padding: dense ? '0.4rem 0.6rem' : '0.75rem',
        background: color.bg,
        color: color.fg,
        border: `1px solid ${color.border}`,
        borderRadius: 6,
      }}
    >
      {children}
    </div>
  )
}

export default StatusMessage