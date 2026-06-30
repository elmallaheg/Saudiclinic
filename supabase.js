const SUPABASE_URL = "https://qpwytgrmnmqfhqnywpqc.supabase.co";

const SUPABASE_ANON_KEY =
"sb_publishable_yiTw8107zHfpmzKN9OcIMg_tdH2hG_e";

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

console.log("✅ Supabase Connected");

/* =========================
   HELPERS
========================= */
// مطابقة السجل: لو المعرّف يشبه UUID نطابق على عمود id، وإلا على عمود الكود النصي (D.. / PT..)
function _matchByKey(query, codeColumn, id){
  const isUuid = typeof id === 'string' && id.indexOf('-') > -1 && id.length >= 32;
  return isUuid ? query.eq('id', id) : query.eq(codeColumn, id);
}

/* =========================
   PATIENTS
========================= */

window.savePatientToSupabase = async function(patient){

  const { data,error } = await supabaseClient
    .from('patients')
    .insert([{
      patient_code: patient.id,
      full_name: patient.name,
      phone: patient.phone,
      gender: patient.gender,
      birth_date: patient.dob || null,
      notes: patient.history || ''
    }])
    .select();

  if(error){
    console.error('PATIENT ERROR:', error);
  }

  return {data,error};
};

window.loadPatientsFromSupabase = async function(){

  const { data,error } = await supabaseClient
    .from('patients')
    .select('*')
    .order('created_at',{ascending:false});

  if(error){
    console.error('LOAD PATIENTS ERROR:', error);
    return;
  }

  // fallback: لو Supabase رجعت فارغة نُبقي بيانات localStorage الحالية
  if(!data || !data.length){ console.warn('patients: no rows from Supabase, keeping local data'); return; }

  DB.patients = (data || []).map(p => ({
    id: p.patient_code || p.id,
    name: p.full_name || '',
    phone: p.phone || '',
    gender: p.gender || 'ذكر',
    dob: p.birth_date || '',
    history: p.notes || '',
    address: '',
    emergency: '',
    balance: 0,
    createdAt: p.created_at || ''
  }));

  console.log('✅ Patients Loaded:', DB.patients.length);
};

window.updatePatientInSupabase = async function(patient){

  const { data,error } = await _matchByKey(
    supabaseClient.from('patients').update({
      full_name: patient.name,
      phone: patient.phone,
      gender: patient.gender,
      birth_date: patient.dob || null,
      notes: patient.history || ''
    }),
    'patient_code', patient.id
  ).select();

  if(error){
    console.error('UPDATE PATIENT ERROR:', error);
  }

  return {data,error};
};

window.deletePatientFromSupabase = async function(id){

  const { data,error } = await _matchByKey(
    supabaseClient.from('patients').delete(),
    'patient_code', id
  ).select();

  if(error){
    console.error('DELETE PATIENT ERROR:', error);
  }

  return {data,error};
};

/* =========================
   DOCTORS
   ملاحظة: التطبيق يستخدم الحقل (spec) للتخصص، و(ratio) للنسبة،
   و(salary) للراتب الثابت، و(active) للحالة، و(paid) للمدفوع.
   عمود قاعدة البيانات للتخصص اسمه (specialty) — تم تصحيح الربط هنا.
========================= */

window.saveDoctorToSupabase = async function(doc){

  const { data,error } = await supabaseClient
    .from('doctors')
    .insert([{
      doctor_code: doc.id,
      full_name: doc.name,
      phone: doc.phone || '',
      specialty: doc.spec || '',          // FIX: كان doc.specialty (غير موجود)
      commission: doc.ratio || 0,
      fixed_salary: doc.salary || 0,
      notes: doc.notes || '',
      is_active: doc.active !== false,
      paid: doc.paid || 0
    }])
    .select();

  if(error){
    console.error('DOCTOR ERROR:', error);
  }

  return {data,error};
};

