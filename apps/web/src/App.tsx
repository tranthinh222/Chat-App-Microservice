import './App.css'

const services = [
  { name: 'API Gateway', port: 3000 },
  { name: 'Auth Service', port: 3001 },
  { name: 'Place Service', port: 3002 },
  { name: 'Review Service', port: 3003 },
]

function App() {
  return (
    <main className="app-shell">
      <nav className="navbar" aria-label="Main navigation">
        <a className="brand" href="/" aria-label="VietTaste Map home">
          <span className="brand-mark" aria-hidden="true">V</span>
          <span>VietTaste Map</span>
        </a>
        <span className="environment">Development</span>
      </nav>

      <section className="hero">
        <p className="eyebrow">MICROSERVICE STARTER</p>
        <h1>Discover the flavors of Vietnam.</h1>
        <p className="hero-copy">
          The frontend is ready. Start building the map, places, and food
          experiences that will bring VietTaste to life.
        </p>
        <div className="actions">
          <a className="primary-action" href="http://localhost:3000/health">Check API Gateway</a>
          <a className="secondary-action" href="#services">View services</a>
        </div>
      </section>

      <section className="services" id="services" aria-labelledby="services-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">LOCAL SERVICES</p>
            <h2 id="services-title">Architecture overview</h2>
          </div>
          <p>Each backend service runs independently behind the API Gateway.</p>
        </div>

        <div className="service-grid">
          {services.map((service) => (
            <article className="service-card" key={service.name}>
              <span className="status-dot" aria-hidden="true" />
              <h3>{service.name}</h3>
              <code>localhost:{service.port}</code>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}

export default App
