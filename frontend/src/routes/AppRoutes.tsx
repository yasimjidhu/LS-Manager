import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import ProtectedRoute from './ProtectedRoute';
import LoginPage from '../pages/auth/LoginPage';
import SignupPage from '../pages/auth/SignupPage';
import Dashboard from '../pages/dashboard/Dashboard';
import MyJobs from '../pages/jobs/MyJobs';
import Wages from '../pages/wages/Wages';
import Settings from '../pages/settings/Settings';
import Inventory from '../pages/inventory/Inventory';
import Jobs from '../pages/jobs/Jobs';
import Checkout from '../pages/checkout/Checkout';
import CheckIn from '../pages/checkin/CheckIn';
import Quotations from '../pages/quotations/Quotations';
import CreateQuotation from '../pages/quotations/CreateQuotation';
import Invoices from '../pages/invoices/Invoices';
import CreateInvoice from '../pages/invoices/CreateInvoice';
import InvoicePreview from '../pages/invoices/InvoicePreview';
import Clients from '../pages/clients/Clients';
import SupervisorDashboard from '../pages/supervisor/SupervisorDashboard';
import Employees from '../pages/employees/Employees';
import CreateEmployee from '../pages/employees/CreateEmployee';
import EmployeeDetail from '../pages/employees/EmployeeDetail';
import EditEmployee from '../pages/employees/EditEmployee';
import Maintenance from '../pages/maintenance/Maintenance';

import RoleRoute from './RoleRoute';

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/auth/login" element={<LoginPage />} />
            <Route path="/auth/signup" element={<SignupPage />} />

            <Route element={<ProtectedRoute />}>
                <Route path="/" element={<Layout />}>
                    <Route index element={<Navigate to="/dashboard" replace />} />

                    {/* Common Routes (Accessible by all or multiple) */}
                    <Route element={<RoleRoute allowedRoles={['ADMIN', 'SUPERVISOR', 'EMPLOYEE']} />}>
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="my-jobs" element={<MyJobs />} />
                        <Route path="settings" element={<Settings />} />
                    </Route>

                    {/* Admin & Supervisor Routes */}
                    <Route element={<RoleRoute allowedRoles={['ADMIN', 'SUPERVISOR']} />}>
                        <Route path="supervisor" element={<SupervisorDashboard />} />
                        <Route path="clients" element={<Clients />} />
                        <Route path="employees" element={<Employees />} />
                        <Route path="employees/create" element={<CreateEmployee />} />
                        <Route path="employees/:id" element={<EmployeeDetail />} />
                        <Route path="employees/:id/edit" element={<EditEmployee />} />
                        <Route path="quotations" element={<Quotations />} />
                        <Route path="quotations/new" element={<CreateQuotation />} />
                        <Route path="quotations/:id/edit" element={<CreateQuotation />} />
                        <Route path="invoices" element={<Invoices />} />
                        <Route path="invoices/new" element={<CreateInvoice />} />
                        <Route path="invoices/:id" element={<InvoicePreview />} />
                        <Route path="maintenance" element={<Maintenance />} />
                    </Route>

                    {/* Admin, Supervisor & Employee Routes */}
                    <Route element={<RoleRoute allowedRoles={['ADMIN', 'SUPERVISOR', 'EMPLOYEE']} />}>
                        <Route path="inventory" element={<Inventory />} />
                        <Route path="checkout" element={<Checkout />} />
                        <Route path="checkin" element={<CheckIn />} />
                        <Route path="wages" element={<Wages />} />
                        <Route path="jobs" element={<Jobs />} />
                    </Route>


                    {/* Admin Only Routes */}
                    <Route element={<RoleRoute allowedRoles={['ADMIN']} />}>
                    </Route>
                </Route>
            </Route>
        </Routes>
    );
};

export default AppRoutes;
