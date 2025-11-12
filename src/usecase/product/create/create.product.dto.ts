export interface InputCreateProductDTO {
    type: string;
    name: string;
    price: number;
}

export interface OutputCreatedProductDTO {
    id: string;
    name: string;
    price: number;
}
