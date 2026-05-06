# SPEC-002: Backend API Core - LMS Platform

> A local-first LMS backend with Supabase + Edge Functions + Dev-Mirror for testing. Production-ready architecture with RLS policies, server-side grading, and audit trails.

## Quick Start

### Prerequisites
- Node.js 18+
- Supabase CLI
- Postman (for API testing)

### Setup (5 min)

```bash
# 1. Navigate to project
cd SDD_Workflow

# 2. Run SQL migrations
supabase migration up

# 3. Start dev-mirror (local Express server)
cd dev-mirror
npm install
npm run dev
# Output: "dev-mirror listening on 3001"

# 4. Open TESTING.md and start testing with Postman
```

---

## Project Structure

```
SDD_Workflow/
├── supabase/
│   ├── migrations/       ← SQL schema + RLS policies
│   └── functions/        ← Edge Functions (Deno)
├── backend/
│   └── src/
│       ├── lib/          ← Shared utilities (auth, errors, permissions)
│       └── api/          ← API endpoints
├── dev-mirror/           ← Local Express server (dev only, excluded from production)
│   ├── src/
│   │   ├── routes/       ← Express routes (mirror of Edge Functions)
│   │   └── services/     ← Business logic
│   └── tests/            ← Vitest unit tests
├── TESTING.md            ← Postman guide + examples
├── IMPLEMENTATION_ROADMAP.md ← What's left to do
├── .vercelignore         ← Exclude dev-mirror from Vercel
└── .gitignore            ← Exclude node_modules, .env, etc.
```

---

## Key Files

| File | Purpose |
|------|---------|
| `supabase/migrations/20260505_001_schema.sql` | 19 tables + RLS policies (CRITICAL) |
| `backend/src/lib/supabaseClient.ts` | Supabase client factory |
| `backend/src/lib/errors.ts` | API error envelope |
| `dev-mirror/src/server.ts` | Local Express server |
| `dev-mirror/package.json` | Node deps (express, vitest) |
| `TESTING.md` | Postman endpoints + curl examples |
| `IMPLEMENTATION_ROADMAP.md` | Tasks breakdown + TODO items |

---

## Architecture

### 1. Supabase (Production)
- **Database**: PostgreSQL with RLS policies
- **Edge Functions**: Deno runtime (submit-evaluation, update-user-role, ai-chat)
- **Auth**: Supabase Auth (JWT)

### 2. Dev-Mirror (Local Development)
- **Server**: Express.js (port 3001)
- **Routes**: Mirror of Edge Functions (for local testing)
- **Tests**: Vitest for unit/integration testing
- **Configuration**: Excluded from production via `.vercelignore`

### 3. Backend Libraries
- **Auth**: JWT verification, role extraction
- **Errors**: Standardized error envelope
- **Permissions**: Role-based access control

---

## Development Workflow

### 1. Run Migrations
```bash
supabase migration up  # Apply to local Supabase
# or
supabase db push      # Apply to Supabase Cloud
```

### 2. Start Dev-Mirror
```bash
cd dev-mirror
npm run dev           # Starts on http://localhost:3001
```

### 3. Test with Postman
- Import environment variables from `TESTING.md`
- Import request examples from `TESTING.md`
- Click "Send" on each request
- Verify response matches expected schema

### 4. Write Code
- Pick a task from `IMPLEMENTATION_ROADMAP.md`
- Implement in corresponding file
- Add tests in `dev-mirror/tests/`
- Commit: `git commit -m "feat(T###): description"`

### 5. Deploy (Optional)
```bash
supabase functions deploy    # Deploy Edge Functions
# Push to Vercel/production (dev-mirror excluded via .vercelignore)
```

---

## Constitution Requirements (Non-Negotiable)

These rules are enforced by RLS policies and Edge Functions:

