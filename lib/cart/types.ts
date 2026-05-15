export interface CartEntry {
  productId: string;
  quantity: number;
}

export interface CartItem extends CartEntry {
  name: string;
  price: number;
  formattedPrice: string;
}
