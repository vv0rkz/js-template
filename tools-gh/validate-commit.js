#!/usr/bin/env node
import { readFileSync } from 'fs'
import { spawnSync } from 'child_process'
import { platform } from 'os'
import { loadConfig } from './config.js'

const config = await loadConfig()
const commitMsgFile = process.argv[2]
const commitMsg = readFileSync(commitMsgFile, 'utf8').split('\n')[0].trim()

const { types, requireIssue, closeKeyword } = config.commits

if (/^chore\(release\): v\d+\.\d+\.\d+$/.test(commitMsg)) {
  console.log(`✅ Авто-релизный коммит: ${commitMsg}`)
  process.exit(0)
}

const escClose = closeKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const issuePatterns = requireIssue
  .map((t) => `${t}(\\(.+\\))?: (${escClose} )?#[0-9]+ .+`)
  .join('|')

const freePatterns = types
  .filter((t) => !requireIssue.includes(t))
  .map((t) => `${t}(\\(.+\\))?: .+`)
  .join('|')

const fullPattern = [issuePatterns, freePatterns].filter(Boolean).join('|')
const regex = new RegExp(`^(${fullPattern})$`)

if (!regex.test(commitMsg)) {
  console.log(`❌ Неправильный формат коммита: '${commitMsg}'`)
  showHelp()
  process.exit(1)
}

for (const type of requireIssue) {
  const typeMatch = new RegExp(`^${type}(\\(.+\\))?:`)
  if (typeMatch.test(commitMsg)) {
    const issueMatch = new RegExp(`^${type}(\\(.+\\))?: (${escClose} )?#[0-9]`)
    if (!issueMatch.test(commitMsg)) {
      console.log(`❌ ${type} коммиты должны содержать номер задачи`)
      console.log(`💡 Твой коммит: ${commitMsg}`)
      console.log(`✅ Пример: ${type}: #9 описание`)
      console.log(`✅ Закрыть: ${type}: ${closeKeyword} #9 описание`)
      process.exit(1)
    }
  }
}

const isWin = platform() === 'win32'
const npx = isWin ? 'npx.cmd' : 'npx'
const result = spawnSync(npx, ['--no', '--', 'commitlint', '--edit', commitMsgFile], {
  stdio: 'inherit',
})

process.exit(result.status || 0)

function showHelp() {
  console.log('')
  console.log('🎯 РАЗРЕШЕННЫЕ ФОРМАТЫ КОММИТОВ:')
  console.log('────────────────────────────────────')

  for (const type of types) {
    if (requireIssue.includes(type)) {
      console.log(`   ${type}: #номер описание`)
      console.log(`   ${type}(scope): #номер описание`)
      console.log(`   ${type}: ${closeKeyword} #номер описание  (закрыть issue)`)
    } else {
      console.log(`   ${type}: описание`)
      console.log(`   ${type}(scope): описание`)
    }
  }

  console.log('   chore(release): vX.X.X')
  console.log('')
  console.log('📝 ПРИМЕРЫ:')
  console.log('   feat: #9 добавить нормализацию')
  console.log('   feat(Date): #9 добавить форматирование дат')
  console.log(`   feat: ${closeKeyword} #9 добавить нормализацию (закрыть issue)`)
  console.log(`   feat(parser): ${closeKeyword} #9 финализировать (scope + закрыть)`)
  console.log('   fix: #10 исправить валидацию')
  console.log('   refactor(utils): оптимизировать хелперы')
  console.log('────────────────────────────────────')
}
