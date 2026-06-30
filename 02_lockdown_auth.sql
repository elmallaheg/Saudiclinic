-- ============================================================
-- المرحلة 2 (القفل النهائي): منع الوصول المجهول (anon) نهائياً
-- ⚠️ شغّل هذا الملف "آخر حاجة" — فقط بعد ما تتأكد إن:
--    - شغّلت 01_auth_profiles.sql
--    - أنشأت مستخدم Admin في Authentication
--    - رفعت الكود الجديد وسجّلت دخول بنجاح والبيانات بتتحمّل/بتتحفظ
--
-- بعد هذا الملف: لن يستطيع أي شخص قراءة/كتابة البيانات إلا بعد
-- تسجيل الدخول بحساب حقيقي. (هذا هو الإصلاح الأمني الأساسي)
--
-- للتراجع (طوارئ): أعد تشغيل 00_setup_all.sql ليعيد سياسة anon.
-- ============================================================

do $$
declare t text;
begin
  foreach t in array array[
    'patients','doctors','appointments','partners','payments',
    'cases','invoices','inventory','app_settings','app_state'
  ] loop
    -- احذف سياسة الوصول المجهول
    execute format('drop policy if exists "%s_anon_all" on public.%I;', t, t);
    -- اسمح فقط للمستخدمين المسجّلين
    execute format('drop policy if exists "%s_auth_all" on public.%I;', t, t);
    execute format(
      'create policy "%s_auth_all" on public.%I for all to authenticated using (true) with check (true);',
      t, t
    );
  end loop;
end $$;

-- تحقق: اعرض السياسات الحالية لكل الجداول
-- select tablename, policyname, roles
-- from pg_policies
-- where schemaname='public'
-- order by tablename;
