# Tasks: SPEC-002 Backend API Core LMS

**Input**: Design documents from `/specs/002-backend-api-core/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Organization**: Tasks are grouped by user story to support independent implementation and validation.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story the task belongs to, e.g. `[US1]`, `[US2]`, `[US3]`, `[US4]`
- Include exact file paths in descriptions

### RLS Policies — acceptance criteria (mandatory for every schema task)

Every task that creates or modifies tables **must** include the following
as explicit acceptance criteria before the task can be closed:

- [ ] RLS enabled on table: `ALTER TABLE {table} ENABLE ROW LEVEL SECURITY;`
- [ ] 4 separate policies defined (never `FOR ALL`):
      SELECT / INSERT / UPDATE / DELETE — one policy per operation
- [ ] All policy expressions use `(select auth.uid())` (initPlan pattern)
- [ ] Role-based logic delegates to `app.*` helpers
      e.g. `(select app.is_instructor())`, `(select app.is_admin())`
- [ ] Policies tested with `pgTAP` assertions for at least:
      - anon user → denied on all operations
      - alumno → allowed only on own rows (where applicable)
      - instructor → allowed only on own course resources
      - admin (scoped) → allowed within org_unit scope
      - super_admin → allowed globally

**Helper reference** (all `security definer stable`, schema `app`):
  app.user_role() / app.is_super_admin() / app.is_admin()
  app.is_admin_strict() / app.is_instructor() / app.is_moderador()
  app.is_course_instructor(uuid) / app.is_course_owner(uuid)
  app.admin_has_scope(uuid) / app.is_enrolled(uuid)
  app.has_completed_prerequisites(uuid) / app.can_access_lesson(uuid)

**Tasks where this section must be explicitly added**:
T012, T020, T021, T026, T033, T036, T037, T039, T044

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Backend workspace bootstrap and shared repository conventions

- [ ] T001 [P] Create the backend source layout in `backend/src/api/`, `backend/src/services/`, `backend/src/middleware/`, `backend/src/lib/`, and `backend/tests/`
- [ ] T002 [P] Create the Supabase project layout in `supabase/migrations/`, `supabase/functions/`, and `supabase/seed/`
- [ ] T003 Configure backend package scripts and tooling in `backend/package.json`, `backend/tsconfig.json`, `backend/eslint.config.js`, and `backend/vitest.config.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core backend primitives required by every user story

**⚠️ Critical**: No user story work should begin until this phase is complete

- [ ] T004 [P] Define the base schema for identities, organization, courses, lessons, enrollment, evaluations, gamification, notifications, moderation, and AI in `supabase/migrations/20260505_0001_base_schema.sql`
- [ ] T005 [P] Create the RLS policies, role helpers, and security-definer utilities in `supabase/migrations/20260505_0002_rls_and_auth.sql`
- [ ] T006 [P] Configure storage buckets, realtime channels, and operational guards in `supabase/migrations/20260505_0003_platform_services.sql`
- [ ] T007 Define the common API error envelope and auth helpers in `backend/src/lib/errors.ts`, `backend/src/lib/auth.ts`, and `backend/src/lib/permissions.ts`
- [ ] T008 Establish the shared request validators and DTO schemas in `backend/src/lib/schemas/`
- [ ] T009 Create the base contract fixtures for request and response payloads in `specs/002-backend-api-core/contracts/`
- [ ] T010 Seed minimal reference data for roles, organizational units, and fixture content in `supabase/seed/seed.sql`

**Checkpoint**: Foundation ready - backend user story implementation can now proceed

---

## Phase 3: User Story 1 - Identidad, autenticacion y control de acceso (Priority: P1)

**Goal**: Expose secure authentication, profile retrieval, hierarchical roles, and controlled role mutation

**Independent Test**: A new user can register, authenticate, fetch their profile, and role elevation is blocked unless the actor has the correct hierarchy

