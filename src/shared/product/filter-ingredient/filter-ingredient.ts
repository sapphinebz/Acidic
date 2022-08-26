import { FormControl } from '@angular/forms';
import { IngredientSelection } from '../select-product-list/select-product-list';

export interface FilterIngredientDialogData {
  form: FormControl<IngredientSelection[]>;
}