window.updateDoctorInSupabase = async function(doc){

  const { data,error } = await _matchByKey(
    supabaseClient.from('doctors').update({
      full_name: doc.name,
      phone: doc.phone || '',
      specialty: doc.spec || '',
      commission: doc.ratio || 0,
      fixed_salary: doc.salary || 0,
      notes: doc.notes || '',
      is_active: doc.active !== false,
      paid: doc.paid || 0
    }),
    'doctor_code', doc.id
  ).select();

  if(error){
    console.error('UPDATE DOCTOR ERROR:', error);
  }

  return {data,error};
};

window.deleteDoctorFromSupabase = async function(id){

  const { data,error } = await _matchByKey(
    supabaseClient.from('doctors').delete(),
    'doctor_code', id
  ).select();

  if(error){
    console.error('DELETE DOCTOR ERROR:', error);
  }

  return {data,error};
};

window.setDoctorActiveInSupabase = async function(id, isActive){

  const { data,error } = await _matchByKey(
    supabaseClient.from('doctors').update({ is_active: !!isActive }),
    'doctor_code', id
  ).select();

  if(error){
    console.error('TOGGLE DOCTOR ERROR:', error);
  }

  return {data,error};
};

window.loadDoctorsFromSupabase = async function(){

  const { data,error } = await supabaseClient
    .from('doctors')
    .select('*');

  if(error){
    console.error('LOAD DOCTORS ERROR:', error);
    return;
  }

  // fallback: لو Supabase رجعت فارغة نُبقي بيانات localStorage الحالية
  if(!data || !data.length){ console.warn('doctors: no rows from Supabase, keeping local data'); return; }

  DB.doctors = (data || []).map(d => ({
    id: d.doctor_code || d.id,
    name: d.full_name || '',
    spec: d.specialty || '',             // FIX: كان specialty (التطبيق يتوقع spec)
    phone: d.phone || '',
    ratio: d.commission || 0,
    salary: d.fixed_salary || 0,
    notes: d.notes || '',
    active: d.is_active !== false,
    paid: d.paid || 0
  }));

  console.log('✅ Doctors Loaded:', DB.doctors.length);
};

/* =========================
   APPOINTMENTS
========================= */

window.saveAppointmentToSupabase = async function(appt){

  const { data,error } = await supabaseClient
    .from('appointments')
    .insert([{
      appointment_code: appt.id,
      patient_id: appt.patientId,
      doctor_id: appt.doctorId,
      appointment_date: appt.date,
      appointment_time: appt.time,
      treatment_type: appt.type,
      notes: appt.notes || '',
      status: appt.status || 'scheduled'
    }])
    .select();

  if(error){
    console.error('APPOINTMENT ERROR:', error);
  }

  return {data,error};
};

window.loadAppointmentsFromSupabase = async function(){

  const { data,error } = await supabaseClient
    .from('appointments')
    .select('*');

  if(error){
    console.error('LOAD APPOINTMENTS ERROR:', error);
    return;
  }

  // fallback: لو Supabase رجعت فارغة نُبقي بيانات localStorage الحالية
  if(!data || !data.length){ console.warn('appointments: no rows from Supabase, keeping local data'); return; }

  DB.appointments = (data || []).map(a => ({
    id: a.appointment_code || a.id,
    patientId: a.patient_id,
    doctorId: a.doctor_id,
    date: a.appointment_date,
    time: a.appointment_time,
    type: a.treatment_type,
    notes: a.notes || '',
    status: a.status || 'scheduled'
  }));

  console.log('✅ Appointments Loaded:', DB.appointments.length);
};

window.updateAppointmentInSupabase = async function(appt){

  const { data,error } = await supabaseClient
    .from('appointments')
    .update({
      patient_id: appt.patientId,
      doctor_id: appt.doctorId,
      appointment_date: appt.date,
      appointment_time: appt.time,
      treatment_type: appt.type,
      notes: appt.notes || '',
      status: appt.status || 'scheduled'
    })
    .eq('appointment_code', appt.id)
    .select();

  if(error){
    console.error('UPDATE APPOINTMENT ERROR:', error);
  }

  return {data,error};
};

window.deleteAppointmentFromSupabase = async function(id){

  const { data,error } = await supabaseClient
    .from('appointments')
    .delete()
    .eq('appointment_code', id)
    .select();

  if(error){
    console.error('DELETE APPOINTMENT ERROR:', error);
  }

  return {data,error};
};

