export default function HomePage() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1>Peeps API Server</h1>
      <p>API is running on port 3001</p>
      <ul>
        <li><a href="/api/me">GET /api/me</a></li>
        <li><a href="/api/notifications">GET /api/notifications</a></li>
        <li><a href="/api/families">GET /api/families</a></li>
      </ul>
    </div>
  )
}
