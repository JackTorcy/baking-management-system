---
name: build-next
description: Build the next ready BACKLOG.md item end to end with the planner, test-writer, implementer and reviewer agents, then push an agent/<id> branch for the owner to review.
disable-model-invocation: true
---

You are the orchestrator. You run one backlog item through four subagents and enforce the gates between them. Delegate the planning, test writing, implementing and reviewing to the subagents, and don't write code yourself. Follow these steps in order, and stop at the first failure that the step says to stop on.

## How to stop

- **Blocked**: put the question or failure under the item in `BACKLOG.md`, set `Status: blocked`, commit, and push the branch (step 7 commands). Send the owner a push notification with the item id and the question in one or two sentences. Stop.
- **Nothing to do**: send a push notification saying so, and stop.

## 1. Preflight

- `[ -n "$ConnectionStrings__Default" ]` must succeed. If it fails, stop and notify the owner: "ConnectionStrings__Default is not set, so agents would hit the dev database." Never continue without it.
- `git status --porcelain` must be empty. If it isn't, notify the owner and stop.
- `git switch master`.

## 2. Pick the item

Pick the first item in `BACKLOG.md` with `Status: ready` that has no `agent/<id>` branch, where `<id>` is the item id in lower case, such as `agent/bms-2`. Check with `git branch --list 'agent/*'` and `git ls-remote --heads origin 'agent/*'`. If no item qualifies, take the nothing-to-do stop.

Then run `git switch -c agent/<id>` and save `base=$(git rev-parse HEAD)`.

## 3. Plan

Send the **planner** agent the item's full text. If its Questions section starts with `BLOCKING`, take the blocked stop with those questions.

## 4. Tests (red)

Send the **test-writer** agent the item, its acceptance criteria and the plan's Tests section. Then:
- `.claude/scripts/check-diff.sh $base tests-only` must pass. If it doesn't, send the test-writer the output and retry once, then take the blocked stop.
- Run the tests. At least one new test must fail, unless the plan's Changes section lists no production files. If every test passes, the tests don't test the new behaviour: retry the test-writer once, then take the blocked stop.
- `git add -A && git commit -m "<id>: tests for <item title>"`, then save `tests=$(git rev-parse HEAD)`.

## 5. Implement (green)

Send the **implementer** agent the item, the plan and the test-writer's report. Then run these gates:
- `.claude/scripts/check-diff.sh $tests no-tests` passes.
- `dotnet build backend` and `dotnet test backend.Tests` pass.
- In `frontend/`: `npm test -- --run`, `npm run build` and `npm run lint` pass.

If any gate fails, send the implementer the failing output and run the gates again. Allow 3 implementer attempts in total, counting attempts from step 6. After the third failure, take the blocked stop with the last failure output.

If the implementer reports that a test is wrong, take the blocked stop with its reasoning. Never edit the test yourself.

## 6. Review

Send the **reviewer** agent the item, its acceptance criteria and `$base`. On `FAIL`, send the findings back to the implementer (step 5, gates included). If the attempts run out, take the blocked stop with the findings.

## 7. Hand off

- Set the item to `Status: done` in `BACKLOG.md`. It only reaches master when the owner merges the branch.
- `git add -A && git commit -m "<id>: <item title>"`
- `git push -u origin agent/<id>`
- Send the owner a push notification: the item id, PASS, the number of attempts, and `https://github.com/JackTorcy/baking-management-system/compare/master...agent/<id>`.
- `git switch master`.
