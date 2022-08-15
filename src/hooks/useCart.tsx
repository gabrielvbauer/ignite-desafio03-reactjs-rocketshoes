import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    // const storagedCart = Buscar dados do localStorage

    // if (storagedCart) {
    //   return JSON.parse(storagedCart);
    // }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      const productHasStockResponse = await api.get(`/stock/${productId}`);
      
      if (!productHasStockResponse.data) return
      if (productHasStockResponse.data.amount < 1) return

      const response = await api.get(`/products/${productId}`);
      setCart([...cart, {
        ...response.data,
        amount: 1
      }])
    } catch {
      // TODO
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const cartWithoutProductToBeRemoved = cart.filter((product) => {
        return product.id !== productId;
      })
      setCart(cartWithoutProductToBeRemoved);
    } catch {
      // TODO
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      const productHasStockResponse = await api.get(`/stock/${productId}`);
      
      if (!productHasStockResponse.data) return false

      if (amount > productHasStockResponse.data.amount) return false;

      
    } catch {
      // TODO
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
