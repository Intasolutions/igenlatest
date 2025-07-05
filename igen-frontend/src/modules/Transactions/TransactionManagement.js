import React, { useState, useEffect } from 'react';
import API from '../../api/axios';
import {
  
  Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Card, CardContent, Typography, TablePagination
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete'; // Make sure this is imported
import Tooltip from '@mui/material/Tooltip';          // Optional: for hover label
import IconButton from '@mui/material/IconButton';    // If not already imported


export default function TransactionManagement() {
  const [transactions, setTransactions] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [banks, setBanks] = useState([]);
  const [costCentres, setCostCentres] = useState([]);
  const [transactionTypes, setTransactionTypes] = useState([]);
  const [open, setOpen] = useState(false);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [form, setForm] = useState({
    company: '',
    bank_account: '',
    cost_centre: '',
    transaction_type: '',
    direction: 'CREDIT',
    amount: '',
    date: '',
    notes: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [trans, comps, bks, ccs, tts] = await Promise.all([
        API.get('transactions/'),
        API.get('companies/'),
        API.get('banks/'),
        API.get('cost-centres/'),
        API.get('transaction-types/'),
      ]);
      setTransactions(trans.data);
      setCompanies(comps.data);
      setBanks(bks.data);
      setCostCentres(ccs.data);
      setTransactionTypes(tts.data);
    } catch (err) {
      alert('Error fetching data');
    }
  };

  const handleAddTransaction = async () => {
    const { company, bank_account, cost_centre, transaction_type, direction, amount, date } = form;
    if (!company || !bank_account || !cost_centre || !transaction_type || !amount || !date) {
      alert('All fields are required');
      return;
    }
    try {
      await API.post('transactions/', form);
      alert('Transaction added');
      fetchData();
      setOpen(false);
      setForm({ company: '', bank_account: '', cost_centre: '', transaction_type: '', direction: 'CREDIT', amount: '', date: '', notes: '' });
    } catch (err) {
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

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

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
        <Button variant="contained" color="primary" onClick={() => setOpen(true)}>
          Add Transaction
        </Button>
      </div>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add Transaction</DialogTitle>
        <DialogContent>
          <TextField select margin="dense" label="Company" fullWidth value={form.company}
            onChange={(e) => setForm({ ...form, company: e.target.value })}>
            {companies.map((c) => (
              <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
            ))}
          </TextField>
          <TextField select margin="dense" label="Bank Account" fullWidth value={form.bank_account}
            onChange={(e) => setForm({ ...form, bank_account: e.target.value })}>
            {banks.map((b) => (
              <MenuItem key={b.id} value={b.id}>{b.account_name} ({b.company_name})</MenuItem>
            ))}
          </TextField>
          <TextField select margin="dense" label="Cost Centre" fullWidth value={form.cost_centre}
            onChange={(e) => setForm({ ...form, cost_centre: e.target.value })}>
            {costCentres.map((cc) => (
              <MenuItem key={cc.id} value={cc.id}>{cc.name} ({cc.company_name})</MenuItem>
            ))}
          </TextField>
          <TextField select margin="dense" label="Transaction Type" fullWidth value={form.transaction_type}
            onChange={(e) => setForm({ ...form, transaction_type: e.target.value })}>
            {transactionTypes.map((tt) => (
              <MenuItem key={tt.id} value={tt.id}>{tt.name} ({tt.type})</MenuItem>
            ))}
          </TextField>
          <TextField select margin="dense" label="Direction" fullWidth value={form.direction}
            onChange={(e) => setForm({ ...form, direction: e.target.value })}>
            <MenuItem value="CREDIT">Credit (Income)</MenuItem>
            <MenuItem value="DEBIT">Debit (Expense)</MenuItem>
          </TextField>
          <TextField margin="dense" label="Amount" type="number" fullWidth value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })} />
          <TextField margin="dense" label="Date" type="date" fullWidth value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            InputLabelProps={{ shrink: true }} />
          <TextField margin="dense" label="Notes" fullWidth multiline value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleAddTransaction} color="primary" variant="contained">Add</Button>
        </DialogActions>
      </Dialog>

      <Card sx={{ boxShadow: 3, borderRadius: 3, mt: 2 }}>
        <CardContent>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead sx={{ backgroundColor: '#e3f2fd' }}>
                <TableRow>
                  <TableCell><strong>#</strong></TableCell>
                  <TableCell><strong>Company</strong></TableCell>
                  <TableCell><strong>Bank</strong></TableCell>
                  <TableCell><strong>Cost Centre</strong></TableCell>
                  <TableCell><strong>Type</strong></TableCell>
                  <TableCell><strong>Direction</strong></TableCell>
                  <TableCell><strong>Amount</strong></TableCell>
                  <TableCell><strong>Date</strong></TableCell>
                  <TableCell><strong>Notes</strong></TableCell>
                  <TableCell align="center"><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedData.map((t, index) => (
                  <TableRow key={t.id}>
                    <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                    <TableCell>{t.company_name}</TableCell>
                    <TableCell>{t.bank_name}</TableCell>
                    <TableCell>{t.cost_centre_name}</TableCell>
                    <TableCell>{t.transaction_type_name}</TableCell>
                    <TableCell>{t.direction}</TableCell>
                    <TableCell>{t.amount}</TableCell>
                    <TableCell>{t.date}</TableCell>
                    <TableCell>{t.notes}</TableCell>
                    <TableCell align="center">
                     <Tooltip title="Delete Transaction " arrow>
  <IconButton color="error" onClick={() => deleteTransaction(t.id)}>
    <DeleteIcon />
  </IconButton>
</Tooltip>

                    </TableCell>
                  </TableRow>
                ))}
                {transactions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={10} align="center">No transactions found</TableCell>
                  </TableRow>
                )}
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
