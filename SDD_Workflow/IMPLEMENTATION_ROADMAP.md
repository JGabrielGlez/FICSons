# Implementation Roadmap - SPEC-002 Backend API Core

## Status Overview

| Category | Status | Progress |
|----------|--------|----------|
| Scaffolding | ✅ Complete | 100% |
| RLS Policies | ✅ Complete | 100% |
| SQL Migrations | ✅ Complete | 100% |
| Edge Functions | ⏳ Stub | 10% |
| Dev-Mirror Routes | ⏳ Stub | 10% |
| Unit Tests | ✅ Basic | 20% |
| Integration Tests | ❌ Not Started | 0% |
| AI Integration | ❌ Not Started | 0% |

---

## Task-by-Task Implementation Guide

### ✅ COMPLETED TASKS

| Task ID | Description | File(s) | Status |
|---------|-------------|---------|--------|
| T001 | Scaffold backend project | `backend/src/lib/`, `backend/src/api/` | ✅ Complete |
| T002 | Create Supabase client helper | `backend/src/lib/supabaseClient.ts` | ✅ Complete |
| T003 | Implement error envelope | `backend/src/lib/errors.ts` | ✅ Complete |
| T004 | Create profiles table + RLS | `supabase/migrations/20260505_001_schema.sql` | ✅ Complete |
| T005-T011 | Course/module/lesson tables + RLS | `supabase/migrations/20260505_001_schema.sql` | ✅ Complete |
| T012-T021 | Evaluation tables + RLS | `supabase/migrations/20260505_001_schema.sql` | ✅ Complete |

---

## ⏳ PENDING IMPLEMENTATION TASKS

### Authentication & Users

| Task | File(s) | Description | Implementation Notes |
|------|---------|-------------|----------------------|
| **T013** | `supabase/functions/sign-up/index.ts` | Create user profile via Supabase Auth | **TODO:** Use `supabase.auth.signUp()`, create profile record |
| **T014** | `supabase/functions/login/index.ts` | User authentication | **TODO:** Use `supabase.auth.signInWithPassword()` |
| **T015** | `backend/src/api/auth/me.ts` | Get current user profile | **TODO:** Read `auth.uid()` from JWT, query profiles table |
| **T016** | `backend/src/lib/auth.ts` | JWT verification helper | **TODO:** Parse & verify Supabase JWT tokens |

### Course Management

| Task | File(s) | Description | Implementation Notes |
|------|---------|-------------|----------------------|
| **T017** | `supabase/functions/create-course/index.ts` | Create course | **TODO:** Validate owner_id, insert to courses table, log audit |
| **T018** | `supabase/functions/update-course/index.ts` | Update course | **TODO:** Check RLS (owner only), update, audit log |
| **T019** | `supabase/functions/list-courses/index.ts` | List courses (with RLS) | **TODO:** Filter by status + user role via SELECT |
| **T020** | `supabase/functions/enroll-user/index.ts` | Enroll in course | **TODO:** Insert to enrollments, check prerequisites, audit |

### Evaluations & Grading

| Task | File(s) | Description | Implementation Notes |
|------|---------|-------------|----------------------|
| **T023** | `supabase/functions/submit-evaluation/index.ts` | **CRITICAL:** Submit evaluation | **TODO:** <ul><li>Extract answers from `req.body.attempt`</li><li>Query `evaluation_options` WHERE `is_correct = true` (server-side only)</li><li>Compare user answers vs correct answers</li><li>Calculate score</li><li>Insert `evaluation_attempts` record</li><li>Insert `operational_audit` record (T046 requirement)</li><li>Return score + passed status</li></ul> |
| **T024** | `supabase/functions/grade-attempt/index.ts` | Grade evaluation | **TODO:** Same as T023 but separate function (optional) |
| **T025** | `supabase/functions/get-attempt-results/index.ts` | Fetch attempt results | **TODO:** Query evaluation_attempts, filter by RLS, return score |
| **T026** | `dev-mirror/src/services/grading.ts` | Local grading (dev-mirror) | **TODO:** Import from `backend/src/lib/schemas/`, grade locally, mirror T023 |

