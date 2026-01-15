#!/usr/bin/env node
import { execSync } from 'child_process'

const args = process.argv.slice(2)
const title = args.join(' ')

if (!title) {
  console.log('❌ Использование: jst create-perf "описание оптимизации"')
  console.log('   или: npm run _ create-perf "описание оптимизации"')
  process.exit(1)
}

try {
  console.log('⚡ Создаю задачу на оптимизацию...')

  execSync(`gh issue create --title "Perf: ${title}" --body "Оптимизация: ${title}" --label "perf"`, {
    stdio: 'inherit',
  })

  console.log('⚡ Задача на оптимизацию создана!')
} catch (error) {
  if (error.message.includes("'perf' not found") || error.stderr?.includes("'perf' not found")) {
    console.log("\n⚠️  Label 'perf' не найден. Создаю автоматически...")

    try {
      execSync('gh label create perf --color "FF6B6B" --description "Оптимизация производительности"', {
        stdio: 'ignore',
      })
      console.log("✅ Label 'perf' создан")

      console.log('⚡ Создаю задачу на оптимизацию...')
      execSync(`gh issue create --title "Perf: ${title}" --body "Оптимизация: ${title}" --label "perf"`, {
        stdio: 'inherit',
      })

      console.log('⚡ Задача на оптимизацию создана!')
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
