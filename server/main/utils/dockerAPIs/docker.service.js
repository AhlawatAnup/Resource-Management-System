const API_KEY = process.env.X_API_KEY;

async function stopUser(baseUrl, user, retries = 3) {
  try {
    const res = await fetch(`${baseUrl}/stop/${user}`, {
      method: 'POST',
      headers: {
        'x-api-key': API_KEY,
      },
    });

    // API LEVEL FAILURE
    if (!res.ok) {
      throw new Error(`HTTP Error: ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    // NO RETRIES LEFT
    if (retries === 0) {
      // throw new Error(`Error at Stop Machine.. Unable to Fetch. ${error.message}`);
      console.log('Error... At Stop Machine : No retries Left');
      return 'Failed';
    }

    console.log(`Retrying stopUser... Attempts left: ${retries}`);

    // WAIT 10 SECONDS
    await new Promise((resolve) => setTimeout(resolve, 10000));

    // RETRY
    return stopUser(baseUrl, user, retries - 1);
  }
}

async function deleteUser(baseUrl, user, retries = 3) {
  try {
    const res = await fetch(`${baseUrl}/user/${user}`, {
      method: 'DELETE',
      headers: {
        'x-api-key': API_KEY,
      },
    });

    // CHECK FOR HTTP ERRORS
    if (!res.ok) {
      throw new Error(`HTTP Error: ${res.status}`);
    }

    // RETURN RESPONSE
    return await res.json();
  } catch (error) {
    // IF NO RETRIES LEFT
    if (retries === 0) {
      // throw new Error(`Delete User Failed After Multiple Retries. ${error.message}`);
      console.log('Error... At Delete Machine : No retries Left');
      return 'Failed';
    }

    console.log(`Retrying deleteUser... Attempts left: ${retries}`);

    // WAIT FOR 10 SECONDS
    await new Promise((resolve) => setTimeout(resolve, 10000));

    // RETRY AGAIN
    return deleteUser(baseUrl, user, retries - 1);
  }
}

async function startUser(baseUrl, user, retries = 3) {
  try {
    const res = await fetch(`${baseUrl}/start/${user}`, {
      method: 'POST',
      headers: {
        'x-api-key': API_KEY,
      },
    });

    // CHECK FOR HTTP ERRORS
    if (!res.ok) {
      throw new Error(`HTTP Error: ${res.status}`);
    }

    // RETURN RESPONSE
    return await res.json();
  } catch (error) {
    // IF NO RETRIES LEFT
    if (retries === 0) {
      // throw new Error(`Start User Failed After Multiple Retries. ${error.message}`);
      console.log('Error... At Start Machine : No retries Left');
      return 'Failed';
    }

    console.log(`Retrying startUser... Attempts left: ${retries}`);

    // WAIT FOR 10 SECONDS
    await new Promise((resolve) => setTimeout(resolve, 10000));

    // RETRY AGAIN
    return startUser(baseUrl, user, retries - 1);
  }
}

async function machineStats(baseUrl) {
  const res = await fetch(`${baseUrl}/stats`, {
    method: 'GET',
    headers: { 'x-api-key': API_KEY },
  });
  return res.json();
}

module.exports = { stopUser, deleteUser, startUser, machineStats };
