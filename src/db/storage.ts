export type TransactionType = 'income' | 'expense'

export interface Transaction {
  id: string
  description: string
  amount: number
  date: string
  category: string
  type: TransactionType
  accountId: string
  clientId?: string // Added for client integration
}

export interface Account {
  id: string
  name: string
  bank: string
  type: 'Personal' | 'Business'
  balance: number
}

export interface Client {
  id: string
  name: string
  amount: number
  frequency: 'semanal' | 'quinzenal' | 'mensal'
  startDate: string
  accountId: string
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
const STORAGE_KEY_CLIENTS = 'gv_clients'

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

export const getClients = (): Client[] => {
  const data = localStorage.getItem(STORAGE_KEY_CLIENTS)
  if (!data) {
    localStorage.setItem(STORAGE_KEY_CLIENTS, JSON.stringify([]))
    return []
  }
  return JSON.parse(data)
}

export const saveTransaction = (transaction: Omit<Transaction, 'id'>, skipBalanceUpdate = false) => {
  const txs = getTransactions()
  const newTx: Transaction = { ...transaction, id: Math.random().toString(36).substr(2, 9) }
  txs.push(newTx)
  localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(txs))

  if (!skipBalanceUpdate) {
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
  }
  return newTx
}

export const saveClient = (client: Omit<Client, 'id'>) => {
  const clients = getClients()
  const newClient: Client = { ...client, id: Math.random().toString(36).substr(2, 9) }
  clients.push(newClient)
  localStorage.setItem(STORAGE_KEY_CLIENTS, JSON.stringify(clients))

  // Generate future transactions based on frequency
  let numberOfTransactions = 0;
  let daysToAdd = 0;

  if (client.frequency === 'semanal') {
    numberOfTransactions = 52;
    daysToAdd = 7;
  } else if (client.frequency === 'quinzenal') {
    numberOfTransactions = 24;
    daysToAdd = 15;
  } else if (client.frequency === 'mensal') {
    numberOfTransactions = 12;
    // Special logic for months can be applied, but simpler is +30 days or using Date methods
  }

  let currentDate = new Date(client.startDate);
  // Ensure we interpret the start date locally properly
  currentDate = new Date(currentDate.getTime() + currentDate.getTimezoneOffset() * 60000);

  for (let i = 0; i < numberOfTransactions; i++) {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;

    // Calculate if the transaction date is in the future
    const isFuture = new Date(formattedDate) > new Date();

    saveTransaction({
      description: `Cliente: ${client.name}`,
      amount: client.amount,
      date: formattedDate,
      category: 'Clientes',
      type: 'income',
      accountId: client.accountId,
      clientId: newClient.id
    }, isFuture); // Skip balance update if it's in the future

    if (client.frequency === 'mensal') {
      currentDate.setMonth(currentDate.getMonth() + 1);
    } else {
      currentDate.setDate(currentDate.getDate() + daysToAdd);
    }
  }

  return newClient
}

export const deleteClient = (clientId: string) => {
  const clients = getClients()
  const updatedClients = clients.filter(c => c.id !== clientId)
  localStorage.setItem(STORAGE_KEY_CLIENTS, JSON.stringify(updatedClients))

  // Find all transactions for this client
  const txs = getTransactions()
  const clientTxs = txs.filter(t => t.clientId === clientId)
  const remainingTxs = txs.filter(t => t.clientId !== clientId)
  
  localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(remainingTxs))

  // Rollback balance for past transactions that were actually added to the balance
  const accounts = getAccounts()
  clientTxs.forEach(tx => {
    const isFuture = new Date(tx.date) > new Date();
    if (!isFuture) { // It was added to the balance, so we need to rollback
      const accIndex = accounts.findIndex(a => a.id === tx.accountId)
      if (accIndex >= 0) {
        if (tx.type === 'income') {
          accounts[accIndex].balance -= tx.amount // reverse income
        } else {
          accounts[accIndex].balance += tx.amount // reverse expense
        }
      }
    }
  })
  localStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(accounts))
}
