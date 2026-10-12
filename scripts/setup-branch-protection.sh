#!/usr/bin/env bash
# Protège la branche main : PR obligatoire, CI verte requise, historique linéaire.
# Prérequis : gh auth login. Sur un dépôt privé, nécessite GitHub Pro (inclus dans le GitHub Student Developer Pack).
# Usage : ./scripts/setup-branch-protection.sh <owner>/<repo>
set -euo pipefail
REPO="${1:?Usage: $0 <owner>/<repo>}"

gh api -X PUT "repos/${REPO}/branches/main/protection" \
  -H "Accept: application/vnd.github+json" \
  --input - <<JSON
{
  "required_status_checks": {
    "strict": true,
    "contexts": ["lint-test-build", "secrets-scan"]
  },
  "enforce_admins": false,
  "required_pull_request_reviews": {
    "required_approving_review_count": 0
  },
  "restrictions": null,
  "required_linear_history": true,
  "allow_force_pushes": false,
  "allow_deletions": false
}
JSON
echo "Protection de main appliquée sur ${REPO}."
