export async function fetchTeacherFromDB() {
  const response = await fetch('/dashboard/teacher/data');
  if (!response.ok) {
    throw new Error('error in fetching students!');
  }

  const data = await response.json();
  return data;
}
