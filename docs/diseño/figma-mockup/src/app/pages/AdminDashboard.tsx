import React, { useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { DollarSign, ShoppingBag, Package, AlertTriangle } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function AdminDashboard() {
  const { products, sales } = useStore();

  // Calcular estadísticas
  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    // Ventas del día
    const todaySales = sales.filter((sale) => {
      const saleDate = new Date(sale.date);
      saleDate.setHours(0, 0, 0, 0);
      return saleDate.getTime() === today.getTime();
    });

    // Ventas del mes
    const monthSales = sales.filter((sale) => {
      const saleDate = new Date(sale.date);
      return saleDate >= thisMonth;
    });

    // Productos con stock bajo
    const lowStockProducts = products.filter((p) => p.stock < p.minStock);

    return {
      monthSales: monthSales.reduce((sum, sale) => sum + sale.total, 0),
      daySalesCount: todaySales.length,
      totalProducts: products.reduce((sum, p) => sum + p.stock, 0),
      lowStockCount: lowStockProducts.length,
    };
  }, [products, sales]);

  // Productos con stock bajo
  const lowStockProducts = useMemo(() => {
    return products.filter((p) => p.stock < p.minStock).slice(0, 5);
  }, [products]);

  // Últimas ventas
  const recentSales = useMemo(() => {
    return sales.slice(0, 5);
  }, [sales]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Dashboard</h1>
        <p className="text-slate-500 mt-1">Panel de control administrativo</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Ventas del Mes
            </CardTitle>
            <DollarSign className="w-5 h-5 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{formatCurrency(stats.monthSales)}</div>
            <p className="text-xs text-slate-500 mt-1">Abril 2026</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Ventas Hoy
            </CardTitle>
            <ShoppingBag className="w-5 h-5 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{stats.daySalesCount}</div>
            <p className="text-xs text-slate-500 mt-1">Transacciones del día</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Total Productos
            </CardTitle>
            <Package className="w-5 h-5 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{stats.totalProducts}</div>
            <p className="text-xs text-slate-500 mt-1">Unidades en stock</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Stock Bajo
            </CardTitle>
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-amber-600">{stats.lowStockCount}</div>
            <p className="text-xs text-slate-500 mt-1">Productos críticos</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Últimas Ventas */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Últimas Ventas</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentSales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell className="font-medium">{sale.id}</TableCell>
                    <TableCell>
                      {format(new Date(sale.date), "d 'de' MMM, HH:mm", { locale: es })}
                    </TableCell>
                    <TableCell>{sale.clientName || 'Cliente general'}</TableCell>
                    <TableCell className="font-medium">{formatCurrency(sale.total)}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Completada
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Alertas de Stock Bajo */}
        <Card>
          <CardHeader>
            <CardTitle>Alertas de Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lowStockProducts.length === 0 ? (
                <p className="text-sm text-slate-500">No hay productos con stock bajo</p>
              ) : (
                lowStockProducts.map((product) => (
                  <div key={product.id} className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{product.name}</p>
                      <p className="text-xs text-slate-600 mt-0.5">
                        {product.size} - {product.color}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-amber-700">
                          Stock: {product.stock} / Mínimo: {product.minStock}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
