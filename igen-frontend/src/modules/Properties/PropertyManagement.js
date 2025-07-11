
import React, { useEffect, useState } from 'react';
import API from '../../api/axios';
import {
  Box, Button, Card, CardContent, Chip, Dialog, DialogActions,
  DialogContent, DialogTitle, MenuItem, Snackbar, Alert,
  TextField, Typography, IconButton, Tooltip, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Stepper, Step, StepLabel,
Collapse, Grid, Link// <-- ✅ Add this
} from '@mui/material';
import { Visibility } from '@mui/icons-material';


import { Edit, Delete, KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';  // <-- ✅ Add arrow icons


export default function PropertiesPage() {
  const [properties, setProperties] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, id: null, isActive: false });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [activeStep, setActiveStep] = useState(0);
  const [expandedRow, setExpandedRow] = useState(null);
  

  

  const steps = ['Property Details', 'Configuration & Financials', 'Address', 'Attachments & Key Dates'];

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
      const propertyList = Array.isArray(propRes.data) ? propRes.data : propRes.data.results;
setProperties(Array.isArray(propertyList) ? propertyList : []);

      setCompanies(compRes.data);
    } catch {
      setSnackbar({ open: true, message: 'Failed to fetch data', severity: 'error' });
    }
  };

  useEffect(() => { fetchData(); }, []);

  const validateForm = () => {
    const requiredFields = ['company', 'name', 'location', 'purchase_date', 'purchase_price'];
    for (const field of requiredFields) {
      if (!form[field] || form[field].toString().trim() === '') {
        setSnackbar({ open: true, message: `Please enter a valid ${field.replace('_', ' ')}`, severity: 'warning' });
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
    Object.entries(form).forEach(([key, val]) => {
      if (val !== null && val !== undefined && val !== '') formData.append(key, val);
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
    } catch {
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
    setActiveStep(0);
  };

  const openEditDialog = (prop) => {
    setForm({ ...form, ...prop });
    setEditId(prop.id);
    setIsEditMode(true);
    setOpen(true);
  };

  const proceedToggle = async (id, isActive) => {
    setSnackbar({ open: true, message: isActive ? 'Deactivating...' : 'Activating...', severity: 'info' });
    try {
      await API.patch(`properties/${id}/`, { is_active: !isActive });
      fetchData();
      setSnackbar({ open: true, message: isActive ? 'Property deactivated' : 'Property activated', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Status update failed', severity: 'error' });
    } finally {
      setConfirmDialog({ open: false, id: null, isActive: false });
    }
  };

  const handleToggleActive = (id, isActive) => {
    if (isActive) setConfirmDialog({ open: true, id, isActive });
    else proceedToggle(id, isActive);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'occupied': return 'primary';
      case 'vacant': return 'warning';
      case 'sold': return 'error';
      case 'not_for_rent': return 'default';
      default: return 'info';
    }
  };
const isStepValid = () => {
  switch (activeStep) {
    case 0:
      return form.company && form.name && form.location && form.purchase_date && form.purchase_price && form.purpose && form.status;

    case 1: {
      const { config_bhk, config_bathroom, property_type, lease_start_date, lease_end_date, next_inspection_date, purpose } = form;

      if (!config_bhk || !config_bathroom || !property_type) return false;

      if (purpose === 'rental' && lease_start_date) {
        const start = new Date(lease_start_date);

        if (lease_end_date && new Date(lease_end_date) <= start) return false;
        if (next_inspection_date && new Date(next_inspection_date) <= start) return false;
      }

      return true;
    }

    case 2:
      return form.address_line1 && form.city && form.pincode && form.state && form.country;

    default:
      return true;
  }
};

const handleNext = () => {
  if (!isStepValid()) {
    let message = 'Please complete required fields';
    if (activeStep === 1 && form.purpose === 'rental') {
      if (form.lease_start_date && form.lease_end_date && new Date(form.lease_end_date) <= new Date(form.lease_start_date)) {
        message = 'Lease End Date must be after Lease Start Date';
      } else if (form.lease_start_date && form.next_inspection_date && new Date(form.next_inspection_date) <= new Date(form.lease_start_date)) {
        message = 'Next Inspection Date must be after Lease Start Date';
      }
    }
    setSnackbar({ open: true, message, severity: 'warning' });
    return;
  }

  if (activeStep < steps.length - 1) {
    setActiveStep((prev) => prev + 1);
  } else {
    handleAddOrUpdateProperty();
  }
};

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };
const renderStepContent = (step) => {
  switch (step) {
    case 0:
      return (
        <Box p={2}>
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
      );

    case 1:
      return (
        <Box p={2}>
       <TextField
  label="Bedrooms (BHK)"
  type="number"
  fullWidth
  margin="dense"
  value={form.config_bhk}
  onChange={(e) => setForm({ ...form, config_bhk: e.target.value })}
/>
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
      );

    case 2:
      return (
        <Box p={2}>
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
      );

    case 3:
      return (
        <Box p={2}>
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
      );

    default:
      return null;
  }
};





  return (

    
    <div className="p-[95px]">
      <div className="flex justify-between items-center mb-6">
        <Typography variant="h5" fontWeight="bold">Cost Property Management</Typography>
        <Button variant="contained" color="primary" onClick={() => setOpen(true)}>Add Property</Button>
      </div>
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
                {properties.map((prop) => (
                  <React.Fragment key={prop.id}>
                    <TableRow
                      sx={{ backgroundColor: prop.is_active ? '#e8f5e9' : '#fffde7' }}
                    >
                      <TableCell>
                        <IconButton size="small" onClick={() => setExpandedRow(expandedRow === prop.id ? null : prop.id)}>
                          {expandedRow === prop.id ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                        </IconButton>
                        {prop.id}
                      </TableCell>
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
                 <TableRow sx={{ backgroundColor: '#2f9dd557' }}>
                      <TableCell colSpan={9} sx={{ p: 0, border: 0 }}>
                        <Collapse in={expandedRow === prop.id} timeout="auto" unmountOnExit>
                          <Box margin={2}>
                            <Typography variant="subtitle2"fontWeight="bold" mb={3} gutterBottom>Property Details</Typography>
                           <Grid container spacing={3}>
                              <Grid item xs={12} sm={6}><Typography><strong>Lease Start:</strong> {prop.lease_start_date || '-'}</Typography></Grid>
                              <Grid item xs={12} sm={6}><Typography><strong>Lease End:</strong> {prop.lease_end_date || '-'}</Typography></Grid>
                              <Grid item xs={12} sm={6}><Typography><strong>Next Inspection:</strong> {prop.next_inspection_date || '-'}</Typography></Grid>
                              <Grid item xs={12} sm={6}><Typography><strong>Land Area (Cents):</strong> {prop.land_area_cents}</Typography></Grid>
                              <Grid item xs={12} sm={6}><Typography><strong>Service Charge:</strong> {prop.igen_service_charge}</Typography></Grid>
                              <Grid item xs={12}><Typography><strong>Address:</strong> {prop.address_line1}, {prop.address_line2}, {prop.city}, {prop.state} - {prop.pincode}, {prop.country}</Typography></Grid>
                              <Grid item xs={12}><Typography><strong>Remarks:</strong> {prop.remarks || 'None'}</Typography></Grid>
                              <Grid item xs={12} sm={6}><Typography><strong>Key Date:</strong> {prop.key_date_label || '-'} - {prop.key_date_due || '-'}</Typography></Grid>
                              <Grid item xs={12} sm={6}><Typography><strong>Key Remarks:</strong> {prop.key_date_remarks || '-'}</Typography></Grid>
                       
{Array.isArray(prop.document_urls) && prop.document_urls.length > 0 ? (
  <Grid item xs={12}>
    <Typography sx={{  fontWeight: 'bold' }}>Document Preview</Typography>
    <Grid container spacing={2} sx={{ mt: 1 }}>
  {prop.document_urls.map((url, index) => {
  const fullUrl = url?.startsWith('http') ? url : `http://localhost:8000${url}`;
  if (!url) return null;

  const isPDF = fullUrl.toLowerCase().endsWith('.pdf');

  return (
    <Grid item xs={6} sm={4} md={3} key={index}>
      <Box
        sx={{
          border: '1px solid #ddd',
          borderRadius: 2,
          p: 1,
          boxShadow: 1,
          backgroundColor: '#fafafa',
          textAlign: 'center',
          transition: 'transform 0.2s',
          '&:hover': { transform: 'scale(1.03)', boxShadow: 3 }
        }}
      >
        {isPDF ? (
          <Box
            sx={{
              height: 100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#f5f5f5',
              borderRadius: 6,
              fontWeight: 'bold',
              color: '#1976d2',
              fontSize: 14
            }}
          >
            PDF Document
          </Box>
        ) : (
          <img
            src={fullUrl}
            alt={`Document ${index + 1}`}
            style={{
              width: '100%',
              height: 100,
              objectFit: 'cover',
              borderRadius: 6
            }}
            onError={(e) => {
              e.target.style.display = 'none';
              console.warn('Invalid image URL:', fullUrl);
            }}
          />
        )}

        <Link
          href={fullUrl}
          target="_blank"
          rel="noopener"
          underline="hover"
          sx={{ display: 'block', mt: 1, fontSize: 13 }}
        >
          View / Download
        </Link>
      </Box>
    </Grid>
  );
})}

    </Grid>
  </Grid>
) : (
  <Grid item xs={12}>
    <Typography sx={{ mt: 2, fontStyle: 'italic', color: 'text.secondary' }}>
      No documents available
    </Typography>
  </Grid>
)}




                            </Grid>
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Dialog component remains unchanged except for button text */}
 <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth   PaperProps={{ sx: { borderRadius: 3, p: 2 } }}>
        <DialogTitle sx={{ fontWeight: 'bold' }}>{isEditMode ? 'Edit Property' : 'Add Property'}</DialogTitle>
        <DialogContent>
          <Stepper activeStep={activeStep} alternativeLabel>
  {steps.map((label, index) => (
    <Step key={label}>
      <StepLabel
        StepIconProps={{
          sx: {
            color: activeStep === index ? '#00b16a' : 'rgba(0, 0, 0, 0.38)' // Green when active, grey otherwise
          }
        }}
      >
        {label}
      </StepLabel>
    </Step>
  ))}
</Stepper>
          {renderStepContent(activeStep)}
        </DialogContent>
        <DialogActions>
          {activeStep > 0 && <Button onClick={handleBack}>Back</Button>}
          <Button variant="contained" onClick={handleNext} disabled={!isStepValid()}>
            {activeStep === steps.length - 1 ? (isEditMode ? 'Update' : 'Save') : 'Next'}
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
    </div>
  );
}