- [ ] T011 [P] [US1] Implement signup, login, and profile endpoints in `backend/src/api/auth/signup.ts`, `backend/src/api/auth/login.ts`, and `backend/src/api/users/me.ts`
- [ ] T012 [P] [US1] Implement profile persistence and role claim synchronization in `supabase/migrations/20260505_0004_profiles_and_roles.sql`
  - [ ] RLS enabled on table: `profiles`
  - [ ] RLS enabled on table: `admin_scopes`
  - [ ] 4 separate policies defined (never `FOR ALL`): SELECT / INSERT / UPDATE / DELETE — one policy per operation
  - [ ] All policy expressions use `(select auth.uid())` (initPlan pattern)
  - [ ] Role-based logic delegates to `app.*` helpers
        e.g. `(select app.is_instructor())`, `(select app.is_admin())`
  - [ ] Policies tested with `pgTAP` assertions for at least:
        - anon user → denied on all operations
        - alumno → allowed only on own rows (where applicable)
        - instructor → allowed only on own course resources
        - admin (scoped) → allowed within org_unit scope
        - super_admin → allowed globally
- [ ] T013 [US1] Implement role hierarchy enforcement and permission checks in `backend/src/services/roles/roleHierarchy.ts` and `backend/src/services/roles/roleService.ts`
- [ ] T014 [US1] Implement the `update-user-role` Edge Function in `supabase/functions/update-user-role/index.ts`
- [ ] T015 [US1] Wire admin scope lookup and role-scoped access helpers in `backend/src/api/admin/users/[id]/role.ts` and `backend/src/lib/permissions.ts`
- [ ] T016 [P] [US1] Implement audit logging for role changes in `supabase/migrations/20260505_0005_audit_events.sql` and `backend/src/services/audit/auditLogger.ts`
- [ ] T017 [US1] Add validation and error mapping for auth and role flows in `backend/src/lib/errors.ts` and `backend/src/lib/schemas/auth.ts`

**Checkpoint**: User Story 1 should now be independently usable and testable

---

## Phase 4: User Story 2 - Catalogo academico, contenido y progreso (Priority: P2)

**Goal**: Expose courses, modules, lessons, content sources, enrollment, prerequisites, and progress tracking

**Independent Test**: A published course can be queried, a student can enroll or be blocked by prerequisites, and lesson progress persists with RLS enforced

- [ ] T018 [P] [US2] Implement course catalog and course detail endpoints in `backend/src/api/courses/index.ts` and `backend/src/api/courses/[id].ts`
- [ ] T019 [P] [US2] Implement module and lesson CRUD endpoints in `backend/src/api/courses/[courseId]/modules.ts` and `backend/src/api/lessons/[id].ts`
- [ ] T020 [US2] Implement content source detection and metadata persistence in `backend/src/services/content/contentSourceParser.ts` and `supabase/migrations/20260505_0006_content_sources.sql`
  - [ ] RLS enabled on table: `content_sources`
  - [ ] 4 separate policies defined (never `FOR ALL`): SELECT / INSERT / UPDATE / DELETE — one policy per operation
  - [ ] All policy expressions use `(select auth.uid())` (initPlan pattern)
  - [ ] Role-based logic delegates to `app.*` helpers
        e.g. `(select app.is_instructor())`, `(select app.is_admin())`
  - [ ] Policies tested with `pgTAP` assertions for at least:
        - anon user → denied on all operations
        - alumno → allowed only on own rows (where applicable)
        - instructor → allowed only on own course resources
        - admin (scoped) → allowed within org_unit scope
        - super_admin → allowed globally
