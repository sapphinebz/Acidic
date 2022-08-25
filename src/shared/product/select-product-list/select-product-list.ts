import { SelectProduct } from '../select-product/select-product';

export interface PromotionDiscount {
  discount: number;
  name: string;
}

export type PromotionFn = (products: SelectProduct[]) => PromotionDiscount;

export interface IngredientSelection {
  name: string;
  checked: boolean;
}
