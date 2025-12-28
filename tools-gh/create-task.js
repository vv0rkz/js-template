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
  execSync(`gh issue create --title "Task: ${title}" --body "Задача: ${title}" --label "task"`, {
    stdio: 'inherit',
  })

  console.log('✅ Задача создана! Используй номер в коммитах: feat: #номер описание')
} catch (error) {
  console.error('❌ Ошибка создания задачи:', error.message)
  console.log('\n💡 Убедись что:')
  console.log('   1. Установлен GitHub CLI: gh --version')
  console.log('   2. Выполнена авторизация: gh auth login')
  process.exit(1)
}