### User Roles & Permissions

| Task | File(s) | Description | Implementation Notes |
|------|---------|-------------|----------------------|
| **T033** | `supabase/functions/update-user-role/index.ts` | **CRITICAL:** Update user role | **TODO:** <ul><li>Validate requester is admin</li><li>Update `profiles.role`</li><li>Insert `operational_audit` with action='update_user_role'</li><li>Return updated profile</li></ul> |
| **T036** | `backend/src/lib/permissions.ts` | Permission helpers | **TODO:** Implement `hasPermission(user, action, resource)` |
| **T037** | `backend/src/lib/auth.ts` | Role-based middleware | **TODO:** Implement `requireRole(role)` Express middleware |

### Certificates & Credentials

| Task | File(s) | Description | Implementation Notes |
|------|---------|-------------|----------------------|
| **T044** | `supabase/functions/issue-certificate/index.ts` | Issue course certificate | **TODO:** <ul><li>Check completion (all lessons + passing evaluation)</li><li>Generate verification_code (UUID)</li><li>Insert to certificates table</li><li>Audit log</li></ul> |
| **T045** | `supabase/functions/verify-certificate/index.ts` | Public certificate verification | **TODO:** Query certificates WHERE verification_code, return public info |
| **T046** | `supabase/functions/verify-certificate-rate-limit/index.ts` | **CRITICAL:** Rate-limit cert verification | **TODO:** <ul><li>Check `operational_audit` for action='verify_certificate' in last 60s</li><li>If count > 10, reject with 429</li><li>Log attempt to `operational_audit`</li></ul> |

### AI Integration

| Task | File(s) | Description | Implementation Notes |
|------|---------|-------------|----------------------|
| **T038** | `supabase/functions/ai-chat/index.ts` | **CRITICAL:** AI chat with kill-switch | **TODO:** <ul><li>Check if user has active evaluation (query evaluation_attempts WHERE status='in_progress')</li><li>If yes, return error 423 "AI disabled during evaluation"</li><li>Otherwise, call AI provider (OpenAI/Anthropic)</li><li>Track tokens in `ai_usage_events`</li><li>Log to `operational_audit`</li></ul> |
| **T039** | `supabase/functions/get-ai-usage/index.ts` | Get AI token usage | **TODO:** Query `ai_usage_events`, aggregate by user, return totals |
| **T040** | `supabase/functions/ai-reset-usage/index.ts` | Admin: reset AI usage | **TODO:** Delete `ai_usage_events` for user (admin only) |

### Notifications

| Task | File(s) | Description | Implementation Notes |
|------|---------|-------------|----------------------|
| **T029** | `supabase/functions/send-notification/index.ts` | Send in-app notification | **TODO:** Insert to notifications table, optionally send email |
| **T030** | `supabase/functions/mark-notification-read/index.ts` | Mark notification as read | **TODO:** Update notifications.read_at WHERE id |

### Progress & Tracking

| Task | File(s) | Description | Implementation Notes |
|------|---------|-------------|----------------------|
| **T047** | `dev-mirror/src/routes/enroll.ts` | Dev-mirror: enrollment route | **TODO:** <ul><li>Import Zod schemas from `backend/src/lib/schemas/`</li><li>Validate payload</li><li>Call local service or Supabase</li><li>Add .gitignore + canonical schema reference</li></ul> |
| **T048** | `dev-mirror/tests/enroll.spec.ts` | Dev-mirror: enroll test | **TODO:** Mock Supabase, test success/error paths |
| **T049** | `dev-mirror/tests/grading.spec.ts` | Dev-mirror: grading test | **TODO:** Test score calculation, passed/failed logic |

---

## File Structure for Developers

