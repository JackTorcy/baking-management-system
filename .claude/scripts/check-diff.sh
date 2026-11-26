#!/bin/bash
# Usage: check-diff.sh <base-ref> tests-only|no-tests
# Checks committed and uncommitted changes since <base-ref>. Exits 1 and lists offending files on a violation.
base="$1"
mode="$2"
cd "$(git rev-parse --show-toplevel)" || exit 1

changed=$( (git diff --name-only "$base"; git ls-files --others --exclude-standard) | sort -u)
fail=0

while IFS= read -r f; do
    [ -z "$f" ] && continue
    reason=""
    case "$f" in
        .claude/*) reason="agent config is owner-only" ;;
        backend/appsettings*.json) reason="appsettings is owner-only" ;;
    esac
    if [[ "$f" == backend.Tests/* || "$f" == *.test.ts || "$f" == *.test.tsx ]]; then
        [ "$mode" = "no-tests" ] && reason="implementer changed a test"
    else
        [ "$mode" = "tests-only" ] && reason="test writer changed non-test code"
    fi
    [ -n "$reason" ] && { echo "$f: $reason"; fail=1; }
done <<< "$changed"

# The model snapshot changes with every new migration; any other existing migration must stay untouched.
touched_migrations=$(git diff --name-only --diff-filter=MDR "$base" -- backend/Migrations | grep -v 'AppDbContextModelSnapshot.cs$')
if [ -n "$touched_migrations" ]; then
    echo "$touched_migrations" | sed 's/$/: existing migration edited or deleted/'
    fail=1
fi

exit $fail
