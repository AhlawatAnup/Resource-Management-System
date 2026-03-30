const sendEmail = require('../sendEmail');
const { generateUndertakingPDF } = require('../common/undertakingPdfGenerator');

// Submitted
const sendResourceRequestSubmittedEmail = async (studentEmail, studentName, requestTitle, studentData = {}, purpose = '') => {
  // Generate undertaking PDF
  let attachments = [];
  try {
    const pdfBuffer = await generateUndertakingPDF(studentData, purpose);
    attachments = [{
      filename: 'Undertaking_AI_Data_Centre.pdf',
      content: pdfBuffer,
      contentType: 'application/pdf'
    }];
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
    attachments
  });
};

// Verified Email (for both Teacher/Admin)
const sendResourceRequestVerifiedEmail = async ({
  studentEmail,
  studentName,
  requestTitle
}) => {
  return sendEmail({
    to: studentEmail,
    subject: `[VERIFIED] Your Resource Request is Approved`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width:600px; margin:auto;">
        <h3 style="color:#4CAF50;">🎉 Congratulations, ${studentName}!</h3>

        <p>
          Your resource request <strong>"${requestTitle}"</strong> has been verified and approved.
          You can now use the allocated resources as needed.
        </p>

        <p>
          Please log in to your dashboard for more details.
        </p>

      </div>
    `
  });
};

// Rejected Email (for both Teacher/Admin)
const sendResourceRequestRejectedEmail = async ({
  studentEmail,
  studentName,
  requestTitle
}) => {
  return sendEmail({
    to: studentEmail,
    subject: `[REJECTED] Your Resource Request Update`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width:600px; margin:auto;">
        <h3 style="color:#f44336;">❌ Update on Your Request, ${studentName}</h3>

        <p>
          Your resource request <strong>"${requestTitle}"</strong> has been reviewed and rejected.
        </p>

        <div style="background-color:#ffebee; border:1px solid #ffcdd2; padding:12px; border-radius:6px; margin:16px 0;">
          <p style="margin:0;">
            You may submit a <strong>new request</strong> with updated or corrected details for further review.
          </p>
        </div>

        <p>Please check the details carefully before resubmitting.</p>
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
  sendResourceRequestVerifiedEmail,
  sendResourceRequestRejectedEmail,
  sendResourceRequestRevokedByAdminEmail
};
