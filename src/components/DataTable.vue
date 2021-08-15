<template>
  <span>
    <v-text-field
      v-model="search"
      append-icon="mdi-magnify"
      label="Search"
      single-line
      outlined
      hide-details
      class="mb-10"
    ></v-text-field>

    <v-tabs dark background-color="primary" grow hide-slider show-arrows>
      <v-tab v-on:click="search = ''">Total: {{ testStats.total }} </v-tab>
      <v-tab v-on:click="search = ''">Failed: {{ testStats.failed }}</v-tab>
    </v-tabs>

    <v-data-table
      dense
      :headers="headers"
      :items="tests"
      :items-per-page="50"
      item-key="id"
      class="elevation-1 mb-10"
      :sort-by="sortBy"
      :search="search"
    >
    </v-data-table>
  </span>
</template>

<script lang="ts">
import Vue from "vue"
import { Component, Prop } from "vue-property-decorator"
import { Tests } from "@/types"
import data from "../results.json"

type TestStats = {
  total: number
  failed: number
}

@Component
export default class DataTable extends Vue {
  //@Prop({ required: true }) selectedTests: Tests[]
  private expanded: unknown[] = []
  private sortBy = "Status"
  private search = ""

  private headers = [
    { text: "Name", value: "name" },
    { text: "Status", value: "status" },
    { text: "Browser", value: "browser" },
    { text: "Duration", value: "duration" },
    { text: "Worker Index", value: "workerIndex" },
    { text: "Error Message", value: "errorMessage" },
  ]

  get testStats(): TestStats {
    let total = this.tests.length
    let failed = 0
    for (let i in this.tests) {
      if (this.tests[i].status == "failed") {
        failed++
      }
    }
    return { total, failed }
  }
  get tests(): Tests {
    let tests = []
    for (let i in data.suites) {
      let e = {
        name: data.suites[i].file.slice(0, -8),
        status: data.suites[i].specs[0].tests[0].results[0].status,
        browser: data.suites[i].specs[0].tests[0].projectName,
        duration: data.suites[i].specs[0].tests[0].results[0].duration,
        workerIndex: data.suites[i].specs[0].tests[0].results[0].workerIndex,
      }
      if (data.suites[i].specs[0].tests[0].results[0].status == "failed") {
        e.errorMessage =
          data.suites[i].specs[0].tests[0].results[0].error.message
      }
      tests.push(e)
    }
    return tests
  }
}
</script>

<style scoped></style>
