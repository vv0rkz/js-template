#!/usr/bin/env node
import { execSync } from 'child_process'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import sharp from 'sharp'
import { loadConfig } from './config.js'

const config = await loadConfig()
const { dir: demoDir, style: demoStyle } = config.release.demo

console.log('🎨 Обновляю README релизами с демо...')

if (!existsSync('CHANGELOG.md')) {
  console.log('❌ CHANGELOG.md не найден')
  console.log('💡 Сначала запусти: npm run _ changelog')
  process.exit(1)
}

if (!existsSync('README.md')) {
  console.log('❌ README.md не найден')
  process.exit(1)
}

const changelog = readFileSync('CHANGELOG.md', 'utf8')
let readme = readFileSync('README.md', 'utf8')

// Получаем URL репозитория
let repoUrl
try {
  const remoteUrl = execSync('git config --get remote.origin.url').toString().trim()
  if (remoteUrl.includes('github.com')) {
    repoUrl = remoteUrl.replace('git@github.com:', 'https://github.com/').replace('.git', '')
  }
} catch {
  console.log('⚠️  Не удалось определить URL репозитория')
}

/**
 * Извлекает первый кадр GIF в PNG через sharp.
 * Возвращает true если PNG создан успешно.
 */
async function tryGeneratePng(gifPath, pngPath) {
  try {
    await sharp(gifPath).png().toFile(pngPath)
    console.log(`🖼️  PNG превью создан: ${pngPath}`)
    return true
  } catch {
    return false
  }
}

/**
 * Генерирует HTML блок демо в зависимости от demoStyle.
 */
function renderDemo(version, gifPath, pngPath, hasGif, hasPng) {
  if (demoStyle === 'side-by-side') {
    let html = ''
    if (hasPng) html += `<img src="${pngPath}" alt="${version} demo preview" width="400" />`
    if (hasGif) html += `<img src="${gifPath}" alt="${version} demo animation" width="400" />`
    return `**Демо работы**  \n${html}\n\n`
  }

  // 'click' (default) — PNG превью, клик открывает GIF
  if (hasGif && hasPng) {
    return (
      `**Демо работы**  \n` +
      `<a href="${gifPath}"><img src="${pngPath}" alt="${version} demo preview" width="400" /></a>\n\n` +
      `*${version} — нажми на превью чтобы увидеть анимацию*\n\n`
    )
  }
  if (hasPng) {
    return `**Демо работы**  \n<img src="${pngPath}" alt="${version} demo preview" width="400" />\n\n`
  }
  return `**Демо работы**  \n<img src="${gifPath}" alt="${version} demo" width="400" />\n\n`
}

// Парсим changelog — только версии с демо
const versionBlocks = changelog.split('## v').slice(1)
let prettyChangelog = '## 📋 История версий\n\n'
const processedVersions = new Set()

for (const versionBlock of versionBlocks) {
  // Поддержка заголовков вида "v1.4.0...v2.0.0" (changelogen диапазон) и обычных "v2.0.0"
  const rangeMatch = versionBlock.match(/^\d+\.\d+\.\d+\.\.\.v(\d+\.\d+\.\d+)/)
  const simpleMatch = versionBlock.match(/^(\d+\.\d+\.\d+)/)
  const versionMatch = rangeMatch || simpleMatch
  if (!versionMatch) continue

  const version = `v${versionMatch[1]}`
  if (processedVersions.has(version)) continue
  processedVersions.add(version)

  const gifPath = `${demoDir}/${version}.gif`
  const pngPath = `${demoDir}/${version}.png`

  const hasGif = existsSync(gifPath)
  let hasPng = existsSync(pngPath)

  // Если есть GIF но нет PNG — пытаемся сгенерировать PNG через sharp
  if (hasGif && !hasPng) {
    hasPng = await tryGeneratePng(gifPath, pngPath)
  }

  const hasDemo = hasGif || hasPng
  if (!hasDemo) {
    console.log(`⏭️  Пропускаем ${version} - нет демо`)
    continue
  }

  // Пропускаем если нет фич
  if (
    !versionBlock.includes('### ✨ Новые фичи') &&
    !versionBlock.includes('### ✨ Фичи') &&
    !versionBlock.includes('### 🚀')
  ) {
    console.log(`⏭️  Пропускаем ${version} - нет фич`)
    continue
  }

  // Извлекаем фичи
  const features = []
  const lines = versionBlock.split('\n')
  let inFeaturesSection = false

  for (const line of lines) {
    if (line.includes('### ✨ Новые фичи') || line.includes('### ✨ Фичи') || line.includes('### 🚀')) {
      inFeaturesSection = true
      continue
    }
    if (inFeaturesSection && line.includes('### ')) break
    if (inFeaturesSection && line.trim().startsWith('-') && features.length < 3) {
      const cleanFeature = line
        .replace(/^- /, '')
        .replace(/\(\[#\d+\]\([^)]+\)\)/g, '')
        .replace(/\[#\d+\]\([^)]+\)/g, '')
        .replace(/#\d+\s*/, '')
        .replace(/\[[^\]]+\]\([^)]+\)/g, '')
        .trim()

      if (cleanFeature && !cleanFeature.toLowerCase().includes('тест') && cleanFeature.length > 10) {
        features.push(cleanFeature)
      }
    }
  }

  if (features.length === 0) continue

  console.log(`✅ Добавляем ${version} - есть демо и ${features.length} фич`)

  prettyChangelog += `### 🟢 ${version}\n\n`
  prettyChangelog += renderDemo(version, gifPath, pngPath, hasGif, hasPng)

  prettyChangelog += `**Функционал:**\n`
  features.forEach((feature) => {
    prettyChangelog += `- ${feature}\n`
  })

  if (repoUrl) {
    prettyChangelog += `\n**Релиз:** ${repoUrl}/releases/tag/${version}\n\n`
  }

  prettyChangelog += `---\n\n`
}

// Заменяем секцию между маркерами
if (readme.includes('<!-- AUTOGENERATED_SECTION START -->')) {
  const startMarker = '<!-- AUTOGENERATED_SECTION START -->'
  const endMarker = '<!-- AUTOGENERATED_SECTION END -->'

  const startIndex = readme.indexOf(startMarker)
  const endIndex = readme.indexOf(endMarker, startIndex + startMarker.length)

  if (startIndex !== -1 && endIndex !== -1) {
    readme = readme.substring(0, startIndex + startMarker.length) + '\n' + prettyChangelog + readme.substring(endIndex)
    console.log('✅ Секция обновлена')
  }
} else {
  console.log('⚠️  Маркер <!-- AUTOGENERATED_SECTION START --> не найден в README.md')
  console.log('💡 Добавь в README.md:')
  console.log('   <!-- AUTOGENERATED_SECTION START -->')
  console.log('   <!-- AUTOGENERATED_SECTION END -->')
  process.exit(1)
}

writeFileSync('README.md', readme)
console.log('✅ README обновлён с релизами, у которых есть демо!')

// Пытаемся закоммитить и запушить
try {
  const status = execSync('git status --porcelain README.md').toString().trim()
  if (status) {
    execSync('git add README.md', { stdio: 'inherit' })
    execSync('git commit -m "docs: update README with demo releases"', { stdio: 'inherit' })
    execSync('git push', { stdio: 'inherit' })
    console.log('🚀 Изменения запушены!')
  } else {
    console.log('💡 README не изменился')
  }
} catch {
  console.log('💡 README обновлён локально (не удалось запушить автоматически)')
}
