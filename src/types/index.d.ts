export declare interface TestItem {
  name: string
  status: string
  browser: string
  duration: number
  workerIndex: number
  errorMessage?: string
  links?: TestLinks
  screenshot?: boolean
}

export declare interface TestLinks {
  diff?: string
  expected?: string
  received?: string
}

export type TestItems = Array<TestItem>
