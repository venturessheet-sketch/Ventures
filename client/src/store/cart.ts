import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '@/data/products';

export interface CartItem {
  cartItemId: string;
  product: Product;
  quantity: number;
  size?: string;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  addItem: (product: Product, quantity?: number, size?: string) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  updateSize: (cartItemId: string, newSize: string) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      setIsOpen: (isOpen) => set({ isOpen }),
      
      addItem: (product, quantity = 1, size) => {
        set((state) => {
          const cartItemId = `${product.id}-${size || 'unselected'}`;
          const existingItem = state.items.find((item) => item.cartItemId === cartItemId);
          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.cartItemId === cartItemId
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
              isOpen: true,
            };
          }
          return {
            items: [...state.items, { cartItemId, product, quantity, size }],
            isOpen: true,
          };
        });
      },
      
      removeItem: (cartItemId) => {
        set((state) => ({
          items: state.items.filter((item) => item.cartItemId !== cartItemId),
        }));
      },
      
      updateQuantity: (cartItemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(cartItemId);
          return;
        }
        set((state) => ({
          items: state.items.map((item) =>
            item.cartItemId === cartItemId ? { ...item, quantity } : item
          ),
        }));
      },
      
      updateSize: (cartItemId, newSize) => {
        set((state) => {
          const itemToUpdate = state.items.find(i => i.cartItemId === cartItemId);
          if (!itemToUpdate) return state;

          const newCartItemId = `${itemToUpdate.product.id}-${newSize}`;
          const existingTarget = state.items.find(i => i.cartItemId === newCartItemId);

          if (existingTarget) {
            // Target size already exists, merge them
            return {
              items: state.items.map(item =>
                item.cartItemId === newCartItemId
                  ? { ...item, quantity: item.quantity + itemToUpdate.quantity }
                  : item
              ).filter(item => item.cartItemId !== cartItemId)
            };
          } else {
            // Just update size and ID
            return {
              items: state.items.map(item =>
                item.cartItemId === cartItemId
                  ? { ...item, cartItemId: newCartItemId, size: newSize }
                  : item
              )
            };
          }
        });
      },
      
      clearCart: () => set({ items: [] }),
      
      getTotal: () => {
        const { items } = get();
        return items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
      },
      
      getItemCount: () => {
        const { items } = get();
        return items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'ventures-cart-storage',
      partialize: (state) => ({ items: state.items }),
    }
  )
);