- [ ] T021 [US2] Implement enrollment, prerequisite validation, and cycle detection in `backend/src/api/enrollments/index.ts`, `backend/src/services/enrollment/prerequisiteService.ts`, and `supabase/migrations/20260505_0007_enrollments_and_prereqs.sql`
  - [ ] RLS enabled on table: `enrollments`
  - [ ] RLS enabled on table: `course_prerequisites`
  - [ ] 4 separate policies defined (never `FOR ALL`): SELECT / INSERT / UPDATE / DELETE — one policy per operation
  - [ ] All policy expressions use `(select auth.uid())` (initPlan pattern)
  - [ ] Role-based logic delegates to `app.*` helpers
        e.g. `(select app.is_instructor())`, `(select app.is_admin())`
  - [ ] Policies tested with `pgTAP` assertions for at least:
        - anon user → denied on all operations
        - alumno → allowed only on own rows (where applicable)
        - instructor → allowed only on own course resources
        - admin (scoped) → allowed within org_unit scope
        - super_admin → allowed globally
- [ ] T022 [US2] Implement learning path queries and course-path linking in `backend/src/services/paths/learningPathService.ts` and `supabase/migrations/20260505_0008_learning_paths.sql`
- [ ] T023 [P] [US2] Implement progress tracking persistence and completion helpers in `backend/src/api/progress/index.ts`, `backend/src/services/progress/progressService.ts`, and `supabase/migrations/20260505_0009_progress_tracking.sql`
- [ ] T024 [US2] Implement read models for course prerequisites and user progress in `backend/src/services/courses/courseReadModels.ts` and `backend/src/lib/schemas/course.ts`

**Checkpoint**: User Story 2 should now be independently usable and testable

---

## Phase 5: User Story 3 - Evaluaciones seguras, certificacion y gamification (Priority: P3)

**Goal**: Expose evaluation builder and runner endpoints, server-side grading, achievements, and public certificate verification

**Independent Test**: An evaluation attempt can be started and submitted, grading happens only on the server, and the resulting certificate can be verified publicly

- [ ] T025 [P] [US3] Implement evaluation builder CRUD endpoints in `backend/src/api/evaluations/index.ts` and `backend/src/api/evaluations/[id].ts`
- [ ] T026 [P] [US3] Implement evaluation question and option persistence in `supabase/migrations/20260505_0010_evaluations.sql`
  - [ ] RLS enabled on table: `evaluations`
  - [ ] RLS enabled on table: `evaluation_questions`
  - [ ] RLS enabled on table: `evaluation_options`
  - [ ] 4 separate policies defined (never `FOR ALL`): SELECT / INSERT / UPDATE / DELETE — one policy per operation
  - [ ] All policy expressions use `(select auth.uid())` (initPlan pattern)
  - [ ] Role-based logic delegates to `app.*` helpers
        e.g. `(select app.is_instructor())`, `(select app.is_admin())`
  - [ ] Policies tested with `pgTAP` assertions for at least:
        - anon user → denied on all operations
        - alumno → allowed only on own rows (where applicable)
        - instructor → allowed only on own course resources
        - admin (scoped) → allowed within org_unit scope
        - super_admin → allowed globally
- [ ] T027 [US3] Implement attempt start and attempt lifecycle helpers in `backend/src/api/evaluations/[id]/attempts.ts` and `backend/src/services/evaluations/attemptService.ts`
- [ ] T028 [US3] Implement the `submit-evaluation` Edge Function with server-side grading in `supabase/functions/submit-evaluation/index.ts` and `supabase/functions/submit-evaluation/grading.ts`
- [ ] T029 [US3] Implement result shaping so public responses never expose `is_correct` in `backend/src/services/evaluations/publicResultMapper.ts`
- [ ] T030 [P] [US3] Implement achievement calculation and XP/badge/trophy issuance in `supabase/functions/check-achievements/index.ts` and `supabase/migrations/20260505_0011_achievements.sql`
- [ ] T031 [US3] Implement certificate issuance and public verification contracts in `supabase/functions/issue-certificate/index.ts`, `backend/src/api/certificates/[code].ts`, and `supabase/migrations/20260505_0012_certificates.sql`
- [ ] T032 [US3] Implement diploma generation and learning-path completion hooks in `supabase/migrations/20260505_0013_diplomas.sql` and `backend/src/services/gamification/diplomaService.ts`

**Checkpoint**: User Story 3 should now be independently usable and testable

---

