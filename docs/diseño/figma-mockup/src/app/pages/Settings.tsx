import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Separator } from '../components/ui/separator';
import { User, Mail, Building2, MapPin, Phone } from 'lucide-react';

export default function Settings() {
  const { user } = useAuth();

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-semibold">Configuración</h1>
        <p className="text-slate-500 mt-1">Administra la configuración de la tienda y tu perfil</p>
      </div>

      {/* Información del Usuario */}
      <Card>
        <CardHeader>
          <CardTitle>Perfil de Usuario</CardTitle>
          <CardDescription>
            Información de tu cuenta de {user?.role === 'admin' ? 'administrador' : 'empleado'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre Completo</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <Input
                id="name"
                value={user?.name || ''}
                readOnly
                className="pl-10"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Correo Electrónico</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <Input
                id="email"
                type="email"
                value={user?.email || ''}
                readOnly
                className="pl-10"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Rol</Label>
            <Input
              id="role"
              value={user?.role === 'admin' ? 'Administrador' : 'Empleado'}
              readOnly
            />
          </div>
        </CardContent>
      </Card>

      {/* Información de la Tienda */}
      <Card>
        <CardHeader>
          <CardTitle>Información de la Tienda</CardTitle>
          <CardDescription>
            Datos de Siete Store
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="store-name">Nombre de la Tienda</Label>
            <div className="relative">
              <Building2 className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <Input
                id="store-name"
                value="Siete Store"
                readOnly
                className="pl-10"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Dirección</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <Input
                id="address"
                value="Pamplona, Norte de Santander"
                readOnly
                className="pl-10"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <Input
                id="phone"
                value="+57 300 123 4567"
                readOnly
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Información del Proyecto */}
      <Card className="border-slate-200 bg-slate-50">
        <CardHeader>
          <CardTitle>Información del Proyecto</CardTitle>
          <CardDescription>
            Proyecto Académico - Universidad de Pamplona
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-600 font-medium">Asignatura:</p>
                <p>Desarrollo Orientado a Plataformas</p>
              </div>
              <div>
                <p className="text-slate-600 font-medium">Universidad:</p>
                <p>Universidad de Pamplona</p>
              </div>
              <div>
                <p className="text-slate-600 font-medium">Cliente:</p>
                <p>Deinnys Carreño García</p>
              </div>
              <div>
                <p className="text-slate-600 font-medium">Desarrollador:</p>
                <p>Alexander Medina</p>
              </div>
            </div>
          </div>
          <Separator />
          <div className="text-xs text-slate-500">
            <p>Esta es una plataforma de demostración desarrollada como prototipo funcional.</p>
            <p className="mt-1">Los datos mostrados son de prueba y no se persisten en una base de datos real.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
