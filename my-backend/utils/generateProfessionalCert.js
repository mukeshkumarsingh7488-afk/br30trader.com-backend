//#region Certificate Generator Utility
// Ye utility function humare certificate generate karne ke liye hai. Isme hum PDFKit ka use karke ek professional certificate design karenge, jisme student ka naam, course ka naam, date, aur ek unique certificate ID hoga. 
// Jab bhi koi user course complete karega, toh yeh function call hoke uske liye ek personalized certificate generate karega, jise wo download kar sakta hai aur apne achievements ko showcase kar sakta hai.
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const QRCode = require("qrcode");

/**
 * 🎓 BR30 TRADER - ULTIMATE MSME CERTIFICATE GENERATOR
 */
// ✅ UPDATE: courseName parameter add kiya hai taaki dynamic name chhape
const generateProfessionalCert = async (user, fullName, certId, courseName) => {
  // 📂 1. Certificates folder setup
  const certFolder = path.join(process.cwd(), "certificates");
  if (!fs.existsSync(certFolder)) fs.mkdirSync(certFolder, { recursive: true });

  // 🕒 2. FIX: FileName ab hamesha ID ke naam se hoga (e.g., BR30-978424.pdf)
  // Isse purani file automatic replace ho jayegi aur folder "blast" nahi hoga
  const fileName = `${certId}.pdf`;
  const filePath = path.join(certFolder, fileName);

  // 📱 3. QR Link for Verification
  const qrData = `http://localhost:5000/verify.html?id=${certId}`;
  const qrImage = await QRCode.toDataURL(qrData);

  const doc = new PDFDocument({ layout: "landscape", size: "A4", margin: 0 });
  const writeStream = fs.createWriteStream(filePath);
  doc.pipe(writeStream);

  const gold = "#D4AF37";

  // 🎨 DESIGN: PREMIUM BORDERS (Same Design, No Changes)
  doc.rect(20, 20, 802, 555).lineWidth(12).stroke(gold);
  doc.rect(45, 45, 752, 505).lineWidth(2).stroke("#1a1a1a");

  // 🛡️ MSME & CERTIFICATE NO. (Top Right)
  doc
    .fontSize(10)
    .fillColor("#1a1a1a")
    .font("Helvetica-Bold")
    .text("BR30 TRADER ACADEMY | TRUSTED EDUCATION", 0, 65, {
      align: "center",
    });
  doc
    .fontSize(11)
    .text("MSME REGISTERED ACADEMY ✓", 550, 95, { align: "right", width: 220 });
  doc
    .fontSize(10)
    .fillColor(gold)
    .text(`CERTIFICATE NO: ${certId}`, 550, 110, {
      align: "right",
      width: 220,
    });
  doc
    .fontSize(8)
    .fillColor("#64748b")
    .text("UDYAM-BR-34-0058103", 550, 125, { align: "right", width: 220 });

  // 🏆 HEADER
  doc
    .fillColor("#1a1a1a")
    .font("Helvetica-Bold")
    .fontSize(42)
    .text("CERTIFICATE OF COMPLETION", 0, 160, { align: "center" });
  doc
    .fontSize(18)
    .font("Helvetica")
    .fillColor("#64748b")
    .text("This certificate is proudly presented to", 0, 210, {
      align: "center",
    });

  // ⭐ STUDENT NAME (Golden Slim Style)
  doc
    .fontSize(55)
    .fillColor(gold)
    .font("Helvetica")
    .text(fullName.toUpperCase(), 0, 255, { align: "center" });

  // 🎓 COURSE INFO
  doc
    .fontSize(16)
    .fillColor("#64748b")
    .font("Helvetica")
    .text("For successfully completing the professional masterclass", 0, 345, {
      align: "center",
    });

  // ✅ UPDATE: Fixed text ki jagah ab 'courseName' variable print hoga (Dynamic)
  doc
    .fontSize(24)
    .fillColor("#1a1a1a")
    .font("Helvetica-Bold")
    .text(courseName.toUpperCase(), 0, 380, { align: "center" });

  // 📅 FOOTER LAYOUT
  const footerY = 485;
  doc.image(qrImage, 385, 445, { width: 75 });
  doc
    .fontSize(8)
    .fillColor("#94a3b8")
    .text("SCAN TO VERIFY 🛡️", 0, 525, { align: "center" });

  // Left Side: Address & Date
  doc
    .fontSize(10)
    .fillColor("#1a1a1a")
    .font("Helvetica-Bold")
    .text("OFFICE ADDRESS", 100, footerY);
  doc
    .fontSize(9)
    .font("Helvetica")
    .text("Sitamarhi Bihar, 843302", 100, footerY + 15);
  doc
    .fontSize(12)
    .fillColor("#1a1a1a")
    .text(`DATE: ${new Date().toLocaleDateString("en-IN")}`, 100, footerY + 40);

  // Right Side: Instructor
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

  // 🚀 RETURN PROMISE
  return new Promise((resolve, reject) => {
    writeStream.on("finish", () => resolve({ fileName, filePath }));
    writeStream.on("error", (err) => {
      console.error("❌ PDF Stream Error:", err);
      reject(err);
    });
  });
};

module.exports = { generateProfessionalCert };
//#endregion