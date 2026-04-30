#!/usr/bin/env node
import { spawnSync } from 'child_process'
import { platform } from 'os'

const jstRepo = 'vv0rkz/js-template'
const isWin = platform() === 'win32'
const ghCmd = isWin ? 'gh.exe' : 'gh'

const title = process.argv.slice(2).join(' ')

console.log(`📝 Создаю issue в ${jstRepo}...`)

if (!title) {
  const result = spawnSync(ghCmd, ['issue', 'create', '--repo', jstRepo], { stdio: 'inherit' })
  process.exit(result.status || 0)
}

const result = spawnSync(ghCmd, ['issue', 'create', '--repo', jstRepo, '--title', title], {
  stdio: 'inherit',
})

if (result.status === 0) {
  console.log('\n✅ Issue создан!')
} else {
  console.error('❌ Ошибка создания issue')
  console.log('\n💡 Убедись что:')
  console.log('   1. Установлен GitHub CLI: gh --version')
  console.log('   2. Выполнена авторизация: gh auth login')
  process.exit(1)
}
