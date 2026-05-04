import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { Product, Category, Size } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '../components/ui/dialog';
import { Search, Plus, Edit, Trash2, Copy, Package } from 'lucide-react';
import { toast } from 'sonner';
import { Textarea } from '../components/ui/textarea';

export default function Inventory() {
  const { products, addProduct, updateProduct, deleteProduct } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Estado del formulario
  const [formData, setFormData] = useState<Partial<Product>>({
    code: '',
    name: '',
    category: 'Dama',
    type: '',
    size: 'M',
    color: '',
    brand: '',
    salePrice: 0,
    cost: 0,
    stock: 0,
    minStock: 5,
    description: '',
    location: '',
    entryDate: new Date().toISOString().split('T')[0],
    imageUrl: '',
  });

  // Filtrar productos
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory =
        categoryFilter === 'all' || product.category === categoryFilter;

      const matchesStock =
        stockFilter === 'all' ||
        (stockFilter === 'low' && product.stock < product.minStock) ||
        (stockFilter === 'normal' && product.stock >= product.minStock);

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [products, searchQuery, categoryFilter, stockFilter]);

  const handleSubmit = () => {
    if (!formData.code || !formData.name || !formData.type || !formData.brand) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    if (editingProduct) {
      updateProduct(editingProduct.id, formData);
      toast.success('Producto actualizado exitosamente');
    } else {
      const newProduct: Product = {
        ...formData,
        id: `p${Date.now()}`,
      } as Product;
      addProduct(newProduct);
      toast.success('Producto agregado exitosamente');
    }

    resetForm();
    setIsAddModalOpen(false);
    setEditingProduct(null);
  };

  const handleEdit = (product: Product) => {
    setFormData(product);
    setEditingProduct(product);
    setIsAddModalOpen(true);
  };

  const handleDuplicate = (product: Product) => {
    setFormData({
      ...product,
      code: `${product.code}-COPY`,
      name: `${product.name} (Copia)`,
    });
    setEditingProduct(null);
    setIsAddModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
      deleteProduct(id);
      toast.success('Producto eliminado');
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      category: 'Dama',
      type: '',
      size: 'M',
      color: '',
      brand: '',
      salePrice: 0,
      cost: 0,
      stock: 0,
      minStock: 5,
      description: '',
      location: '',
      entryDate: new Date().toISOString().split('T')[0],
      imageUrl: '',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStockProgress = (stock: number, minStock: number) => {
    const maxStock = minStock * 3;
    return Math.min((stock / maxStock) * 100, 100);
  };

  const getStockColor = (stock: number, minStock: number) => {
    if (stock < minStock) return 'bg-red-500';
    if (stock < minStock * 2) return 'bg-amber-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Gestión de Inventario</h1>
          <p className="text-slate-500 mt-1">Administra el catálogo de productos</p>
        </div>
        <Dialog open={isAddModalOpen} onOpenChange={(open) => {
          setIsAddModalOpen(open);
          if (!open) {
            setEditingProduct(null);
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Producto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? 'Editar Producto' : 'Agregar Nuevo Producto'}
              </DialogTitle>
              <DialogDescription>
                Completa la información del producto
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="code">Código *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="CAM-001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Nombre *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Camisa Casual"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Categoría *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value as Category })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Dama">Dama</SelectItem>
                    <SelectItem value="Caballero">Caballero</SelectItem>
                    <SelectItem value="Gorra">Gorra</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Tipo de Prenda *</Label>
                <Input
                  id="type"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  placeholder="camisa, pantalón, vestido..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="size">Talla</Label>
                <Select
                  value={formData.size}
                  onValueChange={(value) => setFormData({ ...formData, size: value as Size })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="XS">XS</SelectItem>
                    <SelectItem value="S">S</SelectItem>
                    <SelectItem value="M">M</SelectItem>
                    <SelectItem value="L">L</SelectItem>
                    <SelectItem value="XL">XL</SelectItem>
                    <SelectItem value="XXL">XXL</SelectItem>
                    <SelectItem value="Única">Única</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  placeholder="Azul, Rojo, Negro..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="brand">Marca *</Label>
                <Input
                  id="brand"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  placeholder="Fashion Co."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salePrice">Precio de Venta</Label>
                <Input
                  id="salePrice"
                  type="number"
                  value={formData.salePrice}
                  onChange={(e) => setFormData({ ...formData, salePrice: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cost">Costo</Label>
                <Input
                  id="cost"
                  type="number"
                  value={formData.cost}
                  onChange={(e) => setFormData({ ...formData, cost: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Cantidad en Stock</Label>
                <Input
                  id="stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minStock">Stock Mínimo</Label>
                <Input
                  id="minStock"
                  type="number"
                  value={formData.minStock}
                  onChange={(e) => setFormData({ ...formData, minStock: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Ubicación</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Estante A1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="entryDate">Fecha de Ingreso</Label>
                <Input
                  id="entryDate"
                  type="date"
                  value={formData.entryDate}
                  onChange={(e) => setFormData({ ...formData, entryDate: e.target.value })}
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="imageUrl">URL de Imagen (Opcional)</Label>
                <Input
                  id="imageUrl"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descripción del producto..."
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => {
                setIsAddModalOpen(false);
                setEditingProduct(null);
                resetForm();
              }}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit}>
                {editingProduct ? 'Actualizar' : 'Agregar'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4">
            {/* Buscador */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Buscar por nombre, código o marca..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filtros */}
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

            <Select value={stockFilter} onValueChange={setStockFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Stock" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los niveles</SelectItem>
                <SelectItem value="low">Stock bajo</SelectItem>
                <SelectItem value="normal">Stock normal</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Producto</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Talla</TableHead>
                <TableHead>Color</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-mono text-sm">{product.code}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-xs text-slate-500">{product.brand}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{product.category}</Badge>
                  </TableCell>
                  <TableCell>{product.size}</TableCell>
                  <TableCell>{product.color}</TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(product.salePrice)}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{product.stock}</span>
                        {product.stock < product.minStock && (
                          <Badge variant="destructive" className="text-xs">Bajo</Badge>
                        )}
                      </div>
                      <Progress
                        value={getStockProgress(product.stock, product.minStock)}
                        className="h-1.5"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(product)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDuplicate(product)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(product.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredProducts.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              <Package className="w-12 h-12 mx-auto mb-2 text-slate-400" />
              <p>No se encontraron productos</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
