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
    id: a.id,
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
   BOOT LOADER (اختياري — Phase 4)
   استدعِها بعد تسجيل الدخول لتحميل الكيانات الأساسية من Supabase.
========================= */
window.loadAllFromSupabase = async function(){
  try{
    await window.loadPatientsFromSupabase();
    await window.loadDoctorsFromSupabase();
    await window.loadAppointmentsFromSupabase();
    await window.loadPartnersFromSupabase();
    if(typeof saveDB === 'function') saveDB();       // تحديث نسخة localStorage الاحتياطية
    if(typeof renderAllPages === 'function') renderAllPages();
    if(typeof updateBadges === 'function') updateBadges();
    console.log('✅ All core entities loaded from Supabase');
  }catch(e){
    console.error('LOAD ALL ERROR:', e);
  }
};
