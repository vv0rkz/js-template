#!/usr/bin/env node
import { execSync } from 'child_process'

console.log('🚀 Создание Pull Request для релиза...')

try {
  // 1. Получаем текущую ветку
  const currentBranch = execSync('git branch --show-current').toString().trim()

  if (currentBranch === 'main' || currentBranch === 'master') {
    console.log('⚠️  Вы уже находитесь на главной ветке!')
    process.exit(0)
  }

  console.log(`📁 Текущая ветка: ${currentBranch}`)

  // 2. Проверяем есть ли изменения для коммита
  const status = execSync('git status --porcelain').toString().trim()
  if (status) {
    console.log('❌ Есть незакоммиченные изменения!')
    console.log("   Сначала сделай коммит: git add . && git commit -m 'your message'")
    process.exit(1)
  }

  // 3. Проверяем что ветка запушена
  console.log('📤 Пушим изменения в удалённую ветку...')
  try {
    execSync(`git push origin ${currentBranch} --follow-tags`, { stdio: 'inherit' })
  } catch (error) {
    console.log('⚠️  Ветка уже запушена или произошла ошибка')
  }

  // 4. Определяем главную ветку (main или master)
  let mainBranch = 'main'
  try {
    execSync('git rev-parse --verify origin/main', { stdio: 'ignore' })
  } catch {
    mainBranch = 'master'
  }

  // 5. Получаем последний тег (версию релиза)
  let version = 'Release'
  try {
    version = execSync('git describe --tags --abbrev=0').toString().trim()
  } catch {
    console.log('⚠️  Тег не найден, используется дефолтное название')
  }

  // 6. Создаём Pull Request через GitHub CLI
  console.log('\n🔀 Создаю Pull Request...')

  const prTitle = `Release ${version}`
  const prBody = `Релиз версии ${version}\n\nСм. CHANGELOG.md для деталей.`

  execSync(`gh pr create --base ${mainBranch} --head ${currentBranch} --title "${prTitle}" --body "${prBody}"`, {
    stdio: 'inherit',
  })

  console.log(`\n✅ Pull Request создан!`)

  // 7. Автоматический merge БЕЗ удаления ветки
  console.log('\n🔀 Мерджу PR...')
  execSync('gh pr merge --merge', { stdio: 'inherit' })

  console.log(`\n✅ Релиз ${version} завершён!`)
  console.log(`💡 Ветка ${currentBranch} сохранена в истории`)
} catch (error) {
  console.error('❌ Ошибка при создании/мердже PR:', error.message)
  console.log('\n💡 Убедись что:')
  console.log('   1. Установлен GitHub CLI: gh --version')
  console.log('   2. Выполнена авторизация: gh auth login')
  process.exit(1)
}
