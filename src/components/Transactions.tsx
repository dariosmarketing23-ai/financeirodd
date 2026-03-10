import { useState, useEffect } from 'react'
import { getTransactions, saveTransaction, getAccounts, Transaction, Account } from '../db/storage'

export function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Form state
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [category, setCategory] = useState('')
  const [type, setType] = useState<'income' | 'expense'>('expense')
  const [accountId, setAccountId] = useState('')

  useEffect(() => {
    setTransactions(getTransactions())
    setAccounts(getAccounts())
    if (getAccounts().length > 0) {
      setAccountId(getAccounts()[0].id)
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!description || !amount || !category || !accountId) return

    const newTx = saveTransaction({
      description,
      amount: parseFloat(amount),
      date,
      category,
      type,
      accountId
    })

    setTransactions([...transactions, newTx])
    setIsModalOpen(false)
    // reset form
    setDescription('')
    setAmount('')
    setCategory('')
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Histórico de Transações</h2>
        <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
          + Novo Lançamento
        </button>
      </div>

      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid var(--border-color)' }}>
              <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Data</th>
              <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Descrição</th>
              <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Categoria</th>
              <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Valor</th>
            </tr>
          </thead>
          <tbody>
            {transactions.slice().reverse().map(tx => (
              <tr key={tx.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                <td style={{ padding: '1rem' }}>{new Date(tx.date).toLocaleDateString('pt-BR')}</td>
                <td style={{ padding: '1rem' }}>{tx.description}</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ background: 'rgba(255,255,255,0.1)', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}>
                    {tx.category}
                  </span>
                </td>
                <td style={{ padding: '1rem', color: tx.type === 'income' ? 'var(--accent-success)' : 'var(--accent-danger)' }}>
                  {tx.type === 'income' ? '+' : '-'} {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(tx.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {transactions.length === 0 && (
          <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Nenhuma transação encontrada.</p>
        )}
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="glass-panel animate-fade-in" style={{ padding: '2rem', width: '100%', maxWidth: '500px' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Novo Lançamento</h3>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <label style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input type="radio" name="type" checked={type === 'income'} onChange={() => setType('income')} /> Receita
                </label>
                <label style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input type="radio" name="type" checked={type === 'expense'} onChange={() => setType('expense')} /> Despesa
                </label>
              </div>

              <input required placeholder="Descrição" value={description} onChange={e => setDescription(e.target.value)} />
              <input required type="number" step="0.01" placeholder="Valor (R$)" value={amount} onChange={e => setAmount(e.target.value)} />
              <input required type="date" value={date} onChange={e => setDate(e.target.value)} />
              <input required placeholder="Categoria (ex: Saúde, Casa)" value={category} onChange={e => setCategory(e.target.value)} />
              
              <select required value={accountId} onChange={e => setAccountId(e.target.value)}>
                {accounts.map(a => (
                  <option key={a.id} value={a.id} style={{ color: 'black' }}>{a.name}</option>
                ))}
              </select>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ color: 'var(--text-muted)' }}>Cancelar</button>
                <button type="submit" className="btn-primary">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
