export type UserType = {
  id: number;
  name: string;
  email: string;
  phone: string;
  role?: Roles;
};

export type UpdateUserPayload = {
  name?: string;
  phone?: string;
};

export type GetAllUsersPayload = {
  page: number;
  size: number;
  sort?: string[];
};

export type Roles = 'GUEST' | 'USER' | 'ADMIN';
