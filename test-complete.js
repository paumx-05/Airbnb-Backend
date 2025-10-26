const http = require('http');

function registerUser() {
  const data = JSON.stringify({
    email: 'test@example.com',
    password: 'password123',
    name: 'Test User'
  });

  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/register',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  const req = http.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
      console.log('Register Response:', res.statusCode);
      console.log('Register Body:', body);
      
      if (res.statusCode === 201) {
        console.log('✅ Usuario registrado, ahora probando forgot-password...');
        testForgotPassword();
      }
    });
  });

  req.on('error', (e) => {
    console.error('Register Error:', e.message);
  });

  req.write(data);
  req.end();
}

function testForgotPassword() {
  const data = JSON.stringify({
    email: 'test@example.com'
  });

  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/forgot-password',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  const req = http.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
      console.log('Forgot Response:', res.statusCode);
      console.log('Forgot Body:', body);
    });
  });

  req.on('error', (e) => {
    console.error('Forgot Error:', e.message);
  });

  req.write(data);
  req.end();
}

console.log('🧪 Registrando usuario y probando forgot-password...');
registerUser();
