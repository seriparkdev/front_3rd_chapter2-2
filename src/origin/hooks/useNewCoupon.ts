import { useState } from 'react';
import { Coupon } from '../../types.ts';

const couponInitialState: Coupon = {
  name: '',
  code: '',
  discountType: 'percentage',
  discountValue: 0
};

export const useNewCoupon = () => {
  const [newCoupon, setNewCoupon] = useState<Coupon>(couponInitialState);

  const updateNewCoupon = (coupon: Coupon) => {
    setNewCoupon(coupon);
  };

  const initNewCoupon = () => {
    setNewCoupon(couponInitialState);
  };

  return { newCoupon, updateNewCoupon, initNewCoupon };
};
