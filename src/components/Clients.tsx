import React, { useState, useEffect } from 'react'
import { getClients, saveClient, deleteClient, Client, Account, getAccounts } from '../db/storage'

export function Clients() {
  const [clients, setClients] = useState<Client[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Form state
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [frequency, setFrequency] = useState<'semanal' | 'quinzenal' | 'mensal'>('mensal')
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [accountId, setAccountId] = useState('')

  useEffect(() => {
    setClients(getClients())
    const accs = getAccounts()
    setAccounts(accs)
    if (accs.length > 0) {
      setAccountId(accs[0].id)
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !amount || !accountId || !startDate) return

    const newClient = saveClient({
      name,
      amount: parseFloat(amount),
      frequency,
      startDate,
      accountId
    })

    setClients([...clients, newClient])
    setIsModalOpen(false)
    // reset form
    setName('')
    setAmount('')
    setFrequency('mensal')
    setStartDate(new Date().toISOString().split('T')[0])
  }

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este cliente? Todos os lançamentos futuros vinculados a ele também serão removidos.')) {
      deleteClient(id)
      setClients(getClients())
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Meus Clientes</h2>
        <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
          + Novo Cliente
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {clients.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>Nenhum cliente cadastrado ainda.</p>
        ) : (
          clients.map(client => (
            <div key={client.id} className="glass-panel hover-scale" style={{ padding: '1.5rem', transition: 'transform 0.2s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem' }}>{client.name}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem', textTransform: 'capitalize' }}>
                    {client.frequency}
                  </p>
                </div>
                <button 
                  onClick={() => handleDelete(client.id)}
                  style={{ background: 'none', border: 'none', color: 'var(--accent-danger)', cursor: 'pointer', fontSize: '1.2rem' }}
                  title="Excluir cliente"
                >
                  ×
                </button>
              </div>
              <div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Valor Cobrado</p>
                <h2 style={{ fontSize: '1.5rem', marginTop: '0.25rem', color: 'var(--accent-success)' }}>
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(client.amount)}
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.5rem' }}>
                  Início: {new Date(client.startDate).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="glass-panel animate-fade-in" style={{ padding: '2rem', width: '100%', maxWidth: '500px' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Cadastrar Novo Cliente</h3>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Nome do Cliente</label>
                <input required placeholder="Ex: Maria Joaquina" value={name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)} style={{ width: '100%' }} />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Valor a Pagar (R$)</label>
                <input required type="number" step="0.01" placeholder="Ex: 500,00" value={amount} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)} style={{ width: '100%' }} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Frequência de Pagamento</label>
                <select required value={frequency} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFrequency(e.target.value as any)} style={{ width: '100%' }}>
                  <option value="semanal" style={{ color: 'black' }}>Semanal</option>
                  <option value="quinzenal" style={{ color: 'black' }}>Quinzenal</option>
                  <option value="mensal" style={{ color: 'black' }}>Mensal</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Data do Primeiro Pagamento</label>
                <input required type="date" value={startDate} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStartDate(e.target.value)} style={{ width: '100%' }} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Conta de Recebimento</label>
                <select required value={accountId} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setAccountId(e.target.value)} style={{ width: '100%' }}>
                  {accounts.map((a: Account) => (
                    <option key={a.id} value={a.id} style={{ color: 'black' }}>{a.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ color: 'var(--text-muted)' }}>Cancelar</button>
                <button type="submit" className="btn-primary">Salvar e Gerar Lançamentos</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