/* =========================
   PAYMENTS (الحسابات / الخزينة)
   التطبيق: {id:'PAY..', date, amount, methodId, direction, category, refId, note, commission, net}
   قاعدة البيانات: payment_code, payment_date, amount, method_id, direction,
                   category, ref_id, note, commission, net
========================= */

window.savePaymentToSupabase = async function(pay){

  const { data,error } = await supabaseClient
    .from('payments')
    .insert([{
      payment_code: pay.id,
      amount: pay.amount || 0,
      direction: pay.direction || 'in',
      method_id: pay.methodId || '',
      category: pay.category || '',
      ref_id: pay.refId || '',
      note: pay.note || '',
      commission: pay.commission || 0,
      net: pay.net || 0,
      payment_date: pay.date || null
    }])
    .select();

  if(error){
    console.error('PAYMENT ERROR:', error);
  }

  return {data,error};
};

window.loadPaymentsFromSupabase = async function(){

  const { data,error } = await supabaseClient
    .from('payments')
    .select('*')
    .order('created_at',{ascending:true});

  if(error){
    console.error('LOAD PAYMENTS ERROR:', error);
    return;
  }

  // fallback: لو Supabase رجعت فارغة نُبقي بيانات localStorage الحالية
  if(!data || !data.length){ console.warn('payments: no rows from Supabase, keeping local data'); return; }

  DB.payments = (data || []).map(p => ({
    id: p.payment_code || p.id,
    date: p.payment_date || '',
    amount: Number(p.amount) || 0,
    methodId: p.method_id || '',
    direction: p.direction || 'in',
    category: p.category || '',
    refId: p.ref_id || '',
    note: p.note || '',
    commission: Number(p.commission) || 0,
    net: Number(p.net) || 0
  }));

  console.log('✅ Payments Loaded:', DB.payments.length);
};

/* =========================
   PARTNERS  (Phase 2 — جديد)
   التطبيق: {id:'PT..', name, shares, withdrawn, phone, email, notes, active}
   قاعدة البيانات: partner_code, full_name, share_percentage, withdrawn,
                   phone, email, notes, is_active
========================= */

window.savePartnerToSupabase = async function(p){

  const { data,error } = await supabaseClient
    .from('partners')
    .insert([{
      partner_code: p.id,
      full_name: p.name,
      phone: p.phone || '',
      email: p.email || '',
      share_percentage: p.shares || 0,
      withdrawn: p.withdrawn || 0,
      notes: p.notes || '',
      is_active: p.active !== false
    }])
    .select();

  if(error){
    console.error('PARTNER ERROR:', error);
  }

  return {data,error};
};

window.updatePartnerInSupabase = async function(p){

  const { data,error } = await _matchByKey(
    supabaseClient.from('partners').update({
      full_name: p.name,
      phone: p.phone || '',
      email: p.email || '',
      share_percentage: p.shares || 0,
      withdrawn: p.withdrawn || 0,
      notes: p.notes || '',
      is_active: p.active !== false
    }),
    'partner_code', p.id
  ).select();

  if(error){
    console.error('UPDATE PARTNER ERROR:', error);
  }

  return {data,error};
};

window.deletePartnerFromSupabase = async function(id){

  const { data,error } = await _matchByKey(
    supabaseClient.from('partners').delete(),
    'partner_code', id
  ).select();

  if(error){
    console.error('DELETE PARTNER ERROR:', error);
  }

  return {data,error};
};

window.setPartnerActiveInSupabase = async function(id, isActive){

  const { data,error } = await _matchByKey(
    supabaseClient.from('partners').update({ is_active: !!isActive }),
    'partner_code', id
  ).select();

  if(error){
    console.error('TOGGLE PARTNER ERROR:', error);
  }

  return {data,error};
};

