import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function History() {
  const navigate = useNavigate()
  const [history, setHistory] = useState([])

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('educas_history') || '[]')
    setHistory(saved)
  }, [])

  const clearHistory = () => {
    localStorage.removeItem('educas_history')
    setHistory([])
  }

  const deleteItem = (index) => {
    const updated = history.filter((_, i) => i !== index)
    localStorage.setItem('educas_history', JSON.stringify(updated))
    setHistory(updated)
  }

  return (
    <div className="page-wrapper">
      <nav className="navbar">
        <div className="nav-logo"> EduCAS</div>
        <div className="nav-links">
          <button onClick={() => navigate('/')} className="nav-btn">Home</button>
          <button onClick={() => navigate('/analyze')} className="nav-btn">Analyze</button>
          <button onClick={() => navigate('/history')} className="nav-btn active">History</button>
          <button onClick={() => navigate('/stats')} className="nav-btn">Statistics</button>
          <button onClick={() => navigate('/about')} className="nav-btn">About</button>
          <button onClick={() => navigate('/login')} className="nav-btn login-btn">Login</button>
        </div>
      </nav>

      <div className="page-content">
        <div className="page-header">
          <h1>📜 Analysis History</h1>
          <p>View all your previous analyses</p>
        </div>

        {history.length === 0 ? (
          <div className="empty-state">
            <span>📭</span>
            <h2>No History Yet</h2>
            <p>Your analysis history will appear here after you analyze documents.</p>
            <button className="go-btn" onClick={() => navigate('/analyze')}>🔍 Start Analyzing</button>
          </div>
        ) : (
          <>
            <div className="history-header">
              <p>{history.length} analyses found</p>
              <button className="clear-btn" onClick={clearHistory}>🗑️ Clear All</button>
            </div>
            <div className="history-list">
              {history.map((item, i) => (
                <div className="history-card" key={i}>
                  <div className="history-card-header">
                    <div>
                      <h3>{item.fileName || 'Manual Text Input'}</h3>
                      <span className="history-date">{item.date}</span>
                    </div>
                    <button className="delete-btn" onClick={() => deleteItem(i)}>✕</button>
                  </div>
                  <div className="history-tags">
                    <span className="tag blue">{item.domain}</span>
                    <span className="tag teal">{item.subject}</span>
                    <span className="tag purple">{item.difficulty}</span>
                    <span className="tag orange">{item.suitableFor}</span>
                  </div>
                  <p className="history-summary">{item.summary}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <footer className="page-footer">
        <p> EduCAS · University of Hail · College of Computer Science and Engineering · 2026</p>
      </footer>
    </div>
  )
}

export default History
