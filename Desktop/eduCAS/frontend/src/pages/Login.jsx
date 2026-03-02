import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Login() {
  const navigate = useNavigate()
  const [isLogin, setIsLogin] = useState(true)
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [msg, setMsg] = useState('')

  const handleSubmit = () => {
    if (!form.email || !form.password) return setMsg('Please fill all fields!')
    if (!isLogin && !form.name) return setMsg('Please enter your name!')
    setMsg('✅ ' + (isLogin ? 'Login successful! Welcome back.' : 'Account created! Welcome to EduCAS.'))
    setTimeout(() => navigate('/analyze'), 1500)
  }

  return (
    <div className="page-wrapper">
      <nav className="navbar">
        <div className="nav-logo"> EduCAS</div>
        <div className="nav-links">
          <button onClick={() => navigate('/')} className="nav-btn">Home</button>
          <button onClick={() => navigate('/analyze')} className="nav-btn">Analyze</button>
          <button onClick={() => navigate('/history')} className="nav-btn">History</button>
          <button onClick={() => navigate('/stats')} className="nav-btn">Statistics</button>
          <button onClick={() => navigate('/about')} className="nav-btn">About</button>
          <button onClick={() => navigate('/login')} className="nav-btn login-btn active">Login</button>
        </div>
      </nav>

      <div className="page-content">
        <div className="login-container">
          <div className="login-box">
            <div className="login-logo"></div>
            <h1>EduCAS</h1>
            <p className="login-sub">{isLogin ? 'Sign in to your account' : 'Create a new account'}</p>

            <div className="login-tabs">
              <button className={isLogin ? 'tab active' : 'tab'} onClick={() => setIsLogin(true)}>Login</button>
              <button className={!isLogin ? 'tab active' : 'tab'} onClick={() => setIsLogin(false)}>Register</button>
            </div>

            {!isLogin && (
              <input
                className="login-input"
                type="text"
                placeholder="Full Name"
                value={form.name}
                onChange={e => setForm({...form, name: e.target.value})}
              />
            )}
            <input
              className="login-input"
              type="email"
              placeholder="Email Address"
              value={form.email}
              onChange={e => setForm({...form, email: e.target.value})}
            />
            <input
              className="login-input"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={e => setForm({...form, password: e.target.value})}
            />

            {msg && <p className={msg.includes('✅') ? 'msg success' : 'msg error'}>{msg}</p>}

            <button className="login-submit" onClick={handleSubmit}>
              {isLogin ? '🔑 Sign In' : '🚀 Create Account'}
            </button>

            <p className="login-switch">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <span onClick={() => setIsLogin(!isLogin)}>{isLogin ? 'Register' : 'Login'}</span>
            </p>
          </div>
        </div>
      </div>

      <footer className="page-footer">
        <p> EduCAS · University of Hail · College of Computer Science and Engineering · 2026</p>
      </footer>
    </div>
  )
}

export default Login
