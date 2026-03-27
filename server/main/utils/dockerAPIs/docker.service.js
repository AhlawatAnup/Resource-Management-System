const API_KEY =process.env.X_API_KEY;
async function stopUser(ip, port, user) {
  const baseUrl = `http://${ip}:${port}`;
  const res = await fetch(`${baseUrl}/stop/${user}`, {
    method: "POST",
    headers: { "x-api-key": API_KEY },
  });
  return res.json();
}

async function deleteUser(ip, port, user) {
  const baseUrl = `http://${ip}:${port}`;
  const res = await fetch(`${baseUrl}/user/${user}`, {
    method: "DELETE",
    headers: { "x-api-key": API_KEY },
  });
  return res.json();
}

async function startUser(ip, port, user) {
  const baseUrl = `http://${ip}:${port}`;
  const res = await fetch(`${baseUrl}/start/${user}`, {
    method: "POST",
    headers: { "x-api-key": API_KEY },
  });
  return res.json();
}

module.exports = { stopUser, deleteUser, startUser };