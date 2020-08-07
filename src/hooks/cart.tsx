import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // await AsyncStorage.setItem('@GoMarketplace:products', '');

      const storageProducts = await AsyncStorage.getItem(
        '@GoMarketplace:products',
      );

      if (storageProducts) {
        setProducts([...JSON.parse(storageProducts)]);
      }
    }
    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      let newProducts = [{} as Product];

      if (products.findIndex(p => p.id === product.id) === -1) {
        newProducts = [...products, { ...product, quantity: 1 }];
      } else {
        newProducts = products.map(p =>
          p.id !== product.id ? p : { ...p, quantity: p.quantity + 1 },
        );
      }

      setProducts(newProducts);

      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(newProducts),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const newProducts = products.map(p =>
        p.id !== id ? p : { ...p, quantity: p.quantity + 1 },
      );

      setProducts(newProducts);

      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(newProducts),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      let newProducts = [{} as Product];
      const decrementProduct = products.find(p => p.id === id);

      if (decrementProduct && decrementProduct.quantity === 1) {
        newProducts = products.filter(p => p.id !== id);
      } else {
        newProducts = products.map(p =>
          p.id !== id ? p : { ...p, quantity: p.quantity - 1 },
        );
      }

      setProducts(newProducts);

      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(newProducts),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
