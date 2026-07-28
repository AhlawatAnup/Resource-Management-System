require('dotenv').config();
const sendEmail = require('../utils/email/sendEmail.js');
const students = require('../database/studentModel.js');
const { feedback_template } = require('./templates/feedback.template.js');
const { invitation_template } = require('./templates/invitation.template.js');
const { vscode_init_template } = require('./templates/vscode.announcement.js');
const connectDB = require('../database/db.js');

connectDB();
const feedback_sub = '[FEEDBACK] Complete Your Annual GPU Resource Feedback Form';
const invitation_sub =
  'Invitation to Interact with Intel Unnati Labs Team | 23 July 2026 | U.I.E.T Cloud AI Data Center';

const VS_CODE_SUBJECT = '';

async function mail_feedback() {
  try {
    const studentsData = await students.find({});

    // console.log(allStudents);
    let i = 0;
    for (const student of studentsData) {
      console.log(student.email);
      // continue;
      await sendEmail({
        to: student.email,
        subject: '[FEEDBACK]: Complete Your Annual GPU Resource Feedback Form',
        html: feedback_template(student.name, process.env.GOOGLE_FORM_LINK),
      });
      i = i + 1;
      console.log('Sent', i, '/', studentsData.length, 'mails');
    }
    console.log('sent emails!');
  } catch (error) {
    console.log('error in fetching emails: ', error);
  }
}

// MAIL TO STUDENTS
async function mail_invitation() {
  try {
    const studentsData = await students.find({});

    // console.log(allStudents);
    let i = 0;
    for (const student of studentsData) {
      console.log(student.email);
      // continue;
      await sendEmail({
        to: student.email,
        subject: invitation_sub,
        html: invitation_template(student.name, process.env.GOOGLE_FORM_LINK),
      });
      i = i + 1;
      console.log('Sent', i, '/', studentsData.length, 'mails');
    }
    console.log('sent emails!');
  } catch (error) {
    console.log('error in fetching emails: ', error);
  }
}

// MAIL TO STUDENTS
async function mail_vscode_announcement() {
  try {
    const studentsData = await students.find({});

    // console.log(allStudents);
    let i = 0;
    for (const student of studentsData) {
      console.log(student.email);
      // continue;
      await sendEmail({
        to: student.email,
        subject: VS_CODE_SUBJECT,
        html: vscode_init_template(student.name, process.env.VS_CODE_MANUAL),
      });
      i = i + 1;
      console.log('Sent', i, '/', studentsData.length, 'mails');
    }
    console.log('sent emails!');
  } catch (error) {
    console.log('error in fetching emails: ', error);
  }
}

// mail_invitation();
mail_vscode_announcement();
