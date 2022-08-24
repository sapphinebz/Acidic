import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceiptCanvasComponent } from './receipt-canvas.component';

describe('ReceiptCanvasComponent', () => {
  let component: ReceiptCanvasComponent;
  let fixture: ComponentFixture<ReceiptCanvasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ ReceiptCanvasComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReceiptCanvasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
