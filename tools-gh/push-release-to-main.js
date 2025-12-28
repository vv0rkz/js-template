#!/usr/bin/env node
import { execSync } from 'child_process'

console.log('🚀 Мердж релизной ветки в main...')

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

  // 3. Определяем главную ветку (main или master)
  let mainBranch = 'main'
  try {
    execSync('git rev-parse --verify main', { stdio: 'ignore' })
  } catch {
    mainBranch = 'master'
  }

  // 4. Мерджим в main/master
  console.log(`🔀 Переключаемся на ${mainBranch} и мерджим...`)
  execSync(`git checkout ${mainBranch}`, { stdio: 'inherit' })
  execSync(`git merge ${currentBranch} --no-ff -m "Release ${currentBranch}"`, { stdio: 'inherit' })

  // 5. Пушим всё
  console.log('📤 Пушим изменения...')
  execSync(`git push origin ${mainBranch}`, { stdio: 'inherit' })
  execSync('git push --tags', { stdio: 'inherit' })

  console.log(`✅ Релиз из ветки ${currentBranch} завершён!`)
  console.log(`💡 Теперь можешь удалить ветку: git branch -d ${currentBranch}`)
} catch (error) {
  console.error('❌ Ошибка при мердже:', error.message)
  process.exit(1)
}
