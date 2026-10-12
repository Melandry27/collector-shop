// Conventional Commits : <type>(<scope>): <description>
// Scopes autorisés = composants du monorepo.
module.exports = {
  extends: ['@commitlint/config-conventional'],
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