| Requirement | How | File |
|------------|-----|------|
| RLS on all tables | Every table has `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` | `supabase/migrations/20260505_001_schema.sql` |
| `is_correct` hidden from client | RLS policy blocks SELECT on `evaluation_options.is_correct` | `supabase/migrations/20260505_001_schema.sql` |
| Grading server-side only | `submit-evaluation` function runs server-side | `supabase/functions/submit-evaluation/index.ts` |
| AI disabled during evaluations | Check `evaluation_attempts.status='in_progress'` before AI call | `supabase/functions/ai-chat/index.ts` |
| Audit trail for all changes | Insert to `operational_audit` table on every mutation | `supabase/functions/*/index.ts` |
| Dev-mirror never deployed | `.vercelignore` and `.gitignore` exclude `dev-mirror/` | `.vercelignore`, `.gitignore` |

---

## Status

### ✅ Complete
- [x] Database schema + RLS policies (19 tables)
- [x] Scaffolding (backend libs, routes, services)
- [x] Dev-mirror server + Express setup
- [x] Unit tests (vitest) for grading service
- [x] Documentation (TESTING.md, this README, IMPLEMENTATION_ROADMAP.md)
- [x] Git + deployment config (.gitignore, .vercelignore)

### ⏳ Pending Implementation
- [ ] Endpoint logic (submit-evaluation, update-user-role, ai-chat, etc.)
- [ ] Integration tests (dev-mirror)
- [ ] pgTAP tests for RLS policies
- [ ] Production deployment

See `IMPLEMENTATION_ROADMAP.md` for detailed task breakdown.

---

## Testing

### Unit Tests (Vitest)
```bash
cd dev-mirror
npm test
```

### Integration Tests (Postman)
1. Open `TESTING.md`
2. Import environment variables
3. Import requests
4. Send and verify responses

### Database Tests (pgTAP)
```bash
# (Pending implementation)
supabase test db
```

---

## Important Notes

### dev-mirror is LOCAL ONLY
- ✅ Use for local development and testing
- ❌ Never deployed to production
- ✅ Excluded via `.vercelignore` and `.gitignore`
- ✅ Mirrors Edge Functions for offline testing

### Environment Variables
Create `.env.local`:
```bash
SUPABASE_URL=http://localhost:54321  # or https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...
SUPABASE_ANON_KEY=...
```

### Canonical Schema
- All Zod schemas live in `backend/src/lib/schemas/`
- Dev-mirror routes import from this canonical source
- This ensures dev-mirror mirrors production exactly

---

## Troubleshooting

### "Cannot connect to dev-mirror"
```bash
# Check if it's running
netstat -ano | findstr :3001  # Windows
lsof -i :3001                  # Mac/Linux

# Restart
cd dev-mirror && npm run dev
```

### "Migration not found"
```bash
# Verify migrations
supabase migration list

# Apply all
supabase migration up
```

### "RLS policy blocks my query"
- Check that your user has the required role
- Review RLS policy in `supabase/migrations/20260505_001_schema.sql`
- Test with service_role key (bypasses RLS)

### "Tests fail in vitest"
```bash
cd dev-mirror
npm install  # Ensure dependencies
npm test     # Run again
```

---

## Next Steps

1. **Read** `IMPLEMENTATION_ROADMAP.md` for detailed tasks
2. **Choose** a task from "Critical Path"
3. **Implement** following the TODO comments in each file
4. **Test** with Postman (see `TESTING.md`)
5. **Commit** with conventional commits (`feat(T###): ...`)

---

## Documentation

- **TESTING.md** — Complete Postman guide with examples
- **IMPLEMENTATION_ROADMAP.md** — Task breakdown + what's left
- **specs/002-backend-api-core/** — Full SPEC with requirements
- **supabase/migrations/20260505_001_schema.sql** — Database schema + RLS

---

## Contact / Questions

- Check IMPLEMENTATION_ROADMAP.md for task details
- Review TESTING.md for API examples
- Search for `// TODO:` comments in source files
- Read specs/002-backend-api-core/ for business requirements

---

**Last Updated**: 2026-05-05  
**Status**: Scaffolding complete, pending implementation  
**Maintainer**: [Your name]
