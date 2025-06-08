
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

  let qrCodeResult: String = "unscanned"

  async function qrcodeClick(event: Event) {
    let result: CapacitorBarcodeScannerScanResult = await CapacitorBarcodeScanner.scanBarcode({
          hint: CapacitorBarcodeScannerTypeHint.QR_CODE,
          cameraDirection: CapacitorBarcodeScannerCameraDirection.BACK,
          scanOrientation: CapacitorBarcodeScannerScanOrientation.PORTRAIT,
        })
    qrCodeResult = result.ScanResult
  }
</script>
