import { beforeAll, beforeEach, describe, expect, it, test, vi } from 'vitest';
import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
  within
} from '@testing-library/react';
import { CartPage } from '../../origin/pages/CartPage.tsx';
import { AdminPage } from '../../origin/pages/AdminPage.tsx';
import { CartItem, Coupon, Discount, Product } from '../../types';
import { useProductStore } from '../../origin/stores/useProductStore.ts';
import { useCouponStore } from '../../origin/stores/useCouponStore.ts';
import { EditingProductProvider } from '../../origin/contexts/EditingProductContext.tsx';
import { CartProvider } from '../../origin/contexts/CartContext.tsx';
import {
  addItemToCart,
  getApplicableDiscount,
  getMaxDiscount,
  getRemainingStock,
  removeItemFromCart
} from '../../origin/hooks/utils/cartUtils.ts';
import {
  addDiscountToProduct,
  findProductById,
  removeDiscountFromProduct
} from '../../origin/hooks/utils/productUtils.ts';
import { useCart } from '../../origin/hooks/useCart.ts';
import { useDiscount, useNewCoupon, useNewProduct } from '../../origin/hooks';
import { useEditProduct } from '../../origin/hooks/useEditProduct.ts';

const mockProducts: Product[] = [
  {
    id: 'p1',
    name: '상품1',
    price: 10000,
    stock: 20,
    discounts: [{ quantity: 10, rate: 0.1 }]
  },
  {
    id: 'p2',
    name: '상품2',
    price: 20000,
    stock: 20,
    discounts: [{ quantity: 10, rate: 0.15 }]
  },
  {
    id: 'p3',
    name: '상품3',
    price: 30000,
    stock: 20,
    discounts: [{ quantity: 10, rate: 0.2 }]
  }
];
const mockCoupons: Coupon[] = [
  {
    name: '5000원 할인 쿠폰',
    code: 'AMOUNT5000',
    discountType: 'amount',
    discountValue: 5000
  },
  {
    name: '10% 할인 쿠폰',
    code: 'PERCENT10',
    discountType: 'percentage',
    discountValue: 10
  }
];

const testProduct: Product = {
  id: 'test_p1',
  name: 'test상품',
  price: 25000,
  stock: 30,
  discounts: [{ quantity: 10, rate: 0.1 }]
};

const testCoupon: Coupon = {
  name: 'test 할인 쿠폰',
  code: 'TEST_DISCOUNT',
  discountType: 'amount',
  discountValue: 3000
};

const TestAdminPage = () => {
  return (
    <EditingProductProvider>
      <AdminPage />
    </EditingProductProvider>
  );
};

