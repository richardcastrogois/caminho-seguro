export type LoginInput = {
  email: string;
  password: string;
};

export type LoginResult = {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
};
