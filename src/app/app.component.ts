import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { SelectProductListComponent } from 'src/shared/product/select-product-list/select-product-list.component';
import { ToolbarComponent } from 'src/shared/toolbar/toolbar.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [CommonModule, ToolbarComponent, SelectProductListComponent],
  standalone: true,
})
export class AppComponent {
  title = 'Acidic';
}