window.loadPartnersFromSupabase = async function(){

  const { data,error } = await supabaseClient
    .from('partners')
    .select('*')
    .order('created_at',{ascending:true});

  if(error){
    console.error('LOAD PARTNERS ERROR:', error);
    return;
  }

  // fallback: لو Supabase رجعت فارغة نُبقي بيانات localStorage الحالية
  if(!data || !data.length){ console.warn('partners: no rows from Supabase, keeping local data'); return; }

  DB.partners = (data || []).map(p => ({
    id: p.partner_code || p.id,
    name: p.full_name || '',
    phone: p.phone || '',
    email: p.email || '',
    shares: p.share_percentage || 0,
    withdrawn: p.withdrawn || 0,
    notes: p.notes || '',
    active: p.is_active !== false
  }));

  console.log('✅ Partners Loaded:', DB.partners.length);
};

/* =========================
   CASES (الحالات)
========================= */
window.saveCaseToSupabase = async function(c){
  const { data,error } = await supabaseClient.from('cases').insert([{
    case_code: c.id,
    patient_code: c.patientId,
    doctor_code: c.doctorId,
    service: c.service || '',
    teeth: c.teeth || '',
    price: c.price || 0,
    collected: c.collected || 0,
    lab_cost: c.labCost || 0,
    mat_cost: c.matCost || 0,
    nurse_cost: c.nurseCost || 0,
    other_cost: c.otherCost || 0,
    ratio_snapshot: (c.ratioSnapshot!=null ? c.ratioSnapshot : null),
    status: c.status || 'جاري'
  }]).select();
  if(error){ console.error('CASE ERROR:', error); }
  return {data,error};
};
window.updateCaseInSupabase = async function(c){
  const { data,error } = await supabaseClient.from('cases').update({
    patient_code: c.patientId,
    doctor_code: c.doctorId,
    service: c.service || '',
    teeth: c.teeth || '',
    price: c.price || 0,
    collected: c.collected || 0,
    lab_cost: c.labCost || 0,
    mat_cost: c.matCost || 0,
    nurse_cost: c.nurseCost || 0,
    other_cost: c.otherCost || 0,
    ratio_snapshot: (c.ratioSnapshot!=null ? c.ratioSnapshot : null),
    status: c.status || 'جاري'
  }).eq('case_code', c.id).select();
  if(error){ console.error('UPDATE CASE ERROR:', error); }
  return {data,error};
};
window.deleteCaseFromSupabase = async function(id){
  const { data,error } = await supabaseClient.from('cases').delete().eq('case_code', id).select();
  if(error){ console.error('DELETE CASE ERROR:', error); }
  return {data,error};
};
window.loadCasesFromSupabase = async function(){
  const { data,error } = await supabaseClient.from('cases').select('*');
  if(error){ console.error('LOAD CASES ERROR:', error); return; }
  if(!data || !data.length){ console.warn('cases: no rows from Supabase, keeping local data'); return; }
  DB.cases = data.map(r => ({
    id: r.case_code || r.id,
    patientId: r.patient_code || '',
    doctorId: r.doctor_code || '',
    service: r.service || '',
    teeth: r.teeth || '',
    price: Number(r.price)||0,
    collected: Number(r.collected)||0,
    labCost: Number(r.lab_cost)||0,
    matCost: Number(r.mat_cost)||0,
    nurseCost: Number(r.nurse_cost)||0,
    otherCost: Number(r.other_cost)||0,
    ratioSnapshot: (r.ratio_snapshot!=null ? Number(r.ratio_snapshot) : undefined),
    status: r.status || 'جاري',
    createdAt: r.created_at || ''
  }));
  console.log('✅ Cases Loaded:', DB.cases.length);
};

