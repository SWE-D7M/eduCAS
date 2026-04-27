# MASTER SPEC v3.1 — Legal Case Management Platform

> **Changelog from v3.0:** filled stack ambiguities (App Router / TypeScript / Tailwind+shadcn), pinned Supabase Cloud, added email-provider plan, added first-Principal bootstrap, added i18n (Arabic + English RTL), defined single-tenant scope, fixed Realtime/WebSocket redundancy, added phasing, testing strategy, and acceptance criteria. Original 20-section structure preserved; new sections 21-26 appended.

## 0. System Principles
- **Single-tenant** (one law firm per deployment — multi-tenancy out of scope).
- Case-centric architecture · 3-layer RBAC (DB RLS + API + UI) · Audit-first · Soft-delete by default · Least privilege · Zero trust between layers.

## 1. Infrastructure
**Application tier (in Docker on VPS):** Next.js 15 (App Router, TypeScript) · Nginx 1.27 · Node 20 LTS.
**Data tier (managed):** **Supabase Cloud — Pro tier** (daily backups, 7-day PITR). Region: chosen to match user data residency (default `eu-central-1` Frankfurt; switch to `ap-southeast-1` Singapore for South-Asia residency; switch to self-hosted Supabase on VPS only if regulator forbids cross-border data).
**Edge:** Cloudflare (DNS, Full Strict SSL, WAF, rate limiting, CDN) with Origin CA cert installed in Nginx.
**VPS:** Ubuntu 24.04 LTS, Docker + Compose v2, ufw closed except 22 (key-only) / 80 / 443, Fail2Ban on SSH.
**Observability:** Sentry (errors/traces) · UptimeRobot (uptime) · Docker + Nginx logs shipped to a single mount.
**CI/CD:** GitHub Actions — lint → typecheck → unit tests → pgTAP RLS tests → Playwright e2e → Docker build → deploy to staging → smoke → production (manual gate).
**Environments:** dev (local Supabase via CLI) · staging (mirrors prod) · production. Migrations run via `supabase db push` against each.

## 2. Security
- Secrets in `.env*.local` only, never committed. Rotated 90-day. CI uses GitHub Actions encrypted secrets.
- TLS 1.3 in transit. Encryption at rest via Supabase (default).
- **Rate limiting** (Upstash Redis HTTP, in-memory fallback for local dev): login 5/5min · signup 3/10min · file upload 20/min · chat 30/min · global 120/min.
- **Sessions:** access token 30 min, refresh token 7 days, auto-logout after 30 min inactivity (configurable per firm), invalidated on role/password change.
- **2FA (TOTP):** required for Principal/Consultant from Phase 5; available opt-in for others.

## 3. Audit Log (Immutable)
- INSERT-only via service role; UPDATE/DELETE denied to all roles by RLS.
- Retention 7 years; retention job uses service role and writes a meta-audit entry on expiry.
- Fields: `id, actor_id, actor_role, action, entity_type, entity_id, before(jsonb), after(jsonb), ip, user_agent, request_id, created_at`.
- Logged events: login/logout/login-failure, case CRUD, assignment changes, file upload/access/delete, role changes, exports, chat-deletes.

## 4. User System
- Sign-up via landing → email + OTP (6 digits, 10 min, 5/5min limit). No magic links, no passwords.
- Default role: **Client**.
- Role changes: only Principal can change roles. Effect: assignments retained, permissions update next request, target user forced to re-login (`must_relogin_after = now()`), action audited.
- **First-Principal bootstrap:** on first deploy, no Principal exists. Operator runs documented one-time SQL in Supabase Studio: `update public.users set role='principal' where email='<owner>';`. Subsequent Principals appointed in-app.

## 5. RBAC + Data Visibility
Roles: Principal · Consultant · Lawyer · Trainee · Client.

| Resource | Principal | Consultant | Lawyer | Trainee | Client |
|---|---|---|---|---|---|
| Cases | All R/W/D | All R/W (no purge) | Assigned R/W | Assigned R | Own R |
| Files | All R/W/D | All R/W | Assigned R/W | Assigned R | Own R |
| Chat (internal) | All R/W (delete) | All R/W | Assigned R/W | Assigned R | — |
| Chat (client) | All R/W (delete) | All R/W | Assigned R/W | Assigned R | Own R/W |
| Calendar | All R/W/D | All R/W | Assigned R/W | Assigned R | Own R |
| Audit logs | All R | Self + own cases R | Self R | Self R | — |
| Users | All R/W | All R, self W | Members R, self W | Members R, self W | Self R/W |
| Export | Yes | Yes | — | — | — |

