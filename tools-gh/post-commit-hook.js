#!/usr/bin/env node
import { execSync } from 'child_process'
import { loadConfig } from './config.js'

const config = await loadConfig()
const { closeKeyword, requireIssue } = config.commits

function safeExec(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }).trim()
  } catch {
    return ''
  }
}

let repoUrl = execSync('git remote get-url origin', { encoding: 'utf8' }).trim()
if (repoUrl.startsWith('git@github.com:')) {
  repoUrl = repoUrl.replace('git@github.com:', 'https://github.com/').replace(/\.git$/, '')
} else {
  repoUrl = repoUrl.replace(/\.git$/, '')
}

// Capture upstream BEFORE push so we can scan everything that lands on the
// remote in this push — including older commits whose pushes were previously
// rejected by pre-push (fixes #10).
const beforeUpstream = safeExec('git rev-parse @{u}')

try {
  execSync('git push -u origin HEAD', { stdio: 'inherit' })
} catch {
  // pre-push hook may have rejected the push; nothing to close yet.
  process.exit(1)
}

// On successful push, scan every commit between the previously known remote
// HEAD and the new HEAD for close-keywords. If we had no upstream before,
// fall back to the last 50 commits.
const range = beforeUpstream ? `${beforeUpstream}..HEAD` : '-50'
const log = safeExec(`git log ${range} --format=%H%x09%s`)

if (!log) process.exit(0)

const escClose = closeKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const typesGroup = requireIssue.join('|')
const closePattern = new RegExp(`^(${typesGroup})(\\(.+\\))?: ${escClose} #(\\d+)`)

const seen = new Set()

for (const line of log.split('\n').filter(Boolean)) {
  const tabIndex = line.indexOf('\t')
  if (tabIndex === -1) continue
  const hash = line.slice(0, tabIndex)
  const subject = line.slice(tabIndex + 1)

  const match = subject.match(closePattern)
  if (!match) continue

  const issueNumber = match[3]
  if (seen.has(issueNumber)) continue
  seen.add(issueNumber)

  const shortHash = hash.slice(0, 7)
  const commitLink = `${repoUrl}/commit/${hash}`

  console.log(`🔧 Закрываю issue #${issueNumber} (коммит ${shortHash})...`)

  try {
    execSync(
      `gh issue close "${issueNumber}" --comment "✅ Завершено в коммите: [${shortHash}](${commitLink}) - ${subject}"`,
      { stdio: 'inherit' },
    )
  } catch {
    console.log(`⚠️  Не удалось закрыть issue #${issueNumber} (возможно уже закрыт)`)
  }
}
