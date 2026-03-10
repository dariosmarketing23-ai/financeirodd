import React, { useState, useRef, useEffect } from 'react'
import { getTransactions, saveTransaction, getAccounts, Transaction, Account } from '../db/storage'

// Custom CSV Parser to handle quotes correctly
function parseCSV(text: string): string[][] {
  const result: string[][] = []
  let row: string[] = []
  let inQuotes = false
  let currentValue = ''

  for (let i = 0; i < text.length; i++) {
    const char = text[i]

    if (inQuotes) {
      if (char === '"' && i + 1 < text.length && text[i + 1] === '"') {
        currentValue += '"'
        i++ // skip escaped quote
      } else if (char === '"') {
        inQuotes = false
      } else {
        currentValue += char
      }
    } else {
      if (char === '"') {
        inQuotes = true
      } else if (char === ',') {
        row.push(currentValue)
        currentValue = ''
      } else if (char === '\n' || char === '\r') {
        if (char === '\r' && i + 1 < text.length && text[i + 1] === '\n') {
          i++ // skip \n of \r\n
        }
        row.push(currentValue)
        result.push(row)
        row = []
        currentValue = ''
      } else {
        currentValue += char
      }
    }
  }

  if (currentValue || row.length > 0) {
    row.push(currentValue)
    result.push(row)
  }

  return result.filter(r => r.some(c => c.trim() !== ''))
}

export function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      if (!text) return

      const rows = parseCSV(text)
      if (rows.length < 2) return

      const header = rows[0].map(h => h.toLowerCase().trim())
      let importedCount = 0

      // Identify NuConta vs Credit Card format
      const isNuConta = header.includes('data') && header.includes('valor') && header.includes('identificador')
      const isCreditCard = header.includes('date') && header.includes('category') && header.includes('amount')

      if (!isNuConta && !isCreditCard) {
        alert("Formato de extrato não reconhecido. Use um CSV válido do Nubank (Conta ou Cartão).")
        return
      }

      // We need a destination account for the imports
      const targetAccountId = accountId || (accounts.length > 0 ? accounts[0].id : '')
      if (!targetAccountId) {
        alert("Nenhuma conta disponível para importar.")
        return
      }

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i]

        if (isNuConta) {
          // NuConta: Data,Valor,Identificador,Descrição
          if (row.length < 4) continue
          const rawDate = row[header.indexOf('data')].trim() // DD/MM/YYYY
          const rawAmount = row[header.indexOf('valor')].trim()
          const rawDesc = row[header.indexOf('descrição')]?.trim() || row[header.indexOf('descricao')]?.trim() || ''

          if (!rawDate || !rawAmount) continue

          const [day, month, year] = rawDate.split('/')
          const parsedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
          const amountNum = parseFloat(rawAmount.replace(',', '.'))

          if (isNaN(amountNum)) continue

          const txType = amountNum >= 0 ? 'income' : 'expense'
          const txAmount = Math.abs(amountNum)

          saveTransaction({
            description: rawDesc,
            amount: txAmount,
            date: parsedDate,
            category: 'Conta Nubank',
            type: txType,
            accountId: targetAccountId
          })
          importedCount++
        } else if (isCreditCard) {
          // Credit Card: date,category,title,amount
          if (row.length < 4) continue
          const rawDate = row[header.indexOf('date')].trim() // YYYY-MM-DD
          const rawCategory = row[header.indexOf('category')].trim()
          const rawTitle = row[header.indexOf('title')].trim()
          const rawAmount = row[header.indexOf('amount')].trim()

          if (!rawDate || !rawAmount) continue

          const amountNum = parseFloat(rawAmount.replace(',', '.'))
          if (isNaN(amountNum)) continue

          saveTransaction({
            description: rawTitle,
            amount: Math.abs(amountNum),
            date: rawDate,
            category: rawCategory || 'Cartão Nubank',
            type: 'expense', // Fatura de cartão é sempre despesa
            accountId: targetAccountId
          })
          importedCount++
        }
      }

      // Refresh data
      setTransactions(getTransactions())
      setAccounts(getAccounts())
      alert(`Importação concluída! ${importedCount} lançamentos adicionados.`)

      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
    reader.readAsText(file)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Histórico de Transações</h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <input
            type="file"
            accept=".csv"
            style={{ display: 'none' }}
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
          <button
            className="btn-primary"
            style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}
            onClick={() => fileInputRef.current?.click()}
          >
            Importar Nubank (CSV)
          </button>
          <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
            + Novo Lançamento
          </button>
        </div>
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
            {transactions.slice().reverse().map((tx: Transaction) => (
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

              <input required placeholder="Descrição" value={description} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDescription(e.target.value)} />
              <input required type="number" step="0.01" placeholder="Valor (R$)" value={amount} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)} />
              <input required type="date" value={date} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDate(e.target.value)} />
              <input required placeholder="Categoria (ex: Saúde, Casa)" value={category} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCategory(e.target.value)} />

              <select required value={accountId} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setAccountId(e.target.value)}>
                {accounts.map((a: Account) => (
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
