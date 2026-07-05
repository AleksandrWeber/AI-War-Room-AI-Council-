#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const root = join(import.meta.dirname, '..')
const appModulePath = join(root, 'apps/api/src/app.module.ts')
const rolloutModulePath = join(root, 'apps/api/src/app-rollout.module.ts')

const source = readFileSync(appModulePath, 'utf8')

const importLineRe =
  /^import \{ (\w+) \} from '\.\/(\w+izability)\/\2\.module\.js'$/m

const rolloutImportLines = []
const coreImportLines = []
for (const line of source.split('\n')) {
  if (importLineRe.test(line.trim())) {
    rolloutImportLines.push(line)
  } else if (line.startsWith('import ')) {
    coreImportLines.push(line)
  }
}

const moduleEntryRe = /^    (\w*izabilityModule),$/
const rolloutModuleEntries = []
const coreModuleEntries = []

const importsBlockMatch = source.match(/@Module\(\{\s*\n  imports: \[([\s\S]*?)\n  \],\n\}\)/)
if (!importsBlockMatch) {
  throw new Error('Could not parse @Module imports in app.module.ts')
}

for (const line of importsBlockMatch[1].split('\n')) {
  const match = line.match(moduleEntryRe)
  if (match) {
    rolloutModuleEntries.push(line)
  } else if (line.trim().endsWith('Module,')) {
    coreModuleEntries.push(line)
  }
}

const rolloutModuleSource = `import { Module } from '@nestjs/common'
${rolloutImportLines.join('\n')}

@Module({
  imports: [
${rolloutModuleEntries.join('\n')}
  ],
  exports: [
${rolloutModuleEntries.join('\n')}
  ],
})
export class AppRolloutModule {}
`

const coreModuleSource = `${coreImportLines.join('\n')}
import { AppRolloutModule } from './app-rollout.module.js'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
${coreModuleEntries.join('\n')}
    AppRolloutModule,
  ],
})
export class AppModule {}
`

writeFileSync(rolloutModulePath, rolloutModuleSource)
writeFileSync(appModulePath, coreModuleSource)

console.log(
  `Split app module: ${rolloutImportLines.length} rollout modules → app-rollout.module.ts`,
)
