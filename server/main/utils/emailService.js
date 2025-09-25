const nodemailer = require('nodemailer');

// Create transporter with Gmail configuration
const createTransporter = () => {
  // Debug environment variables at transporter creation
  console.log('🔧 Creating email transporter...');
  console.log('EMAIL_USER available:', !!process.env.EMAIL_USER);
  console.log('EMAIL_PASS available:', !!process.env.EMAIL_PASS);
  
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('❌ Email credentials missing!');
    console.log('EMAIL_USER:', process.env.EMAIL_USER);
    console.log('EMAIL_PASS length:', process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 'undefined');
  }
  
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// ================== OTP VERIFICATION EMAIL ==================

// Send OTP verification email
const sendOTPEmail = async (email, otp, role) => {
  const transporter = createTransporter();
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Verify Your Email - UIET Cluster Resource Sharing',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2196F3;">🔐 Email Verification</h2>
        
        <p>Dear User,</p>
        
        <p>You are registering as a <strong>${role}</strong> for the UIET Cluster Resource Management System.</p>
        
        <div style="background-color: #f0f8ff; border: 2px solid #2196F3; padding: 25px; border-radius: 8px; margin: 25px 0; text-align: center;">
          <h3 style="color: #333; margin-top: 0;">Your Verification Code:</h3>
          <div style="font-size: 32px; font-weight: bold; color: #2196F3; letter-spacing: 5px; margin: 15px 0;">
            ${otp}
          </div>
          <p style="margin: 0; color: #666; font-size: 14px;">This code will expire in 5 minutes</p>
        </div>
        
        <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <strong>📋 Important Notes:</strong>
          <ul>
            <li>Do not share this OTP with anyone</li>
            <li>This code is valid for 5 minutes only</li>
            <li>Use this code to complete your registration</li>
            <li>If you didn't request this, please ignore this email</li>
          </ul>
        </div>
        
        <p>If you have any issues, please contact the IT support team.</p>
        
        <p>Best regards,<br>
        <strong>UIET Cluster Resource Management System</strong></p>
        
        <hr style="margin-top: 30px; border: none; border-top: 1px solid #eee;">
        <p style="font-size: 12px; color: #666;">
          This is an automated email. Please do not reply to this message.
        </p>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('OTP email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return { success: false, error: error.message };
  }
};

// ================== STUDENT REGISTRATION EMAILS ==================

// 1. Send email when student successfully registers
const sendStudentRegistrationSuccessEmail = async (studentEmail, studentName) => {
  const transporter = createTransporter();
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: studentEmail,
    subject: 'Registration Successful - Welcome to UIET Cluster Resource Sharing',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4CAF50;">🎉 Registration Successful!</h2>
        
        <p>Dear <strong>${studentName}</strong>,</p>
        
        <p>Welcome to the UIET Cluster Resource Management System! Your student account has been successfully created.</p>
        
        <div style="background-color: #e3f2fd; border: 1px solid #bbdefb; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <strong>📝 Next Steps:</strong>
          <ul>
            <li>Your profile is now pending verification by your assigned teacher</li>
            <li>Once verified by your teacher, an admin will provide final approval</li>
            <li>You will receive email notifications about your verification status</li>
            <li>After approval, you can start submitting resource requests</li>
          </ul>
        </div>
        
        <p>If you have any questions, please contact your supervisor or the IT support team.</p>
        
        <p>Best regards,<br>
        <strong>UIET Cluster Resource Management System</strong></p>
        
        <hr style="margin-top: 30px; border: none; border-top: 1px solid #eee;">
        <p style="font-size: 12px; color: #666;">
          This is an automated email. Please do not reply to this message.
        </p>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Student registration success email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending student registration success email:', error);
    return { success: false, error: error.message };
  }
};

// ================== STUDENT PROFILE VERIFICATION EMAILS ==================

