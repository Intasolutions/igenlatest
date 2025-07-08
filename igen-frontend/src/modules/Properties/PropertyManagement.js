// Modern UI version of PropertiesPage with Edit Support

import React, { useEffect, useState } from 'react';
import API from '../../api/axios';
import {
  Box, Button, Card, CardContent, Chip, Dialog, DialogActions,
  DialogContent, DialogTitle, MenuItem, Snackbar, Alert,
  Tab, Tabs, TextField, Typography, IconButton, Tooltip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';

export default function PropertiesPage() {
  const [properties, setProperties] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState(0);
  const [files, setFiles] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, id: null, isActive: false });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [form, setForm] = useState({
    company: '', name: '', location: '', purchase_date: '', purchase_price: '',
    purpose: 'rental', status: 'vacant', remarks: '',
    config_bhk: '', config_bathroom: '', property_type: '', build_up_area_sqft: '', land_area_cents: '',
    monthly_rent: '', lease_start_date: '', lease_end_date: '', next_inspection_date: '',
    expected_sale_price: '', igen_service_charge: '',
    address_line1: '', address_line2: '', city: '', pincode: '', state: 'Kerala', country: 'India',
    key_date_label: '', key_date_due: '', key_date_remarks: '',
    is_active: true
  });

  const fetchData = async () => {
    try {
      const [propRes, compRes] = await Promise.all([
        API.get('properties/'),
        API.get('companies/')
      ]);
      setProperties(Array.isArray(propRes.data) ? propRes.data : propRes.data.results || []);
      setCompanies(compRes.data);
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to fetch data', severity: 'error' });
    }
  };

  useEffect(() => { fetchData(); }, []);

  const validateForm = () => {
    const requiredFields = ['company', 'name', 'location', 'purchase_date', 'purchase_price'];
    for (const field of requiredFields) {
      if (!form[field] || form[field].toString().trim() === '') {
        setSnackbar({
          open: true,
          message: `Please enter a valid ${field.replace('_', ' ')}`,
          severity: 'warning'
        });
        return false;
      }
    }

    if (form.pincode && !/^[0-9]{6}$/.test(form.pincode)) {
      setSnackbar({ open: true, message: 'Pincode must be a 6-digit number', severity: 'warning' });
      return false;
    }

    if (form.purchase_price && parseFloat(form.purchase_price) <= 0) {
      setSnackbar({ open: true, message: 'Purchase price must be greater than zero', severity: 'warning' });
      return false;
    }

    return true;
  };

  const handleAddOrUpdateProperty = async () => {
    if (!validateForm()) return;

    const formData = new FormData();
    Object.keys(form).forEach((key) => {
      const value = form[key]?.toString().trim();
      if (value !== undefined && value !== null && value !== '') formData.append(key, value);
    });
    formData.append('is_active', form.is_active);

    try {
      let response;
      if (isEditMode && editId) {
        response = await API.put(`properties/${editId}/`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        response = await API.post('properties/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      const propertyId = response.data.id;

      if (files) {
        for (let file of files) {
          const docData = new FormData();
          docData.append('property', propertyId);
          docData.append('file_name', file.name);
          docData.append('file_url', file);
          await API.post('property-documents/', docData);
        }
      }

      if (form.key_date_label && form.key_date_due) {
        await API.post('property-key-dates/', {
          property: propertyId,
          date_label: form.key_date_label,
          due_date: form.key_date_due,
          remarks: form.key_date_remarks,
        });
      }

      setSnackbar({ open: true, message: isEditMode ? 'Property updated successfully' : 'Property added successfully', severity: 'success' });
      setOpen(false);
      fetchData();
      resetForm();
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to save property', severity: 'error' });
    }
  };

  const resetForm = () => {
    setForm({
      company: '', name: '', location: '', purchase_date: '', purchase_price: '',
      purpose: 'rental', status: 'vacant', remarks: '',
      config_bhk: '', config_bathroom: '', property_type: '', build_up_area_sqft: '', land_area_cents: '',
      monthly_rent: '', lease_start_date: '', lease_end_date: '', next_inspection_date: '',
      expected_sale_price: '', igen_service_charge: '',
      address_line1: '', address_line2: '', city: '', pincode: '', state: 'Kerala', country: 'India',
      key_date_label: '', key_date_due: '', key_date_remarks: '',
      is_active: true
    });
    setFiles(null);
    setIsEditMode(false);
    setEditId(null);
  };

  const openEditDialog = (prop) => {
    setForm({
      ...form,
      ...prop
    });
    setEditId(prop.id);
    setIsEditMode(true);
    setOpen(true);
  };

  const proceedToggle = async (id, isActive) => {
    setSnackbar({
      open: true,
      message: isActive ? 'Deactivating property...' : 'Activating property...',
      severity: 'info'
    });

    try {
      await API.patch(`properties/${id}/`, { is_active: !isActive });
      fetchData();
      setSnackbar({
        open: true,
        message: isActive ? 'Property deactivated successfully' : 'Property activated successfully',
        severity: 'success'
      });
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to update property status', severity: 'error' });
    } finally {
      setConfirmDialog({ open: false, id: null, isActive: false });
    }
  };

  const handleToggleActive = (id, isActive) => {
    if (isActive) {
      setConfirmDialog({ open: true, id, isActive });
    } else {
      proceedToggle(id, isActive);
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'occupied': return 'primary';
      case 'vacant': return 'warning';
      case 'sold': return 'error';
      case 'not_for_rent': return 'default';
      default: return 'info';
    }
  };



  return (

    
    <Box p={5}>
      <Box display="flex" justifyContent="space-between" mb={3}>
        <Typography variant="h5" fontWeight="bold">Property Management</Typography>
        <Button variant="contained" onClick={() => { setOpen(true); resetForm(); }}>Add Property</Button>
      </Box>

      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          <TableContainer>
            <Table size="small">
              <TableHead sx={{ backgroundColor: '#e3f2fd' }}>
                <TableRow>
                  <TableCell><strong>ID</strong></TableCell>
                  <TableCell><strong>Company</strong></TableCell>
                  <TableCell><strong>Name</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Location</strong></TableCell>
                  <TableCell><strong>Type</strong></TableCell>
                  <TableCell><strong>Area</strong></TableCell>
                  <TableCell><strong>Rent/Sale</strong></TableCell>
                  <TableCell><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {properties.map(prop => (
                  <TableRow
                    key={prop.id}
                    sx={{ backgroundColor: prop.is_active ? '#e8f5e9' : '#fffde7' }}
                  >
                    <TableCell>{prop.id}</TableCell>
                    <TableCell>{prop.company_name}</TableCell>
                    <TableCell>{prop.name}</TableCell>
                   <TableCell>
  <Chip
    label={prop.status}
    color={getStatusColor(prop.status)}
    size="small"
    sx={{ textTransform: 'capitalize' }}
  />
</TableCell>

                    <TableCell>{prop.location}</TableCell>
                    <TableCell>{prop.property_type}</TableCell>
                    <TableCell>{prop.build_up_area_sqft} sqft</TableCell>
                    <TableCell>{prop.purpose === 'rental' ? prop.monthly_rent : prop.expected_sale_price}</TableCell>
                    <TableCell>
                      <Tooltip title="Edit">
                        <IconButton color="primary" onClick={() => openEditDialog(prop)}>
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={prop.is_active ? 'Deactivate' : 'Activate'}>
                        <IconButton color={prop.is_active ? 'error' : 'success'} onClick={() => handleToggleActive(prop.id, prop.is_active)}>
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Dialog component remains unchanged except for button text */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{isEditMode ? 'Edit Property' : 'Add Property'}</DialogTitle>
        <DialogContent>
           <DialogContent>
          <Tabs value={tab} onChange={(e, v) => setTab(v)}>
            <Tab label="PROPERTY DETAILS" />
            <Tab label="CONFIGURATION & FINANCIALS" />
            <Tab label="ADDRESS" />
            <Tab label="ATTACHMENTS & KEY DATES" />
          </Tabs>

          <Box hidden={tab !== 0} sx={{ mt: 2 }}>
            <TextField select fullWidth label="Company **" margin="dense" value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}>
              <MenuItem value="">Select a company</MenuItem>
              {companies.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
            </TextField>
            <TextField label="Property Name **" fullWidth margin="dense" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <TextField label="Location **" fullWidth margin="dense" value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })} />
            <TextField type="date" label="Purchase Date **" fullWidth margin="dense" InputLabelProps={{ shrink: true }}
              value={form.purchase_date} onChange={(e) => setForm({ ...form, purchase_date: e.target.value })} />
            <TextField label="Purchase Price **" type="number" fullWidth margin="dense" value={form.purchase_price}
              onChange={(e) => setForm({ ...form, purchase_price: e.target.value })} />
            <TextField select fullWidth label="Purpose *" margin="dense" value={form.purpose}
              onChange={(e) => setForm({ ...form, purpose: e.target.value })}>
              <MenuItem value="rental">Rental</MenuItem>
              <MenuItem value="sale">Sale</MenuItem>
              <MenuItem value="care">Care</MenuItem>
            </TextField>
            <TextField select fullWidth label="Status **" margin="dense" value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <MenuItem value="vacant">Vacant</MenuItem>
              <MenuItem value="occupied">Occupied</MenuItem>
              <MenuItem value="sold">Sold</MenuItem>
              <MenuItem value="not_for_rent">Not for Rent</MenuItem>
            </TextField>
          </Box>

          <Box hidden={tab !== 1} sx={{ mt: 2 }}>
            <TextField label="Bedrooms (BHK)" type="number" fullWidth margin="dense" value={form.config_bhk}
              onChange={(e) => setForm({ ...form, config_bhk: e.target.value })} />
            <TextField label="Bathrooms" type="number" fullWidth margin="dense" value={form.config_bathroom}
              onChange={(e) => setForm({ ...form, config_bathroom: e.target.value })} />
            <TextField select fullWidth label="Property Type" margin="dense" value={form.property_type}
              onChange={(e) => setForm({ ...form, property_type: e.target.value })}>
              <MenuItem value="">Select type</MenuItem>
              <MenuItem value="apartment">Apartment</MenuItem>
              <MenuItem value="villa">Villa</MenuItem>
              <MenuItem value="plot">Plot</MenuItem>
            </TextField>
            <TextField label="Built-up Area (Sq Ft)" type="number" fullWidth margin="dense" value={form.build_up_area_sqft}
              onChange={(e) => setForm({ ...form, build_up_area_sqft: e.target.value })} />
            <TextField label="Land Area (Cents)" type="number" fullWidth margin="dense" value={form.land_area_cents}
              onChange={(e) => setForm({ ...form, land_area_cents: e.target.value })} />
            {form.purpose === 'rental' && (
              <>
                <TextField label="Monthly Rent" type="number" fullWidth margin="dense" value={form.monthly_rent}
                  onChange={(e) => setForm({ ...form, monthly_rent: e.target.value })} />
                <TextField type="date" label="Lease Start Date" fullWidth margin="dense" InputLabelProps={{ shrink: true }}
                  value={form.lease_start_date} onChange={(e) => setForm({ ...form, lease_start_date: e.target.value })} />
                <TextField type="date" label="Lease End Date" fullWidth margin="dense" InputLabelProps={{ shrink: true }}
                  value={form.lease_end_date} onChange={(e) => setForm({ ...form, lease_end_date: e.target.value })} />
                <TextField type="date" label="Next Inspection Date" fullWidth margin="dense" InputLabelProps={{ shrink: true }}
                  value={form.next_inspection_date} onChange={(e) => setForm({ ...form, next_inspection_date: e.target.value })} />
              </>
            )}
            {form.purpose === 'sale' && (
              <TextField label="Expected Sale Price" type="number" fullWidth margin="dense" value={form.expected_sale_price}
                onChange={(e) => setForm({ ...form, expected_sale_price: e.target.value })} />
            )}
            <TextField label="iGen Service Charge" type="number" fullWidth margin="dense" value={form.igen_service_charge}
              onChange={(e) => setForm({ ...form, igen_service_charge: e.target.value })} />
          </Box>

          <Box hidden={tab !== 2} sx={{ mt: 2 }}>
            <TextField label="Address Line 1" fullWidth margin="dense" value={form.address_line1}
              onChange={(e) => setForm({ ...form, address_line1: e.target.value })} />
            <TextField label="Address Line 2" fullWidth margin="dense" value={form.address_line2}
              onChange={(e) => setForm({ ...form, address_line2: e.target.value })} />
            <TextField label="City" fullWidth margin="dense" value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })} />
            <TextField label="Pincode" fullWidth margin="dense" value={form.pincode}
              onChange={(e) => setForm({ ...form, pincode: e.target.value })} />
            <TextField label="State" fullWidth margin="dense" value={form.state}
              onChange={(e) => setForm({ ...form, state: e.target.value })} />
            <TextField label="Country" fullWidth margin="dense" value={form.country}
              onChange={(e) => setForm({ ...form, country: e.target.value })} />
          </Box>

          <Box hidden={tab !== 3} sx={{ mt: 2 }}>
            <TextField label="Remarks" fullWidth multiline rows={3} margin="dense"
              value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} />
            <Button variant="outlined" component="label" sx={{ mt: 1 }}>
              Upload Document(s)
              <input type="file" hidden multiple onChange={(e) => setFiles(e.target.files)} />
            </Button>
            {files && Array.from(files).map((f, i) => (
              <Typography key={i} variant="body2" sx={{ mt: 1 }}>Selected: {f.name}</Typography>
            ))}
            <Typography sx={{ mt: 3, fontWeight: 'bold' }}>Key Dates</Typography>
            <TextField label="Date Label" fullWidth margin="dense" value={form.key_date_label}
              onChange={(e) => setForm({ ...form, key_date_label: e.target.value })} />
            <TextField type="date" label="Due Date" fullWidth margin="dense" InputLabelProps={{ shrink: true }}
              value={form.key_date_due} onChange={(e) => setForm({ ...form, key_date_due: e.target.value })} />
            <TextField label="Remarks" fullWidth margin="dense" value={form.key_date_remarks}
              onChange={(e) => setForm({ ...form, key_date_remarks: e.target.value })} />
          </Box>
        </DialogContent>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleAddOrUpdateProperty} variant="contained">
            {isEditMode ? 'Update' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
<Dialog open={confirmDialog.open} onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}>
  <DialogTitle>Confirm Deactivation</DialogTitle>
  <DialogContent>
    <Typography>Are you sure you want to deactivate this property?</Typography>
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setConfirmDialog({ ...confirmDialog, open: false })}>Cancel</Button>
    <Button
      onClick={() => proceedToggle(confirmDialog.id, confirmDialog.isActive)}
      color="error"
      variant="contained"
    >
      Deactivate
    </Button>
  </DialogActions>
</Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
