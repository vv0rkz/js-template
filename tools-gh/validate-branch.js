#!/usr/bin/env node
import { execSync } from 'child_process'
import { loadConfig, compileBranchRegex } from './config.js'

const config = await loadConfig()
const { main: mainBranch, patterns } = config.branch

const currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim()

if (currentBranch === mainBranch) {
  console.log(`✅ Разрешённая ветка: ${currentBranch}`)
  process.exit(0)
}

const branchRegex = compileBranchRegex(config.branch)

if (!branchRegex.test(currentBranch)) {
  console.log(`❌ Неправильный формат ветки: ${currentBranch}`)
  console.log('')

  if (patterns && patterns.length) {
    console.log('✅ Допустимые форматы:')
    for (const p of patterns) {
      console.log(`   ${p}`)
    }
  } else {
    console.log(`✅ Паттерн: ${config.branch.pattern}`)
  }

  process.exit(1)
}

console.log(`✅ Формат ветки правильный: ${currentBranch}`)
