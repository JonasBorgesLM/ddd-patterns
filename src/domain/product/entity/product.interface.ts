
export default interface ProductInterface {
  get id(): string;
  get name(): string;
  get price(): number;

  notification: {
    addError(error: { context: string; message: string }): void;
  };

  changeName(name: string): void;
  changePrice(price: number): void;
}
