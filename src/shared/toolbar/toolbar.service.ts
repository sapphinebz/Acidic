import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ToolbarService {
  amountInShoppingCart$ = new BehaviorSubject<number | null>(null);

  constructor() {}

  setBadgeShoppingCart(value: number) {
    if (value === 0) {
      this.amountInShoppingCart$.next(null);
    } else {
      this.amountInShoppingCart$.next(value);
    }
  }
}
