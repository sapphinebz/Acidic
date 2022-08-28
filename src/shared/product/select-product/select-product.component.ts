import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  forwardRef,
  inject,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import {
  map,
  takeUntil,
  debounceTime,
  exhaustMap,
  tap,
  switchMap,
  observeOn,
  takeWhile,
  endWith,
} from 'rxjs/operators';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import {
  animationFrames,
  animationFrameScheduler,
  AsyncSubject,
  BehaviorSubject,
  combineLatest,
  fromEvent,
  merge,
  ReplaySubject,
  timer,
} from 'rxjs';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { ColdPressed, SelectProduct } from './select-product';
import { IngredientsComponent } from '../ingredients/ingredients.component';

@Component({
  selector: 'app-select-product',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatDialogModule],
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
  implements OnInit, OnDestroy, AfterViewInit, ControlValueAccessor
{
  @ViewChild('productEl', { read: ElementRef })
  productEl!: ElementRef<HTMLDivElement>;
  @Input() product!: ColdPressed;
  @Input() highlight = false;
  dialog = inject(MatDialog);
  amount$ = new BehaviorSubject<number>(0);
  onDestroy$ = new AsyncSubject<void>();
  sumPrice$ = new ReplaySubject<number>(1);

  cd = inject(ChangeDetectorRef);
  zone = inject(NgZone);

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

  ngAfterViewInit(): void {
    // hover and slide
    const productElement = this.productEl.nativeElement;
    const searchIconElement =
      productElement.querySelector<HTMLElement>('[data-search-icon]')!;

    searchIconElement.style.position = 'absolute';
    searchIconElement.style.opacity = '0';
    this.zone.runOutsideAngular(() => {
      const mousedown$ = fromEvent<MouseEvent>(
        productElement,
        'mousedown'
      ).pipe(map((event) => ({ x: event.x })));
      const touchstart$ = fromEvent<TouchEvent>(
        productElement,
        'touchstart'
      ).pipe(map((event) => ({ x: event.touches[0].clientX })));
      const down$ = merge(mousedown$, touchstart$);
      const mouseup$ = fromEvent<MouseEvent>(document, 'mouseup');
      const touchend$ = fromEvent<TouchEvent>(document, 'touchend');
      const up$ = merge(mouseup$, touchend$);
      const mousemove$ = fromEvent<MouseEvent>(document, 'mousemove').pipe(
        map((event) => ({ x: event.x }))
      );
      const touchmove$ = fromEvent<TouchEvent>(document, 'touchmove').pipe(
        map((event) => ({ x: event.touches[0].clientX }))
      );
      const move$ = merge(mousemove$, touchmove$);
      down$
        .pipe(
          switchMap((downEvent) => {
            const cancelHold$ = merge(move$, up$).pipe(tap(() => {}));
            return timer(200).pipe(
              map(() => downEvent),
              takeUntil(cancelHold$)
            );
          }),
          exhaustMap((downEvent) => {
            const minRange = 0.2;
            const maxRange = 32;
            let range: number;
            this.cd.detectChanges();

            productElement.classList.add(
              '_select-product-cold-pressed-button-hover'
            );
            return move$.pipe(
              observeOn(animationFrameScheduler),
              tap((upEvent) => {
                const dragRange = upEvent.x - downEvent.x;
                range = Math.min(maxRange, dragRange);
                const opacityRange = range / maxRange;

                productElement.style.borderLeftWidth = `${range}px`;
                searchIconElement.style.transform = `translateX(-${range}px)`;
                searchIconElement.style.opacity = `${opacityRange}`;
              }),
              takeUntil(
                up$.pipe(
                  tap(() => {
                    if (
                      range &&
                      productElement.style.borderLeftWidth === `${maxRange}px`
                    ) {
                      this.zone.run(() => {
                        this.openIngredientsDialog();
                      });
                    }

                    if (range) {
                      this.tween(200).subscribe({
                        next: (t) => {
                          productElement.style.borderLeftWidth = `${
                            range - (range - minRange) * t
                          }px`;

                          searchIconElement.style.opacity = `${
                            (range - range * t) / maxRange
                          }`;

                          searchIconElement.style.transform = `translateX(${
                            range * t - range
                          }px)`;
                        },
                        complete: () => {
                          productElement.classList.remove(
                            '_select-product-cold-pressed-button-hover'
                          );
                        },
                      });
                    } else {
                      productElement.style.borderLeftWidth = `${minRange}px`;
                      searchIconElement.style.transform = `translateX(${0}px)`;
                      productElement.classList.remove(
                        '_select-product-cold-pressed-button-hover'
                      );
                      searchIconElement.style.opacity = `0`;
                    }
                  })
                )
              )
            );
          }),
          takeUntil(this.onDestroy$)
        )
        .subscribe();
    });
  }

  tween(duration: number) {
    return animationFrames().pipe(
      map((event) => event.elapsed / duration),
      takeWhile((t) => t < 1),
      endWith(1)
    );
  }

  openIngredientsDialog() {
    const dialogRef = this.dialog.open(IngredientsComponent, {
      width: '250px',
      data: this.product,
      enterAnimationDuration: '20ms',
      exitAnimationDuration: '20ms',
    });
  }

  writeValue(value: SelectProduct | null): void {
    if (value === null) {
      this.amount$.next(0);
    } else {
      this.amount$.next(value.amount);
    }
  }

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
          name: this.product.name,
        };
        onModelChange(modelState);
      });
  }

  registerOnTouched(fn: any): void {}

  setDisabledState?(isDisabled: boolean): void {}

  addProduct(event: MouseEvent | TouchEvent) {
    event.preventDefault();
    this.amount$.next(this.amount$.value + 1);
  }

  removeProduct(event: MouseEvent | TouchEvent) {
    event.preventDefault();
    const currentAmount = this.amount$.value;
    if (currentAmount !== 0) {
      this.amount$.next(this.amount$.value - 1);
    }
  }
}
