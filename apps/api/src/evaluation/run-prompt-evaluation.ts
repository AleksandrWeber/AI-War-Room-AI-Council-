import { runPromptEvaluation } from './prompt-evaluation.runner.js'

const report = await runPromptEvaluation()

console.log(JSON.stringify(report, null, 2))

if (report.failedCases > 0) {
  process.exitCode = 1
}
