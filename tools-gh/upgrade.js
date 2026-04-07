#!/usr/bin/env node
import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'fs'
import { spawnSync } from 'child_process'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const templateDir = join(__dirname, '../templates')
const targetDir = process.cwd()

console.log('⬆️  JST Upgrade — обновление конфигов и хуков\n')

// 1. jst.config.js — только если нет (не перезаписываем пользовательские настройки)
const configSrc = join(templateDir, 'jst.config.js')
const configDest = join(targetDir, 'jst.config.js')

if (!existsSync(configDest)) {
  copyFileSync(configSrc, configDest)
  console.log('✅ jst.config.js создан (настрой под свой проект)')
} else {
  console.log('⏭️  jst.config.js уже существует (не перезаписан)')
}

// 2. Husky hooks — всегда обновляем (это тонкие обёртки, кастомизация в jst.config.js)
console.log('\n🐶 Обновление husky хуков...')
const huskyDir = join(targetDir, '.husky')
const huskyTemplateDir = join(templateDir, '.husky')

if (!existsSync(huskyDir)) mkdirSync(huskyDir, { recursive: true })

if (existsSync(huskyTemplateDir)) {
  const copyDir = (src, dest) => {
    if (!existsSync(dest)) mkdirSync(dest, { recursive: true })
    for (const entry of readdirSync(src)) {
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
  console.log('✅ Хуки обновлены')
}

// 3. commitlint + changelog — обновляем (кастомизация теперь через jst.config.js)
const configs = ['commitlint.config.js', 'changelog.config.js']

for (const name of configs) {
  const src = join(templateDir, name)
  const dest = join(targetDir, name)
  if (existsSync(src)) {
    copyFileSync(src, dest)
    console.log(`✅ ${name} обновлён`)
  }
}

// 4. Применяем конфиг (labels + deps)
console.log('\n⚙️  Применение конфига...')

try {
  spawnSync('node', [join(__dirname, 'setup-labels.js')], { stdio: 'inherit' })
} catch {
  console.log('⏭️  Labels пропущены (нет gh)')
}

spawnSync('node', [join(__dirname, 'setup-deps.js')], { stdio: 'inherit' })

console.log('\n✅ Upgrade завершён!')
console.log('💡 Проверь jst.config.js и настрой под свой проект')
