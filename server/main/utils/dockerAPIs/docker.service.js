const API_KEY = process.env.X_API_KEY;

async function stopUser(baseUrl, user) {
  const res = await fetch(`${baseUrl}/stop/${user}`, {
    method: 'POST',
    headers: { 'x-api-key': API_KEY },
  });
  return res.json();
}

async function deleteUser(baseUrl, user) {
  const res = await fetch(`${baseUrl}/user/${user}`, {
    method: 'DELETE',
    headers: { 'x-api-key': API_KEY },
  });
  return res.json();
}

async function startUser(baseUrl, user) {
  const res = await fetch(`${baseUrl}/start/${user}`, {
    method: 'POST',
    headers: { 'x-api-key': API_KEY },
  });
  return res.json();
}

async function machineStats(baseUrl) {
  const res = await fetch(`${baseUrl}/stats`, {
    method: 'GET',
    headers: { 'x-api-key': API_KEY },
  });
  return res.json();
}

module.exports = { stopUser, deleteUser, startUser, machineStats };
