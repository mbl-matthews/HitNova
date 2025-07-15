interface SpotifyApiToken {
    accessToken: string,
    refreshToken: string,
}

interface SpotifyResponse {
    access_token: string,
    token_type: string,
    scope: string,
    expires_in: int,
    refresh_token: string,
}

export {
    SpotifyApiToken,
    SpotifyResponse
}
