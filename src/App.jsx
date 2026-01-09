import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { useContext } from 'react';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import CreateTask from './pages/CreateTask';
import TaskDetails from './pages/TaskDetails';
import EditTask from './pages/EditTask';
import Users from './pages/Users';
import Settings from './pages/Settings';
import Trash from './pages/Trash';
import TaskMasterLanding from './pages/TaskMasterLanding';
import MainLayout from './components/MainLayout';
import Reports from './pages/Reports';
import Analytics from './pages/Analytics';

import Profile from './pages/Profile';
import KanbanBoard from './pages/KanbanBoard';
import Projects from './pages/Projects';
import ProjectDetails from './pages/ProjectDetails';
import { ThemeProvider } from './context/ThemeContext';
import OwnerDashboard from './pages/OwnerDashboard';
import CompanyManagement from './pages/CompanyManagement';
import CustomerModule from './pages/CustomerModule';
import DetailsPage from './pages/DetailsPage';

/* New Auth Pages */
import AuthEntry from './pages/AuthEntry';
import CompanySignup from './pages/CompanySignup';
import JoinCompany from './pages/JoinCompany';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div>Loading...</div>;
  return user && (user.user.role === 'admin' || user.user.role === 'manager' || user.user.role === 'owner') ? children : <Navigate to="/dashboard" />;
};

const OwnerRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div>Loading...</div>;
  return user && user.user.role === 'owner' ? children : <Navigate to="/dashboard" />;
};

import { NotificationProvider } from './context/NotificationContext';

import { SyncProvider } from './context/SyncContext';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <NotificationProvider>
          <SyncProvider>
            <Router basename="/">
              <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans transition-colors duration-200">
                <Routes>
                  {/* Auth Routes */}
                  <Route path="/" element={<TaskMasterLanding />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Navigate to="/auth-entry" />} />{/* Legacy redirect */}
                  <Route path="/auth-entry" element={<AuthEntry />} />
                  <Route path="/signup-company" element={<CompanySignup />} />
                  <Route path="/join" element={<JoinCompany />} />

                  {/* Protected Routes */}
                  <Route path="/owner-dashboard" element={
                    <OwnerRoute>
                      <MainLayout>
                        <OwnerDashboard />
                      </MainLayout>
                    </OwnerRoute>
                  } />

                  <Route path="/companies" element={
                    <OwnerRoute>
                      <MainLayout>
                        <CompanyManagement />
                      </MainLayout>
                    </OwnerRoute>
                  } />

                  <Route path="/customers" element={
                    <OwnerRoute>
                      <MainLayout>
                        <CustomerModule />
                      </MainLayout>
                    </OwnerRoute>
                  } />

                  <Route path="/customer-groups/:id" element={
                    <OwnerRoute>
                      <MainLayout>
                        <DetailsPage type="group" />
                      </MainLayout>
                    </OwnerRoute>
                  } />

                  <Route path="/customers/:id" element={
                    <OwnerRoute>
                      <MainLayout>
                        <DetailsPage type="customer" />
                      </MainLayout>
                    </OwnerRoute>
                  } />

                  <Route path="/group-members/:id" element={
                    <OwnerRoute>
                      <MainLayout>
                        <DetailsPage type="member" />
                      </MainLayout>
                    </OwnerRoute>
                  } />

                  <Route path="/dashboard" element={
                    <PrivateRoute>
                      <MainLayout>
                        <Dashboard />
                      </MainLayout>
                    </PrivateRoute>
                  } />

                  <Route path="/tasks" element={
                    <PrivateRoute>
                      <MainLayout>
                        <Tasks />
                      </MainLayout>
                    </PrivateRoute>
                  } />
                  <Route path="/kanban" element={
                    <PrivateRoute>
                      <MainLayout>
                        <KanbanBoard />
                      </MainLayout>
                    </PrivateRoute>
                  } />
                  <Route path="/create-task" element={
                    <AdminRoute>
                      <MainLayout>
                        <CreateTask />
                      </MainLayout>
                    </AdminRoute>
                  } />
                  <Route path="/edit-task/:id" element={
                    <AdminRoute>
                      <MainLayout>
                        <EditTask />
                      </MainLayout>
                    </AdminRoute>
                  } />
                  <Route path="/users" element={
                    <AdminRoute>
                      <MainLayout>
                        <Users />
                      </MainLayout>
                    </AdminRoute>
                  } />
                  <Route path="/projects" element={
                    <PrivateRoute>
                      <MainLayout>
                        <Projects />
                      </MainLayout>
                    </PrivateRoute>
                  } />
                  <Route path="/projects/:id" element={
                    <PrivateRoute>
                      <MainLayout>
                        <ProjectDetails />
                      </MainLayout>
                    </PrivateRoute>
                  } />
                  <Route path="/settings" element={
                    <PrivateRoute>
                      <MainLayout>
                        <Settings />
                      </MainLayout>
                    </PrivateRoute>
                  } />
                  <Route path="/profile" element={
                    <PrivateRoute>
                      <MainLayout>
                        <Profile />
                      </MainLayout>
                    </PrivateRoute>
                  } />
                  <Route path="/tasks/:id" element={
                    <PrivateRoute>
                      <MainLayout>
                        <TaskDetails />
                      </MainLayout>
                    </PrivateRoute>
                  } />
                  <Route path="/trash" element={
                    <PrivateRoute>
                      <MainLayout>
                        <Trash />
                      </MainLayout>
                    </PrivateRoute>
                  } />
                  <Route path="/reports" element={
                    <PrivateRoute>
                      <MainLayout>
                        <Reports />
                      </MainLayout>
                    </PrivateRoute>
                  } />
                  <Route path="/analytics" element={
                    <AdminRoute>
                      <MainLayout>
                        <Analytics />
                      </MainLayout>
                    </AdminRoute>
                  } />

                </Routes>
              </div>
            </Router>
          </SyncProvider>
        </NotificationProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
