# Baking Management System

Web app for small bakers: recipes, ingredient costs, orders, pricing. See README.md for features.

## Layout

- `backend/`: ASP.NET Core Web API (.NET 10), EF Core on PostgreSQL (Neon), ASP.NET Core Identity with cookie auth.
- `backend.Tests/`: xUnit tests, references `backend`.
- `frontend/`: React 19, TypeScript, Vite, Tailwind, React Router, Vitest.
- `BACKLOG.md`: what to build. Only the owner adds items or acceptance criteria.

## Commands

Run from the repo root unless stated.

- Backend build: `dotnet build backend`
- Backend tests: `dotnet test backend.Tests`
- Backend format: `dotnet tool restore` once, then `dotnet csharpier format backend backend.Tests`
- Migration: `dotnet ef migrations add <Name> --project backend`, then `dotnet ef database update --project backend`
- Frontend (run in `frontend/`): `npm ci` if `node_modules` is missing, `npm test -- --run`, `npm run build`, `npm run lint`

## Backend conventions

Follow the Ingredient feature end to end: `IngredientController` -> `IIngredientService`/`IngredientService` -> `AppDbContext`, with `SaveIngredient` in and `IngredientResponse` out.

- Controllers stay thin: call the service, map null to `NotFound()`, no business logic.
- Services own business logic and return DTOs. EF models never leave the service layer.
- Request DTOs validate with data annotations plus `IValidatableObject`. Error messages are user-facing English.
- Every bakery-owned entity implements `IBakeryOwned` and gets a `HasQueryFilter` on `BakeryId` in `AppDbContext`. `SaveChangesAsync` stamps `BakeryId` on new rows, so never set it by hand. A missing filter leaks one bakery's data to another.
- Top-level entities soft-delete with `DeletedAt` and include `DeletedAt == null` in their query filter.
- Auth is required by default (fallback policy). Only mark an endpoint `[AllowAnonymous]` when the backlog item says so.

## Frontend conventions

- Feature folders (`ingredients/`, `recipes/`) hold pages, with pure logic in `lib/` and a `*.test.ts` next to each lib file.
- Reuse `components/ui/` (Button, Card, ConfirmDialog, ErrorList, ...) before writing new UI.
- API calls use `fetch` with `import.meta.env.VITE_API_URL`. Map errors with `api/apiErrors.ts`.
- Shared types live in `types/`.

## Database safety

- Claude sessions get `ConnectionStrings__Default` from `.claude/settings.local.json`, which points at the Neon `agents` branch. Never override it, and never read user secrets or `appsettings*.json` for connection strings.
- Never run `dotnet user-secrets`. Never edit `appsettings*.json`.
- Never edit or delete an existing migration. Add a new one.

## Autonomous runs (`/build-next`)

- The owner typing `/build-next` is the explicit request to write code, commit, and push for that one backlog item.
- Work on a branch named `agent/<item-id>`. Never commit to or push `master`. Never force-push.
- No `Co-Authored-By` or other Claude attribution in commits.
- Commit messages: plain imperative summary, like the existing history.
- If a decision belongs to the owner (scope, UX choice, data model trade-off), don't guess. Mark the item `blocked` in `BACKLOG.md` with the question, notify the owner, and stop.
