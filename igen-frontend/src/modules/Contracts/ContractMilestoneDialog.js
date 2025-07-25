import React, { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, MenuItem, Table, TableHead, TableBody, TableRow, TableCell,
  Select, FormControl, InputLabel
} from '@mui/material';
import API from '../../api/axios';

const STATUS_OPTIONS = ['Pending', 'Completed', 'Paid', 'Cancelled'];

const ContractMilestoneDialog = ({ open, handleClose, contract }) => {
  const [milestones, setMilestones] = useState([]);
  const [formData, setFormData] = useState({
    milestone_name: '',
    due_date: '',
    amount: '',
    status: 'Pending',
    remarks: '',
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    if (contract?.id && open) {
      API.get(`contract-milestones/?contract=${contract.id}`)
        .then(res => setMilestones(res.data))
        .catch(err => console.error('Error fetching milestones:', err));
    }
  }, [contract, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    const payload = {
      ...formData,
      contract: contract.id,
      amount: parseFloat(formData.amount),
    };

    const request = editingId
      ? API.patch(`contract-milestones/${editingId}/`, payload)
      : API.post('contract-milestones/', payload);

    request.then(() => {
      API.get(`contract-milestones/?contract=${contract.id}`)
        .then(res => setMilestones(res.data));
      setFormData({ milestone_name: '', due_date: '', amount: '', status: 'Pending', remarks: '' });
      setEditingId(null);
    }).catch(err => console.error('Error saving milestone:', err));
  };

  const handleEdit = (milestone) => {
    setFormData({
      milestone_name: milestone.milestone_name,
      due_date: milestone.due_date,
      amount: milestone.amount,
      status: milestone.status,
      remarks: milestone.remarks || ''
    });
    setEditingId(milestone.id);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this milestone?')) {
      API.delete(`contract-milestones/${id}/`)
        .then(() => setMilestones(prev => prev.filter(m => m.id !== id)))
        .catch(err => console.error('Delete failed:', err));
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
      <DialogTitle>Manage Milestones for {contract?.vendor_name || 'Contract'}</DialogTitle>
      <DialogContent dividers>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Remarks</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {milestones.map(m => (
              <TableRow key={m.id}>
                <TableCell>{m.milestone_name}</TableCell>
                <TableCell>{m.due_date}</TableCell>
                <TableCell>{m.amount}</TableCell>
                <TableCell>{m.status}</TableCell>
                <TableCell>{m.remarks}</TableCell>
                <TableCell>
                  <Button size="small" onClick={() => handleEdit(m)}>Edit</Button>
                  <Button size="small" color="error" onClick={() => handleDelete(m.id)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="mt-4">
          <TextField
            label="Milestone Name"
            name="milestone_name"
            value={formData.milestone_name}
            onChange={handleChange}
            fullWidth
            margin="dense"
          />
          <TextField
            type="date"
            label="Due Date"
            name="due_date"
            value={formData.due_date}
            onChange={handleChange}
            fullWidth
            margin="dense"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Amount"
            name="amount"
            type="number"
            value={formData.amount}
            onChange={handleChange}
            fullWidth
            margin="dense"
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Status</InputLabel>
            <Select
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              {STATUS_OPTIONS.map(status => (
                <MenuItem key={status} value={status}>{status}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Remarks"
            name="remarks"
            value={formData.remarks}
            onChange={handleChange}
            fullWidth
            margin="dense"
            multiline
          />
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
        <Button variant="contained" onClick={handleSave}>{editingId ? 'Update' : 'Add'} Milestone</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ContractMilestoneDialog;
