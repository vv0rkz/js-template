#!/usr/bin/env node
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { copyFileSync, mkdirSync, existsSync, readFileSync, writeFileSync, readdirSync, statSync } from 'fs'
import { execSync } from 'child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const templateDir = join(__dirname, '../templates')
const targetDir = process.cwd()

console.log('⚡ JS Template by @vv0rkz — Инициализация проекта\n')

// 1. Копирование конфигов
console.log('📋 Копирование конфигов...')
const filesToCopy = ['.gitignore', 'changelog.config.js', 'commitlint.config.js']

filesToCopy.forEach((file) => {
  const src = join(templateDir, file)
  const dest = join(targetDir, file)

  if (existsSync(dest)) {
    console.log(`  ⚠️  ${file} уже существует, пропускаем`)
  } else {
    copyFileSync(src, dest)
    console.log(`  ✅ ${file}`)
  }
})

// 2. Копирование .husky
console.log('\n🐶 Настройка husky хуков...')
const huskyDir = join(targetDir, '.husky')
if (!existsSync(huskyDir)) {
  mkdirSync(huskyDir, { recursive: true })
}

// Копирование всей папки .husky
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
}

// 3. НЕ копируем tools-gh — они остаются в node_modules
console.log('\n🔧 GitHub скрипты...')
console.log('  ✅ Используются из @vv0rkz/js-template (не копируются)')

// 4. Добавление скриптов в package.json
console.log('\n📦 Обновление package.json...')
const packageJsonPath = join(targetDir, 'package.json')
if (existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'))

  // Добавляем только минимум скриптов
  packageJson.scripts = {
    ...packageJson.scripts,
    prepare: 'husky',
    jst: 'jst',
    _: 'jst',
  }

  // Добавляем зависимость
  if (!packageJson.devDependencies) {
    packageJson.devDependencies = {}
  }
  packageJson.devDependencies['@vv0rkz/js-template'] = '^1.0.0'

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
  console.log('  ✅ Husky активирован')
} catch (error) {
  console.log('  ⚠️  Husky уже инициализирован')
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
