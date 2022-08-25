import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ColdPressed } from '../select-product/select-product';
import { BehaviorSubject } from 'rxjs';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
@Component({
  selector: 'app-filter-ingredient',
  standalone: true,
  imports: [CommonModule, MatCheckboxModule, MatButtonModule],
  templateUrl: './filter-ingredient.component.html',
  styleUrls: ['./filter-ingredient.component.scss'],
})
export class FilterIngredientComponent implements OnInit {
  data: { products: ColdPressed[] } = inject(MAT_DIALOG_DATA);
  dialogRef: MatDialogRef<FilterIngredientComponent> = inject(MatDialogRef);

  ingredients$ = new BehaviorSubject<string[]>([]);
  constructor() {}

  ngOnInit(): void {
    const mixIngredients = this.data.products.reduce(
      (ingredients, product) => [...ingredients, ...product.ingredients],
      [] as string[]
    );

    const ingredients = this.distinctArray(mixIngredients);
    this.ingredients$.next(ingredients);
  }

  distinctArray(array: string[]): string[] {
    return array.filter((value, index, self) => {
      return self.indexOf(value) === index;
    });
  }

  applyFilter() {
    this.dialogRef.close();
  }
}
