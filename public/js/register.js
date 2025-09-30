

document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const form = e.target;
  const btn = form.querySelector('button'); 
  const errEl = document.getElementById('error');

  const data = {
    name: form.name.value.trim(),
    email: form.email.value.trim(),
    password: form.password.value,
    age: form.age.value,
    dob: form.dob.value,
    phone: form.phone.value.trim()
  };

  
  errEl.textContent = '';
  btn.disabled = true;
  btn.textContent = 'Registering...';

  try {
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const body = await res.json();

    if (!res.ok) throw new Error(body.error || 'Registration failed');

    
    window.location.href = '/profile.html';
  } catch (err) {
    
    errEl.textContent = err.message;
    btn.disabled = false;
    btn.textContent = 'Register';
  }
});
