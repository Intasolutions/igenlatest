import React, { useState, useEffect } from 'react';
import API from '../../api/axios';
import {
  Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem
} from '@mui/material';

export default function EntityManagement() {
  const [entities, setEntities] = useState([]);
  const [open, setOpen] = useState(false);
  const [editEntity, setEditEntity] = useState(null);
  const [form, setForm] = useState({
    name: '',
    entity_type: 'client',
    contact_email: '',
    contact_phone: '',
    address: '',
    notes: '',
  });

  const fetchEntities = async () => {
    try {
      const res = await API.get('entities/');
      setEntities(res.data);
    } catch (err) {
      console.error('Fetch error:', err.response?.data);
      alert('Error fetching entities');
    }
  };

  useEffect(() => {
    fetchEntities();
  }, []);

  const handleSave = async () => {
    if (!form.name || !form.entity_type) {
      alert('Name and Type are required');
      return;
    }

    try {
      if (editEntity) {
        await API.put(`entities/${editEntity.id}/`, form);
        alert('Entity updated');
      } else {
        await API.post('entities/', form);
        alert('Entity added');
      }
      setOpen(false);
      setForm({ name: '', entity_type: 'client', contact_email: '', contact_phone: '', address: '', notes: '' });
      setEditEntity(null);
      fetchEntities();
    } catch (err) {
      console.error('Save error:', err.response?.data);
      alert('Failed to save entity');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this entity?')) return;
    try {
      await API.delete(`entities/${id}/`);
      alert('Entity deleted');
      fetchEntities();
    } catch (err) {
      console.error('Delete error:', err.response?.data);
      alert('Failed to delete');
    }
  };

  const openEdit = (entity) => {
    setEditEntity(entity);
    setForm({
      name: entity.name,
      entity_type: entity.entity_type,
      contact_email: entity.contact_email,
      contact_phone: entity.contact_phone,
      address: entity.address,
      notes: entity.notes,
    });
    setOpen(true);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Entity Management</h2>

      <Button variant="contained" color="primary" onClick={() => { setEditEntity(null); setForm({ name: '', entity_type: 'client', contact_email: '', contact_phone: '', address: '', notes: '' }); setOpen(true); }}>
        Add Entity
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>{editEntity ? 'Edit Entity' : 'Add New Entity'}</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense" label="Name" fullWidth value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <TextField
            select margin="dense" label="Type" fullWidth value={form.entity_type}
            onChange={(e) => setForm({ ...form, entity_type: e.target.value })}
          >
            <MenuItem value="client">Client</MenuItem>
            <MenuItem value="vendor">Vendor</MenuItem>
            <MenuItem value="partner">Partner</MenuItem>
          </TextField>
          <TextField
            margin="dense" label="Email" type="email" fullWidth value={form.contact_email}
            onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
          />
          <TextField
            margin="dense" label="Phone" fullWidth value={form.contact_phone}
            onChange={(e) => setForm({ ...form, contact_phone: e.target.value })}
          />
          <TextField
            margin="dense" label="Address" fullWidth multiline value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
          <TextField
            margin="dense" label="Notes" fullWidth multiline value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} color="primary">{editEntity ? 'Update' : 'Add'}</Button>
        </DialogActions>
      </Dialog>

      <table border="1" style={{ marginTop: 20, width: '100%' }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Address</th>
            <th>Notes</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {entities.map((e) => (
            <tr key={e.id}>
              <td>{e.name}</td>
              <td>{e.entity_type}</td>
              <td>{e.contact_email || '-'}</td>
              <td>{e.contact_phone || '-'}</td>
              <td>{e.address || '-'}</td>
              <td>{e.notes || '-'}</td>
              <td>
                <Button onClick={() => openEdit(e)} size="small" variant="outlined" color="primary">Edit</Button>
                <Button onClick={() => handleDelete(e.id)} size="small" variant="outlined" color="error" style={{ marginLeft: 5 }}>Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
