// register.js
// Handles client-side registration flow
const form = document.getElementById('registerForm');
const msg = document.getElementById('message');
const success = document.getElementById('success');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  msg.style.display = 'none';
  success.style.display = 'none';

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const confirm = document.getElementById('confirmPassword').value;

  if (!username || !password) {
    msg.textContent = 'Username and password are required.';
    msg.style.display = 'block';
    return;
  }
  if (password !== confirm) {
    msg.textContent = 'Passwords do not match.';
    msg.style.display = 'block';
    return;
  }

  try {
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    if (res.status === 201) {
      success.textContent = 'Account created. Redirecting to login...';
      success.style.display = 'block';
      // small delay so user sees success
      setTimeout(() => {
        window.location.href = '/Login.html';
      }, 900);
      return;
    }

    const body = await res.json();
    msg.textContent = body && body.error ? body.error : 'Registration failed';
    msg.style.display = 'block';
  } catch (err) {
    msg.textContent = 'Network error';
    msg.style.display = 'block';
    console.error(err);
  }
});