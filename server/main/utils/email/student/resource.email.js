const sendEmail = require('../sendEmail');
const { generateUndertakingPDF } = require('../common/undertakingPdfGenerator');

// Submitted
const sendResourceRequestSubmittedEmail = async (
  studentEmail,
  studentName,
  requestTitle,
  studentData = {},
  purpose = '',
) => {
  // Generate undertaking PDF
  let attachments = [];
  try {
    const pdfBuffer = await generateUndertakingPDF(studentData, purpose);
    attachments = [
      {
        filename: 'Undertaking_AI_Data_Centre.pdf',
        content: pdfBuffer,
        contentType: 'application/pdf',
      },
    ];
  } catch (error) {
    console.error('Failed to generate undertaking PDF:', error.message);
    // Continue sending email without attachment if PDF generation fails
  }

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

        <p style="color:#666; font-size:12px; margin-top:20px;">
          <em>Please find the signed undertaking document attached to this email for your records.</em>
        </p>
      </div>
    `,
    attachments,
  });
};

// Verified Email (for both Teacher/Admin)
const sendResourceRequestVerifiedEmail = async ({
  studentEmail,
  studentName,
  requestTitle,
  startTime,
  endTime,
  migId,
  duration,
  attachments = [],
}) => {
  const formatDate = (date) =>
    new Date(date).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  return sendEmail({
    to: studentEmail,
    subject: `[VERIFIED] Your Resource Request is Approved`,
    attachments,
    html: `
      <div style="font-family: Arial, sans-serif; max-width:600px; margin:auto;">
        <h3 style="color:#4CAF50;">🎉 Congratulations, ${studentName}!</h3>

        <p>
          Your resource request <strong>"${requestTitle}"</strong> has been approved.
        </p>

        <div style="background-color:#f5f5f5; border:1px solid #ddd; padding:12px; border-radius:6px; margin:16px 0;">
          <p style="margin:4px 0;"><strong>Start Time:</strong> ${formatDate(startTime)}</p>
          <p style="margin:4px 0;"><strong>End Time:</strong> ${formatDate(endTime)}</p>
          <p style="margin:4px 0;"><strong>Duration:</strong> ${duration} day(s)</p>
          <p style="margin:4px 0;"><strong>MIG ID:</strong> ${migId}</p>
        </div>

        <p>
          📄 An undertaking document is attached with this email. Please review it carefully.
        </p>

        <p>
          Please log in to your dashboard for more details.
        </p>

    <a href="https://aicentre.puchd.ac.in" style="font-family: Arial, sans-serif;background:#1b1e1f;padding :15px; text-decoration: none; color: white; margin-block:2rem; position: relative;  justify-content: center; display: flex;">
         Go to Website
      </a>
      </div>
    `,
  });
};

// Rejected Email (for both Teacher/Admin)
const sendResourceRequestRejectedEmail = async ({
  studentEmail,
  studentName,
  requestTitle,
  remarks,
}) => {
  return sendEmail({
    to: studentEmail,
    subject: `[REJECTED] Your Resource Request Update`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width:600px; margin:auto;">
        <h3 style="color:#f44336;">❌ Update on Your Request, ${studentName}</h3>

        <p>
          Your resource request <strong>"${requestTitle}"</strong> has been rejected.
        </p>

        ${
          remarks
            ? `
              <div style="background-color:#fff3e0; border:1px solid #ffcc80; padding:12px; border-radius:6px; margin:16px 0;">
                <p style="margin:0;"><strong>Admin Remarks:</strong></p>
                <p style="margin-top:8px;">${remarks}</p>
              </div>
              `
            : ''
        }

        <div style="background-color:#ffebee; border:1px solid #ffcdd2; padding:12px; border-radius:6px; margin:16px 0;">
          <p style="margin:0;">
            You may submit a <strong>new request</strong> with updated or corrected details for further review.
          </p>
        </div>

        <p>Please check the details carefully before resubmitting.</p>

    <a href="https://aicentre.puchd.ac.in" style="font-family: Arial, sans-serif;background:#1b1e1f;padding :15px; text-decoration: none; color: white; margin-block:2rem; position: relative;  justify-content: center; display: flex;">
         Go to Website
      </a>

      </div>
    `,
  });
};
// Revoked by Admin (resource allocation removed)
const sendResourceRequestRevokedByAdminEmail = async (studentEmail, studentName, requestTitle) => {
  return sendEmail({
    to: studentEmail,
    subject: '[ATTENTION] Resource Allocation Revoked - Access Removed',
    html: `
      <div style="font-family: Arial, sans-serif; max-width:600px; margin:auto;">
        <h3 style="color:#f44336;">⚠️ Resource Allocation Revoked</h3>

        <p>Dear <strong>${studentName}</strong>,</p>

        <p>
          Your previously approved resource request
          <strong>"${requestTitle}"</strong>
          has been revoked by the administrator.
        </p>

        <p>If you still need resources, please submit a new request with updated details.</p>

    <a href="https://aicentre.puchd.ac.in" style="font-family: Arial, sans-serif;background:#1b1e1f;padding :15px; text-decoration: none; color: white; margin-block:2rem; position: relative;  justify-content: center; display: flex;">
         Go to Website
      </a>
      </div>
    `,
  });
};

