const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generate a professional sanction letter PDF for a loan application
 */
const generateSanctionLetter = async (applicationData, userData) => {
  return new Promise((resolve, reject) => {
    const uploadsDir = path.join(__dirname, '../../uploads/sanctions');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const fileName = `sanction_${applicationData.id}_${Date.now()}.pdf`;
    const filePath = path.join(uploadsDir, fileName);
    const relativePath = `uploads/sanctions/${fileName}`;

    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 60, right: 60 },
    });

    const writeStream = fs.createWriteStream(filePath);
    doc.pipe(writeStream);

    // ─── Header ───────────────────────────────────────────
    doc
      .fillColor('#1a3c6e')
      .fontSize(22)
      .font('Helvetica-Bold')
      .text('TATA CAPITAL FINANCIAL SERVICES LTD.', { align: 'center' });

    doc
      .fillColor('#666')
      .fontSize(10)
      .font('Helvetica')
      .text('One Forbes | Dr. V.B. Gandhi Marg | Fort | Mumbai - 400 001', { align: 'center' });

    doc.moveDown(0.5);

    // Divider
    doc
      .moveTo(60, doc.y)
      .lineTo(535, doc.y)
      .strokeColor('#1a3c6e')
      .lineWidth(2)
      .stroke();

    doc.moveDown(1);

    // ─── Title ───────────────────────────────────────────
    doc
      .fillColor('#1a3c6e')
      .fontSize(16)
      .font('Helvetica-Bold')
      .text('PERSONAL LOAN SANCTION LETTER', { align: 'center' });

    doc.moveDown(0.5);

    // Date + Ref
    const today = new Date().toLocaleDateString('en-IN', {
      day: '2-digit', month: 'long', year: 'numeric',
    });

    doc
      .fillColor('#333')
      .fontSize(10)
      .font('Helvetica')
      .text(`Date: ${today}`, { align: 'right' })
      .text(`Ref No: TCFSL/PL/${applicationData.id.slice(-8).toUpperCase()}`, { align: 'right' });

    doc.moveDown(1);

    // ─── Borrower Details ────────────────────────────────
    doc
      .fillColor('#1a3c6e')
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('To,');

    doc
      .fillColor('#333')
      .fontSize(11)
      .font('Helvetica')
      .text(userData.name)
      .text(userData.email)
      .text(userData.phone || 'N/A');

    doc.moveDown(1);

    // ─── Subject ─────────────────────────────────────────
    doc
      .fillColor('#1a3c6e')
      .fontSize(11)
      .font('Helvetica-Bold')
      .text('Subject: Sanction of Personal Loan');

    doc.moveDown(0.5);

    doc
      .fillColor('#333')
      .fontSize(10)
      .font('Helvetica')
      .text(
        `Dear ${userData.name},\n\nWe are pleased to inform you that your application for a Personal Loan has been reviewed and approved by Tata Capital Financial Services Ltd. We are delighted to offer you a loan under the following terms and conditions:`,
        { lineGap: 4 }
      );

    doc.moveDown(1);

    // ─── Loan Details Table ───────────────────────────────
    doc
      .fillColor('#1a3c6e')
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('LOAN DETAILS', { underline: true });

    doc.moveDown(0.5);

    const tableData = [
      ['Loan Amount Sanctioned', `₹${Number(applicationData.eligibleAmount || applicationData.loanAmount).toLocaleString('en-IN')}`],
      ['Purpose of Loan', applicationData.loanPurpose],
      ['Rate of Interest (p.a.)', `${applicationData.interestRate || 12.5}%`],
      ['Loan Tenure', `${applicationData.tenure} Months`],
      ['Monthly EMI', `₹${Number(applicationData.emi).toLocaleString('en-IN')}`],
      ['Processing Fee', '₹2,999 (inclusive of GST)'],
      ['Disbursement Mode', 'Direct Bank Transfer'],
      ['Loan Status', 'APPROVED'],
    ];

    const tableX = 60;
    let tableY = doc.y;
    const col1Width = 220;
    const col2Width = 255;
    const rowHeight = 28;

    tableData.forEach(([label, value], idx) => {
      const bgColor = idx % 2 === 0 ? '#f0f4ff' : '#ffffff';
      doc
        .rect(tableX, tableY, col1Width + col2Width, rowHeight)
        .fill(bgColor);

      doc
        .fillColor('#1a3c6e')
        .font('Helvetica-Bold')
        .fontSize(10)
        .text(label, tableX + 8, tableY + 8, { width: col1Width - 10 });

      doc
        .fillColor('#333')
        .font('Helvetica')
        .fontSize(10)
        .text(value, tableX + col1Width + 8, tableY + 8, { width: col2Width - 10 });

      tableY += rowHeight;
    });

    // Table border
    doc
      .rect(tableX, doc.y - (tableData.length * rowHeight), col1Width + col2Width, tableData.length * rowHeight)
      .strokeColor('#c0cfe8')
      .lineWidth(1)
      .stroke();

    doc.moveDown(2);

    // ─── Terms & Conditions ───────────────────────────────
    doc.y = tableY + 10;

    doc
      .fillColor('#1a3c6e')
      .fontSize(11)
      .font('Helvetica-Bold')
      .text('TERMS & CONDITIONS', { underline: true });

    doc.moveDown(0.5);

    const terms = [
      '1. This sanction is valid for 30 days from the date of this letter.',
      '2. The loan shall be disbursed subject to satisfactory KYC verification and documentation.',
      '3. The borrower is required to maintain a clean repayment record to avoid penal charges.',
      '4. Prepayment charges of 2% + GST will apply if the loan is foreclosed before 12 months.',
      '5. The final disbursement amount may vary subject to credit assessment at the time of disbursement.',
      '6. EMI will be debited via NACH/ECS mandate from the registered bank account.',
    ];

    terms.forEach((term) => {
      doc
        .fillColor('#444')
        .fontSize(9)
        .font('Helvetica')
        .text(term, { lineGap: 3 });
    });

    doc.moveDown(1.5);

    // ─── Signature ───────────────────────────────────────
    doc
      .moveTo(60, doc.y)
      .lineTo(535, doc.y)
      .strokeColor('#c0cfe8')
      .lineWidth(1)
      .stroke();

    doc.moveDown(1);

    doc
      .fillColor('#1a3c6e')
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('For Tata Capital Financial Services Ltd.', { align: 'right' });

    doc.moveDown(2);

    doc
      .fillColor('#333')
      .fontSize(10)
      .font('Helvetica')
      .text('Authorized Signatory', { align: 'right' })
      .text('Personal Loans Division', { align: 'right' });

    doc.moveDown(1);

    // Footer
    doc
      .fillColor('#999')
      .fontSize(8)
      .font('Helvetica')
      .text(
        'This is a system-generated document. For queries, contact our helpline at 1860-267-6060 or email personalloans@tatacapital.com',
        { align: 'center' }
      );

    doc.end();

    writeStream.on('finish', () => resolve(relativePath));
    writeStream.on('error', reject);
  });
};

module.exports = { generateSanctionLetter };
