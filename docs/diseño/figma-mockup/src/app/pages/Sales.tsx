import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { Product, SaleItem, PaymentMethod } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Search, Plus, Minus, Trash2, ShoppingCart, CreditCard, Banknote, Smartphone } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';

export default function Sales() {
  const { products, addSale } = useStore();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('efectivo');
  const [clientName, setClientName] = useState('');
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [lastSaleId, setLastSaleId] = useState('');

  // Filtrar productos
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.color.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory =
        selectedCategory === 'all' || product.category === selectedCategory;

      return matchesSearch && matchesCategory && product.stock > 0;
    });
  }, [products, searchQuery, selectedCategory]);

  // Agregar producto al carrito
  const addToCart = (product: Product) => {
    const existingItem = cart.find(
      (item) => item.productId === product.id
    );

    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        toast.error('No hay suficiente stock disponible');
        return;
      }
      setCart(
        cart.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.unitPrice }
            : item
        )
      );
    } else {
      setCart([
        ...cart,
        {
          productId: product.id,
          productName: product.name,
          size: product.size,
          color: product.color,
          quantity: 1,
          unitPrice: product.salePrice,
          subtotal: product.salePrice,
        },
      ]);
    }
    toast.success('Producto agregado al carrito');
  };

  // Actualizar cantidad
  const updateQuantity = (productId: string, delta: number) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const updatedCart = cart.map((item) => {
      if (item.productId === productId) {
        const newQuantity = item.quantity + delta;
        if (newQuantity <= 0) return item;
        if (newQuantity > product.stock) {
          toast.error('No hay suficiente stock');
          return item;
        }
        return {
          ...item,
          quantity: newQuantity,
          subtotal: newQuantity * item.unitPrice,
        };
      }
      return item;
    });

    setCart(updatedCart);
  };

  // Remover del carrito
  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.productId !== productId));
  };

  // Calcular total
  const total = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.subtotal, 0);
  }, [cart]);

  // Procesar venta
  const processSale = () => {
    if (cart.length === 0) {
      toast.error('El carrito está vacío');
      return;
    }

    const saleId = `s${Date.now()}`;
    const sale = {
      id: saleId,
      date: new Date().toISOString(),
      items: cart,
      total,
      paymentMethod,
      clientName: clientName || undefined,
      employeeName: user?.name || 'Empleado',
    };

    addSale(sale);
    setLastSaleId(saleId);
    toast.success('Venta registrada exitosamente');
    setShowReceiptModal(true);
    
    // Limpiar carrito
    setCart([]);
    setClientName('');
  };

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
        <h1 className="text-3xl font-semibold">Punto de Venta</h1>
        <p className="text-slate-500 mt-1">Registra ventas y gestiona transacciones</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Catálogo de Productos */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Catálogo de Productos</CardTitle>
            <div className="mt-4 space-y-4">
              {/* Buscador */}
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Buscar por nombre, código o color..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filtros por categoría */}
              <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="all">Todos</TabsTrigger>
                  <TabsTrigger value="Dama">Dama</TabsTrigger>
                  <TabsTrigger value="Caballero">Caballero</TabsTrigger>
                  <TabsTrigger value="Gorra">Gorras</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => addToCart(product)}
                >
                  <div className="flex gap-4">
                    {product.imageUrl && (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-20 h-20 object-cover rounded-md"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-medium text-sm">{product.name}</h3>
                      <p className="text-xs text-slate-500 mt-1">
                        {product.size} - {product.color}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="font-semibold text-slate-900">
                          {formatCurrency(product.salePrice)}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          Stock: {product.stock}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {filteredProducts.length === 0 && (
                <div className="col-span-2 text-center py-8 text-slate-500">
                  No se encontraron productos
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Panel de Venta */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Carrito de Compra
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Items del carrito */}
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {cart.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">
                  El carrito está vacío
                </p>
              ) : (
                cart.map((item) => (
                  <div key={item.productId} className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.productName}</p>
                      <p className="text-xs text-slate-500">
                        {item.size} - {item.color}
                      </p>
                      <p className="text-xs font-medium mt-1">
                        {formatCurrency(item.unitPrice)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0"
                        onClick={() => updateQuantity(item.productId, -1)}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="text-sm font-medium w-8 text-center">
                        {item.quantity}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0"
                        onClick={() => updateQuantity(item.productId, 1)}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 ml-1"
                        onClick={() => removeFromCart(item.productId)}
                      >
                        <Trash2 className="w-3 h-3 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Cliente opcional */}
            <div className="space-y-2 pt-4 border-t">
              <Label htmlFor="client">Cliente (Opcional)</Label>
              <Input
                id="client"
                placeholder="Nombre del cliente"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
              />
            </div>

            {/* Método de pago */}
            <div className="space-y-2">
              <Label>Método de Pago</Label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant={paymentMethod === 'efectivo' ? 'default' : 'outline'}
                  className="h-auto py-3 flex flex-col gap-1"
                  onClick={() => setPaymentMethod('efectivo')}
                >
                  <Banknote className="w-5 h-5" />
                  <span className="text-xs">Efectivo</span>
                </Button>
                <Button
                  variant={paymentMethod === 'tarjeta' ? 'default' : 'outline'}
                  className="h-auto py-3 flex flex-col gap-1"
                  onClick={() => setPaymentMethod('tarjeta')}
                >
                  <CreditCard className="w-5 h-5" />
                  <span className="text-xs">Tarjeta</span>
                </Button>
                <Button
                  variant={paymentMethod === 'transferencia' ? 'default' : 'outline'}
                  className="h-auto py-3 flex flex-col gap-1"
                  onClick={() => setPaymentMethod('transferencia')}
                >
                  <Smartphone className="w-5 h-5" />
                  <span className="text-xs">Transfer.</span>
                </Button>
              </div>
            </div>

            {/* Total */}
            <div className="pt-4 border-t space-y-2">
              <div className="flex justify-between text-lg font-semibold">
                <span>Total:</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>

            {/* Botón de cobrar */}
            <Button
              className="w-full"
              size="lg"
              onClick={processSale}
              disabled={cart.length === 0}
            >
              Procesar Venta
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Modal de Recibo */}
      <Dialog open={showReceiptModal} onOpenChange={setShowReceiptModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Venta Completada</DialogTitle>
            <DialogDescription>
              Recibo de la transacción #{lastSaleId}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <ShoppingCart className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-sm text-slate-600">
                La venta se ha registrado exitosamente
              </p>
            </div>
            <Button className="w-full" onClick={() => setShowReceiptModal(false)}>
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
