import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ColdPressed } from '../select-product/select-product';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-ingredients',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  templateUrl: './ingredients.component.html',
  styleUrls: ['./ingredients.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IngredientsComponent implements OnInit {
  data: ColdPressed = inject(MAT_DIALOG_DATA);
  dialogRef: MatDialogRef<IngredientsComponent> = inject(MatDialogRef);
  product = this.data;

  constructor() {}

  ngOnInit(): void {}

  close() {
    this.dialogRef.close();
  }
}
