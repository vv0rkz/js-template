#!/usr/bin/env node
import { execSync, spawnSync } from 'child_process'
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, unlinkSync, writeFileSync } from 'fs'
import { dirname, join } from 'path'
import * as readline from 'readline'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const templateDir = join(__dirname, '../templates')
const targetDir = process.cwd()
const toolsDir = join(__dirname, '../tools-gh')

console.log('⚡ JS Template by @vv0rkz — Инициализация проекта\n')

// Функция для интерактивного вопроса
function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  return new Promise((resolve) =>
    rl.question(query, (ans) => {
      rl.close()
      resolve(ans)
    })
  )
}

// 0. Проверка git репозитория
console.log('🔍 Проверка git...')
const hasGit = existsSync(join(targetDir, '.git'))

if (!hasGit) {
  console.log('  ⚠️  Git репозиторий не найден')
  const answer = await askQuestion('  ❓ Инициализировать git репозиторий? (Y/n): ')

  if (answer.toLowerCase() !== 'n' && answer.toLowerCase() !== 'no') {
    try {
      execSync('git init', { stdio: 'inherit', cwd: targetDir })
      console.log('  ✅ Git репозиторий создан')
    } catch (error) {
      console.log('  ❌ Ошибка создания git репозитория')
      console.log('     Создай вручную: git init')
    }
  } else {
    console.log('  ⏭️  Git пропущен')
    console.log('     ⚠️  Без git некоторые функции могут не работать (husky, gh)')
  }
} else {
  console.log('  ✅ Git репозиторий найден')
}

// 1. Копирование конфигов с интерактивной перезаписью
console.log('\n📋 Копирование конфигов...')
const filesToCopy = [
  { src: 'gitignore', dest: '.gitignore' },
  { src: 'changelog.config.js', dest: 'changelog.config.js' },
  { src: 'commitlint.config.js', dest: 'commitlint.config.js' },
]

for (const file of filesToCopy) {
  const src = join(templateDir, file.src)
  const dest = join(targetDir, file.dest)

  if (!existsSync(src)) {
    console.log(`  ⚠️  ${file.dest} не найден в template (пропускаем)`)
    continue
  }

  if (existsSync(dest)) {
    // Файл существует - спрашиваем что делать
    const answer = await askQuestion(`  ❓ ${file.dest} уже существует. Перезаписать? (y/N): `)

    if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
      copyFileSync(src, dest)
      console.log(`  ✅ ${file.dest} (перезаписан)`)
    } else {
      console.log(`  ⏭️  ${file.dest} (пропущен)`)
    }
  } else {
    copyFileSync(src, dest)
    console.log(`  ✅ ${file.dest}`)
  }
}

// 2. Копирование .husky
console.log('\n🐶 Настройка husky хуков...')
const huskyDir = join(targetDir, '.husky')
if (!existsSync(huskyDir)) {
  mkdirSync(huskyDir, { recursive: true })
}

const huskyTemplateDir = join(templateDir, '.husky')
if (existsSync(huskyTemplateDir)) {
  const copyDir = (src, dest) => {
    if (!existsSync(dest)) {
      mkdirSync(dest, { recursive: true })
    }

    const entries = readdirSync(src)
    for (const entry of entries) {
      const srcPath = join(src, entry)
      const destPath = join(dest, entry)

      if (statSync(srcPath).isDirectory()) {
        copyDir(srcPath, destPath)
      } else {
        copyFileSync(srcPath, destPath)
      }
    }
  }

  copyDir(huskyTemplateDir, huskyDir)
  console.log('  ✅ Хуки скопированы')
} else {
  console.log('  ⚠️  .husky не найден в template')
}

// 3. НЕ копируем tools-gh
console.log('\n🔧 GitHub скрипты...')
console.log('  ✅ Используются из @vv0rkz/js-template (не копируются)')

// 4. Добавление скриптов в package.json
console.log('\n📦 Обновление package.json...')
const packageJsonPath = join(targetDir, 'package.json')
if (existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'))

  packageJson.scripts = {
    ...packageJson.scripts,
    prepare: 'husky',
    jst: 'jst',
    _: 'jst',
  }

  if (!packageJson.devDependencies) {
    packageJson.devDependencies = {}
  }
  packageJson.devDependencies['@vv0rkz/js-template'] = '^1.4.0'

  writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2))
  console.log('  ✅ Скрипты добавлены')
  console.log('     npm run jst    или    npm run _')
}

// 5. Установка зависимостей
console.log('\n📥 Установка зависимостей...')
try {
  execSync('npm install --save-dev @commitlint/cli @commitlint/config-conventional husky changelogen', {
    stdio: 'inherit',
    cwd: targetDir,
  })
  console.log('  ✅ Зависимости установлены')
} catch (error) {
  console.error('  ❌ Ошибка установки зависимостей')
}

// 6. Инициализация husky
console.log('\n🔗 Активация husky...')
try {
  execSync('npx husky init', { stdio: 'inherit', cwd: targetDir })

  // Удаляем дефолтный pre-commit с npm test
  const defaultPreCommit = join(targetDir, '.husky', 'pre-commit')
  if (existsSync(defaultPreCommit)) {
    unlinkSync(defaultPreCommit) // ← Теперь без await import
    console.log('  🧹 Удалён дефолтный pre-commit')
  }

  console.log('  ✅ Husky активирован')
} catch (error) {
  console.log('  ⚠️  Husky уже инициализирован')
}

// 7. Настройка GitHub labels
console.log('\n🏷️  Настройка GitHub labels...')
try {
  execSync('gh auth status', { stdio: 'ignore' })
  const setupLabels = spawnSync('node', [join(toolsDir, 'setup-labels.js')], { stdio: 'inherit' })
  if (setupLabels.status === 0) {
    console.log('  ✅ Labels настроены')
  }
} catch (error) {
  console.log('  ⏭️  Пропущено (GitHub CLI не настроен)')
  console.log('     Запусти позже: npm run _ setup-labels')
}

// 8. Инициализация README
console.log('\n📝 Инициализация README...')
const initReadme = spawnSync('node', [join(toolsDir, 'init-readme.js')], { stdio: 'inherit' })
if (initReadme.status === 0) {
  console.log('  ✅ README.md создан')
}

console.log(`
🎉 JS Template успешно установлен!

📖 БЫСТРЫЕ КОМАНДЫ:
   npm run _ changelog       # Создать changelog
   npm run _ release         # Полный релиз
   npm run _ tasks           # Список задач
   npm run _ create-task     # Создать задачу

📚 ПОЛНЫЙ СПИСОК:
   npm run _

🚀 Начни работу:
   npm run _ create-task "Моя первая задача"

💡 ВАЖНО: tools-gh скрипты используются из node_modules, не копируются в проект
`)
