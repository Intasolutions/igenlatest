import React, { useEffect, useState } from 'react';
import API from '../../api/axios';
import {
  Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Tabs, Tab, Box, Typography
} from '@mui/material';

export default function PropertiesPage() {
  const [properties, setProperties] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState(0);
  const [files, setFiles] = useState(null);
  const [form, setForm] = useState({
    company: '', name: '', location: '', purchase_date: '', purchase_price: '',
    purpose: 'rental', status: 'vacant', remarks: '',
    config_bhk: '', config_bathroom: '', property_type: '', build_up_area_sqft: '', land_area_cents: '',
    monthly_rent: '', lease_start_date: '', lease_end_date: '', next_inspection_date: '',
    expected_sale_price: '', igen_service_charge: '',
    address_line1: '', address_line2: '', city: '', pincode: '', state: 'Kerala', country: 'India',
    key_date_label: '', key_date_due: '', key_date_remarks: '',
  });

  const fetchData = async () => {
    try {
      const [propRes, compRes] = await Promise.all([
        API.get('properties/'),
        API.get('companies/')
      ]);
      console.log("Fetched properties response:", propRes.data);

      if (Array.isArray(propRes.data)) {
        setProperties(propRes.data);
      } else if (propRes.data.results && Array.isArray(propRes.data.results)) {
        setProperties(propRes.data.results);
      } else {
        console.error("Unexpected properties response:", propRes.data);
        setProperties([]);
      }

      setCompanies(compRes.data);
    } catch (err) {
      console.error("Fetch error:", err);
      alert("Failed to fetch data");
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAddProperty = async () => {
    const formData = new FormData();
    Object.keys(form).forEach((key) => {
      let value = form[key];
      if (typeof value === "string") value = value.trim();
      if (value !== undefined && value !== null && value !== "") formData.append(key, value);
    });

    try {
      const response = await API.post('properties/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const propertyId = response.data.id;
      alert('Property added successfully');

      if (files) {
        for (let i = 0; i < files.length; i++) {
          const docData = new FormData();
          docData.append('property', propertyId);
          docData.append('file_name', files[i].name);
          docData.append('file_url', files[i]);
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

      setOpen(false);
      fetchData();
      resetForm();
    } catch (err) {
      console.error('Add property error:', err.response?.data || err);
      alert(`Failed to save property: ${JSON.stringify(err.response?.data)}`);
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
    });
    setFiles(null);
  };

  const handleToggleActive = async (id, isActive) => {
    const confirmMsg = isActive ? 'Deactivate this property?' : 'Activate this property?';
    if (!window.confirm(confirmMsg)) return;
    try {
      await API.patch(`properties/${id}/`, { is_active: !isActive });
      alert(isActive ? 'Deactivated' : 'Activated');
      fetchData();
    } catch (err) {
      console.error('Toggle error:', err.response?.data || err);
      alert('Failed to update property status');
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <Typography variant="h4" gutterBottom>Property Master</Typography>
      <Button variant="contained" onClick={() => setOpen(true)}>Add Property</Button>

      <table border="1" style={{ marginTop: 20, width: '100%' }}>
        <thead>
          <tr>
            <th>ID</th><th>Company</th><th>Name</th><th>Location</th><th>Purchase Date</th>
            <th>Purchase Price</th><th>Purpose</th><th>Status</th>
            <th>Property Type</th><th>BHK</th><th>Bathrooms</th>
            <th>Built-up Area</th><th>Land Area</th>
            <th>Rent/Sale Price</th><th>iGen Charge</th>
            <th>Address</th><th>Documents</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(properties) && properties.length > 0 ? (
            properties.map((prop) => (
              <tr key={prop.id}>
                <td>{prop.id}</td>
                <td>{prop.company_name}</td>
                <td>{prop.name}</td>
                <td>{prop.location}</td>
                <td>{prop.purchase_date}</td>
                <td>{prop.purchase_price}</td>
                <td>{prop.purpose}</td>
                <td>{prop.status}</td>
                <td>{prop.property_type}</td>
                <td>{prop.config_bhk}</td>
                <td>{prop.config_bathroom}</td>
                <td>{prop.build_up_area_sqft}</td>
                <td>{prop.land_area_cents}</td>
                <td>{prop.purpose === 'rental' ? prop.monthly_rent : prop.expected_sale_price}</td>
                <td>{prop.igen_service_charge}</td>
                <td>{[prop.address_line1, prop.city, prop.pincode].filter(Boolean).join(", ")}</td>
                <td>
                  {prop.documents?.length > 0 ? (
                    prop.documents.map(doc => (
                      <div key={doc.id}>
                        <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                          {doc.file_name}
                        </a>
                      </div>
                    ))
                  ) : (
                    "No Docs"
                  )}
                </td>
                <td>
                  <Button onClick={() => handleToggleActive(prop.id, prop.is_active)} size="small" color="error">
                    {prop.is_active ? 'Deactivate' : 'Activate'}
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="18" style={{ textAlign: 'center' }}>No properties found</td>
            </tr>
          )}
        </tbody>
      </table>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add Property</DialogTitle>
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

        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleAddProperty} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
