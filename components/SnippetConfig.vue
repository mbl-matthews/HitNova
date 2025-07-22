<template>
  <v-container>
    <v-row>
      <v-col>
        <v-number-input
            :reverse="false"
            controlVariant="split"
            label="Snippetlänge in Sek."
            :hideInput="false"
            inset
            :value="modelValue"
        />
      </v-col>
    </v-row>
  </v-container>
</template>
<script setup lang="ts">

</script>
