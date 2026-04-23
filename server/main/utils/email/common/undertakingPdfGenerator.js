const PDFDocument = require('pdfkit');

const generateUndertakingPDF = (studentData, purpose) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const chunks = [];
      const lineGap = 4;

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const currentDate = new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });

      // Title
      doc
        .fontSize(14)
        .font('Helvetica-Bold')
        .text('Undertaking for Use of AI Data Centre Facilities at Panjab University, Chandigarh', {
          align: 'center',
          lineGap,
        });
      doc.moveDown(1.5);

      // Student Details
      doc.fontSize(11).font('Helvetica-Bold').text('Name: ', { continued: true });
      doc.font('Helvetica').text(studentData.name || 'N/A', { lineGap });

      doc.font('Helvetica-Bold').text('Roll Number: ', { continued: true });
      doc.font('Helvetica').text(studentData.rollNo || 'N/A', { lineGap });

      doc.font('Helvetica-Bold').text('Branch: ', { continued: true });
      doc.font('Helvetica').text(studentData.branch || 'N/A', { lineGap });

      doc.font('Helvetica-Bold').text('Institute Name: ', { continued: true });
      doc.font('Helvetica').text(studentData.instituteName || 'N/A', { lineGap });

      doc.font('Helvetica-Bold').text('Institute Address: ', { continued: true });
      doc.font('Helvetica').text(studentData.instituteAddress || 'N/A', { lineGap });

      doc.moveDown(1);

      // Introduction
      doc
        .fontSize(11)
        .font('Helvetica')
        .text(
          'I, the undersigned, understand and agree to the following terms and conditions for using the equipment and facilities of AI Data Centre established by DIC, PU, Chandigarh.',
          { align: 'justify', lineGap },
        );
      doc.moveDown();

      // Section 1
      doc.font('Helvetica-Bold').text('1. Acknowledgment of Funding');
      doc.moveDown(0.5);

      doc
        .font('Helvetica')
        .text(
          'I acknowledge that the equipment and infrastructure available in this data centre have been made possible through generous support from the following grants:',
          { align: 'justify', lineGap },
        );

      doc.moveDown(0.5);

      doc.text(
        '• Ministry of Education (MoE), Government of India, at the Design Innovation Centre (DIC) (File No.: 17-11/2015-PN-1), November 2015.',
        { indent: 20, lineGap },
      );

      doc.text(
        '• Department of Science and Technology (DST) through the Fund for Improvement of S&T Infrastructure (FIST) grant (SR/FST/ET-I/2021/878), 2021.',
        { indent: 20, lineGap },
      );

      doc.text(
        '• AI Data Centre established through CSR grant by Vardhman Textile Pvt Ltd and Intel Corp by Design Innovation Centre, Panjab University, Chandigarh. (File No: 05/02/2025)',
        { indent: 20, lineGap },
      );

      doc.moveDown(0.5);

      doc.text(
        'I understand and agree that any research or work performed using this equipment must properly acknowledge these funding bodies in all resulting publications, presentations, IPR, and reports.',
        { align: 'justify', lineGap },
      );

      doc.moveDown();

      // Section 2
      doc.font('Helvetica-Bold').text('2. Proper Use and Care of Equipment');
      doc.moveDown(0.5);

      doc
        .font('Helvetica')
        .text(
          'I will use all equipment, including the high-end GPU server, responsibly and exclusively for academic and research purposes as approved by the lab in-charge. I will not use the equipment for any unauthorized commercial or personal activities.',
          { align: 'justify', lineGap },
        );

      doc.moveDown(0.5);

      doc.text(
        'I will handle all equipment with care and diligence to prevent damage. I will report any malfunction, damage, or issues with the equipment to the data centre in-charge immediately. I understand that I may be held financially responsible for any damage caused due to negligence or misuse.',
        { align: 'justify', lineGap },
      );

      doc.moveDown();

      // Section 3
      doc.font('Helvetica-Bold').text('3. Data Security and Privacy');
      doc.moveDown(0.5);

      doc
        .font('Helvetica')
        .text(
          "I am responsible for the security of my own data. I will not store sensitive, classified, or unauthorized data on the lab's servers or storage devices. I understand that the lab is not responsible for any loss or corruption of my personal data.",
          { align: 'justify', lineGap },
        );

      doc.moveDown();

      // Section 4
      doc.font('Helvetica-Bold').text('4. Compliance with Policies');
      doc.moveDown(0.5);

      doc
        .font('Helvetica')
        .text(
          'I will adhere to all safety protocols, access policies, and operational guidelines set forth by the Design Innovation Centre and Panjab University. I understand that failure to comply with these rules may result in the suspension of my access to the facilities.',
          { align: 'justify', lineGap },
        );

      doc.moveDown();

      // Section 5
      doc.font('Helvetica-Bold').text('5. Declaration');
      doc.moveDown(0.5);

      doc
        .font('Helvetica')
        .text(
          'By signing below, I confirm that I have read, understood, and agree to abide by all the terms and conditions outlined in this undertaking. I commit to using the provided facilities and equipment responsibly and ethically.',
          { align: 'justify', lineGap },
        );

      // User Details Section
      doc.font('Helvetica-Bold').text('Student Details', { underline: true });
      doc.moveDown(0.5);

      const detailsStartX = 50;
      const valueStartX = 180;

      doc.font('Helvetica-Bold').text('Name:', detailsStartX, doc.y, { continued: false });
      doc.font('Helvetica').text(studentData.name || 'N/A', valueStartX, doc.y - 14);

      doc.font('Helvetica-Bold').text('Roll Number:', detailsStartX, doc.y + 5);
      doc.font('Helvetica').text(studentData.rollNo || 'N/A', valueStartX, doc.y - 14);

      doc.font('Helvetica-Bold').text('Branch:', detailsStartX, doc.y + 5);
      doc.font('Helvetica').text(studentData.branch || 'N/A', valueStartX, doc.y - 14);

      doc.font('Helvetica-Bold').text('Institute Name:', detailsStartX, doc.y + 5);
      doc.font('Helvetica').text(studentData.instituteName || 'N/A', valueStartX, doc.y - 14);

      doc.font('Helvetica-Bold').text('Address:', detailsStartX, doc.y + 5);
      doc.font('Helvetica').text(studentData.instituteAddress || 'N/A', valueStartX, doc.y - 14);

      doc.font('Helvetica-Bold').text('Purpose of Use:', detailsStartX, doc.y + 5);
      doc.font('Helvetica').text(purpose || 'N/A', valueStartX, doc.y - 14, { width: 350 });

      doc.moveDown();
      doc.font('Helvetica-Bold').text('Date:', detailsStartX, doc.y + 5);
      doc.font('Helvetica').text(currentDate, valueStartX, doc.y - 14);

      doc.font('Helvetica-Bold').text('Signature:', detailsStartX, doc.y + 5);
      doc
        .font('Helvetica-Oblique')
        .text(`Signed by ${studentData.name || 'User'}`, valueStartX, doc.y - 14);

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = { generateUndertakingPDF };
