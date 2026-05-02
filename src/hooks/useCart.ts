import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/auth/AuthProvider';
import { apiRequest } from '@/lib/api';

type CartProduct = {
  id: string;
  slug: string;
  title: string;
  price: number | null;
  images: { url: string }[];
};

export type CartItem = {
  id: string;
  quantity: number;
  product: CartProduct;
};

type CartResponse = {
  items: CartItem[];
};

export type OrderCheckoutResult = {
  id: string;
  ticket_number: string;
  status: string;
  total_items: number;
};

export const useCartItems = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['cart-items', user?.id],
    enabled: Boolean(user),
    queryFn: async (): Promise<CartItem[]> => {
      const data = await apiRequest<CartResponse>('/api/account/cart');
      return data.items;
    },
  });
};

export const useCartCount = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['cart-count', user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const data = await apiRequest<CartResponse>('/api/account/cart');
      return data.items.reduce((sum, item) => sum + item.quantity, 0);
    },
  });
};

export const useAddToCart = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, quantity = 1 }: { productId: string; quantity?: number }) => {
      if (!user) {
        throw new Error('AUTH_REQUIRED');
      }

      return apiRequest('/api/account/cart/items', {
        method: 'POST',
        body: JSON.stringify({
          product_id: productId,
          quantity,
        }),
      });
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['cart-items', user?.id] }),
        queryClient.invalidateQueries({ queryKey: ['cart-count', user?.id] }),
      ]);
    },
  });
};

export const useUpdateCartItem = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      if (!user) {
        throw new Error('AUTH_REQUIRED');
      }

      return apiRequest(`/api/account/cart/items/${itemId}`, {
        method: 'PATCH',
        body: JSON.stringify({ quantity }),
      });
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['cart-items', user?.id] }),
        queryClient.invalidateQueries({ queryKey: ['cart-count', user?.id] }),
      ]);
    },
  });
};

export const useRemoveCartItem = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: string) => {
      if (!user) {
        throw new Error('AUTH_REQUIRED');
      }

      return apiRequest(`/api/account/cart/items/${itemId}`, { method: 'DELETE' });
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['cart-items', user?.id] }),
        queryClient.invalidateQueries({ queryKey: ['cart-count', user?.id] }),
      ]);
    },
  });
};

export const useCheckoutCart = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ comment }: { comment?: string }) => {
      if (!user) {
        throw new Error('AUTH_REQUIRED');
      }

      return apiRequest<OrderCheckoutResult>('/api/account/orders', {
        method: 'POST',
        body: JSON.stringify({ comment: comment || null }),
      });
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['cart-items', user?.id] }),
        queryClient.invalidateQueries({ queryKey: ['cart-count', user?.id] }),
      ]);
    },
  });
};
