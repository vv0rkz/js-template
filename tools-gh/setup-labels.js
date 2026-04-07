#!/usr/bin/env node
import { execSync } from 'child_process'
import { loadConfig } from './config.js'

const config = await loadConfig()

console.log('🏷️  Настройка GitHub labels...\n')

const labels = config.labels

try {
  execSync('gh auth status', { stdio: 'ignore' })
} catch (error) {
  console.error('❌ GitHub CLI не установлен или не авторизован')
  console.log('💡 Установи: https://cli.github.com/')
  console.log('   И выполни: gh auth login')
  process.exit(1)
}

let existingLabels = []
try {
  const output = execSync('gh label list --json name', { encoding: 'utf8' })
  existingLabels = JSON.parse(output).map((l) => l.name)
} catch (error) {
  console.log('⚠️  Не удалось получить список labels (возможно репозиторий пустой)')
}

let created = 0
let skipped = 0

for (const label of labels) {
  if (existingLabels.includes(label.name)) {
    console.log(`  ⏭️  ${label.name} (уже существует)`)
    skipped++
    continue
  }

  try {
    execSync(`gh label create "${label.name}" --color "${label.color}" --description "${label.description}"`, {
      stdio: 'ignore',
    })
    console.log(`  ✅ ${label.name}`)
    created++
  } catch (error) {
    console.log(`  ⚠️  ${label.name} (ошибка создания)`)
  }
}

console.log(`\n📊 Итого: создано ${created}, пропущено ${skipped}`)

if (created > 0) {
  console.log('✅ Labels настроены!')
}
