import React, { useEffect, useState } from 'react';
import API from '../../api/axios';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Grid, MenuItem, Typography, Snackbar, Alert
} from '@mui/material';

export default function AddAssetDialog({ open, onClose, onSuccess }) {
  const [companies, setCompanies] = useState([]);
  const [properties, setProperties] = useState([]);
  const [projects, setProjects] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [formData, setFormData] = useState({
    company: '',
    property: '',
    project: '',
    name: '',
    category: '',
    purchase_date: '',
    purchase_price: '',
    warranty_expiry: '',
    location: '',
    maintenance_frequency: '',
    notes: '',
    service_schedule: [{ due_date: '', description: '' }]
  });

  useEffect(() => {
    if (open) fetchDropdownData();
  }, [open]);

  const fetchDropdownData = async () => {
    try {
      const [companyRes, propertyRes, projectRes] = await Promise.all([
        API.get('companies/'),
        API.get('properties/'),
        API.get('projects/')
      ]);

      setCompanies(Array.isArray(companyRes.data) ? companyRes.data : []);
      setProperties(Array.isArray(propertyRes.data) ? propertyRes.data : []);
      setProjects(Array.isArray(projectRes.data) ? projectRes.data : []);
    } catch (err) {
      console.error("Dropdown fetch failed:", err);
      setSnackbar({ open: true, message: 'Failed to load dropdowns', severity: 'error' });
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleScheduleChange = (index, field, value) => {
    const updated = [...formData.service_schedule];
    updated[index][field] = value;
    setFormData({ ...formData, service_schedule: updated });
  };

  const addServiceDate = () => {
    setFormData({
      ...formData,
      service_schedule: [...formData.service_schedule, { due_date: '', description: '' }]
    });
  };

  const handleSubmit = async () => {
    try {
      const payload = { ...formData };
      payload.service_dues = formData.service_schedule;
      delete payload.service_schedule;

      await API.post('assets/', payload);
      setSnackbar({ open: true, message: 'Asset created successfully', severity: 'success' });
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Submit error:", err.response?.data || err.message);
      setSnackbar({ open: true, message: 'Failed to save asset', severity: 'error' });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Add Asset</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <TextField select fullWidth label="Company" name="company" value={formData.company} onChange={handleChange}>
              <MenuItem value="">Select</MenuItem>
              {companies.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField select fullWidth label="Property" name="property" value={formData.property} onChange={handleChange}>
              <MenuItem value="">Select</MenuItem>
              {properties.map(p => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField select fullWidth label="Project" name="project" value={formData.project} onChange={handleChange}>
              <MenuItem value="">Select</MenuItem>
              {projects.map(p => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
            </TextField>
          </Grid>

          <Grid item xs={6}>
            <TextField fullWidth label="Asset Name" name="name" value={formData.name} onChange={handleChange} />
          </Grid>
          <Grid item xs={6}>
            <TextField fullWidth label="Category" name="category" value={formData.category} onChange={handleChange} />
          </Grid>

          <Grid item xs={6}>
            <TextField fullWidth label="Purchase Date" name="purchase_date" type="date" value={formData.purchase_date} InputLabelProps={{ shrink: true }} onChange={handleChange} />
          </Grid>
          <Grid item xs={6}>
            <TextField fullWidth label="Purchase Price" name="purchase_price" value={formData.purchase_price} onChange={handleChange} />
          </Grid>

          <Grid item xs={6}>
            <TextField fullWidth label="Warranty Expiry" name="warranty_expiry" type="date" value={formData.warranty_expiry} InputLabelProps={{ shrink: true }} onChange={handleChange} />
          </Grid>
          <Grid item xs={6}>
            <TextField fullWidth label="Location" name="location" value={formData.location} onChange={handleChange} />
          </Grid>

          <Grid item xs={6}>
            <TextField fullWidth label="Maintenance Frequency" name="maintenance_frequency" value={formData.maintenance_frequency} onChange={handleChange} />
          </Grid>
          <Grid item xs={6}>
            <TextField fullWidth label="Notes" name="notes" multiline rows={2} value={formData.notes} onChange={handleChange} />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle1">Service Due Dates</Typography>
          </Grid>

          {formData.service_schedule.map((entry, index) => (
            <React.Fragment key={index}>
              <Grid item xs={6}>
                <TextField type="date" fullWidth label="Due Date" InputLabelProps={{ shrink: true }} value={entry.due_date} onChange={(e) => handleScheduleChange(index, 'due_date', e.target.value)} />
              </Grid>
              <Grid item xs={6}>
                <TextField fullWidth label="Description" value={entry.description} onChange={(e) => handleScheduleChange(index, 'description', e.target.value)} />
              </Grid>
            </React.Fragment>
          ))}

          <Grid item xs={12}>
            <Button onClick={addServiceDate}>Add Date</Button>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}>Save</Button>
      </DialogActions>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
      </Snackbar>
    </Dialog>
  );
}