// 2. Send email when student profile is verified by teacher
const sendStudentProfileVerifiedByTeacherEmail = async (studentEmail, studentName, teacherName) => {
  const transporter = createTransporter();
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: studentEmail,
    subject: 'Profile Verification Update - Teacher Approved',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4CAF50;">✅ Teacher Verification Complete!</h2>
        
        <p>Dear <strong>${studentName}</strong>,</p>
        
        <p>Great news! Your student profile has been verified by <strong>${teacherName}</strong>.</p>
        
        <div style="background-color: #e8f5e8; border: 1px solid #4CAF50; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Status:</strong> Teacher verification completed ✅</p>
          <p style="margin: 10px 0 0 0;"><strong>Next Step:</strong> Awaiting admin verification</p>
        </div>
        
        <p>Your profile is now pending final approval from the administrator. You will be notified once the admin completes the verification process.</p>
        
        <p>Best regards,<br>
        <strong>UIET Cluster Resource Management System</strong></p>
        
        <hr style="margin-top: 30px; border: none; border-top: 1px solid #eee;">
        <p style="font-size: 12px; color: #666;">
          This is an automated email. Please do not reply to this message.
        </p>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Student profile verified by teacher email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending student profile verified by teacher email:', error);
    return { success: false, error: error.message };
  }
};

// 3. Send email when student profile is rejected by teacher
const sendStudentProfileRejectedByTeacherEmail = async (studentEmail, studentName, teacherName) => {
  const transporter = createTransporter();
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: studentEmail,
    subject: 'Profile Verification Update - Teacher Review Required',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f44336;">📋 Profile Verification Update</h2>
        
        <p>Dear <strong>${studentName}</strong>,</p>
        
        <p>Your student profile has been reviewed by <strong>${teacherName}</strong>.</p>
        
        <div style="background-color: #ffebee; border: 1px solid #ffcdd2; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Status:</strong> Profile requires revision</p>
        </div>
        
        <div style="background-color: #e3f2fd; border: 1px solid #bbdefb; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <strong>📝 Next Steps:</strong>
          <ul>
            <li>Contact <strong>${teacherName}</strong> for specific feedback</li>
            <li>Review your profile information for accuracy</li>
            <li>Update any incorrect or missing information</li>
            <li>Resubmit your profile for verification</li>
          </ul>
        </div>
        
        <p>Please reach out to your teacher for guidance on resolving any issues with your profile.</p>
        
        <p>Best regards,<br>
        <strong>UIET Cluster Resource Management System</strong></p>
        
        <hr style="margin-top: 30px; border: none; border-top: 1px solid #eee;">
        <p style="font-size: 12px; color: #666;">
          This is an automated email. Please do not reply to this message.
        </p>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Student profile rejected by teacher email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending student profile rejected by teacher email:', error);
    return { success: false, error: error.message };
  }
};

// 4. Send email when student profile is verified by admin
const sendStudentProfileVerifiedByAdminEmail = async (studentEmail, studentName) => {
  const transporter = createTransporter();
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: studentEmail,
    subject: 'Profile Fully Verified - Access Granted!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4CAF50;">🎉 Profile Fully Verified!</h2>
        
        <p>Dear <strong>${studentName}</strong>,</p>
        
        <p>Congratulations! Your student profile has been fully verified by the administrator. You now have complete access to the UIET Cluster Resource Sharing system.</p>
        
        <div style="background-color: #e8f5e8; border: 1px solid #4CAF50; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Status:</strong> Profile Fully Verified ✅</p>
          <p style="margin: 10px 0 0 0;"><strong>Access Level:</strong> Full system access granted</p>
        </div>
        
        <div style="background-color: #e3f2fd; border: 1px solid #bbdefb; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <strong>� You can now:</strong>
          <ul>
            <li>Submit resource requests for cluster computing</li>
            <li>Access your dashboard and view request status</li>
            <li>Receive VM credentials when requests are approved</li>
            <li>Contact support for technical assistance</li>
          </ul>
        </div>
        
        <p>Welcome aboard! You can now start utilizing the cluster resources for your academic and research projects.</p>
        
        <p>Best regards,<br>
        <strong>UIET Cluster Resource Management System</strong></p>
        
        <hr style="margin-top: 30px; border: none; border-top: 1px solid #eee;">
        <p style="font-size: 12px; color: #666;">
          This is an automated email. Please do not reply to this message.
        </p>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Student profile verified by admin email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending student profile verified by admin email:', error);
    return { success: false, error: error.message };
  }
};

