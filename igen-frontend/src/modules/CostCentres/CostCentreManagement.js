import React, { useState, useEffect } from 'react';
import API from '../../api/axios';
import {
  Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem
} from '@mui/material';

export default function CostCentreManagement() {
  const [costCentres, setCostCentres] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const [form, setForm] = useState({
    company: '',
    name: '',
    code: '',
    description: '',
  });

  const [editForm, setEditForm] = useState({
    id: '',
    name: '',
    code: '',
    description: '',
  });

  const fetchCostCentres = async () => {
    try {
      const res = await API.get('cost-centres/');
      setCostCentres(res.data);
    } catch (err) {
      alert('Error fetching cost centres');
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
    fetchCostCentres();
    fetchCompanies();
  }, []);

  const handleAddCostCentre = async () => {
    if (!form.company || !form.name || !form.code) {
      alert('Company, Name, and Code are required');
      return;
    }
    try {
      await API.post('cost-centres/', form);
      alert('Cost Centre added');
      fetchCostCentres();
      setOpen(false);
      setForm({ company: '', name: '', code: '', description: '' });
    } catch (err) {
      alert('Failed to add cost centre');
    }
  };

  const openEditModal = (costCentre) => {
    setEditForm({
      id: costCentre.id,
      name: costCentre.name,
      code: costCentre.code,
      description: costCentre.description,
    });
    setEditOpen(true);
  };

  const handleEditCostCentre = async () => {
    if (!editForm.name || !editForm.code) {
      alert('Name and Code are required');
      return;
    }
    try {
      await API.put(`cost-centres/${editForm.id}/`, {
        name: editForm.name,
        code: editForm.code,
        description: editForm.description,
      });
      alert('Cost Centre updated');
      fetchCostCentres();
      setEditOpen(false);
    } catch (err) {
      alert('Failed to update cost centre');
    }
  };

  const deleteCostCentre = async (id) => {
    try {
      await API.delete(`cost-centres/${id}/`);
      alert('Cost Centre deleted');
      fetchCostCentres();
    } catch (err) {
      alert('Delete failed');
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Cost Centre Management</h2>

      <Button variant="contained" color="primary" onClick={() => setOpen(true)}>
        Add Cost Centre
      </Button>

      {/* Add Cost Centre Modal */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Add Cost Centre</DialogTitle>
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
            margin="dense" label="Cost Centre Name" fullWidth value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <TextField
            margin="dense" label="Code" fullWidth value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
          />
          <TextField
            margin="dense" label="Description" fullWidth multiline value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleAddCostCentre} color="primary">Add</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Cost Centre Modal */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)}>
        <DialogTitle>Edit Cost Centre</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense" label="Cost Centre Name" fullWidth value={editForm.name}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
          />
          <TextField
            margin="dense" label="Code" fullWidth value={editForm.code}
            onChange={(e) => setEditForm({ ...editForm, code: e.target.value })}
          />
          <TextField
            margin="dense" label="Description" fullWidth multiline value={editForm.description}
            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button onClick={handleEditCostCentre} color="primary">Save</Button>
        </DialogActions>
      </Dialog>

      <table border="1" style={{ marginTop: 20, width: '100%' }}>
        <thead>
          <tr>
            <th>Company</th>
            <th>Name</th>
            <th>Code</th>
            <th>Description</th>
            <th>Active</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {costCentres.map((c) => (
            <tr key={c.id}>
              <td>{c.company_name}</td>
              <td>{c.name}</td>
              <td>{c.code}</td>
              <td>{c.description}</td>
              <td>{c.is_active ? 'Yes' : 'No'}</td>
              <td>
                <Button onClick={() => deleteCostCentre(c.id)} size="small" variant="outlined" color="error">
                  Delete
                </Button>
                <Button onClick={() => openEditModal(c)} size="small" variant="outlined" color="primary" style={{ marginLeft: 5 }}>
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
