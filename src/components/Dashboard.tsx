import { useEffect, useState } from 'react'
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

    </div>
  )
}
