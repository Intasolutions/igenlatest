import React, { useState, useEffect } from 'react';
import API from '../../api/axios';
import {
  Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, FormControl, InputLabel, Select
} from '@mui/material';

export default function BankManagement() {
  const [banks, setBanks] = useState([]);
  const [companies, setCompanies] = useState([]);

  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const [form, setForm] = useState({
    company_id: '',
    account_name: '',
    account_number: '',
    bank_name: '',
    ifsc: '',
  });

  const [editForm, setEditForm] = useState({
    id: '',
    company_id: '',
    account_name: '',
    account_number: '',
    bank_name: '',
    ifsc: '',
  });

  const fetchBanks = async () => {
    try {
      const res = await API.get('banks/');
      setBanks(res.data);
    } catch (err) {
      console.error('Fetch error:', err.response?.data);
      alert('Error fetching banks');
    }
  };

  const fetchCompanies = async () => {
    try {
      const res = await API.get('companies/');
      setCompanies(res.data);
    } catch (err) {
      console.error('Fetch companies error:', err.response?.data);
      alert('Error fetching companies');
    }
  };

  useEffect(() => {
    fetchBanks();
    fetchCompanies();
  }, []);

  const handleAddBank = async () => {
    if (!form.company_id || !form.account_name || !form.account_number || !form.bank_name || !form.ifsc) {
      alert('Please fill in all fields');
      return;
    }
    try {
      await API.post('banks/', form);
      alert('Bank added successfully!');
      fetchBanks();
      setOpen(false);
      setForm({ company_id: '', account_name: '', account_number: '', bank_name: '', ifsc: '' });
    } catch (err) {
      console.error('Add error details:', err.response?.data);
      alert('Failed to add bank: ' + (err.response?.data?.detail || 'Unknown error'));
    }
  };

  const openEditModal = (bank) => {
    setEditForm({
      id: bank.id,
      company_id: bank.company?.id || '',
      account_name: bank.account_name,
      account_number: bank.account_number,
      bank_name: bank.bank_name,
      ifsc: bank.ifsc,
    });
    setEditOpen(true);
  };

  const handleEditBank = async () => {
    if (!editForm.company_id || !editForm.account_name || !editForm.account_number || !editForm.bank_name || !editForm.ifsc) {
      alert('Please fill in all fields');
      return;
    }
    try {
      await API.put(`banks/${editForm.id}/`, {
        company_id: editForm.company_id,
        account_name: editForm.account_name,
        account_number: editForm.account_number,
        bank_name: editForm.bank_name,
        ifsc: editForm.ifsc,
      });
      alert('Bank updated successfully!');
      fetchBanks();
      setEditOpen(false);
    } catch (err) {
      console.error('Edit bank error details:', err.response?.data);
      alert('Failed to update bank');
    }
  };

  const deactivateBank = async (id) => {
    try {
      await API.delete(`banks/${id}/`);
      alert('Bank deactivated successfully!');
      fetchBanks();
    } catch (err) {
      console.error('Deactivate error details:', err.response?.data);
      alert('Failed to deactivate bank');
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Bank Management</h2>

      <Button variant="contained" color="primary" onClick={() => setOpen(true)}>
        Add Bank
      </Button>

      {/* Add Bank Modal */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Add New Bank</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel>Company</InputLabel>
            <Select
              value={form.company_id}
              label="Company"
              onChange={(e) => setForm({ ...form, company_id: e.target.value })}
            >
              {companies.map((company) => (
                <MenuItem key={company.id} value={company.id}>
                  {company.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Account Name"
            fullWidth
            value={form.account_name}
            onChange={(e) => setForm({ ...form, account_name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Account Number"
            fullWidth
            value={form.account_number}
            onChange={(e) => setForm({ ...form, account_number: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Bank Name"
            fullWidth
            value={form.bank_name}
            onChange={(e) => setForm({ ...form, bank_name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="IFSC"
            fullWidth
            value={form.ifsc}
            onChange={(e) => setForm({ ...form, ifsc: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleAddBank} color="primary">Add</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Bank Modal */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)}>
        <DialogTitle>Edit Bank</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel>Company</InputLabel>
            <Select
              value={editForm.company_id}
              label="Company"
              onChange={(e) => setEditForm({ ...editForm, company_id: e.target.value })}
            >
              {companies.map((company) => (
                <MenuItem key={company.id} value={company.id}>
                  {company.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Account Name"
            fullWidth
            value={editForm.account_name}
            onChange={(e) => setEditForm({ ...editForm, account_name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Account Number"
            fullWidth
            value={editForm.account_number}
            onChange={(e) => setEditForm({ ...editForm, account_number: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Bank Name"
            fullWidth
            value={editForm.bank_name}
            onChange={(e) => setEditForm({ ...editForm, bank_name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="IFSC"
            fullWidth
            value={editForm.ifsc}
            onChange={(e) => setEditForm({ ...editForm, ifsc: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button onClick={handleEditBank} color="primary">Save</Button>
        </DialogActions>
      </Dialog>

      <table border="1" style={{ marginTop: 20, width: '100%' }}>
        <thead>
          <tr>
            <th>Company</th>
            <th>Account Name</th>
            <th>Account Number</th>
            <th>Bank Name</th>
            <th>IFSC</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {banks.map((b) => (
            <tr key={b.id}>
              <td>{b.company?.name}</td>
              <td>{b.account_name}</td>
              <td>{b.account_number}</td>
              <td>{b.bank_name}</td>
              <td>{b.ifsc}</td>
              <td>
                <Button onClick={() => deactivateBank(b.id)} variant="outlined" color="error" size="small">
                  Deactivate
                </Button>
                <Button onClick={() => openEditModal(b)} variant="outlined" color="primary" size="small" style={{ marginLeft: 5 }}>
                  Edit
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
