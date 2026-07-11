require('dotenv').config();
const sendEmail = require('../utils/email/sendEmail.js');
const students = require('../database/studentModel.js');
const { feedback_template } = require('./templates/feedback.template.js');
const connectDB = require('../database/db.js');

connectDB();

async function mailStudents() {
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

mailStudents();
