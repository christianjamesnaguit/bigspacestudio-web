import axios from "axios";
import api from "./axios";

export type AuthUser = {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
};

export type ApiError = {
    message: string;
    errors?: Record<string, string[]>;
};

const csrfClient = axios.create({
    baseURL: "http://localhost:8000",
    withCredentials: true,
    withXSRFToken: true,
});

export async function prepareCsrf() {
    await csrfClient.get("/sanctum/csrf-cookie");
}

export async function login(email: string, password: string, remember: boolean) {
    await prepareCsrf();
    return api.post<{ message: string; user: AuthUser }>("/login", { email, password, remember });
}

export async function register(
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    passwordConfirmation: string,
) {
    await prepareCsrf();
    return api.post<{ message: string; user: AuthUser }>("/register", {
        first_name: firstName,
        last_name: lastName,
        email,
        password,
        password_confirmation: passwordConfirmation,
    });
}

export async function requestPasswordReset(email: string) {
    await prepareCsrf();
    return api.post<{ message: string }>("/forgot-password", { email });
}

export async function resetPassword(
    token: string,
    email: string,
    password: string,
    passwordConfirmation: string,
) {
    await prepareCsrf();
    return api.post<{ message: string }>("/reset-password", {
        token,
        email,
        password,
        password_confirmation: passwordConfirmation,
    });
}

export function getApiError(error: unknown, fallback: string) {
    if (axios.isAxiosError<ApiError>(error)) {
        const apiError = error.response?.data;
        const validationMessage = apiError?.errors ? Object.values(apiError.errors).flat()[0] : undefined;
        return validationMessage ?? apiError?.message ?? fallback;
    }

    return fallback;
}

export async function getCurrentUser() {
    const response = await api.get<{ user: AuthUser }>("/user");
    return response.data.user;
}

export async function logout() {
    await prepareCsrf();
    return api.post<{ message: string }>("/logout");
}