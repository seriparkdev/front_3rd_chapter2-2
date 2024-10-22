import { useState } from 'react';
import { Coupon } from '../../types.ts';

const COUPON_INITIAL_STATE: Coupon = {
  name: '',
  code: '',
  discountType: 'percentage',
  discountValue: 0
};

export const useNewCoupon = () => {
  const [newCoupon, setNewCoupon] = useState<Coupon>(COUPON_INITIAL_STATE);

  const updateNewCoupon = (coupon: Coupon) => {
    setNewCoupon(coupon);
  };

  const initNewCoupon = () => {
    setNewCoupon(COUPON_INITIAL_STATE);
  };

  return { newCoupon, updateNewCoupon, initNewCoupon };
};
