const sendEmail = require('../sendEmail');

// Submitted
const sendResourceRequestSubmittedEmail = async (studentEmail, studentName, requestTitle) => {
  return sendEmail({
    to: studentEmail,
    subject: 'Resource Request Submitted Successfully',
    html: `
      <div style="font-family: Arial, sans-serif; max-width:600px; margin:auto;">
        <p>Dear <strong>${studentName}</strong>,</p>

        <p>
          Your resource request
          <strong>"${requestTitle}"</strong>
          has been submitted successfully.
        </p>

        <div style="background-color:#e3f2fd; border:1px solid #bbdefb; padding:15px; border-radius:6px; margin:20px 0;">
          <p style="margin:0 0 8px 0;"><strong>What happens next?</strong></p>

          <p style="margin:4px 0;">
            • Your assigned teacher will review, edit (if required), and verify the request
          </p>
          <p style="margin:4px 0;">
            • After teacher verification, the administrator will review it for final approval
          </p>
          <p style="margin:4px 0;">
            • You will be notified at each step of the verification process
          </p>
        </div>

        <p>
          You can track the status of your request from your dashboard.
        </p>
      </div>
    `
  });
};

// Verified by Teacher
const sendResourceRequestVerifiedByTeacherEmail = async (
  studentEmail,
  studentName,
  requestTitle,
  teacherName
) => {
  return sendEmail({
    to: studentEmail,
    subject: 'Resource Request Update - Teacher Approved',
    html: `
      <div style="font-family: Arial, sans-serif; max-width:600px; margin:auto;">
        <h3 style="color:#4CAF50;">✅ Teacher Approval Received</h3>

        <p>Dear <strong>${studentName}</strong>,</p>

        <p>
          Your resource request
          <strong>"${requestTitle}"</strong>
          has been approved by
          <strong>${teacherName}</strong>.
        </p>

        <div style="background-color:#e8f5e9; border:1px solid #c8e6c9; padding:12px; border-radius:6px; margin:16px 0;">
          <p style="margin:0;">
            The request is now pending <strong>administrator approval</strong>.
            You will be notified once the admin completes the verification.
          </p>
        </div>

        <p>You can track the status from your dashboard.</p>
      </div>
    `
  });
};


// Rejected by Teacher
const sendResourceRequestRejectedByTeacherEmail = async (
  studentEmail,
  studentName,
  requestTitle
) => {
  return sendEmail({
    to: studentEmail,
    subject: 'Resource Request Update - Teacher Review Required',
    html: `
      <div style="font-family: Arial, sans-serif; max-width:600px; margin:auto;">
        <h3 style="color:#f44336;">❌ Request Rejected by Teacher</h3>

        <p>Dear <strong>${studentName}</strong>,</p>

        <p>
          Your resource request
          <strong>"${requestTitle}"</strong>
          has been reviewed and rejected by the teacher.
        </p>

        <div style="background-color:#ffebee; border:1px solid #ffcdd2; padding:12px; border-radius:6px; margin:16px 0;">
          <p style="margin:0;">
            You may submit a <strong>new resource request</strong> with corrected
            or updated details for further review.
          </p>
        </div>

        <p>Please review the requirements carefully before resubmitting.</p>
      </div>
    `
  });
};


// Verified by Admin (VM credentials)
const sendResourceRequestVerifiedByAdminEmail = async (
  studentEmail,
  studentName,
  requestTitle,
  vmCredentials,
  requestUsername
) => {
  return sendEmail({
    to: studentEmail,
    subject: 'Resource Request Approved - VM Access Granted',
    html: `
      <div style="font-family: Arial, sans-serif; max-width:600px; margin:auto;">
        <h3 style="color:#4CAF50;">🎉 Resource Request Approved</h3>

        <p>Dear <strong>${studentName}</strong>,</p>

        <p>
          Your resource request
          <strong>"${requestTitle}"</strong>
          has been fully approved by the administrator.
          Your virtual machine is now ready to use.
        </p>

        <div style="background-color:#f5f5f5; border:1px solid #ddd; padding:15px; border-radius:6px; margin:20px 0;">
          <p style="margin:0 0 8px 0;"><strong>VM Access Credentials</strong></p>
          <p style="margin:4px 0;"><strong>Username:</strong> ${requestUsername || 'N/A'}</p>
          <p style="margin:4px 0;"><strong>Password:</strong> ${vmCredentials.password}</p>
          <p style="margin:4px 0;"><strong>IP Address:</strong> ${vmCredentials.ip}</p>
          <p style="margin:4px 0;"><strong>MIG ID:</strong> ${vmCredentials.migId}</p>
        </div>

        <div style="background-color:#fff3cd; border:1px solid #ffeeba; padding:12px; border-radius:6px;">
          <p style="margin:0;">
            Please keep these credentials secure and use the resources responsibly.
            These credentials are also available on the website after login.
          </p>
        </div>

        <p>You can now start using the allocated resources.</p>
      </div>
    `
  });
};


// Rejected by Admin
const sendResourceRequestRejectedByAdminEmail = async (
  studentEmail,
  studentName,
  requestTitle
) => {
  return sendEmail({
    to: studentEmail,
    subject: 'Resource Request Update - Admin Review',
    html: `
      <div style="font-family: Arial, sans-serif; max-width:600px; margin:auto;">
        <h3 style="color:#f44336;">❌ Request Rejected by Admin</h3>

        <p>Dear <strong>${studentName}</strong>,</p>

        <p>
          Your resource request
          <strong>"${requestTitle}"</strong>
          has been reviewed and rejected by the administrator.
        </p>

        <div style="background-color:#ffebee; border:1px solid #ffcdd2; padding:12px; border-radius:6px; margin:16px 0;">
          <p style="margin:0;">
            You may submit a <strong>new request</strong> with revised details
            if you still require the resources.
          </p>
        </div>

        <p>Please ensure all required information is accurate before resubmitting.</p>
      </div>
    `
  });
};

// Revoked by Admin (resource allocation removed)
const sendResourceRequestRevokedByAdminEmail = async (
  studentEmail,
  studentName,
  requestTitle,
  migId
) => {
  const migLine = migId ? `<p style="margin:4px 0;"><strong>MIG ID:</strong> ${migId}</p>` : '';

  return sendEmail({
    to: studentEmail,
    subject: 'Resource Allocation Revoked - Access Removed',
    html: `
      <div style="font-family: Arial, sans-serif; max-width:600px; margin:auto;">
        <h3 style="color:#f44336;">⚠️ Resource Allocation Revoked</h3>

        <p>Dear <strong>${studentName}</strong>,</p>

        <p>
          Your previously approved resource request
          <strong>"${requestTitle}"</strong>
          has been revoked by the administrator.
        </p>

        <div style="background-color:#ffebee; border:1px solid #ffcdd2; padding:12px; border-radius:6px; margin:16px 0;">
          <p style="margin:0 0 8px 0;"><strong>Access Status:</strong> Removed</p>
          ${migLine}
        </div>

        <p>If you still need resources, please submit a new request with updated details.</p>
      </div>
    `
  });
};


module.exports = {
  sendResourceRequestSubmittedEmail,
  sendResourceRequestVerifiedByTeacherEmail,
  sendResourceRequestRejectedByTeacherEmail,
  sendResourceRequestVerifiedByAdminEmail,
  sendResourceRequestRejectedByAdminEmail,
  sendResourceRequestRevokedByAdminEmail
};
