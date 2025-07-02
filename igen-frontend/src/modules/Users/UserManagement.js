'use client';

import React, { useState, useEffect } from 'react';
import API from '../../api/axios';
import {
  Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, FormControl, InputLabel, Select, Checkbox,
  ListItemText, Typography, Paper, Chip, Avatar, IconButton, Tooltip
} from '@mui/material';

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LockResetIcon from '@mui/icons-material/LockReset';
import { motion, AnimatePresence } from 'framer-motion';
import { Stack } from '@mui/material';



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
    try {
      await API.post('users/', form);
      alert('User added successfully!');
      fetchUsers();
      setOpen(false);
      setForm({ user_id: '', full_name: '', role: 'ACCOUNTANT', password: '', company_ids: [] });
    } catch (err) {
      console.error('Add error:', err.response?.data);
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
      await API.put(`users/${editForm.id}/`, editForm);
      alert('User updated successfully!');
      fetchUsers();
      setEditOpen(false);
    } catch (err) {
      console.error('Edit error:', err.response?.data);
      alert('Failed to update user');
    }
  };

  const deactivateUser = async (id) => {
    try {
      await API.delete(`users/${id}/`);
      alert('User deactivated successfully!');
      fetchUsers();
    } catch (err) {
      console.error('Deactivate error:', err.response?.data);
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
      console.error('Reset error:', err.response?.data);
      alert('Failed to reset password');
    }
  };

  return (
    <div style={{ padding: 40,  backgroundColor: '#F9FAFB', minHeight: '100vh', }}>
      <Typography variant="h5" gutterBottom>User Management</Typography>
      <Button variant="contained" color="primary" onClick={() => setOpen(true)}>
        Add User
      </Button>

      <Paper elevation={1} style={{ marginTop: 20, padding: 16 }}>
       <AnimatePresence>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
  {users.map((u) => (
    <motion.div
  key={u.id}
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -10 }}
  transition={{ duration: 0.1 }}
  whileHover={{
    scale: 1.01,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
  }}
  style={{
    display: 'grid',
    gridTemplateColumns: '1fr 1fr auto',
    alignItems: 'center',
    gap: '16px',
    padding: '10px 6px',
    borderBottom: '1px solid #e0e0e0',
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    transition: 'box-shadow 0.3s ease, transform 0.3s ease',
  }}
>

      {/* Column 1: Avatar + Name + ID */}
      
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Avatar>{u.full_name.charAt(0)}</Avatar>
        <div>
          <Typography variant="subtitle1" fontWeight={600} fontSize={16}>
            {u.full_name}
          </Typography>
          <Typography variant="body2" color="text.secondary"fontSize={13}>
            {u.user_id}
          </Typography>
        </div>
      </div>

      {/* Column 2: Role + Companies */}
<div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
  {/* Role Chip (fixed style) */}


 
  <Chip
    label={u.role}
    color="primary"
    variant="outlined"
    sx={{
      alignSelf: 'flex-start',
      borderRadius: '16px',
      fontWeight: 500,
      fontSize:16,
      px: 2, // horizontal padding
    }}
  />

  {/* Company Chips (unchanged) */}
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
    {u.companies.map((c) => (
      
      <Chip
        key={c.id}
        label={c.name}
        size="small"
        sx={{
          backgroundColor: '#f1f1f1',
          fontWeight: 500,
          borderRadius: '12px',
          fontSize:13,
        }}
      />
    
    ))}
  </div>
</div>


      {/* Column 3: Actions */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <Tooltip title="Reset Password" arrow>
          <IconButton onClick={() => resetPassword(u.id)}>
            <LockResetIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Edit User" arrow>
          <IconButton onClick={() => openEditModal(u)}>
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Deactivate User" arrow>
          <IconButton onClick={() => deactivateUser(u.id)}>
            <DeleteIcon color="error" />
          </IconButton>
        </Tooltip>
      </div>
    </motion.div>
  ))}
  </div>
</AnimatePresence>

      </Paper>

      {/* Add/Edit Dialog */}
<Dialog
  open={open || editOpen}
  onClose={() => {
    setOpen(false);
    setEditOpen(false);
  }}
  fullWidth
  maxWidth="sm"
  PaperProps={{
    sx: {
      borderRadius: 4,
      p: 2,
    },
  }}
>
  <DialogTitle sx={{ fontSize: 20, fontWeight: 600, pb: 0 }}>
    {open ? 'Add New User' : 'Edit User'}
  </DialogTitle>

  <DialogContent sx={{ pt: 2 }}>
    <Stack spacing={3}>
      {open && (
        <TextField
          label="User ID"
          variant="outlined"
          fullWidth
          value={form.user_id}
          onChange={(e) => setForm({ ...form, user_id: e.target.value })}
          helperText="Unique ID for logging in"
        />
      )}

      <TextField
        label="Full Name"
        variant="outlined"
        fullWidth
        value={open ? form.full_name : editForm.full_name}
        onChange={(e) =>
          open
            ? setForm({ ...form, full_name: e.target.value })
            : setEditForm({ ...editForm, full_name: e.target.value })
        }
        helperText="The name that will be displayed"
      />

      {open && (
        <TextField
          label="Password"
          type="password"
          variant="outlined"
          fullWidth
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          helperText="Initial password for the user"
        />
      )}

      <FormControl fullWidth>
        <InputLabel>Role</InputLabel>
        <Select
          label="Role"
          value={open ? form.role : editForm.role}
          onChange={(e) =>
            open
              ? setForm({ ...form, role: e.target.value })
              : setEditForm({ ...editForm, role: e.target.value })
          }
        >
          {roleOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth>
        <InputLabel>Companies</InputLabel>
        <Select
          label="Companies"
          multiple
          value={open ? form.company_ids : editForm.company_ids}
          onChange={(e) =>
            open
              ? setForm({ ...form, company_ids: e.target.value })
              : setEditForm({ ...editForm, company_ids: e.target.value })
          }
          renderValue={(selected) =>
            companies
              .filter((c) => selected.includes(c.id))
              .map((c) => c.name)
              .join(', ')
          }
        >
          {companies.map((company) => (
            <MenuItem key={company.id} value={company.id}>
              <Checkbox
                checked={
                  (open ? form.company_ids : editForm.company_ids).includes(
                    company.id
                  )
                }
              />
              <ListItemText primary={company.name} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Stack>
  </DialogContent>

  <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 2, pt: 1 }}>
    <Button variant="outlined" onClick={() => {
      setOpen(false);
      setEditOpen(false);
    }}>
      Cancel
    </Button>
    <Button
      variant="contained"
      color="primary"
      onClick={open ? handleAddUser : handleEditUser}
    >
      {open ? 'Add' : 'Done'}
    </Button>
  </DialogActions>
</Dialog>
    </div>
  );
}
