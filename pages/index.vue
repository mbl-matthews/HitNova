
<template>
  <v-container>
    <v-row>
      <v-col justify="center">
        <v-btn icon="mdi-qrcode" @click="qrcodeClick"/>
      </v-col>
    </v-row>
    <v-row>
      <v-col justify="center">
        <div>
          {{ qrCodeResult }}
        </div>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-btn icon="mdi-spotify" @click="spotifyLogin"/>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-progress-circular v-if="authorizing" indeterminate :size="50"></v-progress-circular>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        Access Token: {{ token }}
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <div v-if="token != null">
          display name: {{ displayName }}
        </div>
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

  const { $authenticateSpotify } = useNuxtApp()
  const qrCodeResult = ref<string>("unscanned")
  const toggle = ref<string>(true)
  const token = useState("spotifyToken")
  const authorizing = useState<boolean>("authorizing")
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
    let accessToken = useState("spotifyToken").value as SpotifyApiToken

    const response = await $fetch<ProfileResponse>('https://api.spotify.com/v1/me', {
      headers: {
        Authorization: 'Bearer ' + accessToken.accessToken
      }
    });

    displayName.value = response.display_name
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
