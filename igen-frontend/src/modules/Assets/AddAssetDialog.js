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
    company_id: '',
    property_id: '',
    project_id: '',
    asset_name: '',
    tag_id: '',
    service_schedule: [{ service_due_date: '', description: '' }]
  });

  useEffect(() => {
    if (open) {
      fetchDropdownData();
    }
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
      setSnackbar({ open: true, message: 'Failed to load dropdowns', severity: 'error' });
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleScheduleChange = (index, field, value) => {
    const updatedSchedule = [...formData.service_schedule];
    updatedSchedule[index][field] = value;
    setFormData({ ...formData, service_schedule: updatedSchedule });
  };

  const addServiceDate = () => {
    setFormData({
      ...formData,
      service_schedule: [...formData.service_schedule, { service_due_date: '', description: '' }]
    });
  };

  const removeServiceDate = (index) => {
    const updated = formData.service_schedule.filter((_, i) => i !== index);
    setFormData({ ...formData, service_schedule: updated });
  };

  const handleSubmit = async () => {
    try {
      await API.post('assets/', formData);
      setSnackbar({ open: true, message: 'Asset created successfully', severity: 'success' });
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: 'Failed to save asset', severity: 'error' });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Add Asset</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <TextField select fullWidth label="Company" name="company_id" value={formData.company_id} onChange={handleChange}>
              <MenuItem value="">Select</MenuItem>
              {companies.map(c => (
                <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <TextField select fullWidth label="Property" name="property_id" value={formData.property_id} onChange={handleChange}>
              <MenuItem value="">Select</MenuItem>
              {properties.map(p => (
                <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <TextField select fullWidth label="Project" name="project_id" value={formData.project_id} onChange={handleChange}>
              <MenuItem value="">Select</MenuItem>
              {projects.map(p => (
                <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Asset Name" name="asset_name" value={formData.asset_name} onChange={handleChange} />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Tag ID / Serial Number" name="tag_id" value={formData.tag_id} onChange={handleChange} />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle1" sx={{ mt: 2 }}>Service Due Dates</Typography>
          </Grid>

          {formData.service_schedule.map((entry, index) => (
            <React.Fragment key={index}>
              <Grid item xs={6}>
                <TextField type="date" label="Due Date" fullWidth InputLabelProps={{ shrink: true }} value={entry.service_due_date} onChange={(e) => handleScheduleChange(index, 'service_due_date', e.target.value)} />
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