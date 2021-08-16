export declare interface TestItem {
  name: string
  status: string
  browser: string
  duration: number
  workerIndex: number
  errorMessage?: string
}

export type TestItems = Array<TestItem>
