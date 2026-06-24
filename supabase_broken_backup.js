const SUPABASE_URL = "https://qpwytgrmnmqfhqnywpqc.supabase.co";

const SUPABASE_ANON_KEY =
  "sb_publishable_yiTw8107zHfpmzKN9OcIMg_tdH2hG_e";

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

console.log("✅ Supabase Connected");

async function testConnection() {
  try {
    const { data, error } = await supabaseClient
      .from("patients")
      .select("*")
      .limit(1);

    console.log("DATA:", data);
    console.log("ERROR:", error);
  } catch (err) {
    console.error("CONNECTION ERROR:", err);
  }
}

async function testInsert() {

const { data, error } = await supabaseClient
.from('patients')
.insert([
{
patient_code: 'TEST001',
full_name: 'اختبار النظام',
phone: '0500000000',
gender: 'ذكر',
birth_date: '1990-01-01',
notes: 'تم الإدخال من Supabase'
}
])
.select();

console.log('DATA:', data);
console.log('ERROR:', error);
}



window.savePatientToSupabase = async function(patient){

  const { data, error } = await supabaseClient
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

  console.log('SUPABASE PATIENT:', data);

  if(error){
    console.error('SUPABASE ERROR:', error);
  }

  return {data,error};
};


window.loadPatientsFromSupabase = async function(){

  const { data, error } = await supabaseClient
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

  if(typeof refreshPage === 'function'){
    refreshPage('patients');
    refreshPage('dashboard');
  }
};


window.saveDoctorToSupabase = async function(doc){

  const { error } = await supabaseClient
    .from('doctors')
    .insert([{
      doctor_code: doc.id,
      full_name: doc.name,
      phone: doc.phone || '',
      specialty: doc.specialty || '',
      commission: doc.ratio || 0
    }]);

  if(error) console.error('DOCTOR ERROR:', error);
};

window.saveAppointmentToSupabase = async function(appt){

  const { error } = await supabaseClient
    .from('appointments')
    .insert([{
      patient_id: appt.patientId,
      doctor_id: appt.doctorId,
      appointment_date: appt.date,
      appointment_time: appt.time,
      treatment_type: appt.type,
      notes: appt.notes || '',
      status: appt.status || 'scheduled'
    }]);

  if(error) console.error('APPOINTMENT ERROR:', error);
};

window.loadDoctorsFromSupabase = async function(){

  const { data,error } = await supabaseClient
    .from('doctors')
    .select('*');

  if(error) return console.error(error);

  DB.doctors = (  DB.doctors = (  DB.doct     DB.doctors = (  DB.doctors = (  DB.doct     DB.
                                       : d.                         o: d.commission || 0,
    paid: 0
  })  })  })  })  })  })  }ntmentsFromSupabase = async function(){

  const { data,error } = await   const { data,error } = await ntments')
    .select('*');

  if(error) return console.error(error  if(error) return console.error(error  if(error) retur: a  if(error) return console.error(err  doc  if(error) return consoda  if(error) rme  if(error) return console.error_time,
    type: a.treatment_type,    type: a.treatment_type,    t a.status
  }));
};

