import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';

import Login from './modules/Auth/Login';
import UserManagement from './modules/Users/UserManagement';
import CompanyManagement from './modules/Companies/CompanyManagement';
import BankManagement from './modules/Banks/BankManagement';
import CostCentreManagement from './modules/CostCentres/CostCentreManagement';
import TransactionTypeManagement from './modules/TransactionTypes/TransactionTypeManagement';
import TransactionManagement from './modules/Transactions/TransactionManagement';
import Dashboard from './modules/Dashboard/Dashboard';
import ProjectManagement from './modules/Projects/ProjectManagement';
import PropertyManagement from './modules/Properties/PropertyManagement';
import EntityManagement from './modules/Entities/EntityManagement';
import ReceiptManagement from './modules/Receipts/ReceiptManagement';
import AssetManagement from './modules/Assets/AssetManagement';
import ContactManagement from './modules/Contacts/ContactManagement';
import VendorManagement from './modules/Vendors/VendorManagement';
import ContractManagement from './modules/Contracts/ContractManagement'; // ✅ Newly added

import ProtectedRoute from './routes/ProtectedRoute';
import Sidebar from './components/Slidebar';
import Header from './components/header';

function AppContent() {
  const location = useLocation();
  const hideNavOnLogin = location.pathname === '/';

  return (
    <div style={{ display: 'flex' }}>
      {!hideNavOnLogin && <Sidebar />}
      <div style={{
        flexGrow: 1,
        backgroundColor: '#F9FAFB',
        minHeight: '100vh',
        padding: '20px',
      }}>
        {!hideNavOnLogin && <Header />}
        <Routes>
          <Route path="/" element={<Login />} />

          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={['SUPER_USER', 'CENTER_HEAD']}>
              <Dashboard />
            </ProtectedRoute>
          } />

          <Route path="/users" element={
            <ProtectedRoute allowedRoles={['SUPER_USER']}>
              <UserManagement />
            </ProtectedRoute>
          } />

          <Route path="/companies" element={
            <ProtectedRoute allowedRoles={['SUPER_USER', 'CENTER_HEAD']}>
              <CompanyManagement />
            </ProtectedRoute>
          } />

          <Route path="/banks" element={
            <ProtectedRoute allowedRoles={['SUPER_USER', 'CENTER_HEAD', 'ACCOUNTANT']}>
              <BankManagement />
            </ProtectedRoute>
          } />

          <Route path="/cost-centres" element={
            <ProtectedRoute allowedRoles={['SUPER_USER', 'ACCOUNTANT']}>
              <CostCentreManagement />
            </ProtectedRoute>
          } />

          <Route path="/transaction-types" element={
            <ProtectedRoute allowedRoles={['SUPER_USER', 'ACCOUNTANT']}>
              <TransactionTypeManagement />
            </ProtectedRoute>
          } />

          <Route path="/transactions" element={
            <ProtectedRoute allowedRoles={['SUPER_USER', 'ACCOUNTANT', 'PROPERTY_MANAGER']}>
              <TransactionManagement />
            </ProtectedRoute>
          } />

          <Route path="/projects" element={
            <ProtectedRoute allowedRoles={['SUPER_USER', 'PROPERTY_MANAGER', 'CENTER_HEAD']}>
              <ProjectManagement />
            </ProtectedRoute>
          } />

          <Route path="/properties" element={
            <ProtectedRoute allowedRoles={['SUPER_USER', 'PROPERTY_MANAGER', 'CENTER_HEAD']}>
              <PropertyManagement />
            </ProtectedRoute>
          } />

          <Route path="/entities" element={
            <ProtectedRoute allowedRoles={['SUPER_USER', 'PROPERTY_MANAGER']}>
              <EntityManagement />
            </ProtectedRoute>
          } />

          <Route path="/receipts" element={
            <ProtectedRoute allowedRoles={['SUPER_USER', 'ACCOUNTANT']}>
              <ReceiptManagement />
            </ProtectedRoute>
          } />

          <Route path="/assets" element={
            <ProtectedRoute allowedRoles={['SUPER_USER', 'PROPERTY_MANAGER', 'CENTER_HEAD']}>
              <AssetManagement />
            </ProtectedRoute>
          } />

          <Route path="/contacts" element={
            <ProtectedRoute allowedRoles={['SUPER_USER', 'CENTER_HEAD', 'PROPERTY_MANAGER']}>
              <ContactManagement />
            </ProtectedRoute>
          } />

          <Route path="/vendors" element={
            <ProtectedRoute allowedRoles={['SUPER_USER', 'ACCOUNTANT']}>
              <VendorManagement />
            </ProtectedRoute>
          } />

          {/* ✅ Contracts route */}
          <Route path="/contracts" element={
            <ProtectedRoute allowedRoles={['SUPER_USER', 'ACCOUNTANT', 'PROPERTY_MANAGER']}>
              <ContractManagement />
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
