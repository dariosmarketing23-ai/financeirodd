export type TransactionType = 'income' | 'expense'

export interface Transaction {
  id: string
  description: string
  amount: number
  date: string
  category: string
  type: TransactionType
  accountId: string
}

export interface Account {
  id: string
  name: string
  bank: string
  type: 'Personal' | 'Business'
  balance: number
}

const INITIAL_ACCOUNTS: Account[] = [
  { id: '1', name: 'Nubank Pessoal — Dário', bank: 'Nubank', type: 'Personal', balance: 23564.27 },
  { id: '2', name: 'Conta Empresa', bank: 'Nubank', type: 'Business', balance: 10500.00 }
]

const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: '1', description: 'Dra Indira Braga', amount: 2500, date: '2026-03-03', category: 'Grace Vision', type: 'income', accountId: '1' },
  { id: '2', description: 'Aluguel AP', amount: 2100, date: '2026-03-28', category: 'Casa', type: 'expense', accountId: '1' }
]

const STORAGE_KEY_ACCOUNTS = 'gv_accounts'
const STORAGE_KEY_TRANSACTIONS = 'gv_transactions'

export const getAccounts = (): Account[] => {
  const data = localStorage.getItem(STORAGE_KEY_ACCOUNTS)
  if (!data) {
    localStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(INITIAL_ACCOUNTS))
    return INITIAL_ACCOUNTS
  }
  return JSON.parse(data)
}

export const getTransactions = (): Transaction[] => {
  const data = localStorage.getItem(STORAGE_KEY_TRANSACTIONS)
  if (!data) {
    localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(INITIAL_TRANSACTIONS))
    return INITIAL_TRANSACTIONS
  }
  return JSON.parse(data)
}

export const saveTransaction = (transaction: Omit<Transaction, 'id'>) => {
  const txs = getTransactions()
  const newTx: Transaction = { ...transaction, id: Math.random().toString(36).substr(2, 9) }
  txs.push(newTx)
  localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(txs))

  // Update account balance
  const accounts = getAccounts()
  const accIndex = accounts.findIndex(a => a.id === transaction.accountId)
  if (accIndex >= 0) {
    if (transaction.type === 'income') {
      accounts[accIndex].balance += transaction.amount
    } else {
      accounts[accIndex].balance -= transaction.amount
    }
    localStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(accounts))
  }
  return newTx
}
