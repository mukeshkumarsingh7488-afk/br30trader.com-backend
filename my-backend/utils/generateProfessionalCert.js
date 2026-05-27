//#region ━━━━━ 🚀 WELCOME DEVELOPER | SYSTEM INITIALIZED ━━━━━
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const QRCode = require("qrcode");

const generateProfessionalCert = async (user, fullName, certId, courseName, issueDate) => {
  const certFolder = path.join(process.cwd(), "certificates");
  if (!fs.existsSync(certFolder)) fs.mkdirSync(certFolder, { recursive: true });

  const fileName = `${certId}.pdf`;
  const filePath = path.join(certFolder, fileName);

  const logoPath = path.join(process.cwd(), "images", "logo-watermark.png");

  const frontendBase = process.env.FRONTEND_URL || "https://my-frontend-eight-roan.vercel.app";
  const qrData = `${frontendBase}/verify?id=${certId}`;
  const qrImage = await QRCode.toDataURL(qrData);

  const doc = new PDFDocument({ layout: "landscape", size: "A4", margin: 0 });
  const writeStream = fs.createWriteStream(filePath);
  doc.pipe(writeStream);

  const gold = "#D4AF37";
  const finalIssueDate = issueDate ? new Date(issueDate) : new Date();

  doc.rect(20, 20, 802, 555).lineWidth(12).stroke(gold);
  doc.rect(45, 45, 752, 505).lineWidth(2).stroke("#1a1a1a");

  if (fs.existsSync(logoPath)) {
    doc.save();
    doc.opacity(0.14);
    doc.image(logoPath, 285, 130, { width: 275 });
    doc.opacity(1);
    doc.restore();
  }

  const watermarkLines = [
    { x: -75, y: 135 },
    { x: 70, y: 425 },
    { x: 520, y: 155 },
    { x: 590, y: 385 },
  ];

  watermarkLines.forEach((pos) => {
    doc.save();
    doc.rotate(-32, { origin: [pos.x + 170, pos.y + 25] });
    doc.font("Helvetica-Bold").fontSize(28).fillColor("#cbd5e1").opacity(0.14).text("BR30 ACADEMY", pos.x, pos.y, { width: 430 });
    doc.opacity(1);
    doc.restore();
  });

  doc.fontSize(10).fillColor("#1a1a1a").font("Helvetica-Bold").text("BR30 TRADER ACADEMY | TRUSTED EDUCATION", 0, 65, { align: "center" });
  doc.fontSize(11).text("MSME REGISTERED ACADEMY ✓", 550, 95, { align: "right", width: 220 });
  doc.fontSize(10).fillColor(gold).text(`CERTIFICATE NO: ${certId}`, 550, 110, { align: "right", width: 220 });
  doc.fontSize(8).fillColor("#64748b").text("UDYAM-BR-34-0058103", 550, 125, { align: "right", width: 220 });

  doc.fillColor("#1a1a1a").font("Helvetica-Bold").fontSize(42).text("CERTIFICATE OF COMPLETION", 0, 160, { align: "center" });
  doc.fontSize(18).font("Helvetica").fillColor("#64748b").text("This certificate is proudly presented to", 0, 210, { align: "center" });
  doc.fontSize(55).fillColor(gold).font("Helvetica").text(fullName.toUpperCase(), 0, 255, { align: "center" });
  doc.fontSize(16).fillColor("#64748b").font("Helvetica").text("For successfully completing the professional masterclass", 0, 345, { align: "center" });
  doc.fontSize(24).fillColor("#1a1a1a").font("Helvetica-Bold").text(courseName.toUpperCase(), 0, 380, { align: "center" });

  const footerY = 485;

  doc.image(qrImage, 385, 445, { width: 75 });
  doc.fontSize(8).fillColor("#94a3b8").text("SCAN TO VERIFY", 0, 525, { align: "center" });

  doc.fontSize(10).fillColor("#1a1a1a").font("Helvetica-Bold").text("OFFICE ADDRESS", 100, footerY);
  doc
    .fontSize(9)
    .font("Helvetica")
    .text("Whitefield, Bangalore 560066, India", 100, footerY + 15);
  doc
    .fontSize(12)
    .fillColor("#1a1a1a")
    .text(`DATE: ${finalIssueDate.toLocaleDateString("en-IN")}`, 100, footerY + 40);

  doc
    .fontSize(14)
    .fillColor("#1a1a1a")
    .font("Helvetica-Bold")
    .text("INSTRUCTOR", 550, footerY + 15, { align: "right", width: 180 });
  doc
    .fontSize(22)
    .fillColor(gold)
    .font("Helvetica-Bold")
    .text("MUKESH RAJ.", 550, footerY + 35, { align: "right", width: 180 });

  doc.end();

  return new Promise((resolve, reject) => {
    writeStream.on("finish", () => resolve({ fileName, filePath }));
    writeStream.on("error", reject);
  });
};

module.exports = { generateProfessionalCert };
//#endregion
// ==========================================================================
// ✅ LOGIC STATUS: CERTIFICATE GENERATION ENGINE ORGANIZED & TESTED.
// 📜 ASSETS: DYNAMIC DATA BINDING & PDF RENDERING READY.
// 🚀 DEPLOYMENT: READY FOR PRODUCTION ISSUANCE!
// ==========================================================================
