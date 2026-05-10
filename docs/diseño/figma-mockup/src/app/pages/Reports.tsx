import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { BarChart3, TrendingUp, AlertTriangle, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { es } from 'date-fns/locale';

export default function Reports() {
  const { products, sales } = useStore();
  const [periodFilter, setPeriodFilter] = useState('7');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');

  const COLORS = ['#0ea5e9', '#6366f1', '#ec4899', '#f59e0b', '#10b981'];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Filtrar ventas por período
  const filteredSales = useMemo(() => {
    const daysAgo = parseInt(periodFilter);
    const startDate = startOfDay(subDays(new Date(), daysAgo));
    
    return sales.filter((sale) => {
      const saleDate = new Date(sale.date);
      const matchesPeriod = saleDate >= startDate;
      const matchesPayment = paymentFilter === 'all' || sale.paymentMethod === paymentFilter;
      return matchesPeriod && matchesPayment;
    });
  }, [sales, periodFilter, paymentFilter]);

  // Reporte de productos más vendidos
  const topProducts = useMemo(() => {
    const productSales: { [key: string]: { name: string; category: string; quantity: number; total: number } } = {};

    filteredSales.forEach((sale) => {
      sale.items.forEach((item) => {
        const product = products.find((p) => p.id === item.productId);
        if (!product) return;

        if (categoryFilter !== 'all' && product.category !== categoryFilter) return;

        if (!productSales[item.productId]) {
          productSales[item.productId] = {
            name: item.productName,
            category: product.category,
            quantity: 0,
            total: 0,
          };
        }
        productSales[item.productId].quantity += item.quantity;
        productSales[item.productId].total += item.subtotal;
      });
    });

    return Object.entries(productSales)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);
  }, [filteredSales, products, categoryFilter]);

  // Reporte de stock bajo
  const lowStockProducts = useMemo(() => {
    return products
      .filter((p) => p.stock < p.minStock)
      .sort((a, b) => a.stock - b.stock);
  }, [products]);

  // Datos para gráfico de ventas por categoría
  const salesByCategory = useMemo(() => {
    const categorySales: { [key: string]: number } = {
      'Dama': 0,
      'Caballero': 0,
      'Gorra': 0,
    };

    filteredSales.forEach((sale) => {
      sale.items.forEach((item) => {
        const product = products.find((p) => p.id === item.productId);
        if (product) {
          categorySales[product.category] += item.subtotal;
        }
      });
    });

    return Object.entries(categorySales).map(([name, value]) => ({
      name,
      value,
    }));
  }, [filteredSales, products]);

  // Datos para gráfico de ventas por método de pago
  const salesByPayment = useMemo(() => {
    const paymentSales: { [key: string]: number } = {
      'efectivo': 0,
      'tarjeta': 0,
      'transferencia': 0,
    };

    filteredSales.forEach((sale) => {
      paymentSales[sale.paymentMethod] += sale.total;
    });

    return Object.entries(paymentSales).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }));
  }, [filteredSales]);

  // Estadísticas generales
  const stats = useMemo(() => {
    const totalSales = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
    const averageSale = filteredSales.length > 0 ? totalSales / filteredSales.length : 0;
    const totalTransactions = filteredSales.length;

    return {
      totalSales,
      averageSale,
      totalTransactions,
    };
  }, [filteredSales]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Reportes Gerenciales</h1>
        <p className="text-slate-500 mt-1">Análisis y estadísticas de la tienda</p>
      </div>

      {/* Filtros Globales */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Período</label>
              <Select value={periodFilter} onValueChange={setPeriodFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Últimos 7 días</SelectItem>
                  <SelectItem value="30">Últimos 30 días</SelectItem>
                  <SelectItem value="90">Últimos 90 días</SelectItem>
                  <SelectItem value="365">Último año</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas Generales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Total en Ventas
            </CardTitle>
            <DollarSign className="w-5 h-5 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{formatCurrency(stats.totalSales)}</div>
            <p className="text-xs text-slate-500 mt-1">Período seleccionado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Transacciones
            </CardTitle>
            <BarChart3 className="w-5 h-5 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{stats.totalTransactions}</div>
            <p className="text-xs text-slate-500 mt-1">Total de ventas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Ticket Promedio
            </CardTitle>
            <TrendingUp className="w-5 h-5 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{formatCurrency(stats.averageSale)}</div>
            <p className="text-xs text-slate-500 mt-1">Por transacción</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de Reportes */}
      <Tabs defaultValue="top-products" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="top-products">Productos Más Vendidos</TabsTrigger>
          <TabsTrigger value="low-stock">Stock Bajo</TabsTrigger>
          <TabsTrigger value="sales-history">Historial de Ventas</TabsTrigger>
        </TabsList>

        {/* Productos Más Vendidos */}
        <TabsContent value="top-products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Productos Más Vendidos</CardTitle>
              <CardDescription>
                Productos con mayor cantidad de unidades vendidas
              </CardDescription>
              <div className="pt-4">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las categorías</SelectItem>
                    <SelectItem value="Dama">Dama</SelectItem>
                    <SelectItem value="Caballero">Caballero</SelectItem>
                    <SelectItem value="Gorra">Gorra</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Posición</TableHead>
                    <TableHead>Producto</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead className="text-right">Cantidad Vendida</TableHead>
                    <TableHead className="text-right">Total Vendido</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topProducts.map((product, index) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-semibold text-sm">
                            {index + 1}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{product.category}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">{product.quantity}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(product.total)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {topProducts.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  No hay datos de ventas para el período seleccionado
                </div>
              )}
            </CardContent>
          </Card>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Ventas por Categoría</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={salesByCategory}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {salesByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ventas por Método de Pago</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={salesByPayment}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Bar dataKey="value" fill="#0ea5e9" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Stock Bajo */}
        <TabsContent value="low-stock">
          <Card>
            <CardHeader>
              <CardTitle>Productos con Stock Bajo</CardTitle>
              <CardDescription>
                Productos cuya cantidad está por debajo del mínimo definido
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead>Talla</TableHead>
                    <TableHead>Color</TableHead>
                    <TableHead className="text-right">Stock Actual</TableHead>
                    <TableHead className="text-right">Stock Mínimo</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lowStockProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-xs text-slate-500">{product.code}</p>
                        </div>
                      </TableCell>
                      <TableCell>{product.size}</TableCell>
                      <TableCell>{product.color}</TableCell>
                      <TableCell className="text-right font-medium">{product.stock}</TableCell>
                      <TableCell className="text-right">{product.minStock}</TableCell>
                      <TableCell>
                        <Badge variant="destructive" className="flex items-center gap-1 w-fit">
                          <AlertTriangle className="w-3 h-3" />
                          Crítico
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {lowStockProducts.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                  <p>Todos los productos tienen stock suficiente</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Historial de Ventas */}
        <TabsContent value="sales-history">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Ventas</CardTitle>
              <CardDescription>
                Registro detallado de todas las ventas realizadas
              </CardDescription>
              <div className="pt-4">
                <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Método de pago" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los métodos</SelectItem>
                    <SelectItem value="efectivo">Efectivo</SelectItem>
                    <SelectItem value="tarjeta">Tarjeta</SelectItem>
                    <SelectItem value="transferencia">Transferencia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Productos</TableHead>
                    <TableHead>Método de Pago</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell className="font-mono text-sm">{sale.id}</TableCell>
                      <TableCell>
                        {format(new Date(sale.date), "d 'de' MMM yyyy, HH:mm", { locale: es })}
                      </TableCell>
                      <TableCell>{sale.clientName || 'Cliente general'}</TableCell>
                      <TableCell>
                        <div className="text-xs">
                          {sale.items.map((item, idx) => (
                            <div key={idx}>
                              {item.productName} x{item.quantity}
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="capitalize">
                          {sale.paymentMethod}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(sale.total)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filteredSales.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  No hay ventas registradas para el período seleccionado
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
