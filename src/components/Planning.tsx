export function Planning() {
  const installments = [
    { id: 1, name: 'Corolla XEI 2018', current: 7, total: 48, amount: 2473.05, type: 'Pessoal' },
    { id: 2, name: 'Empréstimo Caixa', current: 15, total: 36, amount: 1200.00, type: 'Empresa' },
    { id: 3, name: 'Notebook Apple', current: 3, total: 12, amount: 850.00, type: 'Pessoal' }
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Planejamento e Parcelas</h2>
        <button className="btn-primary">+ Nova Dívida/Parcela</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
        {installments.map(inst => {
          const progress = (inst.current / inst.total) * 100
          
          return (
            <div key={inst.id} className="glass-panel" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.1rem' }}>{inst.name}</h3>
                <span style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                  {inst.type}
                </span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1rem' }}>
                <div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Valor Mensal</p>
                  <p style={{ fontSize: '1.25rem', fontWeight: 600 }}>
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(inst.amount)}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Progresso</p>
                  <p style={{ fontSize: '1.1rem', fontWeight: 500 }}>{inst.current} de {inst.total}</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))', borderRadius: '4px', transition: 'width 1s ease-in-out' }}></div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