Enforced at DB (RLS) + API (server actions / route handlers) + UI (`<Can>` wrapper).

## 6. Case System
- Fields: `case_id (uuid), case_number (LAW-YYYY-NNNN unique, generated), title, description, status (intake/active/on_hold/closed/archived), client_id, created_by, opened_at, closed_at, court_name, jurisdiction, timestamps, deleted_at`.
- One case → one client_id; many lawyers/consultants/trainees via `case_assignments(case_id, user_id, assignment_role)`.
- Owned by the firm; client is participant only (cannot reassign).

## 7. Soft Delete
- All tables include `deleted_at timestamptz null` + partial indexes `WHERE deleted_at IS NULL`.
- Restore (Principal-only) clears `deleted_at`; audited.
- Hard delete (purge): Principal-only via service-role route; **PII fields are redacted, audit_log row preserved** (no audit cascade) to satisfy 7-year retention vs right-to-erasure.

## 8. Database Rules
- Postgres 15 via Supabase Cloud · RLS enabled on every table · default deny.
- Required indexes: `user_id`, `case_id`, `created_at`, `status`, partial `deleted_at`, gin_trgm on searchable text.
- All lists paginated (default 20, max 50 items per request).

## 9. Search
- Phase 1: indexed search on `cases` (case_number / title / client name) using `pg_trgm` GIN.
- Phase 3: full `tsvector` across cases + messages + files; role-scoped results.

## 10. File Storage
- **Supabase Storage only.** Bucket `case-files` (private). Path: `cases/{case_id}/files/{file_id}_{filename}`.
- Metadata in DB (`case_files` table) — never depend on case_name in path.
- Access via signed URLs (15 min TTL) issued by API after RBAC check; URLs not session-bound (signed only).
- Versioning: no overwrite — each upload creates a new row chained via `parent_file_id`.
- Antivirus scan via edge function before publish (Phase 2).

## 11. Chat
- Per case: (a) Client Chat (client + team), (b) Internal Chat (team only).
- Text only (Phase 2 adds attachments). Real-time via **Supabase Realtime** (WebSocket-based; the v3.0 wording "WebSocket fallback" was redundant and is removed).
- Pagination 50 messages/page, lazy-load older.
- Client cannot delete; Principal can soft-delete with audit.

## 12. Notifications
- Triggers: case assignment, file upload, chat message, role change, calendar event invite.
- Delivery: in-app (Supabase Realtime channel per recipient_id) + optional email (Resend, Phase 2). Supabase default SMTP used only for OTP in Phase 1.
- Features: mark-read, mark-all-read, clear-all (soft-delete).

## 13. Calendar
- Linked to `case_id`. Fields: title, description, start_at, end_at, location, organizer_id.
- ICS export per event. Recurrence (RRULE) Phase 3.
- Permissions per matrix in §5.

## 14. Dashboard
- **Principal:** firm-wide stats (open cases, hearings this week, overdue tasks, user activity), all cases, user admin shortcut.
- **Consultant:** firm-wide cases overview, no admin.
- **Lawyer:** assigned cases, this-week hearings, internal chat unread.
- **Trainee:** assigned cases (read-only), upcoming events.
- **Client:** own cases, last messages from team, upcoming events on own cases.
- Empty states for every list.

## 15. Export
- Allowed: Principal, Consultant.
- Formats: PDF (case dossier via `react-pdf`) and CSV (case list).
- Signed download URL (5 min TTL). Action audited.

## 16. Realtime
- **Single channel: Supabase Realtime** (Postgres logical replication over WebSocket). No separate fallback layer needed — Supabase Realtime handles reconnection.
- Used for: chat, notifications, live case-list invalidation.

