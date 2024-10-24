import NewProductForm from '../components/NewProductForm.tsx';
import ProductList from '../components/ProductList.tsx';
import NewCouponForm from '../components/NewCouponForm.tsx';
import CouponList from '../components/CouponList.tsx';

export const AdminPage = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">관리자 페이지</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-2xl font-semibold mb-4">상품 관리</h2>
          <NewProductForm />
          <ProductList />
        </div>
        <div>
          <h2 className="text-2xl font-semibold mb-4">쿠폰 관리</h2>
          <div className="bg-white p-4 rounded shadow">
            <NewCouponForm />
            <CouponList />
          </div>
        </div>
      </div>
    </div>
  );
};
