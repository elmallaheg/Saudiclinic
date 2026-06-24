const SUPABASE_URL = "https://qpwytgrmnmqfhqnywpqc.supabase.co";

const SUPABASE_ANON_KEY =
"sb_publishable_yiTw8107zHfpmzKN9OcIMg_tdH2hG_e";

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

console.log("✅ Supabase Connected");

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
========================= */

window.saveDoctorToSupabase = async function(doc){

  const { data,error } = await supabaseClient
    .from('doctors')
    .insert([{
      doctor_code: doc.id,
      full_name: doc.name,
      phone: doc.phone || '',
      specialty: doc.specialty || '',
      commission: doc.ratio || 0
    }])
    .select();

  if(error){
    console.error('DOCTOR ERROR:', error);
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

  DB.doctors = (data || []).map(d => ({
    id: d.doctor_code || d.id,
    name: d.full_name || '',
    specialty: d.specialty || '',
    ratio: d.commission || 0,
    paid: 0
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