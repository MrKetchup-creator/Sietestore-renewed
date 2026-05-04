import { RouterProvider } from 'react-router';
import { AuthProvider } from './context/AuthContext';
import { StoreProvider } from './context/StoreContext';
import { router } from './routes';
import { Toaster } from './components/ui/sonner';

export default function App() {
  return (
    <AuthProvider>
      <StoreProvider>
        <RouterProvider router={router} />
        <Toaster position="top-right" />
      </StoreProvider>
    </AuthProvider>
  );
}
