import React, { useEffect, useState } from 'react';
import API from '../../api/axios';
import {
  Button, Table, TableHead, TableBody, TableCell, TableRow,
  CircularProgress
} from '@mui/material';
import { format } from 'date-fns';
import AddContractDialog from './AddContractDialog';
import ContractMilestoneDialog from './ContractMilestoneDialog';

const ContractManagement = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [milestoneDialogOpen, setMilestoneDialogOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);

  const fetchContracts = () => {
    setLoading(true);
    API.get('contracts/')
      .then((res) => {
        if (Array.isArray(res.data)) {
          setContracts(res.data);
        } else {
          console.error('Unexpected response:', res.data);
          setContracts([]);
        }
      })
      .catch((err) => {
        console.error('Error fetching contracts:', err);
        setContracts([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  const downloadContract = (id) => {
    API.get(`contracts/${id}/download/`, { responseType: 'blob' })
      .then((res) => {
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'contract_document.pdf');
        document.body.appendChild(link);
        link.click();
      })
      .catch((err) => console.error('Download failed', err));
  };

  const handleOpenMilestoneDialog = (contract) => {
    setSelectedContract(contract);
    setMilestoneDialogOpen(true);
  };

  const handleDeleteContract = (id) => {
    if (window.confirm('Are you sure you want to delete this contract?')) {
      API.delete(`contracts/${id}/`)
        .then(() => fetchContracts())
        .catch((err) => console.error('Error deleting contract:', err));
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Contract Management</h2>
        <Button variant="contained" onClick={() => setDialogOpen(true)}>
          + Add Contract
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <CircularProgress />
        </div>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Vendor</TableCell>
              <TableCell>Cost Centre</TableCell>
              <TableCell>Entity</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Contract Date</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>End Date</TableCell>
              <TableCell>Total Value</TableCell>
              <TableCell>Paid</TableCell>
              <TableCell>Due</TableCell>
              <TableCell>Document</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {contracts.length > 0 ? (
              contracts.map((contract, index) => (
                <TableRow key={contract.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{contract.vendor_name}</TableCell>
                  <TableCell>{contract.cost_centre_name}</TableCell>
                  <TableCell>{contract.entity_name}</TableCell>
                  <TableCell>{contract.description}</TableCell>
                  <TableCell>{format(new Date(contract.contract_date), 'dd/MM/yyyy')}</TableCell>
                  <TableCell>{format(new Date(contract.start_date), 'dd/MM/yyyy')}</TableCell>
                  <TableCell>{format(new Date(contract.end_date), 'dd/MM/yyyy')}</TableCell>
                  <TableCell>{contract.total_contract_value || 0}</TableCell>
                  <TableCell>{contract.total_paid || 0}</TableCell>
                  <TableCell>{contract.total_due || 0}</TableCell>
                  <TableCell>
                    {contract.document ? (
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => downloadContract(contract.id)}
                      >
                        Download
                      </Button>
                    ) : (
                      'N/A'
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="text"
                      size="small"
                      onClick={() => handleOpenMilestoneDialog(contract)}
                    >
                      Milestones
                    </Button>
                    <Button
                      variant="text"
                      size="small"
                      color="error"
                      onClick={() => handleDeleteContract(contract.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={13} align="center">
                  No contracts found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}

      <AddContractDialog
        open={dialogOpen}
        handleClose={() => setDialogOpen(false)}
        onContractAdded={fetchContracts}
      />

      <ContractMilestoneDialog
        open={milestoneDialogOpen}
        handleClose={() => setMilestoneDialogOpen(false)}
        contract={selectedContract}
      />
    </div>
  );
};

export default ContractManagement;