## Phase 6: User Story 4 - IA, notificaciones, moderacion y administracion (Priority: P4)

**Goal**: Expose server-side AI, notifications, moderation, and administrative controls with auditability and kill-switch enforcement

**Independent Test**: AI endpoints reject requests during active evaluations, notifications can be queried, moderation actions are recorded, and admin stats can be retrieved

- [ ] T033 [P] [US4] Implement the `ai-chat` proxy Edge Function and conversation persistence in `supabase/functions/ai-chat/index.ts` and `supabase/migrations/20260505_0014_ai_conversations.sql`
  - [ ] RLS enabled on table: `ai_conversations`
  - [ ] 4 separate policies defined (never `FOR ALL`): SELECT / INSERT / UPDATE / DELETE — one policy per operation
  - [ ] All policy expressions use `(select auth.uid())` (initPlan pattern)
  - [ ] Role-based logic delegates to `app.*` helpers
        e.g. `(select app.is_instructor())`, `(select app.is_admin())`
  - [ ] Policies tested with `pgTAP` assertions for at least:
        - anon user → denied on all operations
        - alumno → allowed only on own rows (where applicable)
        - instructor → allowed only on own course resources
        - admin (scoped) → allowed within org_unit scope
        - super_admin → allowed globally
- [ ] T034 [P] [US4] Implement the `ai-summarize` and `ai-generate-quiz` contracts in `supabase/functions/ai-summarize/index.ts` and `supabase/functions/ai-generate-quiz/index.ts`
- [ ] T035 [US4] Implement the `ai-data-advisor` contract with controlled data access in `supabase/functions/ai-data-advisor/index.ts` and `backend/src/services/ai/dataAdvisorRouter.ts`
- [ ] T036 [US4] Implement notification reads, unread counts, and mark-read endpoints in `backend/src/api/notifications/index.ts` and `supabase/migrations/20260505_0015_notifications.sql`
  - [ ] RLS enabled on table: `notifications`
  - [ ] 4 separate policies defined (never `FOR ALL`): SELECT / INSERT / UPDATE / DELETE — one policy per operation
  - [ ] All policy expressions use `(select auth.uid())` (initPlan pattern)
  - [ ] Role-based logic delegates to `app.*` helpers
        e.g. `(select app.is_instructor())`, `(select app.is_admin())`
  - [ ] Policies tested with `pgTAP` assertions for at least:
        - anon user → denied on all operations
        - alumno → allowed only on own rows (where applicable)
        - instructor → allowed only on own course resources
        - admin (scoped) → allowed within org_unit scope
        - super_admin → allowed globally
- [ ] T037 [US4] Implement moderation queue reads and resolution actions in `backend/src/api/moderation/flags.ts` and `supabase/migrations/20260505_0016_moderation_flags.sql`
  - [ ] RLS enabled on table: `moderation_flags`
  - [ ] 4 separate policies defined (never `FOR ALL`): SELECT / INSERT / UPDATE / DELETE — one policy per operation
  - [ ] All policy expressions use `(select auth.uid())` (initPlan pattern)
  - [ ] Role-based logic delegates to `app.*` helpers
        e.g. `(select app.is_instructor())`, `(select app.is_admin())`
  - [ ] Policies tested with `pgTAP` assertions for at least:
        - anon user → denied on all operations
        - alumno → allowed only on own rows (where applicable)
        - instructor → allowed only on own course resources
        - admin (scoped) → allowed within org_unit scope
        - super_admin → allowed globally
