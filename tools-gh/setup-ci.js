#!/usr/bin/env node
import { existsSync, mkdirSync, writeFileSync } from 'fs'
import { join } from 'path'
import { loadConfig } from './config.js'

const config = await loadConfig()
const ci = config.ci

if (!ci || !ci.enable) {
  console.log('⏭️  CI отключён (ci.enable = false)')
  process.exit(0)
}

const checks = Array.isArray(ci.checks) ? ci.checks.filter(Boolean) : []
if (checks.length === 0) {
  console.log('⚠️  ci.enable = true, но ci.checks пуст — workflow не создан')
  process.exit(0)
}

const nodeVersion = ci.nodeVersion || '20'
const mainBranch = (config.branch && config.branch.main) || 'main'

const workflowsDir = join(process.cwd(), '.github', 'workflows')
if (!existsSync(workflowsDir)) mkdirSync(workflowsDir, { recursive: true })

const filePath = join(workflowsDir, 'ci.yml')
if (existsSync(filePath)) {
  console.log('⏭️  .github/workflows/ci.yml уже существует')
  process.exit(0)
}

const jobs = checks
  .map(
    (check) => `  ${check}:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '${nodeVersion}'
          cache: npm
      - run: npm ci
      - run: npm run ${check}`,
  )
  .join('\n\n')

const yaml = `name: CI

on:
  push:
    branches: [${mainBranch}]
  pull_request:
    branches: [${mainBranch}]

jobs:
${jobs}
`

writeFileSync(filePath, yaml)
console.log('✅ Создан .github/workflows/ci.yml')
console.log(`   ↳ checks: ${checks.join(', ')}`)
console.log(`   ↳ node: ${nodeVersion}`)
console.log(`   ↳ branch: ${mainBranch}`)
