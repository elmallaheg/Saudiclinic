-- ============================================================
-- PHASE 1 — DOCTORS: add missing columns
-- جدول doctors موجود بالفعل (doctor_code, full_name, phone,
-- specialty, commission). هذا السكربت يضيف الأعمدة الناقصة فقط.
-- آمن للتشغيل أكثر من مرة (IF NOT EXISTS).
-- ============================================================

alter table public.doctors
  add column if not exists fixed_salary numeric(12,2) default 0,
  add column if not exists notes        text          default '',
  add column if not exists is_active    boolean       default true,
  add column if not exists paid         numeric(12,2) default 0;

-- ضمان وجود created_at (إن لم يكن موجوداً)
alter table public.doctors
  add column if not exists created_at timestamptz default now();
