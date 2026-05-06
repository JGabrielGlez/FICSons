# Tasks: SPEC-001 Fundacional LMS Escolar

**Input**: Design documents from `/specs/001-spec-fundacional/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Organization**: Tasks are grouped by user story to support independent implementation and validation.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story the task belongs to, e.g. `[US1]`, `[US2]`, `[US3]`
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and baseline structure for the LMS PWA + Supabase stack

- [ ] T001 [P] Create the frontend application scaffold in `frontend/package.json`, `frontend/vite.config.ts`, `frontend/src/main.tsx`, and `frontend/src/app/App.tsx`
- [ ] T002 [P] Create the feature folder layout in `frontend/src/features/auth/`, `frontend/src/features/courses/`, `frontend/src/features/lessons/`, `frontend/src/features/evaluations/`, `frontend/src/features/gamification/`, `frontend/src/features/ai-chat/`, `frontend/src/features/admin/`, `frontend/src/features/moderation/`, `frontend/src/features/profile/`, `frontend/src/features/notifications/`, and `frontend/src/shared/`
- [ ] T003 Configure baseline quality tooling and scripts in `frontend/eslint.config.js`, `frontend/prettier.config.js`, `frontend/tsconfig.json`, `frontend/package.json`, and `.github/workflows/ci.yml`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that must exist before any user story is implemented

**⚠️ Critical**: No user story work should begin until this phase is complete

- [ ] T004 [P] Create the base Supabase schema for identities, organization, courses, lessons, enrollments, progress, evaluations, gamification, notifications, moderation, and AI history in `supabase/migrations/20260505_0001_base_schema.sql`
- [ ] T005 [P] Create the core RLS policies and auth helper functions in `supabase/migrations/20260505_0002_rls_and_auth.sql`
- [ ] T006 [P] Configure storage buckets, realtime channels, and signed URL support in `supabase/migrations/20260505_0003_platform_services.sql`
- [ ] T007 Implement the shared Supabase client, session helper, and environment validation in `frontend/src/shared/supabase/client.ts`, `frontend/src/shared/auth/session.ts`, and `frontend/src/shared/config/env.ts`
- [ ] T008 Implement role-based route guards and the application shell layout in `frontend/src/app/router.tsx`, `frontend/src/app/layouts/AppShell.tsx`, and `frontend/src/shared/auth/roleGuards.ts`
- [ ] T009 Define shared domain types and query wrappers for profiles, courses, lessons, evaluations, certificates, and notifications in `frontend/src/shared/types/` and `frontend/src/shared/api/`
- [ ] T010 Seed minimal reference data for organizational units, roles, and validation fixtures in `supabase/seed/seed.sql`

**Checkpoint**: Foundation ready - user story implementation can now proceed

---

## Phase 3: User Story 1 - Trayectoria de aprendizaje trazable (Priority: P1)

**Goal**: Allow students to enroll, progress through courses, and be blocked when prerequisites are not met while keeping progress traceable

**Independent Test**: A student can enroll in a course, open allowed lessons, persist progress, and be blocked from prerequisite-gated content

- [ ] T011 [P] [US1] Implement course catalog and course detail data access in `frontend/src/features/courses/api/courseQueries.ts`, `frontend/src/features/courses/pages/CourseCatalogPage.tsx`, and `frontend/src/features/courses/pages/CourseDetailPage.tsx`
- [ ] T012 [P] [US1] Implement enrollment validation and prerequisite cycle checks in `supabase/migrations/20260505_0004_enrollment_prerequisites.sql`
- [ ] T013 [US1] Implement enrollment actions and blocked-state UI in `frontend/src/features/enrollments/api/enrollmentApi.ts` and `frontend/src/features/enrollments/components/EnrollButton.tsx`
- [ ] T014 [P] [US1] Implement lesson player, resume state, and completion tracking in `frontend/src/features/lessons/pages/LessonPlayerPage.tsx` and `frontend/src/features/lessons/components/ProgressTracker.tsx`
- [ ] T015 [US1] Implement progress persistence and mark-complete RPC wiring in `frontend/src/features/lessons/api/progressApi.ts` and `supabase/migrations/20260505_0005_progress_tracking.sql`
- [ ] T016 [US1] Implement learning path navigation and prerequisite blockers in `frontend/src/features/learning-paths/components/LearningPathTimeline.tsx` and `frontend/src/features/learning-paths/api/learningPathApi.ts`
- [ ] T017 [US1] Expose completion and progress summaries in `frontend/src/features/profile/pages/ProfileProgressPage.tsx` and `frontend/src/features/profile/api/profileProgressApi.ts`
- [ ] T018 [US1] Wire progress traceability events and history reads in `frontend/src/shared/telemetry/progressEvents.ts` and `supabase/migrations/20260505_0006_progress_events.sql`

**Checkpoint**: User Story 1 should now be independently usable and testable

---

## Phase 4: User Story 2 - Gestion docente de contenido (Priority: P2)

**Goal**: Allow instructors to create, publish, reorder, and maintain course content of the supported types

**Independent Test**: An authorized instructor can create a course, add lessons of each supported content type, publish content, and reorder modules

- [ ] T019 [P] [US2] Implement the instructor course editor shell and ownership checks in `frontend/src/features/courses/instructor/pages/CourseEditorPage.tsx` and `frontend/src/features/courses/instructor/guards.ts`
- [ ] T020 [P] [US2] Implement instructor course and module CRUD data access in `frontend/src/features/courses/instructor/api/instructorCourseApi.ts`
- [ ] T021 [US2] Implement module reorder RPC and drag-and-drop UI in `frontend/src/features/courses/instructor/components/ModuleReorderList.tsx` and `supabase/migrations/20260505_0007_reorder_modules.sql`
- [ ] T022 [P] [US2] Implement lesson create/edit/delete forms for the supported content types in `frontend/src/features/lessons/instructor/LessonEditorPage.tsx` and `frontend/src/features/lessons/instructor/LessonForm.tsx`
- [ ] T023 [US2] Implement content source provider detection and metadata extraction in `frontend/src/features/lessons/utils/contentSource.ts` and `supabase/functions/content-source-detect/index.ts`
- [ ] T024 [US2] Implement publish and unpublish flows for courses, modules, and lessons in `frontend/src/features/courses/instructor/components/PublishControls.tsx` and `frontend/src/features/courses/instructor/api/publishApi.ts`
- [ ] T025 [US2] Add signed asset upload support for lesson resources in `supabase/functions/sign-asset-url/index.ts` and `frontend/src/shared/storage/signedUrl.ts`
- [ ] T026 [US2] Enforce organization scope and instructor team membership in `supabase/migrations/20260505_0008_admin_scope_and_team.sql`
- [ ] T027 [US2] Implement course team management UI in `frontend/src/features/courses/instructor/components/CourseTeamManager.tsx` and `frontend/src/features/courses/instructor/api/courseTeamApi.ts`

**Checkpoint**: User Story 2 should now be independently usable and testable

---

## Phase 5: User Story 3 - Integridad de evaluacion y certificacion (Priority: P3)

**Goal**: Protect evaluation integrity with server-side grading and issue publicly verifiable certificates

**Independent Test**: An instructor can author an evaluation, a learner can submit an attempt, grading occurs on the server, and the resulting certificate can be verified publicly

- [ ] T028 [P] [US3] Implement evaluation builder data access and authoring UI in `frontend/src/features/evaluations/pages/EvaluationBuilderPage.tsx` and `frontend/src/features/evaluations/api/evaluationBuilderApi.ts`
- [ ] T029 [P] [US3] Create the evaluation schema, questions, options, attempts, and RLS in `supabase/migrations/20260505_0009_evaluations.sql`
- [ ] T030 [US3] Implement attempt start and evaluation runner UI in `frontend/src/features/evaluations/pages/EvaluationRunnerPage.tsx` and `frontend/src/features/evaluations/components/QuestionRenderer.tsx`
- [ ] T031 [US3] Implement the `submit-evaluation` Edge Function with server-side grading in `supabase/functions/submit-evaluation/index.ts` and `supabase/functions/submit-evaluation/grading.ts`
- [ ] T032 [US3] Add client transforms that strip `is_correct` from public evaluation payloads in `frontend/src/features/evaluations/api/publicEvaluationTransforms.ts`
- [ ] T033 [P] [US3] Implement certificate issuance and the public verification route in `supabase/functions/issue-certificate/index.ts` and `frontend/src/app/public/certificates/[code]/page.tsx`
- [ ] T034 [US3] Implement certificate and diploma history views in `frontend/src/features/gamification/pages/CertificatesPage.tsx` and `frontend/src/features/gamification/api/certificateApi.ts`
- [ ] T035 [US3] Wire achievement calculation after graded attempts in `supabase/functions/check-achievements/index.ts` and `supabase/migrations/20260505_0010_achievements.sql`

**Checkpoint**: User Story 3 should now be independently usable and testable

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and finalize the product baseline

- [ ] T036 [P] Configure the PWA manifest, service worker, and offline caching in `frontend/public/manifest.webmanifest`, `frontend/src/app/pwa/registerServiceWorker.ts`, and `frontend/src/shared/pwa/workbox.ts`
- [ ] T037 Implement the `ai-chat` Edge Function with kill-switch and rate limiting in `supabase/functions/ai-chat/index.ts` and `supabase/migrations/20260505_0011_ai_conversations.sql`
- [ ] T038 Implement the conversational tutor UI and chat history in `frontend/src/features/ai-chat/pages/AiChatPage.tsx` and `frontend/src/features/ai-chat/api/aiChatApi.ts`
- [ ] T039 Implement realtime notifications consumption and unread badge state in `frontend/src/features/notifications/pages/NotificationsPage.tsx`, `frontend/src/features/notifications/api/notificationsApi.ts`, and `frontend/src/features/notifications/store/notificationStore.ts`
- [ ] T040 Implement the moderation queue and admin role management screens in `frontend/src/features/moderation/pages/ModerationQueuePage.tsx`, `frontend/src/features/admin/pages/AdminUsersPage.tsx`, and `supabase/functions/update-user-role/index.ts`
- [ ] T041 Add CI quality gates, Lighthouse validation, and deployment checks in `.github/workflows/ci.yml` and `frontend/package.json`
- [ ] T042 Update the quickstart and runbook validation notes in `specs/001-spec-fundacional/quickstart.md` and `specs/001-spec-fundacional/plan.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion and blocks all user stories
- **User Stories (Phase 3+)**: All depend on Foundational completion
- **Polish (Final Phase)**: Depends on the user stories targeted for delivery

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational completion and does not depend on later stories
- **User Story 2 (P2)**: Can start after Foundational completion and may reuse shared learner primitives
- **User Story 3 (P3)**: Can start after Foundational completion and reuses shared auth, storage, and content primitives

