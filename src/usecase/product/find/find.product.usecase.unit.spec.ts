import ProductFactory from "../../../domain/product/factory/product.factory";
import FindProductUseCase from "./find.product.usecase";

const product1 = ProductFactory.create("a", "Product A", 1);

const MockRepository = () => {
    return {
        create: jest.fn(),
        find: jest.fn().mockReturnValue(product1),
        update: jest.fn(),
        findAll: jest.fn(),
    };
};

describe("Unit test for finding product use case", () => {
    it("should find a product", async () => {
        const repository = MockRepository();
        const useCase = new FindProductUseCase(repository);
        const input = {
            id: "a",
        };
        const output = {
            id: product1.id,
            name: product1.name,
            price: product1.price,
        };

        const result = await useCase.execute(input);

        expect(result).toEqual(output);
    });

    it("should not find a product", async () => {
        const repository = MockRepository();
        repository.find.mockImplementation(() => {
            throw new Error("Product not found");
        });
        const useCase = new FindProductUseCase(repository);
        const input = {
            id: "a",
        };

        expect(() => {
            return useCase.execute(input);
        }).rejects.toThrow("Product not found");
    });
});
