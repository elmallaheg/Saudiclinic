-- ============================================================
-- SAUDICLINIC — SETUP شامل وآمن (شغّله مرة واحدة في Supabase)
-- Supabase Dashboard ▸ SQL Editor ▸ الصق الكل ▸ Run
--
-- الهدف:
--   1) التأكد من وجود كل الجداول بالأعمدة الصحيحة.
--   2) تفعيل RLS مع policy تسمح للـ anon بالقراءة والكتابة
--      (السبب الأكثر شيوعاً لعدم حفظ البيانات هو RLS بدون policy).
--
-- آمن للتشغيل أكثر من مرة (IF NOT EXISTS / DROP POLICY IF EXISTS).
-- لا يحذف أي بيانات موجودة.
-- ============================================================

-- ---------- PATIENTS ----------
create table if not exists public.patients (
  id           uuid primary key default gen_random_uuid(),
  patient_code text unique,                 -- معرّف التطبيق 'P001'
  full_name    text not null default '',
  phone        text default '',
  gender       text default 'ذكر',
  birth_date   date,
  notes        text default '',
  created_at   timestamptz default now()
);
alter table public.patients
  add column if not exists patient_code text,
  add column if not exists full_name    text,
  add column if not exists phone        text,
  add column if not exists gender       text,
  add column if not exists birth_date   date,
  add column if not exists notes        text,
  add column if not exists created_at   timestamptz default now();
create unique index if not exists idx_patients_code on public.patients(patient_code);

-- ---------- DOCTORS ----------
create table if not exists public.doctors (
  id           uuid primary key default gen_random_uuid(),
  doctor_code  text unique,                 -- 'D001'
  full_name    text not null default '',
  phone        text default '',
  specialty    text default '',
  commission   numeric(5,2) default 0,
  fixed_salary numeric(12,2) default 0,
  notes        text default '',
  is_active    boolean default true,
  paid         numeric(12,2) default 0,
  created_at   timestamptz default now()
);
alter table public.doctors
  add column if not exists fixed_salary numeric(12,2) default 0,
  add column if not exists notes        text default '',
  add column if not exists is_active    boolean default true,
  add column if not exists paid         numeric(12,2) default 0,
  add column if not exists created_at   timestamptz default now();

-- ---------- APPOINTMENTS ----------
-- ملاحظة مهمة: patient_id / doctor_id مخزّنة كنصوص (codes مثل 'P001'/'D001')
-- وليست UUID/Foreign Keys، لتفادي تعارض الأنواع مع معرّفات التطبيق.
create table if not exists public.appointments (
  id               uuid primary key default gen_random_uuid(),
  appointment_code text unique,             -- 'A...' معرّف التطبيق
  patient_id       text,                    -- 'P001'
  doctor_id        text,                    -- 'D001'
  appointment_date date,
  appointment_time text,
  treatment_type   text default '',
  notes            text default '',
  status           text default 'scheduled',
  created_at       timestamptz default now()
);
alter table public.appointments
  add column if not exists appointment_code text,
  add column if not exists patient_id       text,
  add column if not exists doctor_id        text,
  add column if not exists appointment_date date,
  add column if not exists appointment_time text,
  add column if not exists treatment_type   text,
  add column if not exists notes            text,
  add column if not exists status           text default 'scheduled',
  add column if not exists created_at       timestamptz default now();
create unique index if not exists idx_appointments_code on public.appointments(appointment_code);

-- ---------- PARTNERS ----------
create table if not exists public.partners (
  id               uuid primary key default gen_random_uuid(),
  partner_code     text unique,
  full_name        text not null default '',
  phone            text default '',
  email            text default '',
  share_percentage numeric(5,2) default 0,
  withdrawn        numeric(12,2) default 0,
  notes            text default '',
  is_active        boolean default true,
  created_at       timestamptz default now()
);

-- ---------- PAYMENTS (الحسابات / الخزينة) ----------
create table if not exists public.payments (
  id           uuid primary key default gen_random_uuid(),
  payment_code text unique,
  amount       numeric(12,2) default 0,
  direction    text default 'in',           -- in / out
  method_id    text,
  category     text default '',
  ref_id       text,
  note         text default '',
  commission   numeric(12,2) default 0,
  net          numeric(12,2) default 0,
  payment_date date,
  created_at   timestamptz default now()
);
alter table public.payments
  add column if not exists payment_code text,
  add column if not exists amount       numeric(12,2) default 0,
  add column if not exists direction    text default 'in',
  add column if not exists method_id    text,
  add column if not exists category     text default '',
  add column if not exists ref_id       text,
  add column if not exists note         text default '',
  add column if not exists commission   numeric(12,2) default 0,
  add column if not exists net          numeric(12,2) default 0,
  add column if not exists payment_date date,
  add column if not exists created_at   timestamptz default now();