// email for: allotment start today
const sendResourceAllotmentStartedEmail = async ({
  studentEmail,
  studentName,
  requestTitle,
  startTime,
}) => {
  const formattedStartTime = new Date(startTime).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  return sendEmail({
    to: studentEmail,
    subject: '[CONFIRMATION] Your Resource Allotment Has Started',
    html: `
        <div style="font-family: Arial, sans-serif; max-width:600px; margin:auto;">
          <h3 style="color:#4caf50;">✅ Resource Allotment Started</h3>

          <p>Dear <strong>${studentName}</strong>,</p>

          <p>
            Your resource allotment for <strong>"${requestTitle}"</strong> has been started.
          </p>

          <div style="background-color:#f5f5f5; border:1px solid #ddd; padding:12px; border-radius:6px; margin:16px 0;">
            <p style="margin:0;"><strong>Start Time:</strong> ${formattedStartTime}</p>
          </div>

          <p>
            Please <strong>login</strong> on the website to start using your resources.
          </p>

          <p style="color:#1976d2; font-size: 0.9em;">
            If you face any technical issues, please report them to the administrator immediately.
          </p>

    <a href="https://aicentre.puchd.ac.in" style="font-family: Arial, sans-serif;background:#1b1e1f;padding :15px; text-decoration: none; color: white; margin-block:2rem; position: relative;  justify-content: center; display: flex;">
         Go to Website
      </a>


          <p>Regards,<br>
          <strong>U.I.E.T Cloud AI Data Center</strong></p>
        </div>
      `,
  });
};

// Expiry Warning (same-day expiry reminder)
const sendResourceAllotmentExpiryTodayEmail = async ({
  studentEmail,
  studentName,
  requestTitle,
  endTime,
}) => {
  const formattedEndTime = new Date(endTime).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return sendEmail({
    to: studentEmail,
    subject: '[IMPORTANT] Resource Allotment Expiring Today',
    html: `
      <div style="font-family: Arial, sans-serif; max-width:600px; margin:auto;">
        <h3 style="color:#ff9800;">⏳ Resource Allotment Expiring Today</h3>

        <p>Dear <strong>${studentName}</strong>,</p>

        <p>
          Your resource allotment for 
          <strong>"${requestTitle}"</strong> 
          is scheduled to expire today.
        </p>

        <div style="background-color:#fff3e0; border:1px solid #ffe0b2; padding:12px; border-radius:6px; margin:16px 0;">
          <p style="margin:0 0 8px 0;"><strong>Expiry Time:</strong> ${formattedEndTime}</p>
        </div>

        <p>
          Please ensure that you save all required data from the machine before expiry.
        </p>

        <p style="color:#d32f2f;">
          Any data loss after the expiry time will be your responsibility.
        </p>

    <a href="https://aicentre.puchd.ac.in" style="font-family: Arial, sans-serif;background:#1b1e1f;padding :15px; text-decoration: none; color: white; margin-block:2rem; position: relative;  justify-content: center; display: flex;">
         Go to Website
      </a>

        <p>Regards,</p>
        <strong>U.I.E.T Cloud AI Data Center</strong></p>
      </div>
    `,
  });
};

module.exports = {
  sendResourceRequestSubmittedEmail,
  sendResourceRequestVerifiedEmail,
  sendResourceRequestRejectedEmail,
  sendResourceRequestRevokedByAdminEmail,
  sendResourceAllotmentStartedEmail,
  sendResourceAllotmentExpiryTodayEmail,
};
