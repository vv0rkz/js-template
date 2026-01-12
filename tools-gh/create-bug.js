#!/usr/bin/env node
import { execSync } from 'child_process'

const args = process.argv.slice(2)
const title = args.join(' ')

if (!title) {
  console.log('❌ Использование: jst create-bug "описание бага"')
  console.log('   или: npm run _ create-bug "описание бага"')
  process.exit(1)
}

try {
  console.log('🐛 Создаю баг...')

  // Создаем issue в GitHub
  execSync(`gh issue create --title "Bug: ${title}" --body "Баг обнаружен" --label "bug" --assignee "@me"`, {
    stdio: 'inherit',
  })

  console.log('🐛 Баг зарегистрирован!')
} catch (error) {
  // Если ошибка с label - создаём его автоматически
  if (error.message.includes("'bug' not found") || error.stderr?.includes("'bug' not found")) {
    console.log("\n⚠️  Label 'bug' не найден. Создаю автоматически...")

    try {
      // Создаём label
      execSync('gh label create bug --color "D73A4A" --description "Баг который нужно исправить"', { stdio: 'ignore' })
      console.log("✅ Label 'bug' создан")

      // Пытаемся создать баг ещё раз
      console.log('🐛 Создаю баг...')
      execSync(`gh issue create --title "Bug: ${title}" --body "Баг обнаружен" --label "bug" --assignee "@me"`, {
        stdio: 'inherit',
      })

      console.log('🐛 Баг зарегистрирован!')
    } catch (retryError) {
      console.error('❌ Ошибка создания бага:', retryError.message)
      console.log('\n💡 Попробуй:')
      console.log('   npm run _ setup-labels')
      process.exit(1)
    }
  } else {
    console.error('❌ Ошибка создания бага:', error.message)
    console.log('\n💡 Убедись что:')
    console.log('   1. Установлен GitHub CLI: gh --version')
    console.log('   2. Выполнена авторизация: gh auth login')
    console.log('   3. Создан репозиторий на GitHub')
    process.exit(1)
  }
}
