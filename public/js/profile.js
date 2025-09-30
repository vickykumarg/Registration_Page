
async function loadProfile() {
  const errEl = document.getElementById('error');
  errEl.textContent = '';
  try {
    const res = await fetch('/api/profile');
    if (res.status === 401) {
      window.location.href = '/login.html';
      return;
    }
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Could not fetch profile');

    
    document.getElementById('profileName').textContent = data.name || '';

    document.getElementById('email').textContent = data.email || '';
    document.getElementById('age').textContent = data.age ?? '';

    if (data.dob) {
      const dobDate = new Date(data.dob);
      const day = String(dobDate.getDate()).padStart(2, '0');
      const month = String(dobDate.getMonth() + 1).padStart(2, '0'); // Months are 0-based
      const year = dobDate.getFullYear(); // full year
      document.getElementById('dob').textContent = `${day}/${month}/${year}`;
    } else {
      document.getElementById('dob').textContent = '';
    }


    document.getElementById('phone').textContent = data.phone || '';

  } catch (err) {
    errEl.textContent = err.message;
  }
}


document.getElementById('logoutBtn').addEventListener('click', async () => {
  const btn = document.getElementById('logoutBtn');
  btn.disabled = true;
  btn.textContent = 'Logging out...';
  const errEl = document.getElementById('error');
  errEl.textContent = '';

  try {
    const res = await fetch('/api/logout', { method: 'POST' });
    if (!res.ok) throw new Error('Logout failed');
    window.location.href = '/login.html';
  } catch (err) {
    errEl.textContent = err.message;
    btn.disabled = false;
    btn.textContent = 'Logout';
  }
});


const modal = document.getElementById('updateModal');
const updateBtn = document.getElementById('updateBtn');
const cancelBtn = document.getElementById('cancelBtn');
const updateForm = document.getElementById('updateForm');
const updateError = document.getElementById('updateError');

updateBtn.addEventListener('click', async () => {
  
  const res = await fetch('/api/profile');
  const data = await res.json();
  updateForm.name.value = data.name || '';
  updateForm.age.value = data.age ?? '';
  updateForm.dob.value = data.dob ? data.dob.split('T')[0] : '';
  updateForm.phone.value = data.phone || '';

  modal.style.display = 'block';
});

cancelBtn.addEventListener('click', () => {
  modal.style.display = 'none';
  updateError.textContent = '';
});

updateForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = updateForm.querySelector('button[type="submit"]');
  btn.disabled = true;
  btn.textContent = 'Saving...';
  updateError.textContent = '';

  const data = {
    name: updateForm.name.value.trim(),
    age: updateForm.age.value,
    dob: updateForm.dob.value,
    phone: updateForm.phone.value.trim()
  };

  try {
    const res = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const body = await res.json();
    if (!res.ok) throw new Error(body.error || 'Update failed');

    
    await loadProfile();
    modal.style.display = 'none';
  } catch (err) {
    updateError.textContent = err.message;
  } finally {
    btn.disabled = false;
    btn.textContent = 'Save';
  }
});


window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = 'none';
    updateError.textContent = '';
  }
};

loadProfile();


