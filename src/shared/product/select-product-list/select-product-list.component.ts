import {
  Component,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
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
  ColdPressed,
  COLD_PRESSED_PRODUCTS,
  SelectProduct,
} from '../select-product/select-product';
import { IngredientSelection, PromotionDiscount } from './select-product-list';
import { ToolbarService } from 'src/shared/toolbar/toolbar.service';
import { AsyncSubject, BehaviorSubject, Observable, Subject } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ReceiptCanvasComponent } from '../receipt-canvas/receipt-canvas.component';
import { MatDialogModule } from '@angular/material/dialog';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { FilterIngredientComponent } from '../filter-ingredient/filter-ingredient.component';
import { MatChipsModule } from '@angular/material/chips';
import { HasIngredientPipe } from '../has-ingredient.pipe';
import { ChipsIngredientsComponent } from '../chips-ingredients/chips-ingredients.component';
import { FilterIngredientDialogData } from '../filter-ingredient/filter-ingredient';
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
    HasIngredientPipe,
    FormsModule,
    MatDialogModule,
    MatChipsModule,
    ChipsIngredientsComponent,
  ],
})
export class SelectProductListComponent implements OnInit, OnDestroy {
  @ViewChild(ReceiptCanvasComponent, { read: ReceiptCanvasComponent })
  receiptComponent!: ReceiptCanvasComponent;

  @ViewChild('downloadEl', { read: ElementRef })
  downloadEl!: ElementRef<HTMLAnchorElement>;

  toolbarService = inject(ToolbarService);
  dialog = inject(MatDialog);

  customerName: string = '';

  orderDate: Date | null = new Date();

  receiptImageSrc = '';

  onDestroy$ = new AsyncSubject<void>();
  coldPressedProducts = COLD_PRESSED_PRODUCTS.sort((a, b) => a.price - b.price);

  ingredientSelections = new FormControl<IngredientSelection[]>(
    this.distinctIngredients(this.coldPressedProducts)
  );

  ingredientChips: IngredientSelection[] = [];

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

  promotionDiscount$: Observable<PromotionDiscount[]> =
    this.formArray.valueChanges.pipe(
      debounceTime(0),
      map((products) => {
        // return [this.promotionBuy1SetFree1(products)].filter(
        //   (promotion) => promotion.discount > 0
        // );
        return [] as any[];
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

    this.receiptComponent.clearCanvas();

    this.customerName = '';
    this.orderDate = null;

    this.receiptImageSrc = '';

    if (this.ingredientSelections.value) {
      this.ingredientSelections.value.forEach(
        (selection) => (selection.checked = false)
      );
      this.ingredientSelections.setValue([...this.ingredientSelections.value]);
    }

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
      receiptHeight = this.receiptComponent.calWriteNormalText(
        receiptHeight,
        ''
      );
      receiptHeight = this.receiptComponent.calNewline(receiptHeight);
    }

    products.forEach((product) => {
      if (product && product.amount > 0) {
        receiptHeight = this.receiptComponent.calWriteNormalText(
          receiptHeight,
          `${product.name} (${product.amount}qt x @???${product.price}) ${product.sumPrice}`
        );
      }
    });

    receiptHeight = this.receiptComponent.calWriteNormalText(
      receiptHeight,
      `sub total: ???${this.subTotal}`
    );

    receiptHeight = this.receiptComponent.calWriteNormalText(
      receiptHeight,
      `discount: ???${this.discount}`
    );

    receiptHeight = this.receiptComponent.calWriteNormalText(
      receiptHeight,
      `total: ???${this.total}`
    );

    receiptHeight = this.receiptComponent.calDrawQrCode(receiptHeight);
    receiptHeight = this.receiptComponent.calWriteNormalText(
      receiptHeight,
      'Mr. XXX XXX'
    );
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
      this.receiptComponent.writeText(
        `order date: ${this.orderDate?.toLocaleDateString('th-TH') ?? ''}`
      );
      this.receiptComponent.newline();
    }

    products.forEach((product) => {
      if (product && product.amount > 0) {
        this.receiptComponent.writeText(
          `${product.name} (${product.amount}qt x @${product.price}) ???${product.sumPrice}`
        );
      }
    });

    this.receiptComponent.writeText(`sub total: ???${this.subTotal}`);

    this.receiptComponent.writeText(`discount: ???${this.discount}`);

    this.receiptComponent.writeText(`total: ???${this.total}`);

    this.receiptComponent.drawQrCode();

    this.receiptComponent.writeText(`???.???. ??????????????? ??????????????????????????????`);

    this.receiptComponent.writeReceiptDate();

    // this.receiptComponent.download();

    this.receiptComponent.canvasEl?.nativeElement.scrollIntoView({
      behavior: 'smooth',
    });

    this.receiptImageSrc =
      this.receiptComponent.canvasEl?.nativeElement.toDataURL('image/png') ??
      '';

    // this.downloadEl.nativeElement.click();
  }

  openDialogFilter(event: TouchEvent | MouseEvent) {
    event.preventDefault();

    const dialogRef = this.dialog.open(FilterIngredientComponent, {
      width: '250px',
      data: {
        form: this.ingredientSelections,
      } as FilterIngredientDialogData,
    });
  }

  distinctIngredients(products: ColdPressed[]) {
    const mixIngredients = products.reduce(
      (ingredients, product) => [...ingredients, ...product.ingredients],
      [] as string[]
    );

    return this.distinctArray(mixIngredients).map(
      (ingredient) =>
        ({ name: ingredient, checked: false } as IngredientSelection)
    );
  }

  distinctArray(array: string[]): string[] {
    return array.filter((value, index, self) => {
      return self.indexOf(value) === index;
    });
  }
}