describe('advanced > ', () => {
  beforeAll(() => {
    useProductStore.setState({ products: mockProducts });
    useCouponStore.setState({ coupons: mockCoupons });
  });

  describe('시나리오 테스트 > ', () => {
    test('장바구니 페이지 테스트 > ', async () => {
      render(
        <CartProvider>
          <CartPage products={mockProducts} coupons={mockCoupons} />
        </CartProvider>
      );
      const product1 = screen.getByTestId('product-p1');
      const product2 = screen.getByTestId('product-p2');
      const product3 = screen.getByTestId('product-p3');
      const addToCartButtonsAtProduct1 =
        within(product1).getByText('장바구니에 추가');
      const addToCartButtonsAtProduct2 =
        within(product2).getByText('장바구니에 추가');
      const addToCartButtonsAtProduct3 =
        within(product3).getByText('장바구니에 추가');

      // 1. 상품 정보 표시
      expect(product1).toHaveTextContent('상품1');
      expect(product1).toHaveTextContent('10,000원');
      expect(product1).toHaveTextContent('재고: 20개');
      expect(product2).toHaveTextContent('상품2');
      expect(product2).toHaveTextContent('20,000원');
      expect(product2).toHaveTextContent('재고: 20개');
      expect(product3).toHaveTextContent('상품3');
      expect(product3).toHaveTextContent('30,000원');
      expect(product3).toHaveTextContent('재고: 20개');

      // 2. 할인 정보 표시
      expect(screen.getByText('10개 이상: 10% 할인')).toBeInTheDocument();

      // 3. 상품1 장바구니에 상품 추가
      fireEvent.click(addToCartButtonsAtProduct1); // 상품1 추가

      // 4. 할인율 계산
      expect(screen.getByText('상품 금액: 10,000원')).toBeInTheDocument();
      expect(screen.getByText('할인 금액: 0원')).toBeInTheDocument();
      expect(screen.getByText('최종 결제 금액: 10,000원')).toBeInTheDocument();

      // 5. 상품 품절 상태로 만들기
      for (let i = 0; i < 19; i++) {
        fireEvent.click(addToCartButtonsAtProduct1);
      }

      // 6. 품절일 때 상품 추가 안 되는지 확인하기
      expect(product1).toHaveTextContent('재고: 0개');
      fireEvent.click(addToCartButtonsAtProduct1);
      expect(product1).toHaveTextContent('재고: 0개');

      // 7. 할인율 계산
      expect(screen.getByText('상품 금액: 200,000원')).toBeInTheDocument();
      expect(screen.getByText('할인 금액: 20,000원')).toBeInTheDocument();
      expect(screen.getByText('최종 결제 금액: 180,000원')).toBeInTheDocument();

      // 8. 상품을 각각 10개씩 추가하기
      fireEvent.click(addToCartButtonsAtProduct2); // 상품2 추가
      fireEvent.click(addToCartButtonsAtProduct3); // 상품3 추가

      const increaseButtons = screen.getAllByText('+');
      for (let i = 0; i < 9; i++) {
        fireEvent.click(increaseButtons[1]); // 상품2
        fireEvent.click(increaseButtons[2]); // 상품3
      }

      // 9. 할인율 계산
      expect(screen.getByText('상품 금액: 700,000원')).toBeInTheDocument();
      expect(screen.getByText('할인 금액: 110,000원')).toBeInTheDocument();
      expect(screen.getByText('최종 결제 금액: 590,000원')).toBeInTheDocument();

      // 10. 쿠폰 적용하기
      const couponSelect = screen.getByRole('combobox');
      fireEvent.change(couponSelect, { target: { value: '1' } }); // 10% 할인 쿠폰 선택

      // 11. 할인율 계산
      expect(screen.getByText('상품 금액: 700,000원')).toBeInTheDocument();
      expect(screen.getByText('할인 금액: 169,000원')).toBeInTheDocument();
      expect(screen.getByText('최종 결제 금액: 531,000원')).toBeInTheDocument();

      // 12. 다른 할인 쿠폰 적용하기
      fireEvent.change(couponSelect, { target: { value: '0' } }); // 5000원 할인 쿠폰
      expect(screen.getByText('상품 금액: 700,000원')).toBeInTheDocument();
      expect(screen.getByText('할인 금액: 115,000원')).toBeInTheDocument();
      expect(screen.getByText('최종 결제 금액: 585,000원')).toBeInTheDocument();
    });

    test('관리자 페이지 테스트 > ', async () => {
      render(<TestAdminPage />);

      const $product1 = screen.getByTestId('product-1');

      // 1. 새로운 상품 추가
      fireEvent.click(screen.getByText('새 상품 추가'));

      fireEvent.change(screen.getByLabelText('상품명'), {
        target: { value: '상품4' }
      });
      fireEvent.change(screen.getByLabelText('가격'), {
        target: { value: '15000' }
      });
      fireEvent.change(screen.getByLabelText('재고'), {
        target: { value: '30' }
      });

      fireEvent.click(screen.getByText('추가'));

      const $product4 = screen.getByTestId('product-4');

      expect($product4).toHaveTextContent('상품4');
      expect($product4).toHaveTextContent('15000원');
      expect($product4).toHaveTextContent('재고: 30');

      // 2. 상품 선택 및 수정
      fireEvent.click($product1);
      fireEvent.click(within($product1).getByTestId('toggle-button'));
      fireEvent.click(within($product1).getByTestId('modify-button'));

      act(() => {
        fireEvent.change(within($product1).getByDisplayValue('20'), {
          target: { value: '25' }
        });
        fireEvent.change(within($product1).getByDisplayValue('10000'), {
          target: { value: '12000' }
        });
        fireEvent.change(within($product1).getByDisplayValue('상품1'), {
          target: { value: '수정된 상품1' }
        });
      });

      fireEvent.click(within($product1).getByText('수정 완료'));

      expect($product1).toHaveTextContent('수정된 상품1');
      expect($product1).toHaveTextContent('12000원');
      expect($product1).toHaveTextContent('재고: 25');

      // 3. 상품 할인율 추가 및 삭제
      fireEvent.click($product1);
      fireEvent.click(within($product1).getByTestId('modify-button'));

      // 할인 추가
      act(() => {
        fireEvent.change(screen.getByPlaceholderText('수량'), {
          target: { value: '5' }
        });
        fireEvent.change(screen.getByPlaceholderText('할인율 (%)'), {
          target: { value: '5' }
        });
      });
      fireEvent.click(screen.getByText('할인 추가'));

      expect(
        screen.queryByText('5개 이상 구매 시 5% 할인')
      ).toBeInTheDocument();

      // 할인 삭제
      fireEvent.click(screen.getAllByText('삭제')[0]);
      expect(
        screen.queryByText('10개 이상 구매 시 10% 할인')
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText('5개 이상 구매 시 5% 할인')
      ).toBeInTheDocument();

      fireEvent.click(screen.getAllByText('삭제')[0]);
      expect(
        screen.queryByText('10개 이상 구매 시 10% 할인')
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText('5개 이상 구매 시 5% 할인')
      ).not.toBeInTheDocument();

      // 4. 쿠폰 추가
      fireEvent.change(screen.getByPlaceholderText('쿠폰 이름'), {
        target: { value: '새 쿠폰' }
      });
      fireEvent.change(screen.getByPlaceholderText('쿠폰 코드'), {
        target: { value: 'NEW10' }
      });
      fireEvent.change(screen.getByRole('combobox'), {
        target: { value: 'percentage' }
      });
      fireEvent.change(screen.getByPlaceholderText('할인 값'), {
        target: { value: '10' }
      });

      fireEvent.click(screen.getByText('쿠폰 추가'));

      const $newCoupon = screen.getByTestId('coupon-3');

      expect($newCoupon).toHaveTextContent('새 쿠폰 (NEW10):10% 할인');
    });
  });

  describe('cartUtils > ', () => {
    describe('getApplicableDiscount', () => {
      test('구매 수량이 할인 조건을 충족할 경우 해당 할인율을 반환해야 한다', () => {
        const cartItem: CartItem = {
          product: mockProducts[2],
          quantity: 10
        };
        const result = getApplicableDiscount(cartItem);
        expect(result).toBe(0.2);
      });

      test('구매 수량이 최소 할인 조건에 미달할 경우 0을 반환해야 한다', () => {
        const cartItem: CartItem = {
          product: mockProducts[2],
          quantity: 9
        };
        const result = getApplicableDiscount(cartItem);
        expect(result).toBe(0);
      });
    });

    describe('상품의 최대 할인율을 계산한다', () => {
      test('여러 할인율 중 가장 큰 할인율을 반환해야 한다', () => {
        const discounts = mockProducts.map((product) => product.discounts[0]);
        const result = getMaxDiscount(discounts);
        expect(result).toBe(0.2);
      });

      test('할인율이 없는 경우 0을 반환해야 한다', () => {
        const result = getMaxDiscount([]);
        expect(result).toBe(0);
      });
    });

    describe('getRemainingStock', () => {
      test('장바구니에 담긴 상품의 남은 재고를 정확히 계산해야 한다', () => {
        const cart: CartItem[] = [
          {
            product: mockProducts[0],
            quantity: 12
          }
        ];
        const result = getRemainingStock(cart, mockProducts[0]);
        expect(result).toBe(8);
      });

      test('장바구니에 없는 상품은 전체 재고를 반환해야 한다', () => {
        const cart: CartItem[] = [];
        const result = getRemainingStock(cart, mockProducts[0]);
        expect(result).toBe(20);
      });
    });

    describe('addItemToCart', () => {
      test('새로운 상품 추가시 수량 1로 추가되어야 한다', () => {
        const cart: CartItem[] = [];
        const result = addItemToCart(cart, mockProducts[0]);
        expect(result).toHaveLength(1);
        expect(result[0].quantity).toBe(1);
      });

      test('이미 담긴 상품 추가시 수량이 1 증가해야 한다', () => {
        const cart: CartItem[] = [
          {
            product: mockProducts[0],
            quantity: 1
          }
        ];
        const result = addItemToCart(cart, mockProducts[0]);
        expect(result[0].quantity).toBe(2);
      });

      test('재고 한도에 도달한 상품 추가시 재고 수량을 초과하지 않아야 한다', () => {
        const cart: CartItem[] = [
          {
            product: mockProducts[0],
            quantity: 19
          }
        ];
        const result = addItemToCart(cart, mockProducts[0]);
        expect(result[0].quantity).toBe(20);
      });
    });

    describe('removeItemFromCart', () => {
      test('장바구니에서 지정한 상품이 삭제되어야 한다', () => {
        const cart: CartItem[] = [
          {
            product: mockProducts[0],
            quantity: 1
          }
        ];
        const result = removeItemFromCart(cart, 'p1');
        expect(result).toHaveLength(0);
      });

      test('존재하지 않는 상품 ID로 삭제시 장바구니가 변경되지 않아야 한다', () => {
        const cart: CartItem[] = [
          {
            product: mockProducts[0],
            quantity: 1
          }
        ];
        const result = removeItemFromCart(cart, 'non-existent');
        expect(result).toHaveLength(1);
        expect(result).toEqual(cart);
      });
    });
  });

  describe('productUtil > ', () => {
    describe('findProductById', () => {
      it('올바른 ID로 상품을 찾을 수 있어야 한다', () => {
        const result = findProductById(mockProducts, 'p1');
        expect(result).toEqual(mockProducts[0]);
      });

      it('존재하지 않는 ID로 검색하면 undefined를 반환해야 한다', () => {
        const result = findProductById(mockProducts, 'nonexistent');
        expect(result).toBeUndefined();
      });

      it('빈 배열에서 검색하면 undefined를 반환해야 한다', () => {
        const result = findProductById([], 'p1');
        expect(result).toBeUndefined();
      });
    });

    describe('addDiscountToProduct', () => {
      it('상품에 새로운 할인을 추가할 수 있어야 한다', () => {
        const newDiscount = { quantity: 20, rate: 0.25 };
        const result = addDiscountToProduct(mockProducts[0], newDiscount);

        expect(result.discounts).toHaveLength(2);
        expect(result.discounts).toContainEqual(newDiscount);
        expect(result.discounts).toContainEqual(mockProducts[0].discounts[0]);
        expect(result).not.toBe(mockProducts[0]);
      });

      it('할인이 없는 상품에 새로운 할인을 추가할 수 있어야 한다', () => {
        const productWithoutDiscount = {
          ...mockProducts[0],
          discounts: []
        };

        const newDiscount = { quantity: 5, rate: 0.05 };
        const result = addDiscountToProduct(
          productWithoutDiscount,
          newDiscount
        );

        expect(result.discounts).toHaveLength(1);
        expect(result.discounts[0]).toEqual(newDiscount);
        expect(result).not.toBe(productWithoutDiscount);
      });
    });

    describe('removeDiscountFromProduct', () => {
      it('지정된 인덱스의 할인을 제거할 수 있어야 한다', () => {
        const result = removeDiscountFromProduct(mockProducts[0], 0);

        expect(result.discounts).toHaveLength(0);
        expect(result).not.toBe(mockProducts[0]);
        expect(result.id).toBe(mockProducts[0].id);
      });

      it('잘못된 인덱스로 제거를 시도하면 기존 할인들이 유지되어야 한다', () => {
        const result = removeDiscountFromProduct(mockProducts[0], 1);

        expect(result.discounts).toHaveLength(1);
        expect(result.discounts[0]).toEqual(mockProducts[0].discounts[0]);
      });

      it('여러 할인이 있는 상품에서 특정 할인을 제거할 수 있어야 한다', () => {
        const productWithMultipleDiscounts = {
          ...mockProducts[0],
          discounts: [
            { quantity: 10, rate: 0.1 },
            { quantity: 20, rate: 0.2 }
          ]
        };

        const result = removeDiscountFromProduct(
          productWithMultipleDiscounts,
          0
        );

        expect(result.discounts).toHaveLength(1);
        expect(result.discounts[0]).toEqual({ quantity: 20, rate: 0.2 });
      });
    });
  });

  describe('useCart', () => {
    it('장바구니가 비어있는 상태로 시작한다', () => {
      const { result } = renderHook(() => useCart());
      expect(result.current.cart).toHaveLength(0);
      expect(result.current.selectedCoupon).toBeNull();
    });

    it('장바구니에 상품을 추가한다', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addToCart(testProduct);
      });

      expect(result.current.cart).toHaveLength(1);
      expect(result.current.cart[0].product).toEqual(testProduct);
      expect(result.current.cart[0].quantity).toBe(1);
    });

    it('장바구니에서 상품을 제거한다', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addToCart(testProduct);
        result.current.removeFromCart(testProduct.id);
      });

      expect(result.current.cart).toHaveLength(0);
    });

    it('장바구니 상품의 수량을 업데이트한다', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addToCart(testProduct);
        result.current.updateQuantity(testProduct.id, 3);
      });

      expect(result.current.cart[0].quantity).toBe(3);
    });

    it('재고보다 많은 수량으로 업데이트할 수 없다', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addToCart(testProduct);
        result.current.updateQuantity(testProduct.id, testProduct.stock + 1);
      });

      expect(result.current.cart[0].quantity).toBe(30);
    });

    it('쿠폰을 적용한다', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.applyCoupon(testCoupon);
      });

      expect(result.current.selectedCoupon).toEqual(testCoupon);
    });

    it('장바구니 총액을 계산한다', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addToCart(testProduct);
        result.current.updateQuantity(testProduct.id, 2);
        result.current.applyCoupon(testCoupon);
      });

      const total = result.current.calculateTotal();
      expect(total.totalBeforeDiscount).toBe(50000);
      expect(total.totalAfterDiscount).toBe(47000);
      expect(total.totalDiscount).toBe(3000);
    });

    it('동일한 상품을 추가하면 수량이 증가한다', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addToCart(testProduct);
        result.current.addToCart(testProduct);
      });

      expect(result.current.cart).toHaveLength(1);
      expect(result.current.cart[0].quantity).toBe(2);
    });

    it('수량이 0이 되면 장바구니에서 상품이 제거된다', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addToCart(testProduct);
        result.current.updateQuantity(testProduct.id, 0);
      });

      expect(result.current.cart).toHaveLength(0);
    });
  });

  describe('useDiscount', () => {
    const mockSetEditingProduct = vi.fn();
    const mockUpdateProduct = vi.fn();

    beforeEach(() => {
      vi.clearAllMocks();
      useProductStore.setState({ products: [...mockProducts] });
    });

    const defaultProps = {
      editingProduct: mockProducts[0],
      setEditingProduct: mockSetEditingProduct,
      updateProduct: mockUpdateProduct
    };

    it('초기 상태값이 올바르게 설정된다', () => {
      const { result } = renderHook(() => useDiscount(defaultProps));
      expect(result.current.newDiscount).toEqual({ quantity: 0, rate: 0 });
    });

    it('할인 정보를 추가할 수 있다', () => {
      const { result } = renderHook(() =>
        useDiscount({
          ...defaultProps,
          editingProduct: { ...mockProducts[0] }
        })
      );

      const testDiscount: Discount = { quantity: 15, rate: 0.2 };

      act(() => {
        result.current.setNewDiscount(testDiscount);
      });

      expect(result.current.newDiscount).toEqual(testDiscount);

      act(() => {
        result.current.handleAddDiscount('p1');
      });

      expect(mockUpdateProduct).toHaveBeenCalledWith({
        ...mockProducts[0],
        discounts: [...mockProducts[0].discounts, testDiscount]
      });
    });

    it('할인 정보를 삭제할 수 있다', () => {
      const { result } = renderHook(() => useDiscount(defaultProps));

      act(() => {
        result.current.handleRemoveDiscount('p1', 0);
      });

      expect(mockUpdateProduct).toHaveBeenCalledWith({
        ...mockProducts[0],
        discounts: []
      });
    });

    it('존재하지 않는 상품의 할인 정보는 수정할 수 없다', () => {
      const nonExistentProduct = null;
      const { result } = renderHook(() =>
        useDiscount({
          ...defaultProps,
          editingProduct: nonExistentProduct
        })
      );

      act(() => {
        result.current.handleAddDiscount('non_existent_product');
      });

      expect(mockUpdateProduct).not.toHaveBeenCalled();
    });

    it('할인율은 0과 1 사이의 값이어야 한다', async () => {
      const { result } = renderHook(() => useDiscount(defaultProps));

      await act(async () => {
        result.current.setNewDiscount({ quantity: 10, rate: 0.5 });
      });

      expect(result.current.newDiscount.rate).toBeLessThanOrEqual(1);
      expect(result.current.newDiscount.rate).toBeGreaterThanOrEqual(0);
    });

    it('수량은 0 이상이어야 한다', async () => {
      const { result } = renderHook(() => useDiscount(defaultProps));

      await act(async () => {
        result.current.setNewDiscount({ quantity: 5, rate: 0.1 });
      });

      expect(result.current.newDiscount.quantity).toBeGreaterThanOrEqual(0);
    });

    it('상품별로 다른 할인율을 적용할 수 있다', () => {
      const product = { ...mockProducts[1] };
      const { result } = renderHook(() =>
        useDiscount({
          ...defaultProps,
          editingProduct: product
        })
      );

      const newDiscount: Discount = { quantity: 20, rate: 0.25 };

      act(() => {
        result.current.setNewDiscount(newDiscount);
      });

      // newDiscount가 제대로 설정되었는지 확인
      expect(result.current.newDiscount).toEqual(newDiscount);

      act(() => {
        result.current.handleAddDiscount('p2');
      });

      // updateProduct가 올바른 인자로 호출되었는지 확인
      expect(mockUpdateProduct).toHaveBeenCalledWith({
        ...product,
        discounts: [...product.discounts, newDiscount]
      });
    });
  });

  describe('useEditProduct', () => {
    const mockUpdateProduct = vi.fn();
    vi.mock('../stores/useProductStore', () => ({
      useProductStore: () => ({
        updateProduct: mockUpdateProduct
      })
    }));

    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('handleProductNameUpdate가 올바르게 상품 이름을 업데이트해야 함', () => {
      const { result } = renderHook(() => useEditProduct());

      act(() => {
        result.current.handleEditProduct(testProduct);
      });

      act(() => {
        result.current.handleProductNameUpdate(testProduct.id, '새로운 상품명');
      });

      expect(result.current.editingProduct?.name).toBe('새로운 상품명');
    });

    it('handleEditProduct가 올바르게 상품을 설정해야 함', () => {
      const { result } = renderHook(() => useEditProduct());

      act(() => {
        result.current.handleEditProduct(testProduct);
      });

      expect(result.current.editingProduct).toEqual(testProduct);
    });

    it('editingProduct가 없을 때 handleProductNameUpdate가 아무 동작도 하지 않아야 함', () => {
      const { result } = renderHook(() => useEditProduct());

      act(() => {
        result.current.handleProductNameUpdate('invalid_id', '새로운 상품명');
      });

      expect(result.current.editingProduct).toBeNull();
    });

    it('editingProduct가 없을 때 handleEditComplete가 아무 동작도 하지 않아야 함', () => {
      const { result } = renderHook(() => useEditProduct());

      act(() => {
        result.current.handleEditComplete();
      });

      expect(mockUpdateProduct).not.toHaveBeenCalled();
    });

    it('다른 상품 ID로 handleProductNameUpdate를 호출할 때 이름이 변경되지 않아야 함', () => {
      const { result } = renderHook(() => useEditProduct());

      act(() => {
        result.current.handleEditProduct(testProduct);
      });

      act(() => {
        result.current.handleProductNameUpdate('different_id', '새로운 상품명');
      });

      expect(result.current.editingProduct?.name).toBe(testProduct.name);
    });
  });

  describe('useNewCoupon', () => {
    const couponInitialState: Coupon = {
      name: '',
      code: '',
      discountType: 'percentage',
      discountValue: 0
    };

    it('초기 상태값이 올바르게 설정되어야 함', () => {
      const { result } = renderHook(() => useNewCoupon());

      expect(result.current.newCoupon).toEqual(couponInitialState);
    });

    it('updateNewCoupon이 새로운 쿠폰 정보를 올바르게 업데이트해야 함', () => {
      const { result } = renderHook(() => useNewCoupon());

      const updatedCoupon: Coupon = {
        name: '10% 할인 쿠폰',
        code: 'DISCOUNT10',
        discountType: 'percentage',
        discountValue: 10
      };

      act(() => {
        result.current.updateNewCoupon(updatedCoupon);
      });

      expect(result.current.newCoupon).toEqual(updatedCoupon);
    });

    it('initNewCoupon이 쿠폰 상태를 초기값으로 리셋해야 함', () => {
      const { result } = renderHook(() => useNewCoupon());

      // 먼저 쿠폰 정보를 업데이트
      const updatedCoupon: Coupon = {
        name: '10% 할인 쿠폰',
        code: 'DISCOUNT10',
        discountType: 'percentage',
        discountValue: 10
      };

      act(() => {
        result.current.updateNewCoupon(updatedCoupon);
      });

      // 초기화 실행
      act(() => {
        result.current.initNewCoupon();
      });

      expect(result.current.newCoupon).toEqual(couponInitialState);
    });

    it('금액 할인 타입의 쿠폰도 올바르게 업데이트되어야 함', () => {
      const { result } = renderHook(() => useNewCoupon());

      const amountDiscountCoupon: Coupon = {
        name: '5000원 할인 쿠폰',
        code: 'AMOUNT5000',
        discountType: 'amount',
        discountValue: 5000
      };

      act(() => {
        result.current.updateNewCoupon(amountDiscountCoupon);
      });

      expect(result.current.newCoupon).toEqual(amountDiscountCoupon);
    });

    it('여러 번의 업데이트가 순차적으로 올바르게 동작해야 함', () => {
      const { result } = renderHook(() => useNewCoupon());

      const firstCoupon: Coupon = {
        name: '첫 번째 쿠폰',
        code: 'FIRST',
        discountType: 'percentage',
        discountValue: 10
      };

      const secondCoupon: Coupon = {
        name: '두 번째 쿠폰',
        code: 'SECOND',
        discountType: 'amount',
        discountValue: 3000
      };

      // 첫 번째 업데이트
      act(() => {
        result.current.updateNewCoupon(firstCoupon);
      });
      expect(result.current.newCoupon).toEqual(firstCoupon);

      // 두 번째 업데이트
      act(() => {
        result.current.updateNewCoupon(secondCoupon);
      });
      expect(result.current.newCoupon).toEqual(secondCoupon);

      // 초기화
      act(() => {
        result.current.initNewCoupon();
      });
      expect(result.current.newCoupon).toEqual(couponInitialState);
    });
  });

  const productInitialState: Omit<Product, 'id'> = {
    name: '',
    price: 0,
    stock: 0,
    discounts: []
  };

  describe('useNewProduct', () => {
    it('초기 상태값이 올바르게 설정되어야 함', () => {
      const { result } = renderHook(() => useNewProduct());

      expect(result.current.newProduct).toEqual(productInitialState);
    });

    it('updateNewProduct가 새로운 상품 정보를 올바르게 업데이트해야 함', () => {
      const { result } = renderHook(() => useNewProduct());

      const updatedProduct: Omit<Product, 'id'> = {
        name: '테스트 상품',
        price: 15000,
        stock: 100,
        discounts: [{ quantity: 10, rate: 0.1 }]
      };

      act(() => {
        result.current.updateNewProduct(updatedProduct);
      });

      expect(result.current.newProduct).toEqual(updatedProduct);
    });

    it('initNewProduct가 상품 상태를 초기값으로 리셋해야 함', () => {
      const { result } = renderHook(() => useNewProduct());

      const updatedProduct: Omit<Product, 'id'> = {
        name: '테스트 상품',
        price: 15000,
        stock: 100,
        discounts: [{ quantity: 10, rate: 0.1 }]
      };

      act(() => {
        result.current.updateNewProduct(updatedProduct);
      });

      act(() => {
        result.current.initNewProduct();
      });

      expect(result.current.newProduct).toEqual(productInitialState);
    });

    it('다중 할인이 있는 상품도 올바르게 업데이트되어야 함', () => {
      const { result } = renderHook(() => useNewProduct());

      const productWithMultipleDiscounts: Omit<Product, 'id'> = {
        name: '다중 할인 상품',
        price: 20000,
        stock: 50,
        discounts: [
          { quantity: 5, rate: 0.05 },
          { quantity: 10, rate: 0.1 },
          { quantity: 20, rate: 0.2 }
        ]
      };

      act(() => {
        result.current.updateNewProduct(productWithMultipleDiscounts);
      });

      expect(result.current.newProduct).toEqual(productWithMultipleDiscounts);
    });

    it('빈 할인 배열을 가진 상품도 올바르게 업데이트되어야 함', () => {
      const { result } = renderHook(() => useNewProduct());

      const productWithNoDiscounts: Omit<Product, 'id'> = {
        name: '할인 없는 상품',
        price: 5000,
        stock: 30,
        discounts: []
      };

      act(() => {
        result.current.updateNewProduct(productWithNoDiscounts);
      });

      expect(result.current.newProduct).toEqual(productWithNoDiscounts);
    });

    it('여러 번의 업데이트가 순차적으로 올바르게 동작해야 함', () => {
      const { result } = renderHook(() => useNewProduct());

      const firstProduct: Omit<Product, 'id'> = {
        name: '첫 번째 상품',
        price: 10000,
        stock: 20,
        discounts: [{ quantity: 5, rate: 0.1 }]
      };

      const secondProduct: Omit<Product, 'id'> = {
        name: '두 번째 상품',
        price: 15000,
        stock: 30,
        discounts: [
          { quantity: 10, rate: 0.15 },
          { quantity: 20, rate: 0.2 }
        ]
      };

      // 첫 번째 업데이트
      act(() => {
        result.current.updateNewProduct(firstProduct);
      });
      expect(result.current.newProduct).toEqual(firstProduct);

      // 두 번째 업데이트
      act(() => {
        result.current.updateNewProduct(secondProduct);
      });
      expect(result.current.newProduct).toEqual(secondProduct);

      // 초기화
      act(() => {
        result.current.initNewProduct();
      });
      expect(result.current.newProduct).toEqual(productInitialState);
    });
  });
});
