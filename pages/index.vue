<template>
  <div v-if="scanning">
    <v-btn @click="stopScan">
      <v-icon>mdi-close-circle</v-icon>
    </v-btn>
  </div>
  <div v-else>
    <v-overlay
        :model-value="authorizing || fetchingSongInfo"
        class="align-center justify-center"
    >
      <v-progress-circular
          color="green-accent-3"
          size="64"
          indeterminate
      ></v-progress-circular>
    </v-overlay>
    <v-dialog
        v-model="configDialog"
        scrollable
        persistent
    >
      <v-card
          prepend-icon="mdi-cog"
          title="Einstellungen"
      >
        <v-divider/>
        <v-container class="mb-n4 mt-2">
          <v-row no-gutters class="mb-2">
            <v-col>
              Snippet
            </v-col>
          </v-row>
          <v-row no-gutters>
            <v-col>
              <v-number-input
                  :reverse="false"
                  controlVariant="split"
                  label="Snippetlänge in Sek."
                  :hideInput="false"
                  inset
                  v-model="settings.snippet.length"
              />
            </v-col>
          </v-row>
        </v-container>
        <v-divider/>
        <v-container class="mb-n4 mt-2">
          <v-row no-gutters class="mb-2">
            <v-col>
              Zufälliger Startpunkt
            </v-col>
          </v-row>
          <v-row no-gutters>
            <v-col cols="5">
              <v-checkbox
                  label="Min. Start"
                  v-model="settings.random.minStartActive"
              />
            </v-col>
            <v-col cols="7">
              <v-number-input
                  :disabled="!settings.random.minStartActive"
                  :reverse="false"
                  controlVariant="split"
                  :hideInput="false"
                  inset
                  v-model="settings.random.minStartNumber"
              />
            </v-col>
          </v-row>
          <v-row no-gutters>
            <v-col cols="5">
              <v-checkbox
                  label="Min. Start"
                  v-model="settings.random.maxStartActive"
              />
            </v-col>
            <v-col cols="7">
              <v-number-input
                  :disabled="!settings.random.maxStartActive"
                  :reverse="false"
                  controlVariant="split"
                  :hideInput="false"
                  inset
                  v-model="settings.random.maxStartNumber"
              />
            </v-col>
          </v-row>
        </v-container>
        <v-divider/>

        <template v-slot:actions>
          <v-btn
              class="ms-auto"
              @click="configDialog = false"
          >
            Schließen
          </v-btn>
        </template>
      </v-card>
    </v-dialog>
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
          <v-btn v-if="token == null" class="bg-green-accent-3" block append-icon="mdi-spotify" @click="spotifyLogin">
            Authentifizieren
          </v-btn>
          <v-btn v-else class="bg-green-accent-3" outlined block append-icon="mdi-check-circle">Authentifiziert</v-btn>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-btn class="bg-grey-darken-3" block @click="configDialog = true">
            Einstellungen
          </v-btn>
        </v-col>
      </v-row>
      <v-row class="my-10">
        <v-col class="text-center">
          <v-btn
              :disabled="token == null"
              icon
              size="250"
              :elevation="token == null ? 5 : 24"
              @click="scanQr"
          >
            <v-icon
                icon="mdi-qrcode"
                size="200"
            />
          </v-btn>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-card elevation="0" border>
            <v-card-text>
              <v-row>
                <v-col cols="9" align-self="center" class="text-center">
                  <div v-if="loadedSong == null">Kein Song gescannt!</div>
                  <div v-else></div>
                </v-col>
                <v-col cols="3">
                  <v-btn
                      elevation="5"
                      border
                      :disabled="loadedSong == null"
                      icon="mdi-play"
                      size="large"
                  ></v-btn>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import {
  type Barcode,
  BarcodeScanner,
} from '@capacitor-mlkit/barcode-scanning';
import {nextTick, ref} from "vue";
import {SPOTIFY_TOKEN, AUTHORIZING, SCANNING} from "~/constants/Constants";
import type {SpotifyApiToken} from "~/types/SpotifyTypes";
import {FetchError} from "ofetch";
import type {GameSettings} from "~/types/GameSettings";

