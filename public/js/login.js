

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const form = e.target;
  const btn = form.querySelector('button');
  const errEl = document.getElementById('error');

  const data = {
    email: form.email.value.trim(),
    password: form.password.value
  };

  
  btn.disabled = true;
  btn.textContent = 'Logging in...';
  errEl.textContent = '';

  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const body = await res.json();

    if (!res.ok) throw new Error(body.error || 'Login failed');

    
    window.location.href = '/profile.html';
  } catch (err) {
    
    errEl.textContent = err.message;
    btn.disabled = false;
    btn.textContent = 'Login';
  }
});

