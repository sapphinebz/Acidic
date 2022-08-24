import { DUO_GREEN_SRC } from './images/duoGreen';
import { GREEN_NISH_SRC } from './images/greenish';
import { LIGHT_ORANGE_SRC } from './images/lightOrange';
import { SUMMER_ROOT_SRC } from './images/summerRoot';
import { SUNRISE_BEET_SRC } from './images/sunriseBeet';
import { YELLOW_MELLOW_SRC } from './images/yellowMellow';

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
    src: SUMMER_ROOT_SRC,
    price: 69,
  },
  {
    name: 'Duo Green',
    src: DUO_GREEN_SRC,
    price: 89,
  },
  {
    name: 'Light Orange',
    src: LIGHT_ORANGE_SRC,
    price: 79,
  },
  {
    name: 'Yellow Mellow',
    src: YELLOW_MELLOW_SRC,
    price: 69,
  },
  {
    name: 'Greenish',
    src: GREEN_NISH_SRC,
    price: 89,
  },
  {
    name: 'Sunrise Beet',
    src: SUNRISE_BEET_SRC,
    price: 79,
  },
];