// 5. Send email when student profile is rejected by admin
const sendStudentProfileRejectedByAdminEmail = async (studentEmail, studentName) => {
  const transporter = createTransporter();
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: studentEmail,
    subject: 'Profile Verification Update - Admin Review',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f44336;">📋 Profile Verification Update</h2>
        
        <p>Dear <strong>${studentName}</strong>,</p>
        
        <p>Your student profile has been reviewed by the administrator.</p>
        
        <div style="background-color: #ffebee; border: 1px solid #ffcdd2; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Status:</strong> Profile requires admin review</p>
        </div>
        
        <div style="background-color: #e3f2fd; border: 1px solid #bbdefb; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <strong>📝 Next Steps:</strong>
          <ul>
            <li>Contact the IT support team for specific feedback</li>
            <li>Review your profile information thoroughly</li>
            <li>Ensure all documents and information are accurate</li>
            <li>Work with your teacher to address any concerns</li>
          </ul>
        </div>
        
        <p>Please contact the administrator or IT support team for guidance on resolving any issues with your profile.</p>
        
        <p>Best regards,<br>
        <strong>UIET Cluster Resource Management System</strong></p>
        
        <hr style="margin-top: 30px; border: none; border-top: 1px solid #eee;">
        <p style="font-size: 12px; color: #666;">
          This is an automated email. Please do not reply to this message.
        </p>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Student profile rejected by admin email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending student profile rejected by admin email:', error);
    return { success: false, error: error.message };
  }
};

// ================== RESOURCE REQUEST EMAILS ==================

// 6. Send email when resource request is successfully submitted by student
const sendResourceRequestSubmittedEmail = async (studentEmail, studentName, requestTitle) => {
  const transporter = createTransporter();
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: studentEmail,
    subject: 'Resource Request Submitted Successfully',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4CAF50;">📋 Resource Request Submitted!</h2>
        
        <p>Dear <strong>${studentName}</strong>,</p>
        
        <p>Your resource request "<strong>${requestTitle}</strong>" has been successfully submitted to the system.</p>
        
        <div style="background-color: #e8f5e8; border: 1px solid #4CAF50; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Status:</strong> Request submitted successfully ✅</p>
          <p style="margin: 10px 0 0 0;"><strong>Next Step:</strong> Awaiting teacher verification</p>
        </div>
        
        <div style="background-color: #e3f2fd; border: 1px solid #bbdefb; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <strong>📝 What happens next:</strong>
          <ul>
            <li>Your teacher will review and verify your request</li>
            <li>If approved by teacher, admin will provide final verification</li>
            <li>You will receive email updates about your request status</li>
            <li>Upon final approval, you'll receive VM access credentials</li>
          </ul>
        </div>
        
        <p>You can track the status of your request through your dashboard.</p>
        
        <p>Best regards,<br>
        <strong>UIET Cluster Resource Management System</strong></p>
        
        <hr style="margin-top: 30px; border: none; border-top: 1px solid #eee;">
        <p style="font-size: 12px; color: #666;">
          This is an automated email. Please do not reply to this message.
        </p>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Resource request submitted email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending resource request submitted email:', error);
    return { success: false, error: error.message };
  }
};

