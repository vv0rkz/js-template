#!/usr/bin/env node
import { execSync, spawnSync } from 'child_process'
import { platform } from 'os'

const isWin = platform() === 'win32'
const ghCmd = isWin ? 'gh.exe' : 'gh'

function safeExec(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }).trim()
  } catch {
    return ''
  }
}

try {
  execSync(`${ghCmd} auth status`, { stdio: 'ignore' })
} catch {
  console.error('❌ GitHub CLI не установлен или не авторизован')
  console.log('💡 Установи: https://cli.github.com/  и выполни: gh auth login')
  process.exit(1)
}

const tagsRaw = safeExec('git tag --sort=creatordate')
const tags = tagsRaw
  .split('\n')
  .map((t) => t.trim())
  .filter((t) => /^v\d+\.\d+\.\d+$/.test(t))

if (tags.length === 0) {
  console.log('ℹ️  Тегов не найдено — нечего восстанавливать')
  process.exit(0)
}

const releasesJson = safeExec(`${ghCmd} release list --json tagName --limit 200`)
let releaseTags = new Set()
try {
  releaseTags = new Set(JSON.parse(releasesJson || '[]').map((r) => r.tagName))
} catch {
  console.error('❌ Не удалось распарсить список GitHub Releases')
  process.exit(1)
}

const missing = tags.filter((t) => !releaseTags.has(t))

if (missing.length === 0) {
  console.log('✅ Все теги уже имеют GitHub Release')
  process.exit(0)
}

console.log(`🔧 Создаю GitHub Release для ${missing.length} тег(ов):`)
missing.forEach((t) => console.log(`   • ${t}`))
console.log()

let created = 0
let failed = 0

for (const tag of missing) {
  process.stdout.write(`   ${tag} ... `)
  const result = spawnSync(ghCmd, ['release', 'create', tag, '--generate-notes', '--title', tag], {
    stdio: ['ignore', 'pipe', 'pipe'],
    encoding: 'utf8',
  })

  if (result.status === 0) {
    console.log('✅')
    created++
  } else {
    console.log('⚠️')
    const errMsg = (result.stderr || '').trim().split('\n').slice(0, 2).join(' | ')
    if (errMsg) console.log(`      ${errMsg}`)
    failed++
  }
}

console.log(`\n📊 Создано: ${created}, ошибок: ${failed}`)
if (failed > 0) process.exit(1)
