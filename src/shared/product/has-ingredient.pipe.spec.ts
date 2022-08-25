import { HasIngredientPipe } from './has-ingredient.pipe';

describe('HasIngredientPipe', () => {
  it('create an instance', () => {
    const pipe = new HasIngredientPipe();
    expect(pipe).toBeTruthy();
  });
});
