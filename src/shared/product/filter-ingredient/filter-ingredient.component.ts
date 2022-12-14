import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ColdPressed } from '../select-product/select-product';
import { AsyncSubject, BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { IngredientSelection } from '../select-product-list/select-product-list';
import { FormControl, FormsModule } from '@angular/forms';
import { FilterIngredientDialogData } from './filter-ingredient';
@Component({
  selector: 'app-filter-ingredient',
  standalone: true,
  imports: [CommonModule, MatCheckboxModule, MatButtonModule, FormsModule],
  templateUrl: './filter-ingredient.component.html',
  styleUrls: ['./filter-ingredient.component.scss'],
})
export class FilterIngredientComponent implements OnInit, OnDestroy {
  onDestroy$ = new AsyncSubject<void>();
  data: FilterIngredientDialogData = inject(MAT_DIALOG_DATA);
  dialogRef: MatDialogRef<FilterIngredientComponent> = inject(MatDialogRef);

  ingredients = this.data.form.value;
  onCheckListChange = new Subject<void>();

  constructor() {
    this.onCheckListChange.pipe(takeUntil(this.onDestroy$)).subscribe(() => {
      this.data.form.setValue([...this.ingredients]);
    });
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  applyFilter() {
    this.dialogRef.close();
  }

  tickChange() {
    this.onCheckListChange.next();
  }
}
