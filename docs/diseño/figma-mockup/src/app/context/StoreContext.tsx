import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Product, Sale, SaleItem } from '../types';
import { mockProducts, mockSales } from '../data/mockData';

interface StoreContextType {
  products: Product[];
  sales: Sale[];
  addProduct: (product: Product) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addSale: (sale: Sale) => void;
  updateStock: (productId: string, quantity: number) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [sales, setSales] = useState<Sale[]>(mockSales);

  const addProduct = (product: Product) => {
    setProducts([...products, product]);
  };

  const updateProduct = (id: string, updatedProduct: Partial<Product>) => {
    setProducts(products.map((p) => (p.id === id ? { ...p, ...updatedProduct } : p)));
  };

  const deleteProduct = (id: string) => {
    setProducts(products.filter((p) => p.id !== id));
  };

  const addSale = (sale: Sale) => {
    setSales([sale, ...sales]);
    
    // Actualizar stock de productos
    sale.items.forEach((item) => {
      updateStock(item.productId, item.quantity);
    });
  };

  const updateStock = (productId: string, quantity: number) => {
    setProducts(
      products.map((p) =>
        p.id === productId ? { ...p, stock: p.stock - quantity } : p
      )
    );
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        sales,
        addProduct,
        updateProduct,
        deleteProduct,
        addSale,
        updateStock,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore debe usarse dentro de StoreProvider');
  }
  return context;
};
