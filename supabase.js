const SUPABASE_URL = "https://qpwytgrmnmqfhqnywpqc.supabase.co";

const SUPABASE_ANON_KEY =
  "sb_publishable_yiTw8107zHfpmzKN9OcIMg_tdH2hG_e";

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

console.log("✅ Supabase Connected");

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
    }]);

  if(error) console.error('PATIENT ERROR:', error);

  return {data,error};
};

window.loadPatientsFromSupabase = async function(){

  const { data, error } = await supabaseClient
    .from('patients')
    .select('*')
    .order('created_at',{ascending:false});

  if(error){
    console.error(error);
    return;
  }

  DB.patients = (data || []).map(p => ({
    id: p.patient_code || p.id,
    name: p.fu    name: p.fu    name: p.fu    name: p.fu    name: p.fu    nam| '    name: p.fuob: p.birth_    name: p.fu    name: p.fu    name: p.fu    namss:     name: p.fu    name: p.fu    name: p.fu cre    name: p.fute    name: p.fu    
  console.log('Patients Loaded:', DB.patients.length);
};

window.saveDoctorToSupabase = async function(doc){

  const { error } = await supabaseClie  const { error } =rs')
    .insert([    .insert([    .insert(id,
      full_name: doc.name,
      specialty: doc.specialty || '',
      commission: doc.ratio || 0
    }]);

  if(error) console.error('DOCTOR ERROR:', error);
};

window.loadDoctorsFromSupabase = async function(){

  const { data,error } = await supabaseClient
    .from('doctors')
    .select('*');

  if(error){
    console.error(error);
    return;
  }

  DB.doctors = (data || []).map(d => ({
    id: d.doctor_code || d.id,
    name: d.full_name || '',
    specialty: d.specialty || '',
    ratio: d.commission || 0,
    paid: 0
  })  })  })  })  })  })  })  }Loade  })  })  })  })  })  })  })  }Loade  })  })  })  })  })  })  })  }Loade  })  })  })  })  })  })  })  }Loade  })  })  })  })  })  })  })  }Loade  })  })  })  })  })  })  })  }Loade  })  })  })  })  })  })  })  }Loade  })  })  })  })  })      })  })  })  })  })  })  })  }Loade  })  })  })  })  appt.  })  })  })  })  })  })  })  }Loade  })     notes:   })  })  })  })  })  })  })  }Loade  })  })  })  })  })  }     })  })  })  })  })  })  })  }Loade  })TM  })  })  })  })  })  }) wi  })  })  })  })  })  })  })  }Le = as  })  })  })  })  })  })  })  a,e  }) } = a  })  })  })  })  })  })  })  }Loade  })  })  })  .sele  })  })  })  })  })  })  })  }Loade  })  })  };
                                           || [])                   :                 tId: a.patient_i                   doctor_id,
    date: a.a    date: a.a    date: a.a    date:tment_time,
    type: a.treatment_ty    type: a.treatment_ty| '',    type: a.treatment_|| 'scheduled'
  }));

  console.log('Appointments Loaded:', DB.appointments.length);
};