- [ ] T038 [US4] Implement admin metrics and org-scoped user management in `backend/src/api/admin/stats.ts`, `backend/src/api/admin/users.ts`, and `supabase/functions/update-user-role/index.ts`
- [ ] T039 [US4] Implement audit trails and operational event logging for AI, moderation, and admin actions in `backend/src/services/audit/auditLogger.ts` and `supabase/migrations/20260505_0017_operational_audit.sql`
  - [ ] RLS enabled on table: `operational_audit`
  - [ ] 4 separate policies defined (never `FOR ALL`): SELECT / INSERT / UPDATE / DELETE — one policy per operation
  - [ ] All policy expressions use `(select auth.uid())` (initPlan pattern)
  - [ ] Role-based logic delegates to `app.*` helpers
        e.g. `(select app.is_instructor())`, `(select app.is_admin())`
  - [ ] Policies tested with `pgTAP` assertions for at least:
        - anon user → denied on all operations
        - alumno → allowed only on own rows (where applicable)
        - instructor → allowed only on own course resources
        - admin (scoped) → allowed within org_unit scope
        - super_admin → allowed globally
- [ ] T040 [US4] Enforce kill-switch and rate-limit checks in `backend/src/services/ai/killSwitch.ts`, `backend/src/services/ai/rateLimit.ts`, and `backend/src/lib/permissions.ts`

**Checkpoint**: User Story 4 should now be independently usable and testable

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final backend hardening, consistency, and documentation updates

- [ ] T041 [P] Consolidate shared API response shapes and error codes in `backend/src/lib/errors.ts` and `backend/src/lib/schemas/response.ts`
- [ ] T042 [P] Add backend integration test coverage for auth, enrollment, grading, certificates, and IA guardrails in `backend/tests/integration/`
- [ ] T043 Add contract validation fixtures for API and RPC responses in `specs/002-backend-api-core/contracts/`
- [ ] T044 Tighten RLS policies and edge-case constraints in `supabase/migrations/20260505_0018_rls_hardening.sql`
  - [ ] RLS enabled on table: `*`
  - [ ] 4 separate policies defined (never `FOR ALL`): SELECT / INSERT / UPDATE / DELETE — one policy per operation
  - [ ] All policy expressions use `(select auth.uid())` (initPlan pattern)
  - [ ] Role-based logic delegates to `app.*` helpers
        e.g. `(select app.is_instructor())`, `(select app.is_admin())`
  - [ ] Policies tested with `pgTAP` assertions for at least:
        - anon user → denied on all operations
        - alumno → allowed only on own rows (where applicable)
        - instructor → allowed only on own course resources
        - admin (scoped) → allowed within org_unit scope
        - super_admin → allowed globally
- [ ] T045 Update quickstart validation notes after implementation in `specs/002-backend-api-core/quickstart.md`

---

## T046 — Public certificate verification rate limiting

**Phase**: 5 (Gamification) — companion to T031
**Feature**: gamification / certificates
**Agent**: Vegeta (security hardening)

### Context
The public endpoint `GET /api/certificates/:code` (RPC `verify_certificate`)
must be protected against scraping and enumeration abuse in production.
For local/dev environments this constraint is informational only.

### Acceptance criteria
- [ ] Rate limit: **10 requests per minute per IP** on `GET /certificates/:code`
- [ ] Enforcement layer: Supabase Edge Function middleware (not client-side)
- [ ] Response on limit exceeded: HTTP 429 with body
      `{ "error": "too_many_requests", "retry_after_seconds": 60 }`
- [ ] Response headers on every request:
      `X-RateLimit-Limit: 10`
      `X-RateLimit-Remaining: N`
      `X-RateLimit-Reset: {unix_timestamp}`
- [ ] Rate limit counter stored in Supabase `ai_usage_events` table
      (reuse existing pattern) with `event_type = 'cert_verify'`
- [ ] Abuse protection: IPs exceeding 100 req/hour are soft-blocked for 1h
      (logged in `operational_audit`, not a hard ban)

### RLS note
`verify_certificate(code)` RPC is `security definer` — returns only
`{ user_full_name, course_title, issued_at, revoked, final_score }`.
No full record exposure. Rate limit is the additional production guard.

### Out of scope
- Per-certificate-code rate limiting (IP-based is sufficient)
- Hard bans or WAF rules (deferred to infrastructure hardening)

## T047 — Express mirror scaffold (local dev)
**Optional group**: local-dev-mirror
**Depends on**: T001 (setup)

