import React, { useState, useEffect } from 'react';
import API from '../../api/axios';
import {
  Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Card, CardContent, Typography, TablePagination, IconButton, Tooltip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import UploadFileIcon from '@mui/icons-material/UploadFile';

export default function TransactionManagement() {
  const [transactions, setTransactions] = useState([]);
  const [open, setOpen] = useState(false);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [splitDialog, setSplitDialog] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [banks, setBanks] = useState([]);
  const [costCentres, setCostCentres] = useState([]);
  const [transactionTypes, setTransactionTypes] = useState([]);
  const [entities, setEntities] = useState([]);
  const [classifiedDetails, setClassifiedDetails] = useState([]);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [form, setForm] = useState({
    company: '', bank_account: '', cost_centre: '', transaction_type: '',
    direction: 'CREDIT', amount: '', date: '', notes: ''
  });

  const [splitRows, setSplitRows] = useState([
    { cost_centre: '', entity: '', transaction_type: '', asset: '', contract: '', amount: '', value_date: '', remarks: '' }
  ]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [trans, comps, bks, ccs, tts, ents] = await Promise.all([
        API.get('transactions/'),
        API.get('companies/'),
        API.get('banks/'),
        API.get('cost-centres/'),
        API.get('transaction-types/'),
        API.get('entities/')
      ]);
      setTransactions(Array.isArray(trans.data) ? trans.data : []);
      setCompanies(comps.data);
      setBanks(bks.data);
      setCostCentres(ccs.data);
      setTransactionTypes(tts.data);
      setEntities(ents.data);
    } catch (err) {
      console.error(err);
      alert('Failed to fetch data');
    }
  };

  const handleBulkUpload = async () => {
    if (!file) {
      alert('Please select a file');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('file', file);
      await API.post('bulk-upload/', formData, {

        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Bulk upload successful');
      setBulkDialogOpen(false);
      setFile(null);
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Bulk upload failed');
    }
  };

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const fetchClassifiedDetails = async (transactionId) => {
    try {
      const res = await API.get(`classified-transactions/?transaction=${transactionId}`);
      setClassifiedDetails(res.data);
      setShowDetailsDialog(true);
    } catch (err) {
      console.error(err);
      alert('Failed to fetch split details');
    }
  };

  const handleAddTransaction = async () => {
    const { company, bank_account, cost_centre, transaction_type, direction, amount, date } = form;
    if (!company || !bank_account || !cost_centre || !transaction_type || !amount || !date) {
      alert('All fields are required');
      return;
    }
    try {
      const payload = {
        ...form,
        company: parseInt(company),
        bank_account: parseInt(bank_account),
        cost_centre: parseInt(cost_centre),
        transaction_type: parseInt(transaction_type),
        amount: parseFloat(amount)
      };
      await API.post('transactions/', payload);
      alert('Transaction added');
      fetchData();
      setOpen(false);
      setForm({ company: '', bank_account: '', cost_centre: '', transaction_type: '', direction: 'CREDIT', amount: '', date: '', notes: '' });
    } catch (err) {
      console.error(err);
      alert('Failed to add transaction');
    }
  };

  const deleteTransaction = async (id) => {
    try {
      await API.delete(`transactions/${id}/`);
      alert('Transaction deleted');
      fetchData();
    } catch (err) {
      alert('Delete failed');
    }
  };

  const handleAddSplitRow = () => {
    setSplitRows([...splitRows, {
      cost_centre: '', entity: '', transaction_type: '', asset: '', contract: '',
      amount: '', value_date: '', remarks: ''
    }]);
  };

  const handleSplitChange = (index, field, value) => {
    const updated = [...splitRows];
    updated[index][field] = value;
    setSplitRows(updated);
  };

  const handleSubmitSplit = async () => {
    if (!selectedTransaction) {
      alert("No transaction selected");
      return;
    }

    const totalSplitAmount = splitRows.reduce((sum, row) => sum + parseFloat(row.amount || 0), 0);
    if (totalSplitAmount !== parseFloat(selectedTransaction.amount)) {
      alert(`Split amount (${totalSplitAmount}) must equal the transaction amount (${selectedTransaction.amount})`);
      return;
    }

    for (const row of splitRows) {
      if (!row.cost_centre || !row.entity || !row.transaction_type || !row.amount || !row.value_date) {
        alert('Please fill in all required fields for each row.');
        return;
      }
    }

    try {
      const payload = splitRows.map(row => {
        const entry = {
          transaction: selectedTransaction.id,
          cost_centre: row.cost_centre,
          entity: row.entity,
          transaction_type: row.transaction_type,
          amount: parseFloat(row.amount),
          value_date: row.value_date,
          remarks: row.remarks || '',
        };
        if (row.asset) entry.asset = row.asset;
        if (row.contract) entry.contract = row.contract;
        return entry;
      });

      await API.post('classified-transactions/', payload);

      alert('Split saved');
      setSplitDialog(false);
      setSelectedTransaction(null);
      setSplitRows([{ cost_centre: '', entity: '', transaction_type: '', asset: '', contract: '', amount: '', value_date: '', remarks: '' }]);
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to save split');
    }
  };

  const handleOpenSplitDialog = (transaction) => {
    setSelectedTransaction(transaction);
    setSplitRows([{ cost_centre: '', entity: '', transaction_type: '', asset: '', contract: '', amount: '', value_date: '', remarks: '' }]);
    setSplitDialog(true);
  };

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedData = rowsPerPage > 0
    ? transactions.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
    : transactions;

  return (
    <div className="p-[95px]">
      <div className="flex justify-between items-center mb-6">
        <Typography variant="h5" fontWeight="bold">Transaction Management</Typography>
        <div className="flex gap-3">
          <Button variant="contained" color="secondary" onClick={() => setBulkDialogOpen(true)} startIcon={<UploadFileIcon />}>Bulk Upload</Button>
          <Button variant="contained" color="primary" onClick={() => setOpen(true)}>Add Transaction</Button>
        </div>
      </div>

      {/* Bulk Upload Dialog */}
      <Dialog open={bulkDialogOpen} onClose={() => setBulkDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Bulk Upload Transactions</DialogTitle>
        <DialogContent>
          <input type="file" accept=".csv" onChange={handleFileChange} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleBulkUpload} color="primary" variant="contained">Upload</Button>
        </DialogActions>
      </Dialog>

      {/* Add Transaction Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add Transaction</DialogTitle>
        <DialogContent>
          <TextField
            select
            label="Company"
            value={form.company}
            onChange={(e) => setForm({ ...form, company: e.target.value })}
            fullWidth
            margin="dense"
          >
            {companies?.map((c) => (
              <MenuItem key={c.id} value={String(c.id)}>{c.name}</MenuItem>
            )) || <MenuItem disabled>No companies</MenuItem>}
          </TextField>
          <TextField
            select
            label="Bank Account"
            value={form.bank_account}
            onChange={(e) => setForm({ ...form, bank_account: e.target.value })}
            fullWidth
            margin="dense"
          >
            {banks?.map((b) => (
              <MenuItem key={b.id} value={String(b.id)}>{b.account_name}</MenuItem>
            )) || <MenuItem disabled>No banks</MenuItem>}
          </TextField>
          <TextField
            select
            label="Cost Centre"
            value={form.cost_centre}
            onChange={(e) => setForm({ ...form, cost_centre: e.target.value })}
            fullWidth
            margin="dense"
          >
            {costCentres?.map((cc) => (
              <MenuItem key={cc.id || cc.cost_centre_id} value={cc.id || cc.cost_centre_id}>{cc.name}</MenuItem>
            )) || <MenuItem disabled>No cost centres</MenuItem>}
          </TextField>
          <TextField
            select
            label="Transaction Type"
            value={form.transaction_type}
            onChange={(e) => setForm({ ...form, transaction_type: e.target.value })}
            fullWidth
            margin="dense"
          >
            {transactionTypes?.map((tt) => (
              <MenuItem key={tt.id || tt.transaction_type_id} value={tt.id || tt.transaction_type_id}>{tt.name}</MenuItem>
            )) || <MenuItem disabled>No transaction types</MenuItem>}
          </TextField>
          <TextField
            select
            label="Direction"
            value={form.direction}
            onChange={(e) => setForm({ ...form, direction: e.target.value })}
            fullWidth
            margin="dense"
          >
            <MenuItem value="CREDIT">CREDIT</MenuItem>
            <MenuItem value="DEBIT">DEBIT</MenuItem>
          </TextField>
          <TextField
            label="Amount"
            type="number"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            fullWidth
            margin="dense"
          />
          <TextField
            label="Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            fullWidth
            margin="dense"
          />
          <TextField
            label="Notes"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            fullWidth
            margin="dense"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleAddTransaction} color="primary" variant="contained">Add</Button>
        </DialogActions>
      </Dialog>

      {/* Split Dialog */}
      <Dialog open={splitDialog} onClose={() => setSplitDialog(false)} fullWidth maxWidth="md">
        <DialogTitle>Split Transaction</DialogTitle>
        <DialogContent>
          {splitRows.map((row, index) => (
            <div key={index} className="grid grid-cols-3 gap-3 mb-3">
              <TextField
                select
                label="Cost Centre"
                value={row.cost_centre}
                onChange={(e) => handleSplitChange(index, 'cost_centre', e.target.value)}
                fullWidth
              >
                {costCentres?.map((cc) => (
                  <MenuItem key={cc.id || cc.cost_centre_id} value={cc.id || cc.cost_centre_id}>{cc.name}</MenuItem>
                )) || <MenuItem disabled>No cost centres</MenuItem>}
              </TextField>
              <TextField
                select
                label="Entity"
                value={row.entity}
                onChange={(e) => handleSplitChange(index, 'entity', e.target.value)}
                fullWidth
              >
                {entities?.map((ent) => (
                  <MenuItem key={ent.id} value={ent.id}>{ent.name}</MenuItem>
                )) || <MenuItem disabled>No entities</MenuItem>}
              </TextField>
              <TextField
                select
                label="Transaction Type"
                value={row.transaction_type}
                onChange={(e) => handleSplitChange(index, 'transaction_type', e.target.value)}
                fullWidth
              >
                {transactionTypes?.map((tt) => (
                  <MenuItem key={tt.id || tt.transaction_type_id} value={tt.id || tt.transaction_type_id}>{tt.name}</MenuItem>
                )) || <MenuItem disabled>No transaction types</MenuItem>}
              </TextField>
              <TextField
                label="Amount"
                type="number"
                value={row.amount}
                onChange={(e) => handleSplitChange(index, 'amount', e.target.value)}
                fullWidth
              />
              <TextField
                label="Value Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={row.value_date}
                onChange={(e) => handleSplitChange(index, 'value_date', e.target.value)}
                fullWidth
              />
              <TextField
                label="Remarks"
                value={row.remarks}
                onChange={(e) => handleSplitChange(index, 'remarks', e.target.value)}
                fullWidth
              />
            </div>
          ))}
          <Button onClick={handleAddSplitRow} size="small">+ Add Row</Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSplitDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmitSplit} color="primary" variant="contained">Save Split</Button>
        </DialogActions>
      </Dialog>

      {/* Classified Details Dialog */}
      <Dialog open={showDetailsDialog} onClose={() => setShowDetailsDialog(false)} fullWidth maxWidth="md">
        <DialogTitle>Split Details</DialogTitle>
        <DialogContent>
          {classifiedDetails.length === 0 ? (
            <Typography variant="body1">No split details available.</Typography>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Cost Centre</TableCell>
                  <TableCell>Entity</TableCell>
                  <TableCell>Transaction Type</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Value Date</TableCell>
                  <TableCell>Remarks</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {classifiedDetails.map((row, index) => (
                  <TableRow key={row.classification_id || index}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{row.cost_centre_name || 'N/A'}</TableCell>
                    <TableCell>{row.entity_name || 'N/A'}</TableCell>
                    <TableCell>{row.transaction_type_name || 'N/A'}</TableCell>
                    <TableCell>{row.amount}</TableCell>
                    <TableCell>{row.value_date}</TableCell>
                    <TableCell>{row.remarks}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDetailsDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Table */}
      <Card sx={{ boxShadow: 3, borderRadius: 3, mt: 2 }}>
        <CardContent>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead sx={{ backgroundColor: '#e3f2fd' }}>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Company</TableCell>
                  <TableCell>Bank</TableCell>
                  <TableCell>Cost Centre</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Direction</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Notes</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedData.map((t, index) => (
                  <TableRow key={t.id}>
                    <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                    <TableCell>{t.company_name || 'N/A'}</TableCell>
                    <TableCell>{t.bank_name || 'N/A'}</TableCell>
                    <TableCell>{t.cost_centre_name || 'N/A'}</TableCell>
                    <TableCell>{t.transaction_type_name || 'N/A'}</TableCell>
                    <TableCell>{t.direction}</TableCell>
                    <TableCell>{t.amount}</TableCell>
                    <TableCell>{t.date}</TableCell>
                    <TableCell>{t.notes}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Split Transaction">
                        <IconButton color="primary" onClick={() => handleOpenSplitDialog(t)}>
                          <AddIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="View Split Details">
                        <IconButton color="secondary" onClick={() => fetchClassifiedDetails(t.id)}>
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Transaction">
                        <IconButton color="error" onClick={() => deleteTransaction(t.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={transactions.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
          />
        </CardContent>
      </Card>
    </div>
  );
}
