#!/usr/bin/env node
import { existsSync, mkdirSync, writeFileSync } from 'fs'
import { join } from 'path'
import { loadConfig } from './config.js'

const config = await loadConfig()
const { depUpdater } = config

if (!depUpdater) {
  console.log('⏭️  Автообновление зависимостей отключено (depUpdater = false)')
  process.exit(0)
}

if (depUpdater === 'dependabot') {
  const dir = join(process.cwd(), '.github')
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })

  const filePath = join(dir, 'dependabot.yml')
  if (existsSync(filePath)) {
    console.log('⏭️  .github/dependabot.yml уже существует')
    process.exit(0)
  }

  writeFileSync(
    filePath,
    `version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
`,
  )
  console.log('✅ Создан .github/dependabot.yml')
} else if (depUpdater === 'renovate') {
  const filePath = join(process.cwd(), 'renovate.json')
  if (existsSync(filePath)) {
    console.log('⏭️  renovate.json уже существует')
    process.exit(0)
  }

  writeFileSync(
    filePath,
    JSON.stringify(
      {
        $schema: 'https://docs.renovatebot.com/renovate-schema.json',
        extends: ['config:base'],
      },
      null,
      2,
    ) + '\n',
  )
  console.log('✅ Создан renovate.json')
} else {
  console.log(`⚠️  Неизвестный depUpdater: "${depUpdater}"`)
  console.log('💡 Допустимые значения: "dependabot", "renovate", false')
  process.exit(1)
}
