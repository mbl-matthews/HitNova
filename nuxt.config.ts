import path from 'path'
import fs from 'fs'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  modules: ['vuetify-nuxt-module'],
  runtimeConfig: {
    spotifyClientId: '', // can be overridden by NUXT_SPOTIFY_CLIENT_ID environment variable
    spotifyRedirect: 'https://www.mrmatthews.de/redirect'
  },
  buildModules: [
    '@nuxtjs/dotenv',
  ],
  devServer: {
    https: {
      key: './server.key',
      cert: './server.crt'
    }
  }
})