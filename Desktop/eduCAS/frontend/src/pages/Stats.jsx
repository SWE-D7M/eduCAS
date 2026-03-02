import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function Stats() {
  const navigate = useNavigate()
  const [history, setHistory] = useState([])

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('educas_history') || '[]')
    setHistory(saved)
  }, [])

  const count = (key, val) => history.filter(h => h[key] === val).length
  const pct = (n) => history.length ? Math.round((n / history.length) * 100) : 0

  const domains = ['STEM', 'Humanities', 'Social Sciences']
  const difficulties = ['Beginner', 'Intermediate', 'Advanced']
  const audiences = ['Elementary School', 'Middle School', 'High School', 'University']
  const domainColors = ['#1a73e8', '#00897b', '#e65100']
  const diffColors = ['#2e7d32', '#f9a825', '#c62828']
  const audColors = ['#6a1b9a', '#1a73e8', '#00897b', '#e65100']

  return (
    <div className="page-wrapper">
      <nav className="navbar">
        <div className="nav-logo"> EduCAS</div>
        <div className="nav-links">
          <button onClick={() => navigate('/')} className="nav-btn">Home</button>
          <button onClick={() => navigate('/analyze')} className="nav-btn">Analyze</button>
          <button onClick={() => navigate('/history')} className="nav-btn">History</button>
          <button onClick={() => navigate('/stats')} className="nav-btn active">Statistics</button>
          <button onClick={() => navigate('/about')} className="nav-btn">About</button>
          <button onClick={() => navigate('/login')} className="nav-btn login-btn">Login</button>
        </div>
      </nav>

      <div className="page-content">
        <div className="page-header">
          <h1>📈 Statistics Dashboard</h1>
          <p>Visual overview of all your analyses</p>
        </div>

        <div className="stats-summary">
          <div className="summary-stat"><h2>{history.length}</h2><p>Total Analyses</p></div>
          <div className="summary-stat"><h2>{count('domain','STEM')}</h2><p>STEM Documents</p></div>
          <div className="summary-stat"><h2>{count('difficulty','Advanced')}</h2><p>Advanced Level</p></div>
          <div className="summary-stat"><h2>{count('suitableFor','University')}</h2><p>University Level</p></div>
        </div>

        {history.length === 0 ? (
          <div className="empty-state">
            <span>📊</span>
            <h2>No Data Yet</h2>
            <p>Statistics will appear here after you analyze some documents.</p>
            <button className="go-btn" onClick={() => navigate('/analyze')}>🔍 Start Analyzing</button>
          </div>
        ) : (
          <div className="charts-grid">
            <div className="chart-card">
              <h3>📚 Subject Domains</h3>
              {domains.map((d, i) => (
                <div className="bar-row" key={d}>
                  <span className="bar-label">{d}</span>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: pct(count('domain',d))+'%', background: domainColors[i] }}></div>
                  </div>
                  <span className="bar-count">{count('domain',d)}</span>
                </div>
              ))}
            </div>

            <div className="chart-card">
              <h3>📖 Difficulty Levels</h3>
              {difficulties.map((d, i) => (
                <div className="bar-row" key={d}>
                  <span className="bar-label">{d}</span>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: pct(count('difficulty',d))+'%', background: diffColors[i] }}></div>
                  </div>
                  <span className="bar-count">{count('difficulty',d)}</span>
                </div>
              ))}
            </div>

            <div className="chart-card">
              <h3> Target Audience</h3>
              {audiences.map((a, i) => (
                <div className="bar-row" key={a}>
                  <span className="bar-label">{a}</span>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: pct(count('suitableFor',a))+'%', background: audColors[i] }}></div>
                  </div>
                  <span className="bar-count">{count('suitableFor',a)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <footer className="page-footer">
        <p> EduCAS · University of Hail · College of Computer Science and Engineering · 2026</p>
      </footer>
    </div>
  )
}

export default Stats
