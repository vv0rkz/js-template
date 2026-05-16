#!/usr/bin/env node
import { spawnSync } from 'child_process'
import { platform } from 'os'

const jstRepo = 'vv0rkz/js-template'
const isWin = platform() === 'win32'
const ghCmd = isWin ? 'gh.exe' : 'gh'

const rawArgs = process.argv.slice(2)

console.log(`📝 Создаю issue в ${jstRepo}...`)

// If the caller passed any flag (anything starting with `-`), we assume a
// non-interactive invocation and forward every argument verbatim to
// `gh issue create`. This enables script/CI usage like:
//   jst report-issue --title "..." --body-file body.md --label bug
//
// Otherwise we keep the historical shorthand and join the positional args
// into the title:
//   jst report-issue "Quick bug description"
const hasFlags = rawArgs.some((a) => a.startsWith('-'))

let ghArgs
if (rawArgs.length === 0) {
  ghArgs = ['issue', 'create', '--repo', jstRepo]
} else if (hasFlags) {
  ghArgs = ['issue', 'create', '--repo', jstRepo, ...rawArgs]
} else {
  ghArgs = ['issue', 'create', '--repo', jstRepo, '--title', rawArgs.join(' ')]
}

const result = spawnSync(ghCmd, ghArgs, { stdio: 'inherit' })

if (result.status === 0) {
  console.log('\n✅ Issue создан!')
  process.exit(0)
}

console.error('❌ Ошибка создания issue')
console.log('\n💡 Убедись что:')
console.log('   1. Установлен GitHub CLI: gh --version')
console.log('   2. Выполнена авторизация: gh auth login')
console.log('   3. Для non-interactive вызова используй флаги:')
console.log('      jst report-issue --title "..." --body "..."')
console.log('      jst report-issue --title "..." --body-file body.md')
process.exit(result.status || 1)
