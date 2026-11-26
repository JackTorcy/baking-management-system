# Backlog

Agents pick the first item with `Status: ready`, top to bottom. Only the owner writes items, acceptance criteria and the `ready` status.

Statuses: `draft` (owner still writing) -> `ready` -> `in-progress` -> `review` (branch pushed) -> `done`, or `blocked` (question for the owner below the item).

Each acceptance criterion must be checkable by a test or by running the app. "Works well" is not a criterion.

---

## BMS-1: Backend integration test harness

Status: ready

Why: today's tests only cover DTO validation and pure functions, so agents can't verify services or controllers.

Acceptance criteria:

- An xUnit test can call the API through `WebApplicationFactory<Program>` as a signed-in user of a given bakery.
- Tests run against the database in `ConnectionStrings__Default`, and each test's data is isolated from other tests.
- One test proves a user from bakery A can't read bakery B's ingredients.
- `dotnet test backend.Tests` passes with the new tests included.

## BMS-2: Order tracking

Status: draft

Acceptance criteria:

- TODO (owner)

## BMS-3: User profiles and settings

Status: draft

Acceptance criteria:

- TODO (owner)

## BMS-4: Customer ordering

Status: draft

Acceptance criteria:

- TODO (owner)