/* =========================
   INVOICES (الفواتير)
========================= */
window.saveInvoiceToSupabase = async function(inv){
  const { data,error } = await supabaseClient.from('invoices').insert([{
    invoice_code: inv.id,
    patient_code: inv.patientId,
    case_code: inv.caseId || '',
    amount: inv.amount || 0,
    invoice_date: inv.date || null,
    status: inv.status || 'معلقة',
    installments: inv.installments || []
  }]).select();
  if(error){ console.error('INVOICE ERROR:', error); }
  return {data,error};
};
window.updateInvoiceInSupabase = async function(inv){
  const { data,error } = await supabaseClient.from('invoices').update({
    patient_code: inv.patientId,
    case_code: inv.caseId || '',
    amount: inv.amount || 0,
    invoice_date: inv.date || null,
    status: inv.status || 'معلقة',
    installments: inv.installments || []
  }).eq('invoice_code', inv.id).select();
  if(error){ console.error('UPDATE INVOICE ERROR:', error); }
  return {data,error};
};
window.deleteInvoiceFromSupabase = async function(id){
  const { data,error } = await supabaseClient.from('invoices').delete().eq('invoice_code', id).select();
  if(error){ console.error('DELETE INVOICE ERROR:', error); }
  return {data,error};
};
window.loadInvoicesFromSupabase = async function(){
  const { data,error } = await supabaseClient.from('invoices').select('*');
  if(error){ console.error('LOAD INVOICES ERROR:', error); return; }
  if(!data || !data.length){ console.warn('invoices: no rows from Supabase, keeping local data'); return; }
  DB.invoices = data.map(r => ({
    id: r.invoice_code || r.id,
    patientId: r.patient_code || '',
    caseId: r.case_code || '',
    amount: Number(r.amount)||0,
    date: r.invoice_date || '',
    status: r.status || 'معلقة',
    installments: Array.isArray(r.installments) ? r.installments : (r.installments || [])
  }));
  console.log('✅ Invoices Loaded:', DB.invoices.length);
};

/* =========================
   INVENTORY (المخزون)
========================= */
window.saveInventoryToSupabase = async function(it){
  const { data,error } = await supabaseClient.from('inventory').insert([{
    item_code: it.id,
    name: it.name || '',
    category: it.category || '',
    buy_price: it.buyPrice || 0,
    qty: it.qty || 0,
    min_qty: it.minQty || 0,
    supplier: it.supplier || ''
  }]).select();
  if(error){ console.error('INVENTORY ERROR:', error); }
  return {data,error};
};
window.updateInventoryInSupabase = async function(it){
  const { data,error } = await supabaseClient.from('inventory').update({
    name: it.name || '',
    category: it.category || '',
    buy_price: it.buyPrice || 0,
    qty: it.qty || 0,
    min_qty: it.minQty || 0,
    supplier: it.supplier || ''
  }).eq('item_code', it.id).select();
  if(error){ console.error('UPDATE INVENTORY ERROR:', error); }
  return {data,error};
};
window.deleteInventoryFromSupabase = async function(id){
  const { data,error } = await supabaseClient.from('inventory').delete().eq('item_code', id).select();
  if(error){ console.error('DELETE INVENTORY ERROR:', error); }
  return {data,error};
};
window.loadInventoryFromSupabase = async function(){
  const { data,error } = await supabaseClient.from('inventory').select('*');
  if(error){ console.error('LOAD INVENTORY ERROR:', error); return; }
  if(!data || !data.length){ console.warn('inventory: no rows from Supabase, keeping local data'); return; }
  DB.inventory = data.map(r => ({
    id: r.item_code || r.id,
    name: r.name || '',
    category: r.category || '',
    buyPrice: Number(r.buy_price)||0,
    qty: Number(r.qty)||0,
    minQty: Number(r.min_qty)||0,
    supplier: r.supplier || ''
  }));
  console.log('✅ Inventory Loaded:', DB.inventory.length);
};

/* =========================
   SETTINGS (هوية النظام) — صف واحد id='main' يخزّن كل الإعدادات
========================= */
window.saveSettingsToSupabase = async function(){
  const { data,error } = await supabaseClient.from('app_settings')
    .upsert({ id:'main', data: DB.settings || {}, updated_at: new Date().toISOString() }, { onConflict:'id' })
    .select();
  if(error){ console.error('SETTINGS SAVE ERROR:', error); }
  return {data,error};
};
window.loadSettingsFromSupabase = async function(){
  const { data,error } = await supabaseClient.from('app_settings')
    .select('data').eq('id','main').maybeSingle();
  if(error){ console.error('LOAD SETTINGS ERROR:', error); return; }
  if(data && data.data && typeof data.data==='object'){
    DB.settings = Object.assign({}, DB.settings, data.data);
    if(typeof applyBranding==='function') applyBranding();
    console.log('✅ Settings Loaded from Supabase');
  }
};

