import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, MenuItem, FormControl, InputLabel, Select
} from '@mui/material';
import API from '../../api/axios';

const AddContractDialog = ({ open, handleClose, onContractAdded }) => {
  const [formData, setFormData] = useState({
    vendor_id: '',
    cost_centre_id: '',
    entity_id: '',
    asset_id: '',
    description: '',
    contract_date: '',
    start_date: '',
    end_date: '',
    document: null,
  });

  const [vendors, setVendors] = useState([]);
  const [costCentres, setCostCentres] = useState([]);
  const [entities, setEntities] = useState([]);
  const [assets, setAssets] = useState([]);

  useEffect(() => {
    API.get('vendors/').then(res => setVendors(res.data));
    API.get('cost-centres/').then(res => setCostCentres(res.data));
    API.get('entities/').then(res => setEntities(res.data));
    API.get('assets/').then(res => setAssets(res.data));
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = () => {
    const payload = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value) payload.append(key, value);
    });

    API.post('contracts/', payload)
      .then(() => {
        onContractAdded(); // refresh the table
        handleClose();     // close modal
      })
      .catch(err => console.error('Error saving contract:', err));
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Create New Contract</DialogTitle>
      <DialogContent dividers>
        <FormControl fullWidth margin="dense">
          <InputLabel>Vendor</InputLabel>
          <Select name="vendor_id" value={formData.vendor_id} onChange={handleChange} required>
            {vendors.map(v => <MenuItem key={v.id} value={v.id}>{v.name}</MenuItem>)}
          </Select>
        </FormControl>

        <FormControl fullWidth margin="dense">
          <InputLabel>Cost Centre</InputLabel>
          <Select name="cost_centre_id" value={formData.cost_centre_id} onChange={handleChange} required>
            {costCentres.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
          </Select>
        </FormControl>

        <FormControl fullWidth margin="dense">
          <InputLabel>Entity</InputLabel>
          <Select name="entity_id" value={formData.entity_id} onChange={handleChange} required>
            {entities.map(e => <MenuItem key={e.id} value={e.id}>{e.name}</MenuItem>)}
          </Select>
        </FormControl>

        <FormControl fullWidth margin="dense">
          <InputLabel>Asset (optional)</InputLabel>
          <Select name="asset_id" value={formData.asset_id} onChange={handleChange}>
            {assets.map(a => <MenuItem key={a.id} value={a.id}>{a.name}</MenuItem>)}
          </Select>
        </FormControl>

        <TextField
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          fullWidth
          margin="dense"
          multiline
          required
        />
        <TextField
          type="date"
          label="Contract Date"
          name="contract_date"
          value={formData.contract_date}
          onChange={handleChange}
          fullWidth
          margin="dense"
          InputLabelProps={{ shrink: true }}
          required
        />
        <TextField
          type="date"
          label="Start Date"
          name="start_date"
          value={formData.start_date}
          onChange={handleChange}
          fullWidth
          margin="dense"
          InputLabelProps={{ shrink: true }}
          required
        />
        <TextField
          type="date"
          label="End Date"
          name="end_date"
          value={formData.end_date}
          onChange={handleChange}
          fullWidth
          margin="dense"
          InputLabelProps={{ shrink: true }}
          required
        />
        <TextField
          type="file"
          name="document"
          onChange={handleChange}
          fullWidth
          margin="dense"
          inputProps={{ accept: ".pdf,.jpg,.jpeg,.png" }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}>Save Contract</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddContractDialog;
