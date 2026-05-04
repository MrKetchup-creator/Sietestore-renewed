import { createBrowserRouter, Navigate } from 'react-router';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Layout from './pages/Layout';
import AdminDashboard from './pages/AdminDashboard';
import Sales from './pages/Sales';
import Inventory from './pages/Inventory';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

// Componente de protección de rutas
function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

// Ruta para dashboard que redirige según el rol
function DashboardRoute() {
  const { user } = useAuth();
  
  if (user?.role === 'admin') {
    return <AdminDashboard />;
  } else {
    // Los empleados van directo al módulo de ventas
    return <Navigate to="/ventas" replace />;
  }
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Login />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: 'dashboard',
        element: <DashboardRoute />,
      },
      {
        path: 'ventas',
        element: (
          <ProtectedRoute allowedRoles={['admin', 'employee']}>
            <Sales />
          </ProtectedRoute>
        ),
      },
      {
        path: 'inventario',
        element: (
          <ProtectedRoute allowedRoles={['admin']}>
            <Inventory />
          </ProtectedRoute>
        ),
      },
      {
        path: 'reportes',
        element: (
          <ProtectedRoute allowedRoles={['admin']}>
            <Reports />
          </ProtectedRoute>
        ),
      },
      {
        path: 'configuracion',
        element: (
          <ProtectedRoute allowedRoles={['admin']}>
            <Settings />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);
