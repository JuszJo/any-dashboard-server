export function setAuthHeader(token: string) {
    return `Bearer ${token}`
}

export function createRefreshCookie(token: string) {
    return `refreshToken=${token}; Path=/; HttpOnly`;
}