-- ---------- CASES (الحالات) ----------
create table if not exists public.cases (
  id             uuid primary key default gen_random_uuid(),
  case_code      text unique,                 -- 'C...'
  patient_code   text,
  doctor_code    text,
  service        text default '',
  teeth          text default '',
  price          numeric(12,2) default 0,
  collected      numeric(12,2) default 0,
  lab_cost       numeric(12,2) default 0,
  mat_cost       numeric(12,2) default 0,
  nurse_cost     numeric(12,2) default 0,
  other_cost     numeric(12,2) default 0,
  ratio_snapshot numeric(5,2),
  status         text default 'جاري',
  created_at     timestamptz default now()
);
alter table public.cases
  add column if not exists case_code      text,
  add column if not exists patient_code   text,
  add column if not exists doctor_code    text,
  add column if not exists service        text,
  add column if not exists teeth          text,
  add column if not exists price          numeric(12,2) default 0,
  add column if not exists collected      numeric(12,2) default 0,
  add column if not exists lab_cost       numeric(12,2) default 0,
  add column if not exists mat_cost       numeric(12,2) default 0,
  add column if not exists nurse_cost     numeric(12,2) default 0,
  add column if not exists other_cost     numeric(12,2) default 0,
  add column if not exists ratio_snapshot numeric(5,2),
  add column if not exists status         text default 'جاري',
  add column if not exists created_at     timestamptz default now();
create unique index if not exists idx_cases_code on public.cases(case_code);

-- ---------- INVOICES (الفواتير) ----------
create table if not exists public.invoices (
  id           uuid primary key default gen_random_uuid(),
  invoice_code text unique,                   -- 'INV...'
  patient_code text,
  case_code    text,
  amount       numeric(12,2) default 0,
  invoice_date date,
  status       text default 'معلقة',
  installments jsonb default '[]'::jsonb,
  created_at   timestamptz default now()
);
alter table public.invoices
  add column if not exists invoice_code text,
  add column if not exists patient_code text,
  add column if not exists case_code    text,
  add column if not exists amount       numeric(12,2) default 0,
  add column if not exists invoice_date date,
  add column if not exists status       text default 'معلقة',
  add column if not exists installments jsonb default '[]'::jsonb,
  add column if not exists created_at   timestamptz default now();
create unique index if not exists idx_invoices_code on public.invoices(invoice_code);

-- ---------- INVENTORY (المخزون) ----------
create table if not exists public.inventory (
  id         uuid primary key default gen_random_uuid(),
  item_code  text unique,                     -- 'I...'
  name       text default '',
  category   text default '',
  buy_price  numeric(12,2) default 0,
  qty        numeric(12,2) default 0,
  min_qty    numeric(12,2) default 0,
  supplier   text default '',
  created_at timestamptz default now()
);
alter table public.inventory
  add column if not exists item_code  text,
  add column if not exists name       text,
  add column if not exists category   text,
  add column if not exists buy_price  numeric(12,2) default 0,
  add column if not exists qty        numeric(12,2) default 0,
  add column if not exists min_qty    numeric(12,2) default 0,
  add column if not exists supplier   text,
  add column if not exists created_at timestamptz default now();
create unique index if not exists idx_inventory_code on public.inventory(item_code);

-- ---------- APP_SETTINGS (هوية النظام — صف واحد) ----------
create table if not exists public.app_settings (
  id         text primary key default 'main',
  data       jsonb default '{}'::jsonb,
  updated_at timestamptz default now()
);

-- ---------- APP_STATE (لقطة كاملة لكل بيانات النظام — مزامنة شاملة) ----------
-- تخزّن كامل قاعدة البيانات (كل الكيانات الحالية والمستقبلية) في صف JSON واحد.
create table if not exists public.app_state (
  id         text primary key default 'main',
  data       jsonb default '{}'::jsonb,
  updated_at timestamptz default now()
);

-- ============================================================
-- RLS + POLICIES  (الجزء الأهم لحل مشكلة عدم الحفظ)
-- يسمح لأي طلب anon/authenticated بكل العمليات.
-- ⚠️ غير آمن للإنتاج العام — بعد تفعيل Supabase Auth استبدلها بسياسة مقيّدة.
-- ============================================================
do $$
declare t text;
begin
  foreach t in array array['patients','doctors','appointments','partners','payments','cases','invoices','inventory','app_settings','app_state'] loop
    execute format('alter table public.%I enable row level security;', t);
    execute format('drop policy if exists "%s_anon_all" on public.%I;', t, t);
    execute format(
      'create policy "%s_anon_all" on public.%I for all to anon, authenticated using (true) with check (true);',
      t, t
    );
  end loop;
end $$;

-- ============================================================
-- تحقق سريع: شغّل ده بعد الـ Setup لتشوف العدد في كل جدول
-- select 'patients' tbl, count(*) from public.patients
-- union all select 'doctors', count(*) from public.doctors
-- union all select 'appointments', count(*) from public.appointments
-- union all select 'partners', count(*) from public.partners
-- union all select 'payments', count(*) from public.payments
-- union all select 'cases', count(*) from public.cases
-- union all select 'invoices', count(*) from public.invoices
-- union all select 'inventory', count(*) from public.inventory;
-- ============================================================