### Within Each User Story

- Shared data access and domain types before UI wiring
- Core implementation before integration and polish
- Story complete before moving to the next priority

### Parallel Opportunities

- Setup tasks marked `[P]` can run in parallel
- Foundational tasks marked `[P]` can run in parallel where files do not overlap
- After Foundational completion, user stories can be worked on in parallel by separate contributors
- Story tasks marked `[P]` can run in parallel within that story

---

## Parallel Example: User Story 1

```bash
Task: "Implement course catalog and course detail data access in frontend/src/features/courses/api/courseQueries.ts, frontend/src/features/courses/pages/CourseCatalogPage.tsx, and frontend/src/features/courses/pages/CourseDetailPage.tsx"
Task: "Implement enrollment validation and prerequisite cycle checks in supabase/migrations/20260505_0004_enrollment_prerequisites.sql"
Task: "Implement lesson player, resume state, and completion tracking in frontend/src/features/lessons/pages/LessonPlayerPage.tsx and frontend/src/features/lessons/components/ProgressTracker.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Validate the learner flow independently
5. Demo or deploy the baseline if ready

### Incremental Delivery

1. Finish Setup + Foundational to unlock the core platform
2. Deliver User Story 1 and validate progression/prerequisite behavior
3. Deliver User Story 2 and validate authoring/publishing behavior
4. Deliver User Story 3 and validate grading/certification behavior
5. Finish with polish items that affect multiple stories

### Parallel Team Strategy

1. One contributor can own Setup and Foundational
2. Once Foundation is complete, separate contributors can split User Story 1, User Story 2, and User Story 3
3. Cross-cutting polish can run after the core stories are stable

---

## Notes

- `[P]` tasks mean different files and no dependency on incomplete tasks
- Story labels map tasks directly to the corresponding user story for traceability
- No dedicated test tasks were generated because tests were not explicitly requested in the specification
- The feature must remain subordinated to the project constitution and the Supabase security rules