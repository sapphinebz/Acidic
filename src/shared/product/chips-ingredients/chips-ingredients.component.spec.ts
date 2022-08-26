import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChipsIngredientsComponent } from './chips-ingredients.component';

describe('ChipsIngredientsComponent', () => {
  let component: ChipsIngredientsComponent;
  let fixture: ComponentFixture<ChipsIngredientsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ ChipsIngredientsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChipsIngredientsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