## 17. System Flow
- **Request:** User → Cloudflare → Nginx → Next.js (Server Component / Route Handler) → Supabase (Auth + DB + Storage + Realtime) → response.
- **File:** User → Next.js API (RBAC) → Supabase signed URL → direct Storage upload/download (Next.js does not proxy bytes).
- **Auth:** Login OTP → Supabase Auth issues JWT → cookie set by `@supabase/ssr` → middleware validates each request → RLS scopes data.

## 18. Error Handling
- User-facing messages generic (no stack traces, no DB messages).
- All errors captured in Sentry with request_id correlation. PII scrubbing enabled.
- Form errors via zod-validated server actions; field-level messages.

## 19. Observability
- Sentry: errors + performance traces (10% sample) + release tracking.
- Structured logs (pino JSON) shipped to Docker daemon → mounted volume.
- Nginx access logs with $request_id correlated to Sentry breadcrumbs.
- UptimeRobot pings `/api/health` every 1 min.

## 20. Landing Page
- Office name (Arabic + English) · description · contact CTAs: Google Maps · WhatsApp (pre-filled message in user locale) · Phone (`tel:` link).
- Login / Sign-up CTAs.
- Public — no auth required, no PII shown.

---

## 21. Internationalization (NEW)
- **Locales:** Arabic (default) + English. Both Right-to-Left aware.
- Library: `next-intl` for messages; Tailwind RTL plugin for layout flip; `dir="rtl"` on `<html>` when `ar`.
- Locale switching: cookie-based, manual override; default detected from browser `Accept-Language`.
- All user-facing text via translation keys; no hardcoded strings.

## 22. Tenancy & Scope (NEW)
- **Single-tenant** — one firm per deployment, no firm_id columns. Multi-tenant is out of scope and would require a major schema/RLS redesign.
- Expected scale (initial): ≤ 50 users, ≤ 5,000 cases, ≤ 100k files. Architecture supports 10x without changes.

## 23. Phasing (NEW)
- **Phase 1 (foundation):** infra + auth + RBAC + audit + soft-delete + cases CRUD + landing + role dashboards + Docker/Nginx/CI. *Ship & validate end-to-end.*
- **Phase 2:** chat (both threads) + file storage with versioning + Resend email.
- **Phase 3:** calendar + notifications UI + global search.
- **Phase 4:** export + realtime UI everywhere + dashboard KPIs.
- **Phase 5:** 2FA + retention job + load-tested polish.

## 24. Testing Strategy (NEW)
- **Unit (Vitest):** all `lib/*` pure functions, especially `canAccessCase`, audit, soft-delete. Target 80% line coverage on `lib/`.
- **Integration (Vitest + Supabase test client):** every route handler / server action, both happy-path and RBAC-deny path.
- **DB (pgTAP):** RLS test per role per table per operation — must verify denial as well as permission.
- **E2E (Playwright):** golden flows — signup→OTP→dashboard, principal-creates-case→lawyer-sees-it, role-change→re-login, file upload (Phase 2), chat send (Phase 2).
- **CI gate:** all suites green on PR; staging smoke required before prod.

## 25. Acceptance Criteria (NEW)
A phase is **done** when:
1. All build-order steps for the phase pass linting + typecheck + tests.
2. RBAC matrix verified by pgTAP for every cell.
3. Audit log contains an entry for every mutation in e2e tests.
4. Production deploy is green: `curl -I https://prod` returns HSTS + CSP + X-Frame-Options; HTTP→HTTPS 301; Cloudflare WAF active; Sentry receives test event; Supabase backups verified.
5. Documented runbook exists for: first-Principal bootstrap, role change, hard-delete (purge), backup restore.

## 26. Compliance & Legal Scope (NEW)
- **Confidentiality:** attorney-client privilege respected — internal-chat invisible to clients; client-chat is a separate thread. File ACLs enforce same.
- **Retention:** audit logs 7 years; cases archive but never auto-delete.
- **Right to erasure:** redact PII in user/case rows on legitimate request; audit_log preserves anonymized record (no actor email).
- **Jurisdiction:** spec is jurisdiction-neutral; firm-specific compliance (e.g. Pakistan PDPA, Saudi PDPL, GDPR for EU clients) is configured via deployment region + retention policy + processor agreement with Supabase.
- **Out of scope:** signing/notary, court e-filing integrations, billing.
