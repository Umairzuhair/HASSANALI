
import type { ProductForCart, CartItem } from "@/types/cart";

// Guest Cart: localStorage utilities
const GUEST_CART_KEY = "guest_cart";

// Gets the guest cart array from localStorage (or empty array)
export function getGuestCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    if (!raw) {
      console.log("[guestCart] getGuestCart: No cart found, returning []");
      return [];
    }
    const parsed = JSON.parse(raw) || [];
    console.log("[guestCart] getGuestCart: Loaded cart", parsed);
    return parsed;
  } catch (err) {
    console.error("[guestCart] getGuestCart: Error parsing cart", err);
    return [];
  }
}

// Saves the guest cart array to localStorage
export function setGuestCart(items: CartItem[]) {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
  console.log("[guestCart] setGuestCart: Saved cart", items);
}

// Removes the guest cart from localStorage
export function removeGuestCart() {
  localStorage.removeItem(GUEST_CART_KEY);
  console.log("[guestCart] removeGuestCart: Cart removed");
}

// Clears the guest cart (alias for removeGuestCart for consistency)
export function clearGuestCart() {
  removeGuestCart();
  window.dispatchEvent(new CustomEvent("guestCartUpdated"));
  console.log("[guestCart] clearGuestCart: Cart cleared");
}

// Exposed guest cart fns
export function addToGuestCart(product: ProductForCart, quantity = 1) {
  console.log("[guestCart] addToGuestCart: Adding", product, "qty", quantity);
  let cart = getGuestCart();
  const idx = cart.findIndex((i) => i.products.id === product.id);
  if (idx >= 0) {
    // Already exists: update quantity
    cart[idx].quantity += quantity;
  } else {
    cart.push({
      id: "guest-" + product.id,
      quantity,
      products: product,
    });
  }
  setGuestCart(cart);
  // Notify via event for listening UI (like Cart)
  window.dispatchEvent(new CustomEvent("guestCartUpdated"));
}

export function updateGuestCartQuantity(itemId: string, newQuantity: number) {
  let cart = getGuestCart();
  cart = cart
    .map((item) =>
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    )
    .filter((item) => item.quantity > 0);
  setGuestCart(cart);
  window.dispatchEvent(new CustomEvent("guestCartUpdated"));
  console.log("[guestCart] updateGuestCartQuantity: Updated", itemId, newQuantity);
}

export function removeFromGuestCart(itemId: string) {
  let cart = getGuestCart();
  cart = cart.filter((item) => item.id !== itemId);
  setGuestCart(cart);
  window.dispatchEvent(new CustomEvent("guestCartUpdated"));
  console.log("[guestCart] removeFromGuestCart: Removed", itemId);
}
