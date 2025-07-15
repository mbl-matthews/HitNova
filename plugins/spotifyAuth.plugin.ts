import {Browser} from '@capacitor/browser';
import { VERIFIER_LENGTH, CODE_VERIFIER, SPOTIFY_TOKEN } from "~/constants/Constants";
import {spotifyConfig} from "~/config/SpotifyConfig";
import type { SpotifyApiToken } from "~/types/SpotifyTypes";

export default defineNuxtPlugin((nuxtApp) => {
    useState<SpotifyApiToken>(SPOTIFY_TOKEN, () => null)

    console.log(JSON.stringify(spotifyConfig))

    return {
        provide: {
            authenticateSpotify: async () => {
                const codeVerifier = generateCodeVerifierString(VERIFIER_LENGTH)
                const hashed = await sha256(codeVerifier)
                const codeChallenge = base64encode(hashed)

                const scope = 'user-read-private user-read-email user-modify-playback-state';
                const authUrl = new URL("https://accounts.spotify.com/authorize")

                console.debug("generated verifier:")
                console.debug(codeVerifier)
                useState(CODE_VERIFIER, () => null)
                useState(CODE_VERIFIER).value = codeVerifier

                const clientId = spotifyConfig.clientId
                const redirectUri = spotifyConfig.redirectUri

                const params = {
                    response_type: 'code',
                    client_id: clientId,
                    scope,
                    code_challenge_method: 'S256',
                    code_challenge: codeChallenge,
                    redirect_uri: redirectUri,
                }

                console.debug(JSON.stringify(params))

                authUrl.search = new URLSearchParams(params).toString();
                await Browser.open({
                    url: authUrl,
                })
            }
        }
    }
})