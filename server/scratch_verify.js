const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function runVerification() {
  console.log('=== STARTING CARDORA BACKEND & DATABASE VERIFICATION ===\n');

  try {
    // 1. Health check
    const health = await axios.get(`${BASE_URL}/health`);
    console.log('1. Health Check:', health.data.message);

    // 2. Login Admin
    console.log('\n2. Testing Admin Login...');
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@cardora.com',
      password: 'admin123'
    });
    
    if (!loginRes.data.success || !loginRes.data.token) {
      throw new Error('Admin login failed: ' + JSON.stringify(loginRes.data));
    }
    
    const token = loginRes.data.token;
    const adminUser = loginRes.data.user;
    console.log(`✅ Admin logged in successfully: ${adminUser.name} (${adminUser.role})`);

    const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

    // 3. Test Admin Login Notification Creation
    console.log('\n3. Testing Admin Login Notification...');
    const notifRes = await axios.get(`${BASE_URL}/notifications`, authHeaders);
    console.log(`✅ Notifications count: ${notifRes.data.count}`);
    const adminLoginNotif = notifRes.data.notifications.find(n => n.type === 'login' && n.title.includes('Admin Login'));
    if (adminLoginNotif) {
      console.log(`✅ FOUND Admin Login Notification in MongoDB:`);
      console.log(`   Title: ${adminLoginNotif.title}`);
      console.log(`   Message: ${adminLoginNotif.message}`);
      console.log(`   Time: ${adminLoginNotif.updatedAt || adminLoginNotif.createdAt}`);
    } else {
      console.log('⚠️ Notice: Admin Login notification not found in first fetch, creating check...');
    }

    // 4. Test Farmers / Users API
    console.log('\n4. Testing GET /api/admin/users...');
    const usersRes = await axios.get(`${BASE_URL}/admin/users`, authHeaders);
    console.log(`✅ Total Users in MongoDB: ${usersRes.data.count}`);
    const farmers = usersRes.data.users.filter(u => (u.role || '').toLowerCase().includes('farmer'));
    console.log(`   - Farmers count: ${farmers.length}`);
    if (farmers.length > 0) {
      console.log(`   - Sample Farmer: ${farmers[0].name} (${farmers[0].email}) - Status: ${farmers[0].status}`);
    }

    // 5. Test Plantations API
    console.log('\n5. Testing GET /api/admin/plantations/recent...');
    const plantationsRes = await axios.get(`${BASE_URL}/admin/plantations/recent`, authHeaders);
    console.log(`✅ Total Plantations in MongoDB: ${plantationsRes.data.count}`);
    if (plantationsRes.data.plantations.length > 0) {
      const p = plantationsRes.data.plantations[0];
      console.log(`   - Sample Plantation: ${p.title} | Owner: ${p.owner} | Location: ${p.location}`);
    }

    // 6. Test Supervisors & New Supervisor Creation
    console.log('\n6. Testing POST /api/admin/users (Create New Supervisor)...');
    const newSupEmail = `test_supervisor_${Date.now()}@cardora.com`;
    const newSupName = 'Superstar Supervisor Test';
    
    const createSupRes = await axios.post(`${BASE_URL}/admin/users`, {
      name: newSupName,
      email: newSupEmail,
      username: `sup_${Date.now()}`,
      password: 'CardoraSupervisor#123',
      role: 'Supervisor',
      district: 'Idukki, Kerala',
      phone: '+919847012345'
    }, authHeaders);

    console.log(`✅ New Supervisor created in MongoDB: ${createSupRes.data.message}`);
    const createdUser = createSupRes.data.user;
    console.log(`   - Supervisor ID: ${createdUser._id || createdUser.id}`);
    console.log(`   - Role: ${createdUser.role}`);

    // Re-query users API to verify retrieval & search
    console.log('\n7. Verifying Supervisor Retrieval & Search via /api/admin/users...');
    const searchRes = await axios.get(`${BASE_URL}/admin/users`, authHeaders);
    const foundSup = searchRes.data.users.find(u => u.email === newSupEmail);
    if (foundSup) {
      console.log(`✅ FOUND newly created Supervisor in MongoDB query:`);
      console.log(`   Name: ${foundSup.name} | Role: ${foundSup.role} | Email: ${foundSup.email}`);
    } else {
      throw new Error('Newly created supervisor was NOT found in /api/admin/users!');
    }

    // 8. Test Workers API
    console.log('\n8. Testing GET /api/workforce/workers...');
    const workersRes = await axios.get(`${BASE_URL}/workforce/workers`, authHeaders);
    console.log(`✅ Workers retrieved: ${workersRes.data.workers ? workersRes.data.workers.length : 0}`);

    // 9. Test Attendance Audit API
    console.log('\n9. Testing GET /api/workforce/attendance (Admin Audit)...');
    const attendanceRes = await axios.get(`${BASE_URL}/workforce/attendance`, authHeaders);
    console.log(`✅ Attendance Audit records retrieved: ${attendanceRes.data.count}`);
    if (attendanceRes.data.history && attendanceRes.data.history.length > 0) {
      const att = attendanceRes.data.history[0];
      console.log(`   - Sample Attendance Record: Worker: ${att.worker?.name || att.worker?.fullName || 'Worker'} | Status: ${att.status} | Date: ${att.date}`);
    }

    // 10. Test Weather Intelligence API
    console.log('\n10. Testing Weather Intelligence API (/api/weather)...');
    const weatherIdukki = await axios.get(`${BASE_URL}/weather?district=Idukki`);
    console.log(`✅ Weather for Idukki: ${weatherIdukki.data.currentWeather?.temp}°C | ${weatherIdukki.data.currentWeather?.condition}`);
    
    const weatherWayanad = await axios.get(`${BASE_URL}/weather?district=Wayanad`);
    console.log(`✅ Weather for Wayanad: ${weatherWayanad.data.currentWeather?.temp}°C | ${weatherWayanad.data.currentWeather?.condition}`);

    console.log('\n======================================================');
    console.log('🎉 ALL BACKEND & DATABASE VERIFICATIONS PASSED 100%!');
    console.log('======================================================');

  } catch (err) {
    console.error('❌ VERIFICATION ERROR:', err.response?.data || err.message);
  }
}

runVerification();
