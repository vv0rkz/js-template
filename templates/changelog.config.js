let changelogTypes = {
  feat: { title: '✨ Новые фичи', semver: 'minor' },
  fix: { title: '🐛 Исправления', semver: 'patch' },
  refactor: { title: '♻️ Рефакторинг', semver: 'patch' },
  perf: { title: '⚡ Оптимизация', semver: 'patch' },
}

try {
  const { default: config } = await import('./jst.config.js')
  if (config.changelog?.types) changelogTypes = config.changelog.types
} catch {}

export default {
  types: changelogTypes,
  contributors: false,
}
