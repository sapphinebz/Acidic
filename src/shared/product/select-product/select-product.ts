export interface ColdPressed {
  name: string;
  src: string;
  price: number;
}

export interface SelectProduct {
  name: string;
  amount: number;
  sumPrice?: number;
  price?: number;
}

export const COLD_PRESSED_PRODUCTS: ColdPressed[] = [
  {
    name: 'Summer Root',
    src: 'assets/images/acidic_products/sm/SummerRoot.png',
    price: 69,
  },
  {
    name: 'Duo Green',
    src: 'assets/images/acidic_products/sm/DuoGreen.png',
    price: 89,
  },
  {
    name: 'Light Orange',
    src: 'assets/images/acidic_products/sm/LightOrange.png',
    price: 79,
  },
  {
    name: 'Yellow Mellow',
    src: 'assets/images/acidic_products/sm/YellowMellow.png',
    price: 69,
  },
  {
    name: 'Greenish',
    src: 'assets/images/acidic_products/sm/Greenish.png',
    price: 89,
  },
  {
    name: 'Sunrise Beet',
    src: 'assets/images/acidic_products/sm/SunriseBeet.png',
    price: 79,
  },
];