const {$authenticateSpotify} = useNuxtApp()
const loadedSong = ref(null)
const qrCodeResult = ref<string>(null)
const toggle = ref<string>(true)
const token = useState(SPOTIFY_TOKEN)
const authorizing = useState<boolean>(AUTHORIZING)
const displayName = ref("dunno")
const configDialog = ref(false)
const fetchingSongInfo = ref(false)
const scanning = useState(SCANNING, () => false)
const settings = ref<GameSettings>({
  snippet: {
    length: 15
  },
  random: {
    minStartActive: false,
    minStartNumber: 30,
    maxStartActive: false,
    maxStartNumber: -30,
  },
})

async function scanSingleBarcode() {
  document.querySelector('body')?.classList.add('barcode-scanner-active');
  setPageLayout('scan')
  scanning.value = true
  await BarcodeScanner.startScan();

  return new Promise(async resolve => {
    const listener = await BarcodeScanner.addListener(
        'barcodeScanned',
        async result => {
          await listener.remove();
          document.querySelector('body')?.classList.remove('barcode-scanner-active');
          await setPageLayout('default')
          scanning.value = false
          await BarcodeScanner.stopScan();
          resolve(result.barcode);
        },
    );
  });
}

async function stopScan() {
  document.querySelector('body')?.classList.remove('barcode-scanner-active')
  setPageLayout('default')
  scanning.value = false
  await BarcodeScanner.removeAllListeners()
  await BarcodeScanner.stopScan()
}

async function scanQr(event: Event) {
  const accessToken = useState<SpotifyApiToken>(SPOTIFY_TOKEN).value

  fetchingSongInfo.value = true
  try {
    const result: Barcode = await scanSingleBarcode()
    const resultValue = result.displayValue
    console.debug(JSON.stringify(result))
    // const token = resultValue.ScanResult.split("www.hitstergame.com/de/").pop()
    // const offset = parseInt(token) - 1
    const offset = 5
    console.debug(offset)

    // TODO use this endpoint to get track info of playlist
    // https://developer.spotify.com/documentation/web-api/reference/get-playlist
    // TODO make response object for playlist thing
    // maybe try to make partial reponse, dont know if that works
    const hitsterId = "26zIHVncgI9HmHlgYWwnDi"
    const trackInfo = await $fetch<PlaylistTrackInfoResponse>(`https://api.spotify.com/v1/playlists/${hitsterId}/tracks?limit=1&offset=${offset}`, {
      method: "GET",
      headers: {
        Authorization: 'Bearer ' + accessToken.accessToken
      }
    })
    console.debug(JSON.stringify(trackInfo))
    const trackInfoUrl = trackInfo.items[0].track.href
    const trackResponse = await $fetch<TrackInfoResponse>(trackInfoUrl, {
      headers: {
        Authorization: 'Bearer ' + accessToken.accessToken
      }
    })
    console.debug(JSON.stringify(trackResponse))
    const trackName = trackResponse.name
    console.debug(trackName)
  } catch (e) {
    console.error(e)
  } finally {
    fetchingSongInfo.value = false
    await stopScan()
  }
}

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

interface TrackInfoResponse {
  name: string,
  duration_ms: number,
}

interface PlaylistInfoResponse {
  description: string,
  name: string,
  tracks: {
    href: string,
    offset: number,
    items: {
      track: {
        href: string,
      }
    }[],
  }
}

interface PlaylistTrackInfoResponse {
  items: {
    track: {
      name: string,
      href: string,
      duration_ms: number,
    }
  }[],
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

<style scoped>
body.barcode-scanner-active {
  visibility: hidden;
  background: transparent;
  opacity: 0.7;
}

.barcode-scanner-modal {
  visibility: visible;
}
</style>
