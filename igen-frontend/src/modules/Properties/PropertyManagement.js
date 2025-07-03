import React, { useState, useEffect } from 'react';
import API from '../../api/axios';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';

export default function PropertyManagement() {
  const [properties, setProperties] = useState([]);
  const [projects, setProjects] = useState([]);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState({
    project: '',
    name: '',
    location: '',
    purchase_date: '',
    purchase_price: '',
    expected_rent: '',
    status: 'active',
  });
  const [editForm, setEditForm] = useState({ ...form });

  const fetchProperties = async () => {
    try {
      const res = await API.get('properties/');
      setProperties(res.data);
    } catch (err) {
      console.error(err);
      alert('Error fetching properties');
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await API.get('projects/');
      setProjects(res.data);
    } catch (err) {
      console.error('Error fetching projects:', err);
    }
  };

  useEffect(() => {
    fetchProperties();
    fetchProjects();
  }, []);

  const handleAddProperty = async () => {
    if (!form.project || !form.name || !form.purchase_date) {
      alert('Project, Name, and Purchase Date are required');
      return;
    }
    try {
      await API.post('properties/', form);
      alert('Property added');
      fetchProperties();
      setOpen(false);
      setForm({ project: '', name: '', location: '', purchase_date: '', purchase_price: '', expected_rent: '', status: 'active' });
    } catch (err) {
      console.error('Add property error:', err.response?.data || err);
      alert('Failed to add property');
    }
  };

  const handleDeleteProperty = async (id) => {
    if (!window.confirm('Are you sure you want to delete this property?')) return;
    try {
      await API.delete(`properties/${id}/`);
      alert('Property deleted successfully');
      fetchProperties();
    } catch (err) {
      console.error('Delete error:', err.response?.data || err);
      alert('Failed to delete property');
    }
  };

  const handleEditProperty = (prop) => {
    setEditForm({
      id: prop.id,
      project: prop.project,
      name: prop.name,
      location: prop.location,
      purchase_date: prop.purchase_date,
      purchase_price: prop.purchase_price,
      expected_rent: prop.expected_rent,
      status: prop.status,
    });
    setEditOpen(true);
  };

  const handleUpdateProperty = async () => {
    try {
      await API.put(`properties/${editForm.id}/`, editForm);
      alert('Property updated successfully');
      setEditOpen(false);
      fetchProperties();
    } catch (err) {
      console.error('Update error:', err.response?.data || err);
      alert('Failed to update property');
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Property Management</h2>
      <Button variant="contained" color="primary" onClick={() => setOpen(true)}>Add Property</Button>

      {/* Add Property Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Add New Property</DialogTitle>
        <DialogContent>
          <TextField
            select margin="dense" label="Project" fullWidth value={form.project}
            onChange={(e) => setForm({ ...form, project: e.target.value })}
            SelectProps={{ native: true }}>
            <option value="">Select a project</option>
            {projects.map((proj) => (
              <option key={proj.id} value={proj.id}>
                {proj.name} (ID: {proj.id})
              </option>
            ))}
          </TextField>
          <TextField margin="dense" label="Name" fullWidth value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <TextField margin="dense" label="Location" fullWidth value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })} />
          <TextField margin="dense" label="Purchase Date (YYYY-MM-DD)" fullWidth value={form.purchase_date}
            onChange={(e) => setForm({ ...form, purchase_date: e.target.value })} />
          <TextField margin="dense" label="Purchase Price" type="number" fullWidth value={form.purchase_price}
            onChange={(e) => setForm({ ...form, purchase_price: e.target.value })} />
          <TextField margin="dense" label="Expected Rent" type="number" fullWidth value={form.expected_rent}
            onChange={(e) => setForm({ ...form, expected_rent: e.target.value })} />
          <TextField margin="dense" label="Status" fullWidth value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleAddProperty} color="primary">Add</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Property Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)}>
        <DialogTitle>Edit Property</DialogTitle>
        <DialogContent>
          <TextField select margin="dense" label="Project" fullWidth value={editForm.project}
            onChange={(e) => setEditForm({ ...editForm, project: e.target.value })}
            SelectProps={{ native: true }}>
            <option value="">Select a project</option>
            {projects.map((proj) => (
              <option key={proj.id} value={proj.id}>
                {proj.name} (ID: {proj.id})
              </option>
            ))}
          </TextField>
          <TextField margin="dense" label="Name" fullWidth value={editForm.name}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
          <TextField margin="dense" label="Location" fullWidth value={editForm.location}
            onChange={(e) => setEditForm({ ...editForm, location: e.target.value })} />
          <TextField margin="dense" label="Purchase Date (YYYY-MM-DD)" fullWidth value={editForm.purchase_date}
            onChange={(e) => setEditForm({ ...editForm, purchase_date: e.target.value })} />
          <TextField margin="dense" label="Purchase Price" type="number" fullWidth value={editForm.purchase_price}
            onChange={(e) => setEditForm({ ...editForm, purchase_price: e.target.value })} />
          <TextField margin="dense" label="Expected Rent" type="number" fullWidth value={editForm.expected_rent}
            onChange={(e) => setEditForm({ ...editForm, expected_rent: e.target.value })} />
          <TextField margin="dense" label="Status" fullWidth value={editForm.status}
            onChange={(e) => setEditForm({ ...editForm, status: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdateProperty} color="primary">Update</Button>
        </DialogActions>
      </Dialog>

      {/* Table */}
      <table border="1" style={{ marginTop: 20, width: '100%' }}>
        <thead>
          <tr>
            <th>Project ID</th>
            <th>Name</th>
            <th>Location</th>
            <th>Purchase Date</th>
            <th>Purchase Price</th>
            <th>Expected Rent</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {properties.map((prop) => (
            <tr key={prop.id}>
              <td>{prop.project}</td>
              <td>{prop.name}</td>
              <td>{prop.location}</td>
              <td>{prop.purchase_date}</td>
              <td>{prop.purchase_price}</td>
              <td>{prop.expected_rent || '-'}</td>
              <td>{prop.status}</td>
              <td>
                <Button onClick={() => handleEditProperty(prop)} size="small" variant="outlined" color="primary">
                  Edit
                </Button>
                <Button onClick={() => handleDeleteProperty(prop.id)} size="small" variant="outlined" color="error" style={{ marginLeft: 8 }}>
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
