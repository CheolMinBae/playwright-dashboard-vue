<template>
  <div>
    <v-row class="my-4 mx-2">
      <v-text-field
        v-model="search"
        append-icon="mdi-magnify"
        label="Search"
        single-line
        outlined
        hide-details
      ></v-text-field>

      <v-menu transition="slide-x-transition">
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
      </v-menu>
    </v-row>

    <v-tabs dark background-color="primary" grow hide-slider show-arrows>
      <v-tab v-on:click="search = ''">Selected Build: {{ build }} </v-tab>
      <v-tab v-on:click="search = ''">Total: {{ testStats.total }} </v-tab>
      <v-tab v-on:click="search = ''">Failed: {{ testStats.failed }}</v-tab>
    </v-tabs>

    <v-data-table
      dense
      :headers="headers"
      :items="tests"
      :item-class="addColor"
      :items-per-page="-1"
      item-key="id"
      class="elevation-1 mb-10"
      :sort-by="sortBy"
      :search="search"
      :footer-props="{
        disableItemsPerPage: true,
        showCurrentPage: false,
        disablePagination: true,
      }"
    >
    </v-data-table>
  </div>
</template>

<script lang="ts">
import Vue from "vue"
import { Component, Prop } from "vue-property-decorator"
import { TestItem, TestItems } from "@/types"
//import data from "@/../builds/1/results.json"

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

  get builds() {
    const builds = require.context("@/../builds", true, /^.*\.json$/)
    return builds.keys().map((e) => e.slice(2, -13))
  }
  get build() {
    return this.$route.query.build
  }

  async getData() {
    import("@/../builds/" + this.build + "/results.json").then((res) => {
      console.log(res.default)
      console.log("test2")
      return res.default
    })
  }

  get tests(): TestItems {
    let data: any = this.getData()
    console.log("test1")

    let tests = []
    for (let i in data.suites) {
      let e: TestItem = {
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
  addColor(item: TestItem): string {
    switch (item.status) {
      case "failed":
        return "red lighten-1"
      case "timedOut":
        return "orange lighten-1"
    }
  }

  selectBuild(item: string) {
    window.location.href = "?build=" + item
  }
}
</script>

<style scoped></style>