- [ ] `dev-mirror/` directory with Express + TypeScript setup
- [ ] `.vercelignore` entry to exclude from deployment
- [ ] `.gitignore` entry to exclude local secrets and generated artifacts
- [ ] Shared Zod schemas imported from `src/lib/schemas/`
      (single source of truth — no schema duplication)
- [ ] README explaining mirror vs production parity rules
- [ ] Mirror consumes the canonical backend schema source without duplication

## T048 — Mirror: auth + role endpoints
**Optional group**: local-dev-mirror
**Mirrors**: Edge Functions `update-user-role`, `enroll-course`

**Files**: `dev-mirror/src/routes/update-role.ts`, `dev-mirror/src/routes/enroll.ts`, `dev-mirror/src/server.ts`

- [ ] POST /dev/update-role
- [ ] POST /dev/enroll
- [ ] Uses same Zod validation as Edge Function counterparts
- [ ] Connects to local Supabase instance only

## T049 — Mirror: evaluation grading endpoint
**Optional group**: local-dev-mirror
**Mirrors**: Edge Function `submit-evaluation`

**Files**: `dev-mirror/src/routes/submit-evaluation.ts`, `dev-mirror/src/services/grading.ts`, `dev-mirror/tests/submit-evaluation.spec.ts`

- [ ] POST /dev/submit-evaluation
- [ ] Server-side grading logic identical to Edge Function
- [ ] No `is_correct` exposure to client (same constraint applies)
- [ ] Integration test shared between mirror and Edge Function

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion and blocks all user stories
- **User Stories (Phase 3+)**: All depend on Foundational completion
- **Polish (Final Phase)**: Depends on the user stories targeted for delivery

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational completion and does not depend on later stories
- **User Story 2 (P2)**: Can start after Foundational completion and reuses auth and data primitives
- **User Story 3 (P3)**: Can start after Foundational completion and reuses shared evaluation, certificate, and gamification primitives
- **User Story 4 (P4)**: Can start after Foundational completion and reuses auth, evaluation, audit, and data primitives

### Within Each User Story

- Shared persistence and schema before endpoint wiring
- Endpoint and function contracts before hardening
- Core flow complete before moving to the next priority

### Parallel Opportunities

- Setup tasks marked `[P]` can run in parallel
- Foundational tasks marked `[P]` can run in parallel where files do not overlap
- After Foundational completion, user stories can be worked on in parallel by separate contributors
- Story tasks marked `[P]` can run in parallel within that story

---

## Parallel Example: User Story 2

```bash
Task: "Implement course catalog and course detail endpoints in backend/src/api/courses/index.ts and backend/src/api/courses/[id].ts"
Task: "Implement module and lesson CRUD endpoints in backend/src/api/courses/[courseId]/modules.ts and backend/src/api/lessons/[id].ts"
Task: "Implement progress tracking persistence and completion helpers in backend/src/api/progress/index.ts, backend/src/services/progress/progressService.ts, and supabase/migrations/20260505_0009_progress_tracking.sql"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Validate auth and role flows independently
5. Demo or deploy the backend baseline if ready

### Incremental Delivery

1. Finish Setup + Foundational to unlock the backend platform
2. Deliver User Story 1 and validate auth/role behavior
3. Deliver User Story 2 and validate content/progress behavior
4. Deliver User Story 3 and validate grading/certification behavior
5. Deliver User Story 4 and validate IA/admin/operational behavior
6. Finish with hardening tasks that affect multiple stories

### Parallel Team Strategy

1. One contributor can own Setup and Foundational
2. Once Foundation is complete, separate contributors can split User Story 1, User Story 2, User Story 3, and User Story 4
3. Cross-cutting hardening can run after the core stories are stable

---

## Notes

- `[P]` tasks mean different files and no dependency on incomplete tasks
- Story labels map tasks directly to the corresponding user story for traceability
- Tests are included where they materially support backend validation, especially for contract and integration coverage
- The feature must remain subordinated to the project constitution and the Supabase security rules