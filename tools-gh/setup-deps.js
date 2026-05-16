#!/usr/bin/env node
import { existsSync, mkdirSync, writeFileSync } from 'fs'
import { join } from 'path'
import { loadConfig, normalizeDepUpdater } from './config.js'

const config = await loadConfig()
const dep = normalizeDepUpdater(config.depUpdater)

if (!dep.type) {
  console.log('⏭️  Автообновление зависимостей отключено (depUpdater = false)')
  process.exit(0)
}

if (dep.type === 'dependabot') {
  writeDependabotConfig(dep)
  if (dep.autoMerge) {
    // shorthand: `autoMerge: true` → enable patch + minor auto-merge
    const am = dep.autoMerge === true ? { patch: true, minor: true } : dep.autoMerge
    writeDependabotAutoMergeWorkflow(am)
  }
} else if (dep.type === 'renovate') {
  writeRenovateConfig()
} else {
  console.log(`⚠️  Неизвестный depUpdater.type: "${dep.type}"`)
  console.log('💡 Допустимые значения: "dependabot", "renovate", false')
  process.exit(1)
}

// ---- helpers ------------------------------------------------------------

function buildIgnoreList(dep) {
  // Granular `ignore: { major, minor, patch }` takes precedence over
  // the simple `ignoreMajor` boolean.
  const types = []
  if (dep.ignore && typeof dep.ignore === 'object') {
    if (dep.ignore.major) types.push('version-update:semver-major')
    if (dep.ignore.minor) types.push('version-update:semver-minor')
    if (dep.ignore.patch) types.push('version-update:semver-patch')
  } else if (dep.ignoreMajor) {
    types.push('version-update:semver-major')
  }
  return types
}

function writeDependabotConfig(dep) {
  const dir = join(process.cwd(), '.github')
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })

  const filePath = join(dir, 'dependabot.yml')
  if (existsSync(filePath)) {
    console.log('⏭️  .github/dependabot.yml уже существует')
    return
  }

  const ignoreTypes = buildIgnoreList(dep)
  const ignoreBlock = ignoreTypes.length
    ? `    ignore:\n      - dependency-name: "*"\n        update-types: [${ignoreTypes
        .map((t) => `"${t}"`)
        .join(', ')}]\n`
    : ''

  const yaml =
    `version: 2\n` +
    `updates:\n` +
    `  - package-ecosystem: "npm"\n` +
    `    directory: "/"\n` +
    `    schedule:\n` +
    `      interval: "weekly"\n` +
    `    open-pull-requests-limit: 10\n` +
    ignoreBlock

  writeFileSync(filePath, yaml)
  console.log('✅ Создан .github/dependabot.yml')
  if (ignoreTypes.length) {
    console.log(`   ↳ ignore update-types: ${ignoreTypes.join(', ')}`)
  }
}

function writeDependabotAutoMergeWorkflow(autoMerge) {
  const dir = join(process.cwd(), '.github', 'workflows')
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })

  const filePath = join(dir, 'dependabot-auto-merge.yml')
  if (existsSync(filePath)) {
    console.log('⏭️  .github/workflows/dependabot-auto-merge.yml уже существует')
    return
  }

  const conditions = []
  if (autoMerge.patch) conditions.push("steps.meta.outputs.update-type == 'version-update:semver-patch'")
  if (autoMerge.minor) conditions.push("steps.meta.outputs.update-type == 'version-update:semver-minor'")
  if (autoMerge.major) conditions.push("steps.meta.outputs.update-type == 'version-update:semver-major'")

  if (conditions.length === 0) {
    console.log('⏭️  depUpdater.autoMerge не содержит ни одного true — auto-merge workflow не создан')
    return
  }

  const ifClause = conditions.join(' || ')

  const yaml = `name: Dependabot auto-merge

on: pull_request

permissions:
  contents: write
  pull-requests: write

jobs:
  dependabot:
    runs-on: ubuntu-latest
    if: github.actor == 'dependabot[bot]'
    steps:
      - name: Fetch metadata
        id: meta
        uses: dependabot/fetch-metadata@v2
        with:
          github-token: "\${{ secrets.GITHUB_TOKEN }}"

      - name: Enable auto-merge
        if: ${ifClause}
        run: gh pr merge --auto --squash "$PR_URL"
        env:
          PR_URL: \${{ github.event.pull_request.html_url }}
          GH_TOKEN: \${{ secrets.GITHUB_TOKEN }}
`

  writeFileSync(filePath, yaml)
  console.log('✅ Создан .github/workflows/dependabot-auto-merge.yml')
}

function writeRenovateConfig() {
  const filePath = join(process.cwd(), 'renovate.json')
  if (existsSync(filePath)) {
    console.log('⏭️  renovate.json уже существует')
    return
  }

  writeFileSync(
    filePath,
    JSON.stringify(
      {
        $schema: 'https://docs.renovatebot.com/renovate-schema.json',
        extends: ['config:base'],
      },
      null,
      2,
    ) + '\n',
  )
  console.log('✅ Создан renovate.json')
}