```
SDD_Workflow/
├── supabase/
│   ├── migrations/
│   │   └── 20260505_001_schema.sql ✅ (19 tables + RLS)
│   └── functions/
│       ├── sign-up/index.ts ⏳
│       ├── submit-evaluation/index.ts ⏳ (CRITICAL)
│       ├── update-user-role/index.ts ⏳ (CRITICAL)
│       ├── issue-certificate/index.ts ⏳
│       ├── verify-certificate/index.ts ⏳
│       ├── ai-chat/index.ts ⏳ (CRITICAL)
│       └── [others]
├── backend/
│   └── src/
│       ├── lib/
│       │   ├── supabaseClient.ts ✅
│       │   ├── errors.ts ✅
│       │   ├── auth.ts ⏳ (T016: JWT verification)
│       │   ├── permissions.ts ⏳ (T036)
│       │   └── schemas/ ⏳ (Zod schemas for all tables)
│       └── api/
│           ├── auth/
│           │   ├── signup.ts ⏳
│           │   ├── login.ts ⏳
│           │   └── me.ts ⏳
│           └── [other endpoints]
├── dev-mirror/
│   ├── src/
│   │   ├── server.ts ✅
│   │   ├── routes/
│   │   │   ├── submit-evaluation.ts ⏳
│   │   │   ├── update-role.ts ⏳
│   │   │   ├── enroll.ts ⏳ (T047)
│   │   │   └── index.ts ✅
│   │   └── services/
│   │       └── grading.ts ⏳ (T026)
│   ├── tests/
│   │   ├── submit-evaluation.spec.ts ✅ (basic)
│   │   ├── enroll.spec.ts ⏳ (T048)
│   │   └── grading.spec.ts ⏳ (T049)
│   ├── package.json ✅
│   └── tsconfig.json ✅
├── .env.example ⏳ (document required env vars)
├── .vercelignore ✅
├── .gitignore ✅
├── TESTING.md ✅
└── IMPLEMENTATION_ROADMAP.md ✅ (this file)
```

---

## Critical Path (Highest Priority)

Do these first for a working MVP:

1. **T023: `submit-evaluation` Edge Function** — Core grading logic
2. **T033: `update-user-role` Edge Function** — Role management
3. **T038: `ai-chat` Edge Function** — AI with kill-switch
4. **T046: `verify-certificate-rate-limit`** — Security
5. **T047-T049: Dev-mirror routes + tests** — Local dev parity

---

## How to Use This Roadmap

1. **Pick a task** from the pending list
2. **Open the file** listed in "File(s)" column
3. **Read the TODO comment** in that file (if present)
4. **Implement** following the "Implementation Notes"
5. **Add tests** in `dev-mirror/tests/` or Edge Function tests
6. **Commit**: `git commit -m "feat(T###): implement [description]"`
7. **Update this roadmap** if task details change

---

## Testing Each Task

Use `TESTING.md` for Postman examples. Key commands:

```bash
# Start dev-mirror
cd dev-mirror && npm run dev

# Run tests
cd dev-mirror && npm test

# Deploy Edge Functions
supabase functions deploy

# Apply migrations
supabase db push
```

---

## Constitution Requirements (Non-Negotiable)

Ensure every task respects:
- ✅ RLS on all table SELECT/INSERT/UPDATE/DELETE
- ✅ `evaluation_options.is_correct` never exposed to client
- ✅ Grading only server-side (T023)
- ✅ AI disabled during evaluations (T038)
- ✅ Audit trail for all mutations (T046)
- ✅ Dev-mirror excluded from production (`.vercelignore`, `.gitignore`)

---

## Next Session Checklist

- [ ] Read this roadmap
- [ ] Pick 1-3 tasks from "Critical Path"
- [ ] Open corresponding file
- [ ] Search for `// TODO:` comments
- [ ] Implement
- [ ] Test with Postman (TESTING.md)
- [ ] Commit with `git commit -m "feat(T###): ..."`
- [ ] Update IMPLEMENTATION_ROADMAP.md status
