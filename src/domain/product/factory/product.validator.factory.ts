import ValidatorInterface from "../../@shared/validator/validator.interface";
import ProductInterface from "../../product/entity/product.interface";
import ProductYupValidator from "../../product/validator/product.yup.validator";

export default class ProductValidatorFactory {
  static create(): ValidatorInterface<ProductInterface> {
    return new ProductYupValidator();
  }
}