// 7. Send email when student resource request is verified by teacher
const sendResourceRequestVerifiedByTeacherEmail = async (studentEmail, studentName, requestTitle, teacherName) => {
  const transporter = createTransporter();
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: studentEmail,
    subject: 'Resource Request Update - Teacher Approved',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4CAF50;">✅ Teacher Approval Received!</h2>
        
        <p>Dear <strong>${studentName}</strong>,</p>
        
        <p>Great news! Your resource request "<strong>${requestTitle}</strong>" has been approved by <strong>${teacherName}</strong>.</p>
        
        <div style="background-color: #e8f5e8; border: 1px solid #4CAF50; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Status:</strong> Teacher verification completed ✅</p>
          <p style="margin: 10px 0 0 0;"><strong>Next Step:</strong> Awaiting admin approval for VM provisioning</p>
        </div>
        
        <p>Your request is now pending final approval from the administrator. Once approved, you will receive your VM access credentials.</p>
        
        <p>Best regards,<br>
        <strong>UIET Cluster Resource Management System</strong></p>
        
        <hr style="margin-top: 30px; border: none; border-top: 1px solid #eee;">
        <p style="font-size: 12px; color: #666;">
          This is an automated email. Please do not reply to this message.
        </p>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Resource request verified by teacher email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending resource request verified by teacher email:', error);
    return { success: false, error: error.message };
  }
};

// 8. Send email when student resource request is rejected by teacher
const sendResourceRequestRejectedByTeacherEmail = async (studentEmail, studentName, requestTitle, teacherName) => {
  const transporter = createTransporter();
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: studentEmail,
    subject: 'Resource Request Update - Teacher Review Required',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f44336;">📋 Resource Request Update</h2>
        
        <p>Dear <strong>${studentName}</strong>,</p>
        
        <p>Your resource request "<strong>${requestTitle}</strong>" has been reviewed by <strong>${teacherName}</strong>.</p>
        
        <div style="background-color: #ffebee; border: 1px solid #ffcdd2; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Status:</strong> Request requires revision</p>
        </div>
        
        <div style="background-color: #e3f2fd; border: 1px solid #bbdefb; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <strong>📝 Next Steps:</strong>
          <ul>
            <li>Contact <strong>${teacherName}</strong> for specific feedback</li>
            <li>Review your request details and requirements</li>
            <li>Revise your request based on teacher's guidance</li>
            <li>Resubmit your request for verification</li>
          </ul>
        </div>
        
        <p>Please reach out to your teacher to understand the specific concerns and how to address them.</p>
        
        <p>Best regards,<br>
        <strong>UIET Cluster Resource Management System</strong></p>
        
        <hr style="margin-top: 30px; border: none; border-top: 1px solid #eee;">
        <p style="font-size: 12px; color: #666;">
          This is an automated email. Please do not reply to this message.
        </p>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Resource request rejected by teacher email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending resource request rejected by teacher email:', error);
    return { success: false, error: error.message };
  }
};

// 9. Send email when student resource request is verified by admin (with VM credentials)
const sendResourceRequestVerifiedByAdminEmail = async (studentEmail, studentName, requestTitle, vmCredentials) => {
  const transporter = createTransporter();
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: studentEmail,
    subject: 'Resource Request Approved - VM Access Granted',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4CAF50;">🎉 Resource Request Approved!</h2>
        
        <p>Dear <strong>${studentName}</strong>,</p>
        
        <p>Congratulations! Your resource request "<strong>${requestTitle}</strong>" has been fully approved and your virtual machine is now ready for use.</p>
        
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">VM Access Credentials:</h3>
          <p><strong>Username:</strong> <code style="background: #e8e8e8; padding: 2px 4px;">${vmCredentials.username}</code></p>
          <p><strong>Password:</strong> <code style="background: #e8e8e8; padding: 2px 4px;">${vmCredentials.password}</code></p>
        </div>
        
        <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <strong>📋 Important Instructions:</strong>
          <ul>
            <li>Keep your credentials secure and do not share them with others</li>
            <li>Use the resources responsibly according to your submitted purpose</li>
            <li>Contact your supervisor if you encounter any technical issues</li>
            <li>Remember to clean up your work before the expiry date</li>
          </ul>
        </div>
        
        <p>If you have any questions or need assistance accessing your VM, please contact the IT support team.</p>
        
        <p>Best regards,<br>
        <strong>UIET Cluster Resource Management System</strong></p>
        
        <hr style="margin-top: 30px; border: none; border-top: 1px solid #eee;">
        <p style="font-size: 12px; color: #666;">
          This is an automated email. Please do not reply to this message.
        </p>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Resource request verified by admin email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending resource request verified by admin email:', error);
    return { success: false, error: error.message };
  }
};

