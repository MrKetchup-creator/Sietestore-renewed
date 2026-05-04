import { Store, Package, ShoppingCart, BarChart3, Users, Settings } from 'lucide-react';
import { UserRole } from '../types';

export interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  allowedRoles: UserRole[];
}

export const navigationItems: NavItem[] = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: Store,
    allowedRoles: ['admin', 'employee'],
  },
  {
    label: 'Ventas',
    path: '/ventas',
    icon: ShoppingCart,
    allowedRoles: ['admin', 'employee'],
  },
  {
    label: 'Inventario',
    path: '/inventario',
    icon: Package,
    allowedRoles: ['admin'],
  },
  {
    label: 'Reportes',
    path: '/reportes',
    icon: BarChart3,
    allowedRoles: ['admin'],
  },
  {
    label: 'Configuración',
    path: '/configuracion',
    icon: Settings,
    allowedRoles: ['admin'],
  },
];
