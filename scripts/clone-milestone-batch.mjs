#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const root = join(import.meta.dirname, '..')

const batches = [
  {
    source: 'milestones-v1051-v1055.mjs',
    target: 'milestones-v1061-v1065.mjs',
    versionBase: 561,
    replacements: [
      ['validityvaultizability', 'defensibilityvaultizability'],
      ['authenticityvaultizability', 'explainabilityvaultizability'],
      ['provenancevaultizability', 'demonstrabilityvaultizability'],
      ['verificationvaultizability', 'justifiabilityvaultizability'],
      ['attestationvaultizability', 'reviewabilityvaultizability'],
    ],
  },
  {
    source: 'milestones-v1056-v1060.mjs',
    target: 'milestones-v1066-v1070.mjs',
    versionBase: 566,
    replacements: [
      ['assurancevaultizability', 'assessabilityvaultizability'],
      ['auditabilityvaultizability', 'measurabilityvaultizability'],
      ['inspectabilityvaultizability', 'certifiabilityvaultizability'],
      ['reproducibilityvaultizability', 'substantiabilityvaultizability'],
      ['credibilityvaultizability', 'warrantabilityvaultizability'],
    ],
  },
]

function capitalizeModule(name) {
  return name.charAt(0).toUpperCase() + name.slice(1)
}

for (const batch of batches) {
  let content = readFileSync(join(root, 'scripts', batch.source), 'utf8')

  for (const [from, to] of batch.replacements) {
    const fromName = capitalizeModule(from)
    const toName = capitalizeModule(to)
    content = content.replaceAll(from, to)
    content = content.replaceAll(fromName, toName)
  }

  content = content.replace(
    /version: `v5\.\$\{(\d+) \+ index\}`/,
    `version: \`v5.\${${batch.versionBase} + index}\``,
  )

  writeFileSync(join(root, 'scripts', batch.target), content)
  console.log(`Wrote ${batch.target}`)
}
