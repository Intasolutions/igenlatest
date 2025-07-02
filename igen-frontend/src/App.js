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
import Sidebar from './components/Slidebar';


function AppContent() {
  const location = useLocation();
  const hideNavOnLogin = location.pathname === '/';

  return (
    <div style={{ display: 'flex' }}>
      {!hideNavOnLogin && <Sidebar />}

      <div style={{
        flexGrow: 1,
  
backgroundColor: '#F4F7FE!important',

        minHeight: '100vh',
      }}>
        <Routes>
          <Route path="/" element={<Login />} />

          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={['SUPER_USER']}>
              <Dashboard />
            </ProtectedRoute>
          } />

          <Route path="/users" element={
            <ProtectedRoute allowedRoles={['SUPER_USER']}>
              <UserManagement />
            </ProtectedRoute>
          } />

          <Route path="/companies" element={
            <ProtectedRoute allowedRoles={['SUPER_USER']}>
              <CompanyManagement />
            </ProtectedRoute>
          } />

          <Route path="/banks" element={
            <ProtectedRoute allowedRoles={['SUPER_USER']}>
              <BankManagement />
            </ProtectedRoute>
          } />

          <Route path="/cost-centres" element={
            <ProtectedRoute allowedRoles={['SUPER_USER']}>
              <CostCentreManagement />
            </ProtectedRoute>
          } />

          <Route path="/transaction-types" element={
            <ProtectedRoute allowedRoles={['SUPER_USER']}>
              <TransactionTypeManagement />
            </ProtectedRoute>
          } />

          <Route path="/transactions" element={
            <ProtectedRoute allowedRoles={['SUPER_USER']}>
              <TransactionManagement />
            </ProtectedRoute>
          } />

          <Route path="/projects" element={
            <ProtectedRoute allowedRoles={['SUPER_USER']}>
              <ProjectManagement />
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
