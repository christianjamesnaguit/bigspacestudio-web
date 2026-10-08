import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { getCurrentUser, logout as logoutRequest } from "./auth";
import { AuthContext } from "./auth-context";
import type { AuthUser } from "./auth";

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const location = useLocation();
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isActive = true;

        getCurrentUser()
            .then((currentUser) => {
                if (isActive) {
                    setUser(currentUser);
                }
            })
            .catch(() => {
                if (isActive) {
                    setUser(null);
                }
            })
            .finally(() => {
                if (isActive) {
                    setIsLoading(false);
                }
            });

        return () => {
            isActive = false;
        };
    }, [location.pathname]);

    async function logout() {
        try {
            await logoutRequest();
        } catch (requestError) {
            console.warn("Logout request could not be completed.", requestError);
        } finally {
            setUser(null);
            localStorage.removeItem("remember-auth");
        }
    }

    function authenticate(authenticatedUser: AuthUser) {
        setUser(authenticatedUser);
        setIsLoading(false);
    }

    return <AuthContext.Provider value={{ user, isLoading, authenticate, logout }}>{children}</AuthContext.Provider>;
}