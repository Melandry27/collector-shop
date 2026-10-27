// Conventional Commits : <type>(<scope>): <description>
// Scopes autorisés = composants du monorepo.
module.exports = {
  extends: ['@commitlint/config-conventional'],
  // Les commits de Dependabot ont un corps avec de longs liens (> 100 caractères par ligne),
  // que body-max-line-length refuse. Leur préfixe est déjà imposé par .github/dependabot.yml.
  ignores: [(message) => /^Signed-off-by: dependabot\[bot\]/m.test(message)],
  rules: {
    'scope-enum': [
      2,
      'always',
      [
        'web-app',
        'catalog',
        'notification',
        'contracts',
        'infra',
        'terraform',
        'helm',
        'ci',
        'docs',
        'tests',
        'deps',
        'repo',
      ],
    ],
    'subject-case': [0],
  },
};
