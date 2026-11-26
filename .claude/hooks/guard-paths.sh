#!/bin/bash
# PreToolUse hook for Edit/Write/NotebookEdit. Usage: guard-paths.sh tests-only|no-tests
# Bash edits slip past this hook; .claude/scripts/check-diff.sh is the real enforcement.
mode="$1"
file=$(jq -r '.tool_input.file_path // .tool_input.notebook_path // empty')
[ -z "$file" ] && exit 0

rel="${file#"$CLAUDE_PROJECT_DIR"/}"

is_test() {
    [[ "$1" == backend.Tests/* || "$1" == *.test.ts || "$1" == *.test.tsx ]]
}

if [ "$mode" = "tests-only" ] && ! is_test "$rel"; then
    echo "Test writer may only edit backend.Tests/ and *.test.ts(x). Blocked: $rel. Describe the production change you need in your report instead." >&2
    exit 2
fi

if [ "$mode" = "no-tests" ] && is_test "$rel"; then
    echo "Implementer may not edit tests. Blocked: $rel. If a test looks wrong, say so in your report." >&2
    exit 2
fi

exit 0
