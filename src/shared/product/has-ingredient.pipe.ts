import { Pipe, PipeTransform } from '@angular/core';
import { IngredientSelection } from './select-product-list/select-product-list';
import { ColdPressed } from './select-product/select-product';

@Pipe({
  name: 'hasIngredient',
  standalone: true,
  pure: true,
})
export class HasIngredientPipe implements PipeTransform {
  transform(
    product: ColdPressed,
    selections: IngredientSelection[] | null
  ): boolean {
    if (selections === null || selections.length === 0) {
      return false;
    }
    return selections.every((selection) =>
      product.ingredients.includes(selection.name)
    );
  }
}
