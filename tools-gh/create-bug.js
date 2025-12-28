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
  // Создаем issue в GitHub
  execSync(`gh issue create --title "Bug: ${title}" --body "Баг обнаружен" --label "bug" --assignee "@me"`, {
    stdio: 'inherit',
  })

  console.log('🐛 Баг зарегистрирован!')
} catch (error) {
  console.error('❌ Ошибка создания бага:', error.message)
  console.log('\n💡 Убедись что:')
  console.log('   1. Установлен GitHub CLI: gh --version')
  console.log('   2. Выполнена авторизация: gh auth login')
  process.exit(1)
}
