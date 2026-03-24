// service.js

// ---------------- FETCH MACHINES ----------------
export async function fetchMachines() {
  const resp = await fetch('/dashboard/admin/machines', {
    credentials: 'include'
  });

  if (!resp.ok) {
    throw new Error('Failed to load machines');
  }

  return resp.json();
}


// ---------------- UPLOAD CSV ----------------
export async function uploadMachinesCSV(formData) {
  const resp = await fetch('/dashboard/admin/upload-machines', {
    method: 'POST',
    body: formData,
    credentials: 'include'
  });

  const json = await resp.json();

  if (!resp.ok) {
    throw new Error(json.error || resp.statusText);
  }

  return json;
}


// ---------------- DELETE MACHINE ----------------
export async function deleteMachine(id) {
  const resp = await fetch(`/dashboard/admin/machines/${id}`, {
    method: 'DELETE',
    credentials: 'include'
  });

  if (!resp.ok) {
    const txt = await resp.text();
    throw new Error(txt || resp.statusText);
  }

  return true;
}


// ---------------- UPDATE MACHINE ----------------
// export async function updateMachine(id, data) {
//   const resp = await fetch(`/dashboard/admin/machines/${id}`, {
//     method: 'PUT',
//     credentials: 'include',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify(data)
//   });

//   if (!resp.ok) {
//     const txt = await resp.text();
//     throw new Error(txt || resp.statusText);
//   }

//   return true;
// }


// ---------------- CREATE MACHINE ----------------
export async function createMachine(data) {
  const resp = await fetch('/dashboard/admin/create-machine', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  const json = await resp.json();

  if (!resp.ok) {
    throw new Error(json.error || resp.statusText);
  }

  return json;
}


// ---------------- REVOKE ASSIGNMENT ----------------
export async function updateMachineAvailability(id, data) {
  const resp = await fetch(`/dashboard/admin/machines/${id}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  if (!resp.ok) {
    const txt = await resp.text().catch(() => null);
    throw new Error(txt || resp.statusText);
  }

  return true;
}