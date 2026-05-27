// ASK BARE MINIMUM INFORMATION
import * as constants from '../../constant.admin.js';
import { appendAllTeachers } from './dashboard.ui.js';

// THROW AN EVENT OF DASHBOARD_READY

// GET ALL TEACHER
async function getAllTeacher() {
  try {
    const response = await fetch(constants.GET_ALL_TEACHER);
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }

      throw new Error(`Failed to load dashboard data: ${response.status}`);
    }

    const data = await response.json();
    console.log(data);
    appendAllTeachers(data);
  } catch (error) {
    console.error('Error loading data:', error);
    // logout();
    return null;
  }
}

getAllTeacher();
