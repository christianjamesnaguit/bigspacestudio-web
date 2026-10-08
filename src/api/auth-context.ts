import { createContext } from "react";
import type { AuthUser } from "./auth";

export type AuthContextValue = {
    user: AuthUser | null;
    isLoading: boolean;
    authenticate: (user: AuthUser) => void;
    logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
