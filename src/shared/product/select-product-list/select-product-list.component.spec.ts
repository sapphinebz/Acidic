import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectProductListComponent } from './select-product-list.component';

describe('SelectProductListComponent', () => {
  let component: SelectProductListComponent;
  let fixture: ComponentFixture<SelectProductListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ SelectProductListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectProductListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
