#!/usr/bin/env node
import { execSync } from 'child_process'

const args = process.argv.slice(2)
const title = args.join(' ')

if (!title) {
  console.log('❌ Использование: jst create-task "описание задачи"')
  console.log('   или: npm run _ create-task "описание задачи"')
  process.exit(1)
}

try {
  console.log('📝 Создаю задачу...')

  // Пытаемся создать задачу с label
  execSync(`gh issue create --title "Task: ${title}" --body "Задача: ${title}" --label "task"`, {
    stdio: 'inherit',
  })

  console.log('✅ Задача создана! Используй номер в коммитах: feat: #номер описание')
} catch (error) {
  // Если ошибка с label - создаём его автоматически
  if (error.message.includes("'task' not found") || error.stderr?.includes("'task' not found")) {
    console.log("\n⚠️  Label 'task' не найден. Создаю автоматически...")

    try {
      // Создаём label
      execSync('gh label create task --color "0E8A16" --description "Задача для реализации"', { stdio: 'ignore' })
      console.log("✅ Label 'task' создан")

      // Пытаемся создать задачу ещё раз
      console.log('📝 Создаю задачу...')
      execSync(`gh issue create --title "Task: ${title}" --body "Задача: ${title}" --label "task"`, {
        stdio: 'inherit',
      })

      console.log('✅ Задача создана!')
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
