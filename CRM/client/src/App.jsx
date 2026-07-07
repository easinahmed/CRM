import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/ui';
import { useAuth } from './context/AuthContext';
import { Loader2 } from 'lucide-react';

const LoginPage = lazy(() => import('./features/auth/LoginPage'));
const RegisterPage = lazy(() => import('./features/auth/RegisterPage'));
const DashboardPage = lazy(() => import('./features/dashboard/DashboardPage'));
const CustomersPage = lazy(() => import('./features/crm/CustomersPage'));
const LeadsPage = lazy(() => import('./features/crm/LeadsPage'));
const DealsPage = lazy(() => import('./features/crm/DealsPage'));
const ProductsPage = lazy(() => import('./features/inventory/ProductsPage'));
const OrdersPage = lazy(() => import('./features/sales/OrdersPage'));
const InvoicesPage = lazy(() => import('./features/sales/InvoicesPage'));
const EmployeesPage = lazy(() => import('./features/employees/EmployeesPage'));
const AccountingPage = lazy(() => import('./features/accounting/AccountingPage'));
const TransactionsPage = lazy(() => import('./features/accounting/TransactionsPage'));
const ReportsPage = lazy(() => import('./features/reports/ReportsPage'));
const SettingsPage = lazy(() => import('./features/settings/SettingsPage'));

function Loading() {
  return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Loading />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Loading />;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/crm/customers" element={<CustomersPage />} />
          <Route path="/crm/leads" element={<LeadsPage />} />
          <Route path="/crm/deals" element={<DealsPage />} />
          <Route path="/inventory/products" element={<ProductsPage />} />
          <Route path="/sales/orders" element={<OrdersPage />} />
          <Route path="/sales/invoices" element={<InvoicesPage />} />
          <Route path="/employees" element={<EmployeesPage />} />
          <Route path="/accounting" element={<AccountingPage />} />
          <Route path="/accounting/transactions" element={<TransactionsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={
            <div className="flex flex-col items-center justify-center h-64">
              <h2 className="text-xl font-bold text-text">404</h2>
              <p className="text-text-secondary">Page not found</p>
            </div>
          } />
        </Route>
      </Routes>
    </Suspense>
  );
}
