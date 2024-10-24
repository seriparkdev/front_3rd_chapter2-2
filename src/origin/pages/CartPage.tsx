import ProductList from '../components/cart/ProductList.tsx';
import CartItemList from '../components/cart/CartItemList.tsx';
import { CartProvider } from '../contexts/CartContext.tsx';
import CouponApplySection from '../components/cart/CouponApplySection.tsx';
import CartSummary from '../components/cart/CartSummary.tsx';

export const CartPage = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">장바구니</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CartProvider>
          <div>
            <h2 className="text-2xl font-semibold mb-4">상품 목록</h2>
            <div className="space-y-2">
              <ProductList />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-4">장바구니 내역</h2>
            <div className="space-y-2">
              <CartItemList />
              <CouponApplySection />
              <CartSummary />
            </div>
          </div>
        </CartProvider>
      </div>
    </div>
  );
};
