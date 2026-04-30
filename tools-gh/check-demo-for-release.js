#!/usr/bin/env node
import { existsSync, readFileSync } from 'fs'
import { execSync } from 'child_process'
import { loadConfig } from './config.js'

const config = await loadConfig()

if (!config.release.demo.enable) {
  console.log('⏭️  Проверка демо отключена')
  process.exit(0)
}

const packageJson = JSON.parse(readFileSync('package.json', 'utf8'))
const [major, minor, patch] = packageJson.version.split('.').map(Number)

const commitMessages = execSync('git log --oneline -10', { encoding: 'utf8' })

let nextVersion
if (commitMessages.includes('feat:')) {
  nextVersion = `v${major}.${minor + 1}.0`
} else {
  nextVersion = `v${major}.${minor}.${patch + 1}`
}

console.log(`📦 Предполагаемая следующая версия: ${nextVersion}`)

const { dir: demoDir, formats: demoFormats } = config.release.demo
const hasDemo = demoFormats.some((fmt) => existsSync(`${demoDir}/${nextVersion}.${fmt}`))

if (!hasDemo) {
  console.log(`❌ Релиз ${nextVersion} требует демо!`)
  console.log(`📸 Создай: ${demoDir}/${nextVersion}.${demoFormats[0]}`)
  process.exit(1)
}

console.log(`✅ Демо для ${nextVersion} готово!`)
