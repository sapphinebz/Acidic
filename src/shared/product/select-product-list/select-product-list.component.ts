import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectProductComponent } from '../select-product/select-product.component';
import {
  FormArray,
  FormControl,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  combineLatestWith,
  debounceTime,
  map,
  tap,
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
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ReceiptCanvasComponent } from '../receipt-canvas/receipt-canvas.component';

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
    MatInputModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatNativeDateModule,
    ReceiptCanvasComponent,
    FormsModule,
  ],
})
export class SelectProductListComponent implements OnInit, OnDestroy {
  @ViewChild(ReceiptCanvasComponent, { read: ReceiptCanvasComponent })
  receiptComponent!: ReceiptCanvasComponent;

  customerName: string = '';

  orderDate: Date | null = null;

  onDestroy$ = new AsyncSubject<void>();
  coldPressedProducts = COLD_PRESSED_PRODUCTS;

  toolbarService = inject(ToolbarService);

  formArray = new FormArray<FormControl<SelectProduct | null>>(
    this.coldPressedProducts.map(() => new FormControl(null))
  );

  controls = this.formArray.controls as FormControl[];

  subTotal!: number;
  subTotal$ = this.formArray.valueChanges.pipe(
    map((products) =>
      products.reduce((sum, product) => {
        if (product) {
          sum += product.sumPrice ?? 0;
        }
        return sum;
      }, 0)
    ),
    tap((value) => {
      this.subTotal = value;
    }),
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

  discount!: number;
  discount$ = this.promotionDiscount$.pipe(
    map((promotionDiscounts) => {
      return promotionDiscounts.reduce(
        (sum, promotion) => promotion.discount,
        0
      );
    }),
    tap((value) => {
      this.discount = value;
    }),
    shareReplay(1)
  );

  total!: number;
  total$ = this.subTotal$.pipe(
    combineLatestWith(this.discount$),
    map(([subTotalPrice, discount]) => subTotalPrice - discount),
    tap((value) => {
      this.total = value;
    }),
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

  writeReceipt(event: MouseEvent | TouchEvent) {
    event.preventDefault();
    let receiptHeight = 0;
    const products = this.formArray.value;
    if (this.customerName) {
      receiptHeight = this.receiptComponent.calWriteHeadText(
        receiptHeight,
        this.customerName
      );
    }
    if (this.orderDate) {
      receiptHeight = this.receiptComponent.calWriteHeadText(
        receiptHeight,
        this.orderDate?.toLocaleDateString() ?? ''
      );
    }

    products.forEach((product) => {
      if (product && product.amount > 0) {
        receiptHeight = this.receiptComponent.calWriteNormalText(
          receiptHeight,
          `${product.name} (${product.amount}qt x @฿${product.price}) ${product.sumPrice}`
        );
      }
    });

    receiptHeight = this.receiptComponent.calNewline(receiptHeight);

    receiptHeight = this.receiptComponent.calWriteNormalText(
      receiptHeight,
      `subTotal: ฿${this.subTotal}`
    );

    receiptHeight = this.receiptComponent.calWriteNormalText(
      receiptHeight,
      `discount: ฿${this.discount}`
    );

    receiptHeight = this.receiptComponent.calWriteNormalText(
      receiptHeight,
      `total: ฿${this.total}`
    );

    receiptHeight = this.receiptComponent.calDrawQrCode(receiptHeight);
    receiptHeight = this.receiptComponent.calWriteNormalText(
      receiptHeight,
      'DD/MM/YYYY'
    );

    this.receiptComponent.height$.next(receiptHeight);

    this.receiptComponent.clearReceipt();

    if (this.customerName) {
      this.receiptComponent.writeHeadText(this.customerName);
    }
    if (this.orderDate) {
      this.receiptComponent.writeHeadText(
        this.orderDate?.toLocaleDateString() ?? ''
      );
    }

    products.forEach((product) => {
      if (product && product.amount > 0) {
        this.receiptComponent.writeText(
          `${product.name} (${product.amount}qt x @฿${product.price}) ${product.sumPrice}`
        );
      }
    });

    this.receiptComponent.newline();

    this.receiptComponent.writeText(`subTotal: ฿${this.subTotal}`);

    this.receiptComponent.writeText(`discount: ฿${this.discount}`);

    this.receiptComponent.writeText(`total: ฿${this.total}`);

    this.receiptComponent.drawQrCode();

    this.receiptComponent.writeReceiptDate();

    // this.receiptComponent.download();
  }
}
