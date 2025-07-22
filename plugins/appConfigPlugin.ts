import type {BackButtonListenerEvent, URLOpenListenerEvent} from "@capacitor/app"
import {App} from "@capacitor/app";
import {FetchError} from "ofetch";
import type {SpotifyApiToken, SpotifyResponse} from "~/types/SpotifyTypes";
import {CODE_VERIFIER, SPOTIFY_TOKEN, CODE_PARAM, AUTHORIZING} from "~/constants/Constants";
import {spotifyConfig} from "~/config/SpotifyConfig";

// TODO remove and or refactor console logging
export default defineNuxtPlugin(() => {
    onNuxtReady(async () => {
        await App.addListener('appUrlOpen', async function (event: URLOpenListenerEvent) {
            const url = event.url
            console.debug("deeplink url:")
            console.debug(url)
            const slug = url.split('.de').pop();
            if (slug) {
                console.debug("AppLink working. Redirected.")
                const urlobj = new URL(url);
                const code = urlobj.searchParams.get(CODE_PARAM);
                console.debug("spotify code")
                console.debug(code)
                const codeVerifier = await useState(CODE_VERIFIER).value
                console.debug("code verifier:", codeVerifier)
                console.debug("Requesting spotify access token")
                const spotifyApiToken = await requestSpotifyAccessToken(code, codeVerifier)
                console.debug("Fetched Spotify access token!")
                console.debug(JSON.stringify(spotifyApiToken))
                useState<SpotifyApiToken>(SPOTIFY_TOKEN).value = spotifyApiToken
            } else {
                console.error("Unknown app link path")
            }
            useState(AUTHORIZING).value = false
        });
        await App.addListener("backButton", async function(event: BackButtonListenerEvent) {
            await App.minimizeApp()
        })

    })
})

async function requestSpotifyAccessToken(code: string, verifier: string): SpotifyApiToken {
    const url = "https://accounts.spotify.com/api/token";

    let response: SpotifyResponse
    try {
        response = await $fetch<SpotifyResponse>(url,{
            method: "POST",
            headers: {
                'content-type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                client_id: spotifyConfig.clientId,
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: spotifyConfig.redirectUri,
                code_verifier: verifier,
            })
        })
    } catch(e: FetchError) {
        console.error("Error fetching token!")
        console.error(e.message)
        console.error(JSON.stringify(e.response))
    }
    console.debug("Fetched! spotify response:")
    console.debug(JSON.stringify(response))
    return {
        accessToken: response.access_token,
        refreshToken: response.refresh_token
    }
}

function authString(id: string, secret: string): string {
    return 'Basic ' + Buffer.from(id + ':' + secret).toString('base64')
}
