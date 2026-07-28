// MAIL TO SEND INVITATION FOR UNNNATI LAB
const vscode_init_template = (studentName, vscodeGuideLink) => {
  return ` <div style="font-family: Arial, sans-serif; max-width:600px; margin:auto; color:#333; line-height:1.6;">

    <h2 style="color:#1976D2;"> Introducting VS Code Support</h2>

    <p>Dear <strong>${studentName}</strong>,</p>

    <p>
      Thank you for being a valued user of the
      <strong>U.I.E.T Cloud AI Data Center</strong>. Your continuous support,
      valuable feedback, and active usage have helped us shape the platform into
      what it is today.
    </p>

    <p>
      It has been an incredible journey—from manually allocating GPU resources
      and handling requests individually to building a fully automated platform
      that makes requesting, allocating, and accessing compute resources simple,
      faster, and more reliable.
    </p>

    <p>
      As our research ecosystem continues to grow, we remain committed to
      delivering new capabilities that make AI development and research even
      more seamless. This is only the beginning, and many exciting features are
      on the way.
    </p>

    <div style="background:#E3F2FD; border-left:2px solid #1976D2; padding:16px; margin:20px 0; border-radius:0px;">
      <h3 style="margin-top:0; color:#1565C0;"> Platform Rebranding</h3>

      <p style="margin-bottom:0;">
        We are excited to announce that the core open source platform will now officially be
        known as
        <strong>MAyA</strong> —
        <strong>Multi-user Allocation System for Compute Automation</strong>.
      </p>

      <p style="margin-top:10px; margin-bottom:0;">
        Additionally, the deployment of MAyA at Panjab University will now be
        recognized as the
        <strong>U.I.E.T AI Cloud Data Center</strong>,
        reflecting our vision of building a modern AI computing infrastructure
        for research, learning, and innovation.
      </p>
    </div>

    <div style="background:#E8F5E9; border-left:2px solid #4CAF50; padding:16px; margin:20px 0; border-radius:0px;">
      <h3 style="margin-top:0; color:#2E7D32;">✨ New Feature Released</h3>

      <p>
        With the latest version of the MAyA Platform, we are thrilled to
        introduce one of our most requested features:
      </p>

      <h3 style="color:#1976D2; margin-bottom:10px;">
        VS Code Remote Access Support
      </h3>

      <p>
        You can now connect directly to your allocated compute machine using
        <strong>Visual Studio Code</strong> over the internet and enjoy the
        complete development experience.
      </p>

      <ul style="padding-left:20px;">
        <li> Develop directly on your allocated GPU machine.</li>
        <li> Access the complete VS Code IDE experience.</li>
        <li> Install extensions and manage your workspace seamlessly.</li>
        <li> Faster development and debugging workflow.</li>
        <li> Secure remote access from anywhere.</li>
      </ul>

      <div style="text-align:center; margin-top:20px;">
        <a href="${vscodeGuideLink}"
          style="background:#1976D2;
                 color:#fff;
                 text-decoration:none;
                 padding:12px 28px;
                 border-radius:6px;
                 display:inline-block;
                 font-weight:bold;">
          Read How to Connect VS Code
        </a>
      </div>
    </div>

    <p>
      We sincerely thank you for being part of this journey. Your participation,
      research contributions, and feedback have been instrumental in helping us
      build a better platform for the entire research community.
    </p>

    <p>
      Stay tuned as we continue introducing more powerful features to make MAyA
      the preferred AI compute platform for researchers and students.
    </p>

    <hr style="border:none; border-top:1px solid #ddd; margin:30px 0;" />



    <p style="font-size:14px; color:#666;">
      Regards,<br>
      U.I.E.T AI Cloud Data Center<br>
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
        Visit Platform
      </a>
    </div>

  </div>`;
};

module.exports = { vscode_init_template };
