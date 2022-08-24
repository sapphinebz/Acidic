import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  SelectProductComponent,
} from '../select-product/select-product.component';
import { FormArray, FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  combineLatestWith,
  debounceTime,
  map,
  shareReplay,
} from 'rxjs/operators';
import { COLD_PRESSED_PRODUCTS, SelectProduct } from '../select-product/select-product';
import { PromotionDiscount } from './select-product-list';

@Component({
  selector: 'app-select-product-list',
  templateUrl: './select-product-list.component.html',
  styleUrls: ['./select-product-list.component.scss'],
  standalone: true,
  imports: [CommonModule, SelectProductComponent, ReactiveFormsModule],
})
export class SelectProductListComponent implements OnInit {
  coldPressedProducts = COLD_PRESSED_PRODUCTS;

  formArray = new FormArray<FormControl<SelectProduct | null>>(
    this.coldPressedProducts.map(() => new FormControl(null))
  );

  controls = this.formArray.controls as FormControl[];

  subTotal$ = this.formArray.valueChanges.pipe(
    map((products) =>
      products.reduce((sum, product) => {
        if (product) {
          sum += product.sumPrice;
        }
        return sum;
      }, 0)
    ),
    shareReplay(1)
  );

  promotionDiscount$ = this.formArray.valueChanges.pipe(
    debounceTime(0),
    map((products) => {
      return [this.promotionBuy1SetFree1(products)].filter(
        (promotion) => promotion.discount > 0
      );
    }),
    shareReplay(1)
  );

  promotionNames$ = this.promotionDiscount$.pipe(
    map((promotions) => {
      return promotions.map((promotion) => promotion.name).join(', ');
    }),
    shareReplay(1)
  );

  discount$ = this.promotionDiscount$.pipe(
    map((promotionDiscounts) => {
      return promotionDiscounts.reduce(
        (sum, promotion) => promotion.discount,
        0
      );
    }),
    shareReplay(1)
  );

  total$ = this.subTotal$.pipe(
    combineLatestWith(this.discount$),
    map(([subTotalPrice, discount]) => subTotalPrice - discount),
    shareReplay(1)
  );

  constructor() {}

  ngOnInit() {}

  promotionBuy1SetFree1(products: (SelectProduct | null)[]): PromotionDiscount {
    let min!: number;
    let minPrice!: number;
    for (const product of products) {
      if (product === null) {
        min = 0;
        minPrice = 0;
        break;
      }
      if (min === undefined) {
        min = product.amount;
      } else {
        min = Math.min(min, product.amount);
      }

      if (minPrice === undefined) {
        minPrice = product.price;
      } else {
        minPrice = Math.min(minPrice, product.price);
      }
    }
    return {
      discount: min * minPrice,
      name: 'buy1Set-Free1',
    };
  }
}
