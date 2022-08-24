import { Component, forwardRef, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { map, takeUntil, debounceTime } from 'rxjs/operators';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import {
  AsyncSubject,
  BehaviorSubject,
  combineLatest,
  ReplaySubject,
} from 'rxjs';

import { ColdPressed, SelectProduct } from './select-product';

@Component({
  selector: 'app-select-product',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './select-product.component.html',
  styleUrls: ['./select-product.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectProductComponent),
      multi: true,
    },
  ],
})
export class SelectProductComponent
  implements OnInit, OnDestroy, ControlValueAccessor
{
  @Input() product!: ColdPressed;
  amount$ = new BehaviorSubject<number>(0);
  onDestroy$ = new AsyncSubject<void>();
  sumPrice$ = new ReplaySubject<number>(1);

  constructor() {}

  ngOnInit() {
    this.amount$
      .pipe(
        map((amount) => amount * this.product.price),
        takeUntil(this.onDestroy$)
      )
      .subscribe((sumPrice) => {
        this.sumPrice$.next(sumPrice);
      });
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  writeValue(obj: any): void {}
  registerOnChange(onModelChange: any): void {
    combineLatest({
      amount: this.amount$,
      sumPrice: this.sumPrice$,
    })
      .pipe(debounceTime(0), takeUntil(this.onDestroy$))
      .subscribe((state) => {
        const modelState: SelectProduct = {
          ...state,
          price: this.product.price,
        };
        onModelChange(modelState);
      });
  }
  registerOnTouched(fn: any): void {}
  setDisabledState?(isDisabled: boolean): void {}

  addProduct() {
    this.amount$.next(this.amount$.value + 1);
  }

  removeProduct() {
    const currentAmount = this.amount$.value;
    if (currentAmount !== 0) {
      this.amount$.next(this.amount$.value - 1);
    }
  }
}
