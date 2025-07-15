
<template>
  <v-overlay
      :model-value="authorizing"
      class="align-center justify-center"
  >
    <v-progress-circular
        color="green-accent-3"
        size="64"
        indeterminate
    ></v-progress-circular>
  </v-overlay>
  <v-container>
    <v-row>
      <v-col>
        <div class="text-center">
          <h1>HitNova</h1>
        </div>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-btn v-if="token == null" class="bg-green-accent-3" block append-icon="mdi-spotify" @click="spotifyLogin">Authentifizieren</v-btn>
        <v-btn v-else class="bg-green-accent-3" outlined block append-icon="mdi-check-circle">Authentifiziert</v-btn>
      </v-col>
    </v-row>
    <v-row>
      <v-col class="text-center">
        <v-icon-btn
            icon="mdi-qrcode"
            size="x-large"
            variant="tonal"
            v-ripple
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import {
  CapacitorBarcodeScanner,
  CapacitorBarcodeScannerCameraDirection,
  CapacitorBarcodeScannerScanOrientation,
  type CapacitorBarcodeScannerScanResult,
  CapacitorBarcodeScannerTypeHint,
} from "@capacitor/barcode-scanner";
import { ref } from "vue";
import { SPOTIFY_TOKEN, AUTHORIZING } from "~/constants/Constants";
import type { SpotifyApiToken } from "~/types/SpotifyTypes";
import {FetchError} from "ofetch";

const { $authenticateSpotify } = useNuxtApp()
  const qrCodeResult = ref<string>("unscanned")
  const toggle = ref<string>(true)
  const token = useState(SPOTIFY_TOKEN)
  const authorizing = useState<boolean>(AUTHORIZING)
  const displayName = ref("dunno")

  async function qrcodeClick(event: Event) {
    let result: CapacitorBarcodeScannerScanResult = await CapacitorBarcodeScanner.scanBarcode({
          hint: CapacitorBarcodeScannerTypeHint.QR_CODE,
          cameraDirection: CapacitorBarcodeScannerCameraDirection.BACK,
          scanOrientation: CapacitorBarcodeScannerScanOrientation.PORTRAIT,
        })
    qrCodeResult.value = result.ScanResult
  }

  watch(authorizing, async (n, o) => {
    if(token.value != null) {
      await userInfo()
    }
  })

  async function spotifyLogin(event: Event) {
    authorizing.value = true
    await $authenticateSpotify()
  }

  async function userInfo(event: Event) {
    let accessToken = useState<SpotifyApiToken>(SPOTIFY_TOKEN).value

    const response = await $fetch<ProfileResponse>('https://api.spotify.com/v1/me', {
      headers: {
        Authorization: 'Bearer ' + accessToken.accessToken
      }
    });

    displayName.value = response.display_name
  }

  async function playTrackOfHitster(event: Event) {
    const accessToken = useState<SpotifyApiToken>(SPOTIFY_TOKEN).value
    const response = await $fetch("https://api.spotify.com/v1/me/player/play", {
      method: "PUT",
      headers: {
        Authorization: "Bearer " + accessToken.accessToken
      },
      body: {
        context_uri: "spotify:playlist:26zIHVncgI9HmHlgYWwnDi",
        offset: {
          position: 5
        },
      }
    })
  }

  async function playNuesse() {
    const accessToken = useState<SpotifyApiToken>(SPOTIFY_TOKEN).value

    try {
      const response = await $fetch("https://api.spotify.com/v1/me/player/play", {
        method: "PUT",
        headers: {
          Authorization: "Bearer " + accessToken.accessToken
        },
        body: {
          uris: ["spotify:track:3Bw7guLtln9966ss6lmLkh"],
        }
      })
    } catch (e: FetchError) {
      console.debug(JSON.stringify(e.response))
    }
  }

interface ProfileResponse {
  country: string,
  display_name: string,
  email: string,
  explicit_content: {
    filter_enabled: boolean,
    filter_locked: boolean,
  }
  external_urls: {
    spotify: string,
  },
  followers: {
    href: string,
    total: number,
  }
  id: string,
  href: string,
  images: {
    url: string,
    height: number,
    width: number,
  }[],
  product: string,
  type: string,
  uri: string,
}

</script>
