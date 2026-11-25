// MAIL TO SEND INVITATION FOR UNNNATI LAB
const invitation_template = (studentName, feedbackLink) => {
  return `
  <div style="font-family: Arial, sans-serif; max-width:600px; margin:auto; color:#333; line-height:1.6;">

  <h2 style="color:#1976D2;">Invitation for Visiting Intel Unnati Labs</h2>

  <p>Dear <strong>${studentName}</strong>,</p>

  <p>
    We are delighted to inform you that professionals from
    <strong>Intel Unnati Labs</strong> will be visiting the
    <strong>U.I.E.T Cloud AI Data Center</strong> on
    <strong>23<sup>rd</sup> July 2026</strong>.
  </p>

  <p>
    As a researcher who has benefited from the GPU server infrastructure at the
    <strong>U.I.E.T Cloud AI Data Center</strong>, your presence would be greatly
    appreciated. This visit provides an excellent opportunity to interact with
    the Intel Unnati Labs team, share your research experience, discuss how the
    GPU resources have supported your work, and provide valuable insights that
    can help strengthen our research ecosystem.
  </p>

  <div style="background:#E8F5E9; border-left:2px solid #4CAF50; padding:16px; margin:20px 0; border-radius:0px;">
    <h3 style="margin-top:0; color:#2E7D32;">Visit Details</h3>

    <ul style="padding-left:20px; margin:10px 0;">
      <li><strong>Date:</strong> 23<sup>rd</sup> July 2026</li>
      <li><strong>Venue:</strong> Lab No. 218, Department of Computer Science & Engineering, U.I.E.T, Panjab University</li>
      <li><strong>Purpose:</strong> Interaction with researchers and inspection of the GPU Server Infrastructure.</li>
    </ul>
  </div>

  <p>
    We sincerely request you to spare some time and join us during the visit.
    Your interaction with the Intel Unnati Labs team will help showcase the
    impact of the GPU computing facility on research activities at U.I.E.T.
  </p>

  <div style="background:#FFF8E1; border-left:2px solid #FFC107; padding:16px; margin:20px 0; border-radius:0px;">
    <h3 style="margin-top:0; color:#E65100;">Feedback Reminder</h3>

    <p style="margin-bottom:10px;">
      If you have not yet submitted your Annual Feedback Form, we kindly request
      you to complete it before the visit. Your feedback plays an important role
      in improving our services and future infrastructure.
    </p>

    <div style="text-align:center; margin-top:15px;">
      <a href="${feedbackLink}"
        style="background:#1976D2;
               color:#fff;
               text-decoration:none;
               padding:12px 26px;
               border-radius:6px;
               display:inline-block;
               font-weight:bold;">
        Submit Annual Feedback
      </a>
    </div>
  </div>

  <hr style="border:none; border-top:1px solid #ddd; margin:30px 0;" />

  <p style="font-size:14px; color:#666;">
    We look forward to your gracious presence and valuable interaction with the
    Intel Unnati Labs team.
  </p>

  <p style="font-size:14px; color:#666;">
    Thank you for your continued support and contribution to the
    <strong>U.I.E.T Cloud AI Data Center</strong>.
  </p>

  <p style="font-size:14px; color:#666;">
    Regards,<br>
    <strong>U.I.E.T Cloud AI Data Center</strong><br>
    University Institute of Engineering & Technology<br>
    Panjab University, Chandigarh
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
      Visit Website
    </a>
  </div>

</div>

`;
};

module.exports = { invitation_template };
