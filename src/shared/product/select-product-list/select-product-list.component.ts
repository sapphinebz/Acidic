import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectProductComponent } from '../select-product/select-product.component';
import { FormArray, FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  combineLatestWith,
  debounceTime,
  map,
  shareReplay,
  takeUntil,
} from 'rxjs/operators';
import {
  COLD_PRESSED_PRODUCTS,
  SelectProduct,
} from '../select-product/select-product';
import { PromotionDiscount } from './select-product-list';
import { ToolbarService } from 'src/shared/toolbar/toolbar.service';
import { AsyncSubject } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-select-product-list',
  templateUrl: './select-product-list.component.html',
  styleUrls: ['./select-product-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    SelectProductComponent,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
  ],
})
export class SelectProductListComponent implements OnInit, OnDestroy {
  onDestroy$ = new AsyncSubject<void>();
  coldPressedProducts = COLD_PRESSED_PRODUCTS;

  toolbarService = inject(ToolbarService);

  formArray = new FormArray<FormControl<SelectProduct | null>>(
    this.coldPressedProducts.map(() => new FormControl(null))
  );

  controls = this.formArray.controls as FormControl[];

  subTotal$ = this.formArray.valueChanges.pipe(
    map((products) =>
      products.reduce((sum, product) => {
        if (product) {
          sum += product.sumPrice ?? 0;
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

  constructor() {
    this.formArray.valueChanges
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((products) => {
        let sumAmount = 0;
        for (const product of products) {
          if (product) {
            sumAmount += product.amount;
          }
        }
        this.toolbarService.setBadgeShoppingCart(sumAmount);
      });
  }
  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

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
        minPrice = product.price ?? 0;
      } else {
        minPrice = Math.min(minPrice, product.price ?? 0);
      }
    }
    return {
      discount: min * minPrice,
      name: 'buy1Set-Free1',
    };
  }

  resetProductSelection(event: MouseEvent | TouchEvent) {
    event.preventDefault();

    this.formArray.reset();

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
  }
}
