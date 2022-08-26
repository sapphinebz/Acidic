import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  forwardRef,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { IngredientSelection } from '../select-product-list/select-product-list';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import {
  AsyncSubject,
  combineLatestWith,
  ReplaySubject,
  Subject,
  takeUntil,
} from 'rxjs';
@Component({
  selector: 'app-chips-ingredients',
  standalone: true,
  imports: [CommonModule, MatChipsModule, MatIconModule],
  templateUrl: './chips-ingredients.component.html',
  styleUrls: ['./chips-ingredients.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ChipsIngredientsComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChipsIngredientsComponent
  implements OnInit, OnDestroy, ControlValueAccessor
{
  @Output() onChipsIngredients = new EventEmitter<IngredientSelection[]>();
  onDestroy$ = new AsyncSubject<void>();
  ingredientsFilterSelections: IngredientSelection[] | null = [];
  ingredientChips: IngredientSelection[] = [];
  onChipsValueChange$ = new Subject<IngredientSelection[] | null>();
  onModelChange$ = new ReplaySubject<any>(1);
  onModelTouched?: any;

  constructor(private cd: ChangeDetectorRef) {
    this.onChipsValueChange$
      .pipe(combineLatestWith(this.onModelChange$), takeUntil(this.onDestroy$))
      .subscribe(([value, onModelChange]) => {
        this.toChips(value);
        onModelChange(value);
      });
  }

  ngOnInit(): void {}

  unchipIngredient(event: MouseEvent | TouchEvent, item: IngredientSelection) {
    event.preventDefault();
    if (this.ingredientsFilterSelections) {
      const ingredient = this.ingredientsFilterSelections.find(
        (i) => i.name === item.name
      );
      if (ingredient) {
        ingredient.checked = false;
        this.onChipsValueChange$.next([...this.ingredientsFilterSelections]);
      }
    }

    this.onModelTouched?.();
    this.cd.markForCheck();
  }

  clearChips(event: MouseEvent | TouchEvent) {
    event.preventDefault();
    if (this.ingredientsFilterSelections) {
      this.ingredientsFilterSelections.forEach(
        (ingre) => (ingre.checked = false)
      );
      this.onChipsValueChange$.next([...this.ingredientsFilterSelections]);
    }

    this.onModelTouched?.();
    this.cd.markForCheck();
  }

  writeValue(ingredientsFilterSelections: IngredientSelection[] | null): void {
    this.ingredientsFilterSelections = ingredientsFilterSelections;
    this.toChips(ingredientsFilterSelections);
    this.cd.markForCheck();
  }

  toChips(ingredientsFilterSelections: IngredientSelection[] | null) {
    if (ingredientsFilterSelections) {
      this.ingredientChips = ingredientsFilterSelections.filter(
        (item) => item.checked === true
      );
    } else {
      this.ingredientChips = [];
    }
    this.onChipsIngredients.emit(this.ingredientChips);
  }

  registerOnChange(onModelChange: any): void {
    this.onModelChange$.next(onModelChange);
  }

  registerOnTouched(fn: any): void {
    this.onModelTouched = fn;
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }
}
