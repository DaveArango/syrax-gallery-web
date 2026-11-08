//Espejos de los DTOs
export interface LoginRequest {
    username: string;
    password: string;
}

export interface TokenResponse {
    token: string;
    type: string;
    expiretAt: string;
    roles: string[];
}
