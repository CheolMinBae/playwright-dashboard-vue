<template>
  <div>
    <v-text-field
      class="ma-5"
      v-model="search"
      append-icon="mdi-magnify"
      label="Search"
      single-line
      outlined
      hide-details
    ></v-text-field>

    <!-- <v-menu transition="slide-x-transition">
        <template v-slot:activator="{ on, attrs }">
          <v-btn color="primary" dark v-bind="attrs" v-on="on" class="ml-12">
            Build Selector
          </v-btn>
        </template>
        <v-list>
          <v-list-item
            v-for="(item, index) in builds"
            :key="index"
            @click="selectBuild(item)"
          >
            <v-list-item-title>{{ item }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu> -->

    <v-tabs dark background-color="primary" grow hide-slider show-arrows>
      <v-tab disabled class="white--text" v-on:click="search = ''"
        >Selected Build: {{ build }}
      </v-tab>
      <v-tab v-on:click="search = ''">Total: {{ testStats.total }} </v-tab>
      <v-tab v-on:click="search = 'failed'"
        >Failed: {{ testStats.failed }}</v-tab
      >
    </v-tabs>

    <v-data-table
      dense
      :headers="headers"
      :items="tests"
      :item-class="addColor"
      :items-per-page="-1"
      class="elevation-1 mb-10"
      :sort-by="sortBy"
      :search="search"
      :footer-props="{
        disableItemsPerPage: true,
        showCurrentPage: false,
        disablePagination: true,
      }"
    >
      <template v-slot:[`item.links`]="{ item }">
        <p v-if="item.screenshot">
          <a :href="item.links.diff" target="_blank">Screenshot diff</a>
          <br />
          <a :href="item.links.expected" target="_blank">Screenshot expected</a>
          <br />
          <a :href="item.links.received" target="_blank">Screenshot received</a>
        </p>
      </template>
    </v-data-table>
  </div>
</template>

<script lang="ts">
import Vue from "vue"
import { Component, Prop } from "vue-property-decorator"
import { TestItem, TestItems, TestLinks } from "@/types"

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
  tests: TestItem[] = []

  private headers = [
    { text: "Name", value: "name" },
    { text: "Status", value: "status" },
    { text: "Browser", value: "browser" },
    { text: "Duration", value: "duration" },
    { text: "Worker Index", value: "workerIndex" },
    { text: "Error Message", value: "errorMessage" },
    { text: "Links", value: "links" },
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

  get build() {
    return this.$route.query.build
  }

  async getData() {
    const response = await fetch(`builds/${this.build}/results.json`)
    return response.json()
  }

  async mounted() {
    let data = await this.getData()

    for (let i in data.suites) {
      let e: TestItem = {
        name: data.suites[i].file.slice(0, -8),
        status: data.suites[i].specs[0].tests[0].results[0].status,
        browser: data.suites[i].specs[0].tests[0].projectName,
        duration: data.suites[i].specs[0].tests[0].results[0].duration,
        workerIndex: data.suites[i].specs[0].tests[0].results[0].workerIndex,
      }
      if (data.suites[i].specs[0].tests[0].results[0].status == "failed") {
        if (
          data.suites[i].specs[0].tests[0].results[0].error.message.includes(
            "Snapshot comparison"
          )
        ) {
          let links: TestLinks = {
            diff: data.suites[i].specs[0].tests[0].results[0].error.message
              .split(":")[4]
              .split("test_runner")[1],
            expected: data.suites[i].specs[0].tests[0].results[0].error.message
              .split(":")[4]
              .split("test_runner")[1]
              .replace("diff", "excepted"),
            received: data.suites[i].specs[0].tests[0].results[0].error.message
              .split(":")[4]
              .split("test_runner")[1]
              .replace("diff", "received"),
          }
          e.screenshot = true
          e.links = links
          e.errorMessage = "Screenshot comparison failed"
        } else {
          e.errorMessage =
            data.suites[i].specs[0].tests[0].results[0].error.message
        }
      }

      this.tests.push(e)
    }
  }

  addColor(item: TestItem): string {
    switch (item.status) {
      case "failed":
        return "red lighten-1"
      case "timedOut":
        return "orange lighten-1"
    }
  }
}
</script>

<style scoped></style>
