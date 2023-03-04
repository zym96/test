const cypress = require('cypress')
const globby = require('globby')
const Promise = require('bluebird')
const fs = require('fs')
require('console.table')

//待运行用例，实际项目中您从外部文件读入。
//本例简写，仅为演示 Module API的使用
const constFileList = ['./cypress/integration/first-spec.js', './cypress/integration/third-spec.js']

//判断仅运行存在于 constFileList 中的测试用例。
const filterCaseToRun = (filenames) => {
  const withFilters = filenames.map((filename) => ({
    filename,
    run: constFileList.includes(filename),
  }))

  for (const i in withFilters) {
    if (withFilters[i].run !== true) {
      withFilters.splice(i, 1)
    }
  }
  return withFilters
}

const runOneSpec = (spec) =>
  cypress.run({
    config: {
      video: false,
    },
    spec: spec.filename,
  })

globby('./cypress/integration/*-spec.js')
.then(filterCaseToRun)
.then((specs) => {
  console.table('测试现在开始，仅允许constFileList中的用例运行', specs)
  return Promise.mapSeries(specs, runOneSpec)
})
.then((runsResults) => {
  //您可以定制您的测试报告或者对测试结果进行处理。
  //本例仅用来演示 Module API

  const summary = runsResults
  .map((oneRun) => oneRun.runs[0])
  .map((run) => ({
    spec: run.spec.name,
    tests: run.stats.tests,
    passes: run.stats.passes,
    failures: run.stats.failures,
  }))
  console.table('测试结果一览', summary)
})