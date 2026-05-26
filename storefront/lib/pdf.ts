import PDFDocument from "pdfkit";
import path from "path";
import fs from "fs";

export async function generateInvoicePdf({
  orderId,
  customerName,
  email,
  product,
  amount,
  date = new Date().toLocaleDateString("en-US", { timeZone: "America/New_York" }),
}: {
  orderId: string;
  customerName: string;
  email: string;
  product: string;
  amount: number;
  date?: string;
}): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 0, size: "A4" });
      const buffers: Buffer[] = [];

      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", reject);

      const PRIMARY_COLOR = "#006d37"; // Dark Green
      const SECONDARY_COLOR = "#4ae183"; // Light Green
      const TEXT_MAIN = "#111111";
      const TEXT_MUTED = "#666666";

      // Top Accent Bar
      doc.rect(0, 0, doc.page.width, 12).fill(PRIMARY_COLOR);

      // Header Section
      doc.y = 50;
      doc.x = 50;

      // Add Logo if it exists
      const logoPath = path.join(process.cwd(), "public", "images", "logo.png");
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 50, 40, { fit: [140, 70] });
      } else {
        doc.fillColor(PRIMARY_COLOR).font("Helvetica-Bold").fontSize(24).text("Superior Harness", 50, 50);
      }

      // Company Info (Right Aligned)
      doc.fillColor(TEXT_MAIN).font("Helvetica-Bold").fontSize(12).text("Superior Harness & Assembly LLC", 300, 50, { align: "right", width: 245 });
      doc.fillColor(TEXT_MUTED).font("Helvetica").fontSize(10)
        .text("Canton, Michigan, 48187", { align: "right", width: 245 })
        .text("pateltushar1987@gmail.com", { align: "right", width: 245 })
        .text("+91 734 891 0248", { align: "right", width: 245 });

      doc.moveDown(3);

      // Invoice Title
      doc.y = 150;
      doc.fillColor(PRIMARY_COLOR).font("Helvetica-Bold").fontSize(28).text("INVOICE", 50, 150);

      // Separator Line
      doc.moveTo(50, 185).lineTo(545, 185).lineWidth(2).strokeColor(SECONDARY_COLOR).stroke();

      // Invoice Details & Billed To
      doc.y = 210;
      doc.x = 50;

      // Left Side: Billed To
      doc.fillColor(TEXT_MUTED).font("Helvetica-Bold").fontSize(10).text("BILLED TO:");
      doc.moveDown(0.5);
      doc.fillColor(TEXT_MAIN).font("Helvetica-Bold").fontSize(14).text(customerName);
      doc.fillColor(TEXT_MUTED).font("Helvetica").fontSize(11).text(email);

      // Right Side: Details
      doc.fillColor(TEXT_MUTED).font("Helvetica-Bold").fontSize(10).text("INVOICE NUMBER:", 300, 210, { align: "right", width: 245 });
      doc.fillColor(TEXT_MAIN).font("Helvetica").fontSize(11).text(orderId, { align: "right", width: 245 });
      doc.moveDown(0.5);
      doc.fillColor(TEXT_MUTED).font("Helvetica-Bold").fontSize(10).text("DATE OF ISSUE:", 300, doc.y, { align: "right", width: 245 });
      doc.fillColor(TEXT_MAIN).font("Helvetica").fontSize(11).text(date, { align: "right", width: 245 });

      doc.moveDown(4);

      // Table Header
      const tableTop = doc.y + 20;
      doc.rect(50, tableTop, 495, 30).fill(PRIMARY_COLOR);

      doc.fillColor("#FFFFFF").font("Helvetica-Bold").fontSize(10);
      doc.text("ITEM DESCRIPTION", 65, tableTop + 10);
      doc.text("TOTAL", 400, tableTop + 10, { width: 130, align: "right" });

      // Table Content
      const tableRow = tableTop + 45;
      doc.fillColor(TEXT_MAIN).font("Helvetica").fontSize(12);

      const formattedAmount = `$${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

      doc.text(product, 65, tableRow, { width: 300, lineGap: 4 });
      doc.font("Helvetica-Bold").text(formattedAmount, 400, tableRow, { width: 130, align: "right" });

      // Table Bottom Border
      const tableBottom = Math.max(doc.y, tableRow + 20);
      doc.moveTo(50, tableBottom).lineTo(545, tableBottom).lineWidth(1).strokeColor("#E0E0E0").stroke();

      // Total Section
      doc.y = tableBottom + 20;
      doc.fillColor(TEXT_MAIN).font("Helvetica-Bold").fontSize(16);
      doc.text("Total Paid:", 300, doc.y, { width: 100, align: "right" });
      doc.fillColor(PRIMARY_COLOR).text(formattedAmount, 410, doc.y, { width: 135, align: "right" });

      // Footer
      const footerY = doc.page.height - 80;
      doc.moveTo(50, footerY - 20).lineTo(545, footerY - 20).lineWidth(1).strokeColor("#E0E0E0").stroke();
      doc.fillColor(TEXT_MUTED).font("Helvetica").fontSize(10).text("Thank you for choosing Superior Harness & Assembly LLC.", 50, footerY, { align: "center", width: 495 });
      doc.fillColor(SECONDARY_COLOR).text("If you have any questions about this invoice, please contact us.", 50, footerY + 15, { align: "center", width: 495 });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
