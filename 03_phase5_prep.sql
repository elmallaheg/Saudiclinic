-- ============================================================
-- PHASE 5 — PREP: cases / invoices / payments / inventory
-- جداول تجهيزية للمراحل القادمة. تتبع نفس نمط *_code النصي
-- المستخدم في patients/doctors لتسهيل الربط مع معرّفات التطبيق.
-- المراجع تُخزَّن كنصوص (patient_code / doctor_code) لتفادي
-- تعارض الـ UUID مع معرّفات 'P..'/'D..' الحالية.
-- ============================================================

-- ---------- CASES ----------
create table if not exists public.cases (
  id              uuid primary key default gen_random_uuid(),
  case_code       text unique,            -- 'C...'
  patient_code    text,                   -- مرجع للمريض
  doctor_code     text,                   -- مرجع للطبيب
  service         text default '',
  teeth           text default '',
  price           numeric(12,2) default 0,
  collected       numeric(12,2) default 0,
  lab_cost        numeric(12,2) default 0,
  mat_cost        numeric(12,2) default 0,
  other_cost      numeric(12,2) default 0,
  ratio_snapshot  numeric(5,2),
  status          text default 'جاري',
  created_at      timestamptz default now()
);

-- ---------- INVOICES ----------
create table if not exists public.invoices (
  id            uuid primary key default gen_random_uuid(),
  invoice_code  text unique,              -- 'INV...'
  patient_code  text,
  case_code     text,
  amount        numeric(12,2) default 0,
  invoice_date  date,
  status        text default 'معلقة',
  installments  jsonb default '[]'::jsonb, -- خطة الأقساط
  created_at    timestamptz default now()
);

-- ---------- PAYMENTS ----------
create table if not exists public.payments (
  id           uuid primary key default gen_random_uuid(),
  payment_code text unique,
  amount       numeric(12,2) default 0,
  direction    text default 'in',         -- in / out
  method_id    text,
  category     text default '',
  ref_id       text,                       -- مرجع (حالة/طبيب/فاتورة...)
  note         text default '',
  commission   numeric(12,2) default 0,
  net          numeric(12,2) default 0,
  payment_date date,
  created_at   timestamptz default now()
);

-- ---------- INVENTORY ----------
create table if not exists public.inventory (
  id          uuid primary key default gen_random_uuid(),
  item_code   text unique,                 -- 'I...'
  name        text default '',
  category    text default '',
  buy_price   numeric(12,2) default 0,
  qty         numeric(12,2) default 0,
  min_qty     numeric(12,2) default 0,
  supplier    text default '',
  created_at  timestamptz default now()
);

-- ---------- RLS (نفس التنبيه الأمني في Phase 2) ----------
do $$
declare t text;
begin
  foreach t in array array['cases','invoices','payments','inventory'] loop
    execute format('alter table public.%I enable row level security;', t);
    execute format('drop policy if exists "%s_anon_all" on public.%I;', t, t);
    execute format(
      'create policy "%s_anon_all" on public.%I for all to anon, authenticated using (true) with check (true);',
      t, t
    );
  end loop;
end $$;
