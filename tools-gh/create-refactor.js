#!/usr/bin/env node
import { execSync } from 'child_process'

const args = process.argv.slice(2)
const title = args.join(' ')

if (!title) {
  console.log('❌ Использование: jst create-refactor "описание рефакторинга"')
  console.log('   или: npm run _ create-refactor "описание рефакторинга"')
  process.exit(1)
}

try {
  console.log('♻️  Создаю задачу на рефакторинг...')

  execSync(`gh issue create --title "Refactor: ${title}" --body "Рефакторинг: ${title}" --label "refactor"`, {
    stdio: 'inherit',
  })

  console.log('♻️  Задача на рефакторинг создана!')
} catch (error) {
  if (error.message.includes("'refactor' not found") || error.stderr?.includes("'refactor' not found")) {
    console.log("\n⚠️  Label 'refactor' не найден. Создаю автоматически...")

    try {
      execSync('gh label create refactor --color "FEF2C0" --description "Рефакторинг/техдолг"', { stdio: 'ignore' })
      console.log("✅ Label 'refactor' создан")

      console.log('♻️  Создаю задачу на рефакторинг...')
      execSync(`gh issue create --title "Refactor: ${title}" --body "Рефакторинг: ${title}" --label "refactor"`, {
        stdio: 'inherit',
      })

      console.log('♻️  Задача на рефакторинг создана!')
    } catch (retryError) {
      console.error('❌ Ошибка создания задачи:', retryError.message)
      console.log('\n💡 Попробуй:')
      console.log('   npm run _ setup-labels')
      process.exit(1)
    }
  } else {
    console.error('❌ Ошибка создания задачи:', error.message)
    console.log('\n💡 Убедись что:')
    console.log('   1. Установлен GitHub CLI: gh --version')
    console.log('   2. Выполнена авторизация: gh auth login')
    console.log('   3. Создан репозиторий на GitHub')
    process.exit(1)
  }
}
1
