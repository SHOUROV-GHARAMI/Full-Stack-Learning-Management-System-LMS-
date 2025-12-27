const LoadingBlock = ({ label = 'Loading...' }) => (
  <div style={{ padding: '1rem 0', opacity: 0.8 }} aria-busy="true">
    {label}
  </div>
)

export default LoadingBlock