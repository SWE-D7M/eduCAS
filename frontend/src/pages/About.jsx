import { useNavigate } from 'react-router-dom'

function About() {
  const navigate = useNavigate()
  const team = [
    { name: "Ziyad Majed Al-Anazi", role: "Team Leader" },
    { name: "Rayan Nawaf Naif Al-Harbi", role: "Frontend Developer" },
    { name: "Farhan Hamood Al-Anazi", role: "Backend Developer" },
    { name: "Dhari Mulayh Al-Rammahi", role: "AI Integration" },
    { name: "Salem Abdulrhman Al-Ghassab", role: "Database Designer" },
    { name: "Abdulrahman Nashmi Al-Shammari", role: "UI/UX Designer/AI Integration " },
    { name: "Sultan Waleed Al-qassim", role: "Testing & QA" },
  ]

  return (
    <div className="page-wrapper">
      <nav className="navbar">
        <div className="nav-logo"> EduCAS</div>
        <div className="nav-links">
          <button onClick={() => navigate('/')} className="nav-btn">Home</button>
          <button onClick={() => navigate('/analyze')} className="nav-btn">Analyze</button>
          <button onClick={() => navigate('/history')} className="nav-btn">History</button>
          <button onClick={() => navigate('/stats')} className="nav-btn">Statistics</button>
          <button onClick={() => navigate('/about')} className="nav-btn active">About</button>
          <button onClick={() => navigate('/login')} className="nav-btn login-btn">Login</button>
        </div>
      </nav>

      <div className="page-content">
        <div className="page-header">
          <h1>ℹ️ About EduCAS</h1>
          <p>Learn about our system and the team behind it</p>
        </div>

        <div className="about-section">
          <h2>What is EduCAS?</h2>
          <p>EduCAS (Educational Content Analysis System) is an AI-powered web application built to help educators automatically analyze educational documents and texts. Instead of spending 30–60 minutes manually reviewing a document, educators can upload a file or paste text and receive a complete AI-generated analysis in under 60 seconds.</p>
        </div>

        <div className="about-section">
          <h2>How It Works</h2>
          <div className="steps-grid">
            <div className="step-card"><span>1</span><h3>Upload</h3><p>Upload a PDF, DOCX, or TXT file or paste text directly</p></div>
            <div className="step-card"><span>2</span><h3>Extract</h3><p>The system extracts and processes the text automatically</p></div>
            <div className="step-card"><span>3</span><h3>Analyze</h3><p>AI classifies the content and generates insights</p></div>
            <div className="step-card"><span>4</span><h3>Results</h3><p>View results and download the analysis report</p></div>
          </div>
        </div>

        <div className="about-section">
          <h2>Technology Stack</h2>
          <div className="tech-grid">
            <div className="tech-card"><span>⚛️</span><h3>React.js</h3><p>Frontend Interface</p></div>
            <div className="tech-card"><span>🟩</span><h3>Node.js</h3><p>Backend Server</p></div>
            <div className="tech-card"><span>🤖</span><h3>Llama 3.3</h3><p>AI Model by Meta</p></div>
            <div className="tech-card"><span>⚡</span><h3>Groq API</h3><p>AI Provider</p></div>
            <div className="tech-card"><span>☁️</span><h3>Render.com</h3><p>Cloud Hosting</p></div>
            <div className="tech-card"><span>🐙</span><h3>GitHub</h3><p>Version Control</p></div>
          </div>
        </div>

        <div className="about-section">
          <h2>👥 Our Team</h2>
          <p className="supervisor">Under Supervision of: <strong>Prof/Dr. Adel Alkalel</strong></p>
          <div className="team-grid">
            {team.map((member, i) => (
              <div className="team-card" key={i}>
                <div className="team-avatar">{member.name.charAt(0)}</div>
                <h3>{member.name}</h3>
                <p>{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <footer className="page-footer">
        <p> EduCAS · University of Hail · College of Computer Science and Engineering · 2026</p>
      </footer>
    </div>
  )
}

export default About
