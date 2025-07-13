import {Browser} from '@capacitor/browser';
import {Preferences} from '@capacitor/preferences';

export default defineNuxtPlugin((nuxtApp) => {
    useState<SpotifyApiToken>("spotifyToken", () => null)

    // require('@dotenvx/dotenvx').config()
    const config = useRuntimeConfig()

    return {
        provide: {
            authenticateSpotify: async () => {
                const codeVerifier = generateCodeVerifierString(64)
                const hashed = await sha256(codeVerifier)
                const codeChallenge = base64encode(hashed)

                // TODO make both properyl configurable
                const clientId = config.spotifyClientId
                const redirectUri = config.spotifyRedirect

                const scope = 'user-read-private user-read-email';
                const authUrl = new URL("https://accounts.spotify.com/authorize")

                console.debug("generated verifier:")
                console.debug(codeVerifier)
                useState("code_verifier", () => null)
                useState("code_verifier").value = codeVerifier

                const params = {
                    response_type: 'code',
                    client_id: clientId,
                    scope,
                    code_challenge_method: 'S256',
                    code_challenge: codeChallenge,
                    redirect_uri: redirectUri,
                }
                

                authUrl.search = new URLSearchParams(params).toString();
                await Browser.open({
                    url: authUrl,
                })
            }
        }
    }
})