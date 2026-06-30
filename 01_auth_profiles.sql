-- ============================================================
-- المرحلة 1 من المصادقة: جدول profiles + إنشاء تلقائي للملف الشخصي
-- شغّل هذا الملف الآن — آمن تماماً ولا يكسر أي شيء حالي.
-- (لا يلمس صلاحيات anon — النظام يفضل شغّال كما هو)
-- ============================================================

-- جدول الملفات الشخصية (الاسم/الدور) — مربوط بمستخدمي Supabase Auth
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  full_name  text default '',
  role       text default 'مستخدم',
  username   text,
  phone      text default '',
  active     boolean default true,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

-- أي مستخدم مسجّل يقدر يقرأ الملفات (لعرض الأسماء/الأدوار داخل النظام)
drop policy if exists "profiles_auth_read" on public.profiles;
create policy "profiles_auth_read"
  on public.profiles for select to authenticated using (true);

-- المستخدم يقدر يعدّل/ينشئ ملفه الشخصي فقط
drop policy if exists "profiles_self_update" on public.profiles;
create policy "profiles_self_update"
  on public.profiles for update to authenticated
  using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "profiles_self_insert" on public.profiles;
create policy "profiles_self_insert"
  on public.profiles for insert to authenticated
  with check (auth.uid() = id);

-- إنشاء ملف شخصي تلقائياً عند إضافة أي مستخدم جديد في Authentication
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, username, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'مستخدم')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- بعد تشغيل هذا الملف:
-- 1) Supabase ▸ Authentication ▸ Users ▸ Add user
--    - أدخل البريد وكلمة المرور
--    - فعّل "Auto Confirm User" (مهم: حتى لا يطلب تأكيد بالإيميل)
-- 2) عيّن الدور والاسم للمستخدم (مثال للمدير):
--    update public.profiles
--      set role = 'مدير عام', full_name = 'اسمك هنا'
--      where username = 'ايميلك@example.com';
-- ============================================================
