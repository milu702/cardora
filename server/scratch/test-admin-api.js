const axios = require('axios');

async function testApi() {
  try {
    // 1. Login as admin
    console.log('Logging in as admin...');
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@cardora.com',
      password: 'admin123'
    });
    console.log('Login Response success:', loginRes.data.success);
    const token = loginRes.data.token;
    console.log('User Role from login:', loginRes.data.user?.role);

    // 2. Call /api/admin/users
    const usersRes = await axios.get('http://localhost:5000/api/admin/users', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Admin Users count:', usersRes.data.count);
    console.log('Admin Users list:', usersRes.data.users?.map(u => ({ id: u._id, name: u.name, email: u.email, role: u.role })));

    // 3. Call /api/admin/executive-kpis
    const kpiRes = await axios.get('http://localhost:5000/api/admin/executive-kpis', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('KPIs:', kpiRes.data.kpis);

  } catch (err) {
    console.error('API Error:', err.response?.data || err.message);
  }
}

testApi();
