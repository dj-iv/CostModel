// api/generate-pdf.js

const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');
const fs = require('fs');
const path = require('path');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).send({ message: 'Only POST requests are allowed.' });
  }

  try {
    console.log("PDF generation function started.");
    const proposalData = req.body;
    let baseHtml = '';

    const templatePath = path.join(process.cwd(), 'public', 'interactive-proposal.html');
    console.log("Attempting to read template from path:", templatePath);

    if (fs.existsSync(templatePath)) {
        baseHtml = fs.readFileSync(templatePath, 'utf8');
        console.log("Successfully read template file. Length:", baseHtml.length);
    } else {
        console.error("CRITICAL: Template file not found at path:", templatePath);
        throw new Error("HTML template file not found on the server.");
    }

    const siteUrl = `https://${process.env.VERCEL_URL}`;
    const finalHtml = baseHtml.replace('<head>', `<head><base href="${siteUrl}">`);

    const populatedHtml = finalHtml.replace(/\{(\w+)\}/g, (match, key) => {
      return proposalData.hasOwnProperty(key) ? proposalData[key] : match;
    });

    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.setContent(populatedHtml, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' },
    });

    await browser.close();

    // --- START: New validation and logging ---
    console.log("PDF buffer created. Size (bytes):", pdfBuffer.length);

    // A real PDF will be thousands of bytes. If it's too small, something is wrong.
    if (!pdfBuffer || pdfBuffer.length < 1000) {
        throw new Error("Generated PDF buffer is empty or too small to be valid.");
    }
    // --- END: New validation and logging ---

    console.log("PDF generated successfully. Sending response.");
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="proposal.pdf"`);
    return res.status(200).send(pdfBuffer);

  } catch (error) {
    console.error('Error caught in PDF generation function:', error);
    return res.status(500).send({ message: 'An error occurred during PDF generation.', error: error.message });
  }
};
