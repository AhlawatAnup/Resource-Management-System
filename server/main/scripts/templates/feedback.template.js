const feedback_template = (studentName, feedbackLink) => {
  return `
<div style="font-family: Arial, sans-serif; max-width:600px; margin:auto; color:#333; line-height:1.6;">

  <h2 style="color:#1976D2;">Annual Feedback Request</h2>

  <p>Dear <strong>${studentName}</strong>,</p>

  <p>
    Thank you for using the <strong>U.I.E.T Cloud AI Data Center</strong> facility at
    <strong>UIET, Panjab University</strong>.
  </p>

  <p>
    Your feedback is extremely valuable in helping us improve our infrastructure,
    services, and user experience.
  </p>

  <div style="background:#FFF8E1; border-left:2px solid #FFC107; padding:16px; margin:20px 0; border-radius:0px;">
    <h3 style="margin-top:0; color:#E65100;">Important Notice</h3>

    <ul style="padding-left:20px; margin:10px 0;">
      <li><strong>Submitting the Annual Feedback Form is mandatory for all users.</strong></li>
      <li>Please use <strong>only the email address registered</strong> on the U.I.E.T Cloud AI Data Center website.</li>
      <li>Please provide accurate and honest responses in the feedback form.</li>
      <li>
        Failure to submit the mandatory annual feedback may result in
        <strong>delays or ineligibility for future GPU server resource allotments.</strong>
      </li>
    </ul>
  </div>

  <p>
    Kindly complete the feedback form at your earliest convenience by clicking the button below.
  </p>

  <div style="text-align:center; margin:30px 0;">
    <a href="${feedbackLink}"
      style="background:#1976D2;
             color:#fff;
             text-decoration:none;
             padding:14px 28px;
             border-radius:6px;
             display:inline-block;
             font-weight:bold;">
      Submit Annual Feedback
    </a>
  </div>

  <hr style="border:none; border-top:1px solid #ddd; margin:30px 0;" />

  <p style="font-size:14px; color:#666;">
    Thank you for your cooperation and for being a valued user of the
    <strong>U.I.E.T Cloud AI Data Center</strong>.
  </p>

  <p style="font-size:14px; color:#666;">
    Regards,<br>
    <strong>U.I.E.T Cloud AI Data Center</strong><br>
  </p>

  <div style="text-align:center; margin-top:30px;">
    <a href="https://aicentre.puchd.ac.in"
       style="font-family: Arial, sans-serif;
              background:#1b1e1f;
              padding:15px 28px;
              text-decoration:none;
              color:white;
              border-radius:6px;
              display:inline-block;">
     Go To Website
    </a>
  </div>

</div>`;
};

module.exports = { feedback_template };
