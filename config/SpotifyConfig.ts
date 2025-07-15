export interface SpotifyConfig {
    clientId: string,
    redirectUri: string,
}

const clientId: string = "ea4b0c8d5525469297d1323c6a4e99d0"

export const spotifyProdConfig: SpotifyConfig = {
    clientId,
    redirectUri: "https://www.mrmatthews.de/redirect",
}

export const spotifyWebDevConfig: SpotifyConfig = {
    clientId,
    redirectUri: "https://localhost:3000"
}

export const spotifyConfig = spotifyProdConfig
