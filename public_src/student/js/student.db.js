async function fetchStudentFromDB() {
  const response = await fetch('/dashboard/student/student_data');
  if (!response.ok) {
    throw new Error('error in fetching students!');
  }

  const data = await response.json();
  return data;
}

module.exports = { fetchStudentFromDB };