/* ============================================================
   ☁️ FULL-STATE CLOUD SYNC — طبقة مزامنة مركزية شاملة
   تحفظ كامل قاعدة البيانات (كل الكيانات: معامل/موظفين/مصروفات/
   خدمات/باقات/حملات/إشعارات/رسائل/وسائل دفع... وأي شيء يُضاف لاحقاً)
   في صف واحد JSON. مرتبطة تلقائياً بـ saveDB() فأي تغيير يتزامن فوراً.
   - يحفظ بأسلوب debounce لتقليل الطلبات.
   - الجداول المنفصلة (patients/cases/...) تبقى كطبقة منظَّمة إضافية.
============================================================ */
let _cloudTimer = null;
let _suspendCloudSync = false;

window.cloudSaveState = function(){
  if(_suspendCloudSync) return;
  if(typeof DB === 'undefined') return;
  clearTimeout(_cloudTimer);
  _cloudTimer = setTimeout(async ()=>{
    try{
      const payload = JSON.parse(JSON.stringify(DB));   // نسخة كاملة من الحالة
      const { error } = await supabaseClient
        .from('app_state')
        .upsert({ id:'main', data: payload, updated_at: new Date().toISOString() }, { onConflict:'id' });
      if(error){ console.error('CLOUD SAVE ERROR:', error); }
      else { console.log('☁️ State synced to cloud'); }
    }catch(e){ console.error('CLOUD SAVE EXCEPTION:', e); }
  }, 800);
};

window.loadStateFromSupabase = async function(){
  try{
    const { data, error } = await supabaseClient
      .from('app_state')
      .select('data')
      .eq('id','main')
      .maybeSingle();
    if(error){ console.error('LOAD STATE ERROR:', error); return false; }
    if(data && data.data && typeof data.data === 'object'){
      _suspendCloudSync = true;
      try{
        Object.assign(DB, data.data);
        if(typeof ensureDefaults === 'function') ensureDefaults();
        if(typeof saveDB === 'function') saveDB();        // مرآة محلية (لن تُعيد الرفع لأن المزامنة موقوفة)
      } finally { _suspendCloudSync = false; }
      if(typeof applyBranding === 'function') applyBranding();
      console.log('✅ Full state loaded from cloud');
      return true;
    }
    return false;
  }catch(e){ console.error('LOAD STATE EXCEPTION:', e); return false; }
};

/* =========================
   BOOT LOADER — يُستدعى بعد تسجيل الدخول
   1) يحاول تحميل اللقطة الكاملة (app_state) — مصدر الحقيقة.
   2) لو غير موجودة (أول مرة): يحمّل من الجداول المنظَّمة ثم يصنع لقطة.
========================= */
window.loadAllFromSupabase = async function(){
  try{
    const hadSnapshot = await window.loadStateFromSupabase();
    if(!hadSnapshot){
      // أول تشغيل: اجمع ما في الجداول المنظَّمة ثم ازرع اللقطة
      await window.loadSettingsFromSupabase();
      await window.loadPatientsFromSupabase();
      await window.loadDoctorsFromSupabase();
      await window.loadAppointmentsFromSupabase();
      await window.loadPartnersFromSupabase();
      await window.loadPaymentsFromSupabase();
      await window.loadCasesFromSupabase();
      await window.loadInvoicesFromSupabase();
      await window.loadInventoryFromSupabase();
      if(typeof cloudSaveState === 'function') cloudSaveState();   // ازرع اللقطة الأولى
    }
    if(typeof saveDB === 'function') saveDB();
    if(typeof applyBranding === 'function') applyBranding();
    if(typeof renderAllPages === 'function') renderAllPages();
    if(typeof updateBadges === 'function') updateBadges();
    console.log('✅ All data loaded from Supabase');
  }catch(e){
    console.error('LOAD ALL ERROR:', e);
  }
};
