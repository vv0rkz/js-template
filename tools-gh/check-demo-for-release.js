#!/usr/bin/env node
import { existsSync, readFileSync } from 'fs'
import { loadConfig } from './config.js'
import { predictNextVersion } from './version-utils.js'

const config = await loadConfig()

if (!config.release.demo.enable) {
  console.log('⏭️  Проверка демо отключена')
  process.exit(0)
}

const packageJson = JSON.parse(readFileSync('package.json', 'utf8'))
const nextVersion = predictNextVersion(packageJson.version)

console.log(`📦 Предполагаемая следующая версия: ${nextVersion}`)

const { dir: demoDir, formats: demoFormats } = config.release.demo
const hasDemo = demoFormats.some((fmt) => existsSync(`${demoDir}/${nextVersion}.${fmt}`))

if (!hasDemo) {
  console.log(`❌ Релиз ${nextVersion} требует демо!`)
  console.log(`📸 Создай: ${demoDir}/${nextVersion}.${demoFormats[0]}`)
  process.exit(1)
}

console.log(`✅ Демо для ${nextVersion} готово!`)
