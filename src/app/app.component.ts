import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ProductListComponent } from 'src/shared/product/product-list/product-list.component';
import { ToolbarComponent } from 'src/shared/toolbar/toolbar.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [CommonModule, ToolbarComponent, ProductListComponent],
  standalone: true,
})
export class AppComponent {
  title = 'Acidic';
}
