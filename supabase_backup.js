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

testInsert();
