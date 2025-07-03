import React, { useState, useEffect } from 'react';
import API from '../../api/axios';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem } from '@mui/material';

export default function ReceiptManagement() {
  const [receipts, setReceipts] = useState([]);
  const [entities, setEntities] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null); // ✅ tracking editing receipt
  const [form, setForm] = useState({
    transaction_type: 'RECEIPT',
    date: '',
    amount: '',
    reference: '',
    entity: '',
    company: '',
    notes: '',
  });

  const fetchReceipts = async () => {
    try {
      const res = await API.get('receipts/');
      setReceipts(res.data);
    } catch (err) {
      console.error(err);
      alert('Error fetching receipts');
    }
  };

  const fetchEntities = async () => {
    try {
      const res = await API.get('entities/');
      setEntities(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCompanies = async () => {
    try {
      const res = await API.get('companies/');
      setCompanies(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchReceipts();
    fetchEntities();
    fetchCompanies();
  }, []);

  const resetForm = () => setForm({ transaction_type: 'RECEIPT', date: '', amount: '', reference: '', entity: '', company: '', notes: '' });

  const handleAddOrUpdate = async () => {
    if (!form.date || !form.amount) {
      alert('Date and Amount are required');
      return;
    }
    try {
      if (editing) {
        await API.put(`receipts/${editing.id}/`, form);
        alert('Receipt updated');
      } else {
        await API.post('receipts/', form);
        alert('Receipt added');
      }
      fetchReceipts();
      setOpen(false);
      resetForm();
      setEditing(null);
    } catch (err) {
      console.error(err.response?.data || err);
      alert('Failed to save receipt');
    }
  };

  const handleDeleteReceipt = async (id) => {
    if (!window.confirm('Are you sure you want to delete this receipt?')) return;
    try {
      await API.delete(`receipts/${id}/`);
      alert('Receipt deleted');
      fetchReceipts();
    } catch (err) {
      console.error(err.response?.data || err);
      alert('Failed to delete receipt');
    }
  };

  const openEditDialog = (receipt) => {
    setEditing(receipt);
    setForm({
      transaction_type: receipt.transaction_type,
      date: receipt.date,
      amount: receipt.amount,
      reference: receipt.reference,
      entity: receipt.entity || '',
      company: receipt.company || '',
      notes: receipt.notes || '',
    });
    setOpen(true);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Receipt Management</h2>
      <Button variant="contained" color="primary" onClick={() => { resetForm(); setEditing(null); setOpen(true); }}>
        Add Receipt
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>{editing ? 'Edit Receipt' : 'Add New Receipt'}</DialogTitle>
        <DialogContent>
          <TextField
            select
            label="Transaction Type"
            margin="dense"
            fullWidth
            value={form.transaction_type}
            onChange={(e) => setForm({ ...form, transaction_type: e.target.value })}
          >
            <MenuItem value="RECEIPT">Receipt</MenuItem>
            <MenuItem value="PAYMENT">Payment</MenuItem>
          </TextField>

          <TextField
            margin="dense"
            label="Date (YYYY-MM-DD)"
            fullWidth
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />

          <TextField
            margin="dense"
            label="Amount"
            type="number"
            fullWidth
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
          />

          <TextField
            margin="dense"
            label="Reference"
            fullWidth
            value={form.reference}
            onChange={(e) => setForm({ ...form, reference: e.target.value })}
          />

          <TextField
            select
            label="Entity"
            margin="dense"
            fullWidth
            value={form.entity}
            onChange={(e) => setForm({ ...form, entity: e.target.value })}
          >
            <MenuItem value="">Select entity</MenuItem>
            {entities.map((ent) => (
              <MenuItem key={ent.id} value={ent.id}>
                {ent.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Company"
            margin="dense"
            fullWidth
            value={form.company}
            onChange={(e) => setForm({ ...form, company: e.target.value })}
          >
            <MenuItem value="">Select company</MenuItem>
            {companies.map((comp) => (
              <MenuItem key={comp.id} value={comp.id}>
                {comp.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            margin="dense"
            label="Notes"
            fullWidth
            multiline
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleAddOrUpdate} color="primary">{editing ? 'Update' : 'Add'}</Button>
        </DialogActions>
      </Dialog>

      <table border="1" style={{ marginTop: 20, width: '100%' }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Type</th>
            <th>Date</th>
            <th>Amount</th>
            <th>Reference</th>
            <th>Entity</th>
            <th>Company</th>
            <th>Notes</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {receipts.map((rec) => (
            <tr key={rec.id}>
              <td>{rec.id}</td>
              <td>{rec.transaction_type}</td>
              <td>{rec.date}</td>
              <td>{rec.amount}</td>
              <td>{rec.reference || '-'}</td>
              <td>{rec.entity || '-'}</td>
              <td>{rec.company || '-'}</td>
              <td>{rec.notes || '-'}</td>
              <td>
                <Button onClick={() => openEditDialog(rec)} size="small" variant="outlined" style={{ marginRight: 5 }}>
                  Edit
                </Button>
                <Button onClick={() => handleDeleteReceipt(rec.id)} size="small" variant="outlined" color="error">
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