// 10. Send email when student resource request is rejected by admin
const sendResourceRequestRejectedByAdminEmail = async (studentEmail, studentName, requestTitle) => {
  const transporter = createTransporter();
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: studentEmail,
    subject: 'Resource Request Update - Admin Review',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f44336;">📋 Resource Request Update</h2>
        
        <p>Dear <strong>${studentName}</strong>,</p>
        
        <p>Your resource request "<strong>${requestTitle}</strong>" has been reviewed by the administrator.</p>
        
        <div style="background-color: #ffebee; border: 1px solid #ffcdd2; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Status:</strong> Request not approved by administrator</p>
        </div>
        
        <div style="background-color: #e3f2fd; border: 1px solid #bbdefb; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <strong>📝 Next Steps:</strong>
          <ul>
            <li>Contact the IT support team for specific feedback</li>
            <li>Review your request requirements and justification</li>
            <li>Consider alternative resource configurations</li>
            <li>Resubmit with revised requirements if appropriate</li>
          </ul>
        </div>
        
        <p>Please contact the administrator or IT support team for guidance on resolving any issues with your request.</p>
        
        <p>Best regards,<br>
        <strong>UIET Cluster Resource Management System</strong></p>
        
        <hr style="margin-top: 30px; border: none; border-top: 1px solid #eee;">
        <p style="font-size: 12px; color: #666;">
          This is an automated email. Please do not reply to this message.
        </p>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Resource request rejected by admin email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending resource request rejected by admin email:', error);
    return { success: false, error: error.message };
  }
};

// ================== TEACHER REGISTRATION EMAILS ==================

// 11. Send email when teacher registration is successful
const sendTeacherRegistrationSuccessEmail = async (teacherEmail, teacherName) => {
  const transporter = createTransporter();
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: teacherEmail,
    subject: 'Teacher Registration Successful - Pending Admin Verification',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4CAF50;">🎓 Teacher Registration Successful!</h2>
        
        <p>Dear <strong>${teacherName}</strong>,</p>
        
        <p>Welcome to the UIET Cluster Resource Management System! Your teacher account has been successfully created.</p>
        
        <div style="background-color: #e8f5e8; border: 1px solid #4CAF50; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Status:</strong> Registration completed ✅</p>
          <p style="margin: 10px 0 0 0;"><strong>Next Step:</strong> Awaiting admin verification</p>
        </div>
        
        <div style="background-color: #e3f2fd; border: 1px solid #bbdefb; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <strong>📝 What happens next:</strong>
          <ul>
            <li>Your profile is pending verification by the administrator</li>
            <li>You will receive an email notification about your verification status</li>
            <li>Once verified, you can start managing student profiles and resource requests</li>
            <li>You'll have access to the teacher dashboard and student management tools</li>
          </ul>
        </div>
        
        <p>If you have any questions during the verification process, please contact the IT support team.</p>
        
        <p>Best regards,<br>
        <strong>UIET Cluster Resource Management System</strong></p>
        
        <hr style="margin-top: 30px; border: none; border-top: 1px solid #eee;">
        <p style="font-size: 12px; color: #666;">
          This is an automated email. Please do not reply to this message.
        </p>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Teacher registration success email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending teacher registration success email:', error);
    return { success: false, error: error.message };
  }
};

