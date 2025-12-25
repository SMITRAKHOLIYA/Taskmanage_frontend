import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { useContext } from 'react';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import CreateTask from './pages/CreateTask';
import TaskDetails from './pages/TaskDetails';
import Users from './pages/Users';
import Settings from './pages/Settings';
import Trash from './pages/Trash';
import TaskMasterLanding from './pages/TaskMasterLanding';
import Navbar from './components/Navbar';
import Reports from './pages/Reports';
import Analytics from './pages/Analytics';

import Profile from './pages/Profile';
import KanbanBoard from './pages/KanbanBoard';
import Projects from './pages/Projects';
import ProjectDetails from './pages/ProjectDetails';
import { ThemeProvider } from './context/ThemeContext';
import OwnerDashboard from './pages/OwnerDashboard';
import CompanyManagement from './pages/CompanyManagement';

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

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router basename="/">
          <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans transition-colors duration-200">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/" element={<TaskMasterLanding />} />

              <Route path="/owner-dashboard" element={
                <OwnerRoute>
                  <Navbar />
                  <div className="container mx-auto px-4 pb-4 pt-28">
                    <OwnerDashboard />
                  </div>
                </OwnerRoute>
              } />

              <Route path="/companies" element={
                <OwnerRoute>
                  <Navbar />
                  <div className="container mx-auto px-4 pb-4 pt-28">
                    <CompanyManagement />
                  </div>
                </OwnerRoute>
              } />

              <Route path="/dashboard" element={
                <PrivateRoute>
                  <Navbar />
                  <div className="container mx-auto px-4 pb-4 pt-28">
                    <Dashboard />
                  </div>
                </PrivateRoute>
              } />

              <Route path="/tasks" element={
                <PrivateRoute>
                  <Navbar />
                  <div className="container mx-auto px-4 pb-4 pt-28">
                    <Tasks />
                  </div>
                </PrivateRoute>
              } />
              <Route path="/kanban" element={
                <PrivateRoute>
                  <Navbar />
                  <div className="container mx-auto px-4 pb-4 pt-28">
                    <KanbanBoard />
                  </div>
                </PrivateRoute>
              } />
              <Route path="/create-task" element={
                <AdminRoute>
                  <Navbar />
                  <div className="container mx-auto px-4 pb-4 pt-28">
                    <CreateTask />
                  </div>
                </AdminRoute>
              } />
              <Route path="/users" element={
                <AdminRoute>
                  <Navbar />
                  <div className="container mx-auto px-4 pb-4 pt-28">
                    <Users />
                  </div>
                </AdminRoute>
              } />
              <Route path="/projects" element={
                <PrivateRoute>
                  <Navbar />
                  <div className="container mx-auto px-4 pb-4 pt-28">
                    <Projects />
                  </div>
                </PrivateRoute>
              } />
              <Route path="/projects/:id" element={
                <PrivateRoute>
                  <Navbar />
                  <div className="container mx-auto px-4 pb-4 pt-28">
                    <ProjectDetails />
                  </div>
                </PrivateRoute>
              } />
              <Route path="/settings" element={
                <PrivateRoute>
                  <Navbar />
                  <div className="container mx-auto px-4 pb-4 pt-28">
                    <Settings />
                  </div>
                </PrivateRoute>
              } />
              <Route path="/profile" element={
                <PrivateRoute>
                  <Navbar />
                  <div className="container mx-auto px-4 pb-4 pt-28">
                    <Profile />
                  </div>
                </PrivateRoute>
              } />
              <Route path="/tasks/:id" element={
                <PrivateRoute>
                  <Navbar />
                  <div className="container mx-auto px-4 pb-4 pt-28">
                    <TaskDetails />
                  </div>
                </PrivateRoute>
              } />
              <Route path="/trash" element={
                <PrivateRoute>
                  <Navbar />
                  <div className="container mx-auto px-4 pb-4 pt-28">
                    <Trash />
                  </div>
                </PrivateRoute>
              } />
              <Route path="/reports" element={
                <PrivateRoute>
                  <Navbar />
                  <div className="container mx-auto px-4 pb-4 pt-28">
                    <Reports />
                  </div>
                </PrivateRoute>
              } />
              <Route path="/analytics" element={
                <AdminRoute>
                  <Navbar />
                  <div className="container mx-auto px-4 pb-4 pt-28">
                    <Analytics />
                  </div>
                </AdminRoute>
              } />

            </Routes>
          </div>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
