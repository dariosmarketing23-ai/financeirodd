import { Account, getAccounts } from '../db/storage'
import { useState, useEffect } from 'react'

export function Accounts() {
  const [accounts, setAccounts] = useState<Account[]>([])

  useEffect(() => {
    setAccounts(getAccounts())
  }, [])

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Minhas Contas</h2>
        <button className="btn-primary">+ Nova Conta</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {accounts.map(acc => (
          <div key={acc.id} className="glass-panel hover-scale" style={{ padding: '1.5rem', transition: 'transform 0.2s', cursor: 'pointer' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem' }}>{acc.name}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>{acc.bank} • {acc.type}</p>
              </div>
            </div>
            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Saldo Atual</p>
              <h2 style={{ fontSize: '2rem', marginTop: '0.25rem', color: acc.balance >= 0 ? 'var(--text-primary)' : 'var(--accent-danger)' }}>
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(acc.balance)}
              </h2>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
