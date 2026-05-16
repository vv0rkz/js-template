#!/usr/bin/env node
import { execSync, spawnSync } from 'child_process'
import { platform } from 'os'
import { loadConfig } from './config.js'

const config = await loadConfig()
const bp = config.branchProtection

if (!bp || !bp.enable) {
  console.log('⏭️  Branch protection отключена (branchProtection.enable = false)')
  console.log('💡 Включи в jst.config.js: branchProtection: { enable: true, requiredChecks: [...] }')
  process.exit(0)
}

const requiredChecks = Array.isArray(bp.requiredChecks) ? bp.requiredChecks.filter(Boolean) : []
const enforceAdmins = !!bp.enforceAdmins
const mainBranch = (config.branch && config.branch.main) || 'main'

const isWin = platform() === 'win32'
const ghCmd = isWin ? 'gh.exe' : 'gh'

console.log(`🔒 Настройка branch protection для ветки "${mainBranch}"...\n`)

try {
  execSync(`${ghCmd} auth status`, { stdio: 'ignore' })
} catch {
  console.error('❌ GitHub CLI не установлен или не авторизован')
  console.log('💡 Установи: https://cli.github.com/')
  console.log('   И выполни: gh auth login')
  process.exit(1)
}

let repoSlug = ''
try {
  const remote = execSync('git remote get-url origin', { encoding: 'utf8' }).trim()
  const match = remote.match(/[:/]([^/:]+\/[^/]+?)(?:\.git)?$/)
  if (match) repoSlug = match[1]
} catch {
  // ignore
}

if (!repoSlug) {
  console.error('❌ Не удалось определить owner/repo из git remote origin')
  process.exit(1)
}

const payload = {
  required_status_checks:
    requiredChecks.length > 0 ? { strict: true, contexts: requiredChecks } : null,
  enforce_admins: enforceAdmins,
  required_pull_request_reviews: null,
  restrictions: null,
}

console.log(`📍 Repo: ${repoSlug}`)
console.log(`📍 Required checks: ${requiredChecks.length ? requiredChecks.join(', ') : '(none)'}`)
console.log(`📍 Enforce admins: ${enforceAdmins}`)
console.log()

const result = spawnSync(
  ghCmd,
  ['api', '-X', 'PUT', `repos/${repoSlug}/branches/${mainBranch}/protection`, '--input', '-'],
  {
    input: JSON.stringify(payload),
    stdio: ['pipe', 'inherit', 'inherit'],
    encoding: 'utf8',
  },
)

if (result.status === 0) {
  console.log('\n✅ Branch protection настроена!')
} else {
  console.error('\n❌ Не удалось настроить branch protection')
  console.log('💡 Возможные причины:')
  console.log('   • Нет прав admin на репозиторий')
  console.log('   • Репозиторий приватный на бесплатном плане (нужен Pro/Team/Enterprise)')
  console.log('   • Указанные required checks ещё не запускались на этой ветке')
  process.exit(result.status || 1)
}
