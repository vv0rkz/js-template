#!/usr/bin/env node
import { execSync } from 'child_process'
import { loadConfig } from './config.js'

const config = await loadConfig()
const { closeKeyword, requireIssue } = config.commits

const commitMsg = execSync('git log -1 --pretty=%B', { encoding: 'utf8' }).trim()
const commitHash = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim()

let repoUrl = execSync('git remote get-url origin', { encoding: 'utf8' }).trim()
if (repoUrl.startsWith('git@github.com:')) {
  repoUrl = repoUrl.replace('git@github.com:', 'https://github.com/').replace(/\.git$/, '')
} else {
  repoUrl = repoUrl.replace(/\.git$/, '')
}

execSync('git push origin HEAD', { stdio: 'inherit' })

const escClose = closeKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const typesGroup = requireIssue.join('|')
const closePattern = new RegExp(`^(${typesGroup})(\\(.+\\))?: ${escClose} #(\\d+)`)
const match = commitMsg.match(closePattern)

if (match) {
  const issueNumber = match[3]
  const commitLink = `${repoUrl}/commit/${commitHash}`
  const firstLine = commitMsg.split('\n')[0]

  console.log(`🔧 Закрываю issue #${issueNumber}...`)

  try {
    execSync(
      `gh issue close "${issueNumber}" --comment "✅ Завершено в коммите: [${commitHash}](${commitLink}) - ${firstLine}"`,
      { stdio: 'inherit' },
    )
  } catch {
    console.log(`⚠️  Не удалось закрыть issue #${issueNumber}`)
  }
}
