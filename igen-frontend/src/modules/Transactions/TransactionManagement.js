import React, { useState, useEffect } from 'react';
import API from '../../api/axios';
import {
  Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem
} from '@mui/material';

export default function TransactionManagement() {
  const [transactions, setTransactions] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [banks, setBanks] = useState([]);
  const [costCentres, setCostCentres] = useState([]);
  const [transactionTypes, setTransactionTypes] = useState([]);
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({
    company: '',
    bank_account: '',
    cost_centre: '',
    transaction_type: '',
    direction: 'CREDIT',
    amount: '',
    date: '',
    notes: '',
  });

  const fetchData = async () => {
    try {
      const [trans, comps, bks, ccs, tts] = await Promise.all([
        API.get('transactions/'),
        API.get('companies/'),
        API.get('banks/'),
        API.get('cost-centres/'),
        API.get('transaction-types/'),
      ]);
      setTransactions(trans.data);
      setCompanies(comps.data);
      setBanks(bks.data);
      setCostCentres(ccs.data);
      setTransactionTypes(tts.data);
    } catch (err) {
      alert('Error fetching data');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddTransaction = async () => {
    const { company, bank_account, cost_centre, transaction_type, direction, amount, date } = form;
    if (!company || !bank_account || !cost_centre || !transaction_type || !amount || !date) {
      alert('All fields are required');
      return;
    }
    try {
      await API.post('transactions/', form);
      alert('Transaction added');
      fetchData();
      setOpen(false);
      setForm({ company: '', bank_account: '', cost_centre: '', transaction_type: '', direction: 'CREDIT', amount: '', date: '', notes: '' });
    } catch (err) {
      alert('Failed to add transaction');
    }
  };

  const deleteTransaction = async (id) => {
    try {
      await API.delete(`transactions/${id}/`);
      alert('Transaction deleted');
      fetchData();
    } catch (err) {
      alert('Delete failed');
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Transaction Management</h2>

      <Button variant="contained" color="primary" onClick={() => setOpen(true)}>
        Add Transaction
      </Button>

      {/* Add Transaction Modal */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Add Transaction</DialogTitle>
        <DialogContent>
          <TextField
            select margin="dense" label="Company" fullWidth value={form.company}
            onChange={(e) => setForm({ ...form, company: e.target.value })}
          >
            {companies.map((c) => (
              <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
            ))}
          </TextField>
          <TextField
            select margin="dense" label="Bank Account" fullWidth value={form.bank_account}
            onChange={(e) => setForm({ ...form, bank_account: e.target.value })}
          >
            {banks.map((b) => (
              <MenuItem key={b.id} value={b.id}>{b.account_name} ({b.company_name})</MenuItem>
            ))}
          </TextField>
          <TextField
            select margin="dense" label="Cost Centre" fullWidth value={form.cost_centre}
            onChange={(e) => setForm({ ...form, cost_centre: e.target.value })}
          >
            {costCentres.map((cc) => (
              <MenuItem key={cc.id} value={cc.id}>{cc.name} ({cc.company_name})</MenuItem>
            ))}
          </TextField>
          <TextField
            select margin="dense" label="Transaction Type" fullWidth value={form.transaction_type}
            onChange={(e) => setForm({ ...form, transaction_type: e.target.value })}
          >
            {transactionTypes.map((tt) => (
              <MenuItem key={tt.id} value={tt.id}>{tt.name} ({tt.type})</MenuItem>
            ))}
          </TextField>
          <TextField
            select margin="dense" label="Direction" fullWidth value={form.direction}
            onChange={(e) => setForm({ ...form, direction: e.target.value })}
          >
            <MenuItem value="CREDIT">Credit (Income)</MenuItem>
            <MenuItem value="DEBIT">Debit (Expense)</MenuItem>
          </TextField>
          <TextField
            margin="dense" label="Amount" type="number" fullWidth value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
          />
          <TextField
            margin="dense" label="Date" type="date" fullWidth value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            margin="dense" label="Notes" fullWidth multiline value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleAddTransaction} color="primary">Add</Button>
        </DialogActions>
      </Dialog>

      <table border="1" style={{ marginTop: 20, width: '100%' }}>
        <thead>
          <tr>
            <th>Company</th>
            <th>Bank</th>
            <th>Cost Centre</th>
            <th>Type</th>
            <th>Direction</th>
            <th>Amount</th>
            <th>Date</th>
            <th>Notes</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => (
            <tr key={t.id}>
              <td>{t.company_name}</td>
              <td>{t.bank_name}</td>
              <td>{t.cost_centre_name}</td>
              <td>{t.transaction_type_name}</td>
              <td>{t.direction}</td>
              <td>{t.amount}</td>
              <td>{t.date}</td>
              <td>{t.notes}</td>
              <td>
                <Button onClick={() => deleteTransaction(t.id)} size="small" variant="outlined" color="error">
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
