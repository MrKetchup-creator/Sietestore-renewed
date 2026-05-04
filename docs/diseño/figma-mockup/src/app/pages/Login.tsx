import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Store, User, Lock, Mail } from 'lucide-react';
import { toast } from 'sonner';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('admin');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Por favor ingresa correo y contraseña');
      return;
    }

    const success = login(email, password, role);
    
    if (success) {
      toast.success('Inicio de sesión exitoso');
      navigate(role === 'admin' ? '/dashboard' : '/ventas');
    } else {
      toast.error('Credenciales incorrectas');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center">
            <Store className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-3xl">Siete Store</CardTitle>
          <CardDescription>
            Sistema de Gestión de Ventas e Inventario
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Selector de Rol */}
            <div className="space-y-2">
              <Label>Perfil de Acceso</Label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant={role === 'admin' ? 'default' : 'outline'}
                  className="w-full"
                  onClick={() => setRole('admin')}
                >
                  <User className="w-4 h-4 mr-2" />
                  Administrador
                </Button>
                <Button
                  type="button"
                  variant={role === 'employee' ? 'default' : 'outline'}
                  className="w-full"
                  onClick={() => setRole('employee')}
                >
                  <User className="w-4 h-4 mr-2" />
                  Empleado
                </Button>
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Button type="submit" className="w-full" size="lg">
              Iniciar Sesión
            </Button>
          </form>

          {/* Credenciales de prueba */}
          <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-xs font-medium text-slate-600 mb-2">Credenciales de prueba:</p>
            <div className="space-y-1 text-xs text-slate-500">
              <p><strong>Admin:</strong> admin@sietestore.com / admin123</p>
              <p><strong>Empleado:</strong> empleado@sietestore.com / empleado123</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
