export interface ColdPressed {
  name: string;
  src: string;
  price: number;
  ingredients: string[];
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
    ingredients: ['Pineapple', 'Guava', 'Beetroot', 'Carrot', 'Passion Fruit'],
  },
  {
    name: 'Duo Green',
    src: 'assets/images/acidic_products/sm/DuoGreen.png',
    price: 89,
    ingredients: ['Pineapple', 'Green Apple', 'Kale', 'Brazillian Spinach'],
  },
  {
    name: 'Light Orange',
    src: 'assets/images/acidic_products/sm/LightOrange.png',
    price: 79,
    ingredients: ['Green Apple', 'Lime', 'Carrot', 'Celery'],
  },
  {
    name: 'Yellow Mellow',
    src: 'assets/images/acidic_products/sm/YellowMellow.png',
    price: 69,
    ingredients: ['Pineapple', 'Green Apple', 'Tomato', 'Passion Fruit'],
  },
  {
    name: 'Greenish',
    src: 'assets/images/acidic_products/sm/Greenish.png',
    price: 89,
    ingredients: ['Green Apple', 'Tomato', 'Guava', 'Celery', 'Kale'],
  },
  {
    name: 'Sunrise Beet',
    src: 'assets/images/acidic_products/sm/SunriseBeet.png',
    price: 79,
    ingredients: [
      'Pineapple',
      'Green Apple',
      'Carrot',
      'Tomato',
      'Beetroot',
      'Finger root',
    ],
  },
];
