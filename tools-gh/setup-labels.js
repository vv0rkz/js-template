#!/usr/bin/env node
import { execSync } from 'child_process'

console.log('🏷️  Настройка GitHub labels...\n')

const labels = [
  { name: 'task', color: '0E8A16', description: 'Задача для реализации' },
  { name: 'bug', color: 'D73A4A', description: 'Баг который нужно исправить' },
  { name: 'enhancement', color: 'A2EEEF', description: 'Улучшение функционала' },
  { name: 'documentation', color: '0075CA', description: 'Документация' },
  { name: 'question', color: 'D876E3', description: 'Вопрос' },
]

try {
  // Проверяем что gh установлен и авторизован
  execSync('gh auth status', { stdio: 'ignore' })
} catch (error) {
  console.error('❌ GitHub CLI не установлен или не авторизован')
  console.log('💡 Установи: https://cli.github.com/')
  console.log('   И выполни: gh auth login')
  process.exit(1)
}

// Получаем существующие labels
let existingLabels = []
try {
  const output = execSync('gh label list --json name', { encoding: 'utf8' })
  existingLabels = JSON.parse(output).map((l) => l.name)
} catch (error) {
  console.log('⚠️  Не удалось получить список labels (возможно репозиторий пустой)')
}

// Создаём недостающие labels
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
