<template>
  <div>
    <v-container fluid>
      <DataTable></DataTable>
    </v-container>
  </div>
</template>

<script lang="ts">
import Vue from "vue"
import DataTable from "@/components/DataTable.vue"
import { Component } from "vue-property-decorator"

@Component({
  components: {
    DataTable,
  },
})
export default class Home extends Vue {}
</script>
