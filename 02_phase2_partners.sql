-- ============================================================
-- PHASE 2 — PARTNERS module
-- ملاحظة: أضفنا partner_code (نص) ليتوافق مع نمط التطبيق
-- (مثل patient_code / doctor_code) وليخزّن معرّف 'PT...'،
-- وأضفنا withdrawn للحفاظ على التوافق الخلفي مع شاشة المحاسبة.
-- ============================================================

create table if not exists public.partners (
  id                uuid primary key default gen_random_uuid(),
  partner_code      text unique,                 -- معرّف التطبيق 'PT...'
  clinic_id         uuid,                         -- لدعم تعدّد الفروع مستقبلاً (اختياري)
  full_name         text not null,
  phone             text default '',
  email             text default '',
  share_percentage  numeric(5,2) default 0,       -- الحصة %
  withdrawn         numeric(12,2) default 0,      -- المسحوبات (توافق خلفي)
  notes             text default '',
  is_active         boolean default true,
  created_at        timestamptz default now()
);

create index if not exists idx_partners_partner_code on public.partners(partner_code);

-- ------------------------------------------------------------
-- RLS
-- ------------------------------------------------------------
-- ⚠️ تنبيه أمني مهم:
-- النظام حالياً يسجّل الدخول محلياً (DB.users) ويتصل بـ Supabase
-- عبر anon key. السياسة أدناه تسمح بكل العمليات لأي طلب anon
-- حتى لا ينكسر التطبيق الآن. هذا غير آمن للإنتاج العام.
-- بعد تفعيل Supabase Auth (Phase 3 لاحقاً) استبدلها بسياسة
-- مقيّدة بـ auth.uid() / auth.role().
-- ------------------------------------------------------------
alter table public.partners enable row level security;

drop policy if exists "partners_anon_all" on public.partners;
create policy "partners_anon_all"
  on public.partners
  for all
  to anon, authenticated
  using (true)
  with check (true);

-- النسخة المقيّدة الموصى بها لاحقاً (معطّلة الآن):
-- create policy "partners_auth_only"
--   on public.partners for all
--   to authenticated
--   using (true) with check (true);
