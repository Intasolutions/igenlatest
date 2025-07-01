import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Login from './modules/Auth/Login';
import UserManagement from './modules/Users/UserManagement';
import CompanyManagement from './modules/Companies/CompanyManagement';
import BankManagement from './modules/Banks/BankManagement';
import CostCentreManagement from './modules/CostCentres/CostCentreManagement';
import TransactionTypeManagement from './modules/TransactionTypes/TransactionTypeManagement';
import TransactionManagement from './modules/Transactions/TransactionManagement';
import Dashboard from './modules/Dashboard/Dashboard';
import ProjectManagement from './modules/Projects/ProjectManagement'; // ✅ Import the Projects module
import ProtectedRoute from './routes/ProtectedRoute';
import NavBar from './components/NavBar';

function AppContent() {
  const location = useLocation();
  const hideNavOnLogin = location.pathname === '/';

  return (
    <>
      {!hideNavOnLogin && <NavBar />}

      <Routes>
        {/* Login page */}
        <Route path="/" element={<Login />} />

        {/* Dashboard */}
        <Route path="/dashboard" element={
          <ProtectedRoute allowedRoles={['SUPER_USER']}>
            <Dashboard />
          </ProtectedRoute>
        } />

        {/* Users */}
        <Route path="/users" element={
          <ProtectedRoute allowedRoles={['SUPER_USER']}>
            <UserManagement />
          </ProtectedRoute>
        } />

        {/* Companies */}
        <Route path="/companies" element={
          <ProtectedRoute allowedRoles={['SUPER_USER']} >
            <CompanyManagement />
          </ProtectedRoute>
        } />

        {/* Banks */}
        <Route path="/banks" element={
          <ProtectedRoute allowedRoles={['SUPER_USER']} >
            <BankManagement />
          </ProtectedRoute>
        } />

        {/* Cost Centres */}
        <Route path="/cost-centres" element={
          <ProtectedRoute allowedRoles={['SUPER_USER']} >
            <CostCentreManagement />
          </ProtectedRoute>
        } />

        {/* Transaction Types */}
        <Route path="/transaction-types" element={
          <ProtectedRoute allowedRoles={['SUPER_USER']} >
            <TransactionTypeManagement />
          </ProtectedRoute>
        } />

        {/* Transactions */}
        <Route path="/transactions" element={
          <ProtectedRoute allowedRoles={['SUPER_USER']} >
            <TransactionManagement />
          </ProtectedRoute>
        } />

        {/* ✅ Projects */}
        <Route path="/projects" element={
          <ProtectedRoute allowedRoles={['SUPER_USER']} >
            <ProjectManagement />
          </ProtectedRoute>
        } />

        {/* Fallback to redirect unknown routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
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
