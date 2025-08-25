export interface ProductForCart {
  id: string;
  name: string;
  description: string;
  category: string;
  image_url: string;
  rating?: number;
  reviews_count?: number;
  in_stock?: boolean;
}

export interface CartItem {
  id: string;
  quantity: number;
  products: ProductForCart;
}
