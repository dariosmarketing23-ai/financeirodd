import React, { useEffect, useState } from 'react'
import { getAccounts, getTransactions, Transaction, Account } from '../db/storage'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js'
import { Line, Doughnut } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

export function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])

  useEffect(() => {
    setTransactions(getTransactions())
    setAccounts(getAccounts())
  }, [])

  const totalBalance = accounts.reduce((acc, a) => acc + a.balance, 0)

  const currentMonthTx = transactions.filter(t => new Date(t.date).getMonth() === new Date().getMonth())
  const totalIncome = currentMonthTx.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0)
  const totalExpense = currentMonthTx.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0)

  // Get today's transactions properly in local time (YYYY-MM-DD)
  const today = new Date()
  const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  const todaysTransactions = transactions.filter(t => t.date === todayString)

  // Demo chart data
  const lineOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const, labels: { color: 'rgba(255,255,255,0.7)' } },
      title: { display: false }
    },
    scales: {
      x: { ticks: { color: 'rgba(255,255,255,0.7)' }, grid: { color: 'rgba(255,255,255,0.1)' } },
      y: { ticks: { color: 'rgba(255,255,255,0.7)' }, grid: { color: 'rgba(255,255,255,0.1)' } }
    }
  }

  const lineData = {
    labels: ['1 Mar', '5 Mar', '10 Mar', '15 Mar', '20 Mar', '25 Mar', '30 Mar'],
    datasets: [
      {
        label: 'Saldo Projetado',
        data: [22000, 23000, 19000, 25000, 24000, 28000, totalBalance],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.4
      }
    ],
  }

  const doughnutData = {
    labels: ['Casa', 'Pessoal', 'Alimentação', 'Transporte', 'Saúde'],
    datasets: [
      {
        data: [2100, 800, 1200, 400, 500],
        backgroundColor: [
          '#ef4444',
          '#f59e0b',
          '#10b981',
          '#3b82f6',
          '#8b5cf6',
        ],
        borderWidth: 0,
      },
    ],
  }

  const doughnutOptions = {
    plugins: {
      legend: { position: 'bottom' as const, labels: { color: 'rgba(255,255,255,0.7)' } }
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Saldo Atual Total</p>
          <h2 style={{ fontSize: '2rem', marginTop: '0.5rem' }}>
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalBalance)}
          </h2>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Receitas do Mês</p>
          <h2 style={{ fontSize: '2rem', color: 'var(--accent-success)', marginTop: '0.5rem' }}>
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalIncome)}
          </h2>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Despesas do Mês</p>
          <h2 style={{ fontSize: '2rem', color: 'var(--accent-danger)', marginTop: '0.5rem' }}>
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalExpense)}
          </h2>
        </div>
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Evolução do Saldo</h3>
          <Line options={lineOptions} data={lineData} />
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Despesas por Categoria</h3>
          <Doughnut data={doughnutData} options={doughnutOptions} />
        </div>
      </div>

      {/* Lançamentos do Dia */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>📅</span> Lançamentos de Hoje
        </h3>

        {todaysTransactions.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>
            Nenhum lançamento programado para hoje.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {todaysTransactions.map(tx => (
              <div
                key={tx.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1rem',
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: '8px',
                  borderLeft: `4px solid ${tx.type === 'income' ? 'var(--accent-success)' : 'var(--accent-danger)'}`
                }}
              >
                <div>
                  <h4 style={{ margin: 0, fontSize: '1rem' }}>{tx.description}</h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{tx.category}</span>
                </div>
                <div style={{
                  fontWeight: 'bold',
                  fontSize: '1.1rem',
                  color: tx.type === 'income' ? 'var(--accent-success)' : 'var(--accent-danger)'
                }}>
                  {tx.type === 'income' ? '+' : '-'} {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(tx.amount)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
