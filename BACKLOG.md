# Backlog

Agents pick the first item with `Status: ready`, top to bottom. Only the owner writes items, acceptance criteria and the `ready` status.

Statuses: `draft` (owner still writing) -> `ready` -> `in-progress` -> `review` (branch pushed) -> `done`, or `blocked` (question for the owner below the item).

Each acceptance criterion must be checkable by a test or by running the app. "Works well" is not a criterion.

---

## BMS-1: Backend integration test harness

Status: done

Why: today's tests only cover DTO validation and pure functions, so agents can't verify services or controllers.

Acceptance criteria:

- An xUnit test can call the API through `WebApplicationFactory<Program>` as a signed-in user of a given bakery.
- Tests run against the database in `ConnectionStrings__Default`, and each test's data is isolated from other tests.
- One test proves a user from bakery A can't read bakery B's ingredients.
- `dotnet test backend.Tests` passes with the new tests included.

## BMS-2: Skip integration tests when no test database is configured

Status: ready

Depends on: BMS-1 merged to master.

Why: `ApiFactory` throws when `ConnectionStrings__Default` is unset, so `dotnet test` fails in the owner's own terminal.

Acceptance criteria:

- With `ConnectionStrings__Default` unset, `dotnet test backend.Tests` passes. Unit tests run, and integration tests are reported as skipped, not failed.
- The skip reason names the environment variable to set.
- With `ConnectionStrings__Default` set, the integration tests run and pass as they do today.

## BMS-3: Integration tests only run against the agents database

Status: ready

Depends on: BMS-2. Before marking ready, the owner adds `"BMS_TEST_DATABASE": "agents"` to the `env` block in `.claude/settings.local.json`.

Why: the harness trusts whatever database `ConnectionStrings__Default` names, so exporting the wrong one by accident would write test rows into it.

Acceptance criteria:

- Integration tests run only when `BMS_TEST_DATABASE=agents` is set as well as `ConnectionStrings__Default`.
- If either variable is missing, integration tests are skipped, and the skip reason names both variables.
- CLAUDE.md documents both variables under Database safety.
- `dotnet test backend.Tests` passes in a Claude session with both variables set.

## BMS-4: Bakery filter on recipe child tables

Status: ready

Depends on: BMS-1 merged to master.

Why: `RecipeIngredient`, `RecipeComponent`, `RecipeStep`, `RecipeStepIngredient` and `RecipeStepComponent` only filter on the parent recipe's `DeletedAt`, so any query on them reads every bakery's rows.

Acceptance criteria:

- Each of those five entities' query filters also requires the parent recipe's `BakeryId` to match the current bakery.
- A test proves that as a user of bakery A, querying each of the five tables returns none of bakery B's rows.
- No new migration. Query filters don't change the schema.
- `dotnet test backend.Tests` passes.
