export type Category = {
  categoryId: number;
  name: string;
  imageUrl?: string | null;
};

export type CreateCategoryPayload = {
  name: string;
  imageUrl?: string;
};

export type UpdateCategoryPayload = {
  categoryId: number;
  name: string;
  imageUrl?: string;
};

export type DeleteCategoryPayload = {
  categoryId: number;
};

export type GetCategoryByIdPayload = {
  categoryId: number;
};
