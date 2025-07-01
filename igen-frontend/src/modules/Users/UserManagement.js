import React, { useState, useEffect } from 'react';
import API from '../../api/axios';
import {
  Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, FormControl, InputLabel, Select, Checkbox, ListItemText
} from '@mui/material';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const [form, setForm] = useState({
    user_id: '',
    full_name: '',
    role: 'ACCOUNTANT',
    password: '',
    company_ids: [],
  });

  const [editForm, setEditForm] = useState({
    id: '',
    full_name: '',
    role: '',
    company_ids: [],
  });

  const roleOptions = [
    { value: 'SUPER_USER', label: 'Super User' },
    { value: 'CENTER_HEAD', label: 'Center Head' },
    { value: 'ACCOUNTANT', label: 'Accountant' },
    { value: 'PROPERTY_MANAGER', label: 'Property Manager' },
  ];

  const fetchUsers = async () => {
    try {
      const res = await API.get('users/');
      setUsers(res.data);
    } catch (err) {
      console.error('Fetch error:', err.response?.data);
      alert('Error fetching users');
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
    fetchUsers();
    fetchCompanies();
  }, []);

  const handleAddUser = async () => {
    if (!form.user_id || !form.password || !form.full_name) {
      alert('Please fill in all fields');
      return;
    }
    console.log('Submitting user payload:', form);
    try {
      await API.post('users/', form);
      alert('User added successfully!');
      fetchUsers();
      setOpen(false);
      setForm({ user_id: '', full_name: '', role: 'ACCOUNTANT', password: '', company_ids: [] });
    } catch (err) {
      console.error('Add error details:', err.response?.data);
      alert('Failed to add user: ' + (err.response?.data?.detail || 'Unknown error'));
    }
  };

  const openEditModal = (user) => {
    setEditForm({
      id: user.id,
      full_name: user.full_name,
      role: user.role,
      company_ids: user.companies.map(c => c.id),
    });
    setEditOpen(true);
  };

  const handleEditUser = async () => {
    if (!editForm.full_name || !editForm.role) {
      alert('Please fill in all fields');
      return;
    }
    try {
      await API.put(`users/${editForm.id}/`, {
        full_name: editForm.full_name,
        role: editForm.role,
        company_ids: editForm.company_ids,
      });
      alert('User updated successfully!');
      fetchUsers();
      setEditOpen(false);
    } catch (err) {
      console.error('Edit error details:', err.response?.data);
      alert('Failed to update user');
    }
  };

  const deactivateUser = async (id) => {
    try {
      await API.delete(`users/${id}/`);
      alert('User deactivated successfully!');
      fetchUsers();
    } catch (err) {
      console.error('Deactivate error details:', err.response?.data);
      alert('Failed to deactivate user');
    }
  };

  const resetPassword = async (id) => {
    const newPassword = prompt('Enter new password:');
    if (!newPassword) return;
    try {
      await API.post(`users/${id}/reset_password/`, { new_password: newPassword });
      alert('Password reset successfully!');
    } catch (err) {
      console.error('Reset error details:', err.response?.data);
      alert('Failed to reset password');
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>User Management</h2>

      <Button variant="contained" color="primary" onClick={() => setOpen(true)}>
        Add User
      </Button>

      {/* Add User Modal */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Add New User</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="User ID"
            fullWidth
            value={form.user_id}
            onChange={(e) => setForm({ ...form, user_id: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Full Name"
            fullWidth
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Password"
            type="password"
            fullWidth
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Role</InputLabel>
            <Select
              value={form.role}
              label="Role"
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              {roleOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel>Companies</InputLabel>
            <Select
              multiple
              value={form.company_ids}
              onChange={(e) => setForm({ ...form, company_ids: e.target.value })}
              renderValue={(selected) =>
                companies.filter(c => selected.includes(c.id)).map(c => c.name).join(', ')
              }
            >
              {companies.map((company) => (
                <MenuItem key={company.id} value={company.id}>
                  <Checkbox checked={form.company_ids.includes(company.id)} />
                  <ListItemText primary={company.name} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleAddUser} color="primary">Add</Button>
        </DialogActions>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)}>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Full Name"
            fullWidth
            value={editForm.full_name}
            onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Role</InputLabel>
            <Select
              value={editForm.role}
              label="Role"
              onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
            >
              {roleOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel>Companies</InputLabel>
            <Select
              multiple
              value={editForm.company_ids}
              onChange={(e) => setEditForm({ ...editForm, company_ids: e.target.value })}
              renderValue={(selected) =>
                companies.filter(c => selected.includes(c.id)).map(c => c.name).join(', ')
              }
            >
              {companies.map((company) => (
                <MenuItem key={company.id} value={company.id}>
                  <Checkbox checked={editForm.company_ids.includes(company.id)} />
                  <ListItemText primary={company.name} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button onClick={handleEditUser} color="primary">Save</Button>
        </DialogActions>
      </Dialog>

      <table border="1" style={{ marginTop: 20, width: '100%' }}>
        <thead>
          <tr>
            <th>User ID</th>
            <th>Full Name</th>
            <th>Role</th>
            <th>Active</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.user_id}</td>
              <td>{u.full_name}</td>
              <td>{u.role}</td>
              <td>{u.is_active ? 'Yes' : 'No'}</td>
              <td>
                <Button onClick={() => deactivateUser(u.id)} variant="outlined" color="error" size="small">
                  Deactivate
                </Button>
                <Button onClick={() => resetPassword(u.id)} variant="outlined" color="secondary" size="small" style={{ marginLeft: 5 }}>
                  Reset Password
                </Button>
                <Button onClick={() => openEditModal(u)} variant="outlined" color="primary" size="small" style={{ marginLeft: 5 }}>
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
