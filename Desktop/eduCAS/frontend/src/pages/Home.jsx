import { useNavigate } from 'react-router-dom'

function Home() {
  const navigate = useNavigate()

  return (
    <div className="page-wrapper">
      <nav className="navbar">
        <div className="nav-logo"> EduCAS</div>
        <div className="nav-links">
          <button onClick={() => navigate('/')} className="nav-btn active">Home</button>
          <button onClick={() => navigate('/analyze')} className="nav-btn">Analyze</button>
          <button onClick={() => navigate('/history')} className="nav-btn">History</button>
          <button onClick={() => navigate('/stats')} className="nav-btn">Statistics</button>
          <button onClick={() => navigate('/about')} className="nav-btn">About</button>
          <button onClick={() => navigate('/login')} className="nav-btn login-btn">Login</button>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-content">
          <h1>Welcome to <span>EduCAS</span></h1>
          <p>AI-powered Educational Content Analysis System. Upload any document and get instant intelligent analysis in seconds.</p>
          <div className="hero-buttons">
            <button className="hero-btn-primary" onClick={() => navigate('/analyze')}>🔍 Start Analyzing</button>
            <button className="hero-btn-secondary" onClick={() => navigate('/about')}>Learn More</button>
          </div>
        </div>
        <div className="hero-stats">
          <div className="stat-card"><h2>60s</h2><p>Analysis Time</p></div>
          <div className="stat-card"><h2>3</h2><p>File Formats</p></div>
          <div className="stat-card"><h2>AI</h2><p>Powered</p></div>
          <div className="stat-card"><h2>Free</h2><p>To Use</p></div>
        </div>
      </section>

      <section className="features">
        <h2>Why EduCAS?</h2>
        <div className="features-grid">
          <div className="feature-card"><span>📄</span><h3>Multi-Format Upload</h3><p>Upload PDF, DOCX, or TXT files and get instant analysis without any manual work.</p></div>
          <div className="feature-card"><span>🤖</span><h3>AI Classification</h3><p>Our AI identifies the subject domain, difficulty level, and target audience automatically.</p></div>
          <div className="feature-card"><span>📊</span><h3>Detailed Results</h3><p>Get a complete analysis including summary, recommendations, and downloadable report.</p></div>
          <div className="feature-card"><span>⚡</span><h3>Lightning Fast</h3><p>Powered by Groq AI with Llama 3.3, delivering results in under 60 seconds.</p></div>
          <div className="feature-card"><span>🔒</span><h3>Secure & Private</h3><p>Your files are processed in memory only and never saved to disk.</p></div>
          <div className="feature-card"><span>🌍</span><h3>Cloud Deployed</h3><p>Access EduCAS from anywhere in the world on any device.</p></div>
        </div>
      </section>

      <footer className="page-footer">
        <p> EduCAS · University of Hail · College of Computer Science and Engineering · 2026</p>
      </footer>
    </div>
  )
}

export default Home
