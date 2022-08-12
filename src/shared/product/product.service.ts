import { Injectable } from '@angular/core';
import { Product } from './models/product';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  products: Product[] = [
    {
      name: 'Summer Root',
      src: '/assets/images/products/summerRoot.png',
    },
    {
      name: 'Duo Green',
      src: '/assets/images/products/duoGreen.png',
    },
    {
      name: 'Light Orange',
      src: '/assets/images/products/lightOrange.png',
    },
    {
      name: 'Yellow Mellow',
      src: '/assets/images/products/yellowMellow.png',
    },
    {
      name: 'Green Nish',
      src: '/assets/images/products/greenNish.png',
    },
    {
      name: 'Sunrise Beet',
      src: '/assets/images/products/sunriseBeet.png',
    },
  ];

  constructor() {}
}
