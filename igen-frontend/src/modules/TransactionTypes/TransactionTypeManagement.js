import React, { useState, useEffect } from 'react';
import API from '../../api/axios';
import {
  Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem
} from '@mui/material';

export default function TransactionTypeManagement() {
  const [transactionTypes, setTransactionTypes] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({
    company: '',
    name: '',
    type: 'INCOME',
    description: '',
  });

  const fetchTransactionTypes = async () => {
    try {
      const res = await API.get('transaction-types/');
      setTransactionTypes(res.data);
    } catch (err) {
      alert('Error fetching transaction types');
    }
  };

  const fetchCompanies = async () => {
    try {
      const res = await API.get('companies/');
      setCompanies(res.data);
    } catch (err) {
      alert('Error fetching companies');
    }
  };

  useEffect(() => {
    fetchTransactionTypes();
    fetchCompanies();
  }, []);

  const handleAddTransactionType = async () => {
    if (!form.company || !form.name || !form.type) {
      alert('Company, Name, and Type are required');
      return;
    }
    try {
      await API.post('transaction-types/', form);
      alert('Transaction Type added');
      fetchTransactionTypes();
      setOpen(false);
      setForm({ company: '', name: '', type: 'INCOME', description: '' });
    } catch (err) {
      alert('Failed to add transaction type');
    }
  };

  const deleteTransactionType = async (id) => {
    try {
      await API.delete(`transaction-types/${id}/`);
      alert('Transaction Type deleted');
      fetchTransactionTypes();
    } catch (err) {
      alert('Delete failed');
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Transaction Type Management</h2>

      <Button variant="contained" color="primary" onClick={() => setOpen(true)}>
        Add Transaction Type
      </Button>

      {/* Add Transaction Type Modal */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Add Transaction Type</DialogTitle>
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
            margin="dense" label="Name" fullWidth value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <TextField
            select margin="dense" label="Type" fullWidth value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          >
            <MenuItem value="INCOME">Income</MenuItem>
            <MenuItem value="EXPENSE">Expense</MenuItem>
            <MenuItem value="ASSET">Asset</MenuItem>
            <MenuItem value="LIABILITY">Liability</MenuItem>
          </TextField>
          <TextField
            margin="dense" label="Description" fullWidth multiline value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleAddTransactionType} color="primary">Add</Button>
        </DialogActions>
      </Dialog>

      <table border="1" style={{ marginTop: 20, width: '100%' }}>
        <thead>
          <tr>
            <th>Company</th>
            <th>Name</th>
            <th>Type</th>
            <th>Description</th>
            <th>Active</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {transactionTypes.map((t) => (
            <tr key={t.id}>
              <td>{t.company_name}</td>
              <td>{t.name}</td>
              <td>{t.type}</td>
              <td>{t.description}</td>
              <td>{t.is_active ? 'Yes' : 'No'}</td>
              <td>
                <Button onClick={() => deleteTransactionType(t.id)} size="small" variant="outlined" color="error">
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