// 12. Send email when teacher profile is verified by admin
const sendTeacherProfileVerifiedByAdminEmail = async (teacherEmail, teacherName) => {
  const transporter = createTransporter();
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: teacherEmail,
    subject: 'Teacher Profile Verified - Full Access Granted!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4CAF50;">🎉 Teacher Profile Verified!</h2>
        
        <p>Dear <strong>${teacherName}</strong>,</p>
        
        <p>Congratulations! Your teacher profile has been verified by the administrator. You now have full access to the UIET Cluster Resource Management System.</p>
        
        <div style="background-color: #e8f5e8; border: 1px solid #4CAF50; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Status:</strong> Profile Fully Verified ✅</p>
          <p style="margin: 10px 0 0 0;"><strong>Access Level:</strong> Full teacher privileges granted</p>
        </div>
        
        <div style="background-color: #e3f2fd; border: 1px solid #bbdefb; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <strong>🚀 You can now:</strong>
          <ul>
            <li>Access your teacher dashboard</li>
            <li>Manage and verify student profiles</li>
            <li>Review and approve student resource requests</li>
            <li>Monitor your students' cluster resource usage</li>
            <li>Access reporting and analytics tools</li>
          </ul>
        </div>
        
        <p>Welcome to the teaching staff! You can now start managing your students and their cluster resource requests.</p>
        
        <p>Best regards,<br>
        <strong>UIET Cluster Resource Management System</strong></p>
        
        <hr style="margin-top: 30px; border: none; border-top: 1px solid #eee;">
        <p style="font-size: 12px; color: #666;">
          This is an automated email. Please do not reply to this message.
        </p>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Teacher profile verified by admin email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending teacher profile verified by admin email:', error);
    return { success: false, error: error.message };
  }
};

// 13. Send email when teacher profile is rejected by admin
const sendTeacherProfileRejectedByAdminEmail = async (teacherEmail, teacherName) => {
  const transporter = createTransporter();
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: teacherEmail,
    subject: 'Teacher Profile Verification Update - Admin Review',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f44336;">📋 Profile Verification Update</h2>
        
        <p>Dear <strong>${teacherName}</strong>,</p>
        
        <p>Your teacher profile has been reviewed by the administrator.</p>
        
        <div style="background-color: #ffebee; border: 1px solid #ffcdd2; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Status:</strong> Profile requires admin review</p>
        </div>
        
        <div style="background-color: #e3f2fd; border: 1px solid #bbdefb; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <strong>📝 Next Steps:</strong>
          <ul>
            <li>Contact the IT support team for specific feedback</li>
            <li>Review your profile information and credentials</li>
            <li>Ensure all required documentation is provided</li>
            <li>Address any concerns raised by the administrator</li>
          </ul>
        </div>
        
        <p>Please contact the administrator or IT support team for guidance on resolving any issues with your teacher profile.</p>
        
        <p>Best regards,<br>
        <strong>UIET Cluster Resource Management System</strong></p>
        
        <hr style="margin-top: 30px; border: none; border-top: 1px solid #eee;">
        <p style="font-size: 12px; color: #666;">
          This is an automated email. Please do not reply to this message.
        </p>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Teacher profile rejected by admin email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending teacher profile rejected by admin email:', error);
    return { success: false, error: error.message };
  }
};



module.exports = {
  // Student registration emails
  sendStudentRegistrationSuccessEmail,
  
  // Student profile verification emails
  sendStudentProfileVerifiedByTeacherEmail,
  sendStudentProfileRejectedByTeacherEmail,
  sendStudentProfileVerifiedByAdminEmail,
  sendStudentProfileRejectedByAdminEmail,
  
  // Resource request emails
  sendResourceRequestSubmittedEmail,
  sendResourceRequestVerifiedByTeacherEmail,
  sendResourceRequestRejectedByTeacherEmail,
  sendResourceRequestVerifiedByAdminEmail,
  sendResourceRequestRejectedByAdminEmail,
  
  // Teacher registration emails
  sendTeacherRegistrationSuccessEmail,
  sendTeacherProfileVerifiedByAdminEmail,
  sendTeacherProfileRejectedByAdminEmail,
  
  // OTP verification email
  sendOTPEmail,
  
  // Legacy functions (for backward compatibility)
  sendResourceApprovalEmail: sendResourceRequestVerifiedByAdminEmail,
  sendResourceRejectionEmail: sendResourceRequestRejectedByAdminEmail
};