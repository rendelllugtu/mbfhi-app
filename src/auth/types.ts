export type Role = "admin" | "assessor" | "user";

export type User = {
  email: string;
  roles: string[];
  name?: string;
};

export type AuthContextType = {
  user: User | null | undefined;
  setUser: (user: User | null) => void;
  login: () => Promise<void>;
  logout: () => Promise<void>;
};