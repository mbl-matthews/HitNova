
<template>
  <v-container>
    <v-row>
      <v-col justify="center">
        <v-btn icon="mdi-qrcode" @click="qrcodeClick"/>
        <v-btn icon="mdi-edit" @click="changeStuff"/>
      </v-col>
    </v-row>
    <v-row>
      <v-col justify="center">
        <div>
          {{ qrCodeResult }}
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

  const qrCodeResult = ref<string>("unscanned")
  const toggle = ref<string>(true)

  function changeStuff(event: Event) {
    qrCodeResult.value = toggle.value.toString()
    toggle.value = !(toggle.value)
  }

  async function qrcodeClick(event: Event) {
    let result: CapacitorBarcodeScannerScanResult = await CapacitorBarcodeScanner.scanBarcode({
          hint: CapacitorBarcodeScannerTypeHint.QR_CODE,
          cameraDirection: CapacitorBarcodeScannerCameraDirection.BACK,
          scanOrientation: CapacitorBarcodeScannerScanOrientation.PORTRAIT,
        })
    qrCodeResult.value = result.ScanResult
  }
</script>
