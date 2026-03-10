import { useState } from 'react'
import { Dashboard } from './components/Dashboard'
import { Transactions } from './components/Transactions'
import { Accounts } from './components/Accounts'
import { Planning } from './components/Planning'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')

  return (
    <div className="app-container">
      <nav className="sidebar glass-panel" style={{ borderRadius: 0, borderTop: 0, borderBottom: 0, borderLeft: 0 }}>
        <div>
          <h2 style={{ background: 'linear-gradient(to right, var(--accent-primary), var(--accent-secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: '1.5rem', marginBottom: '0.5rem' }}>
            GraceVision
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Financial Management</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '2rem' }}>
          {['dashboard', 'transactions', 'planning', 'accounts'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '0.875rem 1rem',
                borderRadius: '12px',
                background: activeTab === tab ? 'var(--glass-bg)' : 'transparent',
                border: activeTab === tab ? '1px solid var(--glass-border)' : '1px solid transparent',
                color: activeTab === tab ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: activeTab === tab ? 500 : 400,
                textTransform: 'capitalize'
              }}
            >
              {tab === 'dashboard' ? 'Painel Geral' :
               tab === 'transactions' ? 'Lançamentos' :
               tab === 'planning' ? 'Planejamento' : 'Contas'}
            </button>
          ))}
        </div>
      </nav>

      <main className="main-content">
        <header className="header animate-fade-in">
          <div>
            <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Bem-vindo, Dário</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Aqui está o resumo financeiro da GraceVision.</p>
          </div>
        </header>

        <div className="animate-fade-in">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'transactions' && <Transactions />}
          {activeTab === 'planning' && <Planning />}
          {activeTab === 'accounts' && <Accounts />}
        </div>
      </main>
    </div>
  )
}

export default App
