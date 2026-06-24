from pathlib import Path

p = Path("supabase.js")
txt = p.read_text(encoding="utf-8")

marker = "window.loadDoctorsFromSupabase"

idx = txt.find(marker)

if idx == -1:
    print("NOT FOUND")
    raise SystemExit

clean = txt[:idx]

clean += """

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

  console.log('Doctors Loaded:', DB.doctors.length);
};

window.loadAppointmentsFromSupabase = async function(){

  const { data,error } = await supabaseClient
    .from('appointments')
    .select('*');

  if(error){
    console.error('LOAD APPOINTMENTS ERROR:', error);
    return;
  }

  DB.appointm  DB.appointm   []).map(a => ({
    id: a.    id: a.    id: a.    ient_id,
    id: a.    id: a.  _id,
    date: a.appointment    date: a.appointment    date: ae,
    date: a.appointment    date: a.appoi.no    date: a.appointme: a.status || 'sc    date: a.appointmens    date: a.apntments Loaded:', DB.appointments.length);
};

"""

p.write_text(clean, encoding="utf-8")
print("DONE")
