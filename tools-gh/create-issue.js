#!/usr/bin/env node
import { execSync, spawnSync } from 'child_process'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

/**
 * Создаёт GitHub issue с автоматической настройкой labels
 * @param {string} type - Тип issue (feat, fix, refactor, perf)
 * @param {string} emoji - Эмодзи для вывода
 * @param {string} description - Описание действия
 */
export function createIssue(type, emoji, description) {
  console.log(`${emoji} Создаю задачу на ${description}...`)

  const title = process.argv.slice(2).join(' ')

  if (!title) {
    console.log('❌ Укажи название задачи')
    console.log(`   Пример: npm run _ ${type} "Название задачи"`)
    process.exit(1)
  }

  const issueTitle = `${type.charAt(0).toUpperCase() + type.slice(1)}: ${title}`
  const issueBody = `${description}: ${title}`

  try {
    execSync(`gh issue create --title "${issueTitle}" --body "${issueBody}" --label "${type}"`, { stdio: 'inherit' })
    console.log('\n✅ Задача создана!')
  } catch (error) {
    // Если ошибка с label - запускаем setup-labels
    if (error.message.includes('not found') || error.message.includes('label')) {
      console.log(`\n⚠️  Label "${type}" не найден`)
      console.log('🔧 Настраиваю labels...\n')

      spawnSync('node', [join(__dirname, 'setup-labels.js')], { stdio: 'inherit' })

      console.log('\n🔄 Повторяю создание задачи...\n')
      try {
        execSync(`gh issue create --title "${issueTitle}" --body "${issueBody}" --label "${type}"`, {
          stdio: 'inherit',
        })
        console.log('\n✅ Задача создана!')
      } catch (retryError) {
        console.error('❌ Ошибка создания задачи:', retryError.message)
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
}
