// api/generate-pdf.js

const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');
const fs = require('fs');
const path = require('path');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).send({ message: 'Only POST requests are allowed.' });
  }

  let browser = null;

  try {
    const proposalData = req.body;
    
    const templatePath = path.join(process.cwd(), 'public', 'interactive-proposal.html');
    let baseHtml = '';

    if (fs.existsSync(templatePath)) {
        baseHtml = fs.readFileSync(templatePath, 'utf8');
    } else {
        throw new Error("HTML template file not found on the server.");
    }

    const siteUrl = `https://${process.env.VERCEL_URL}`;
    const finalHtml = baseHtml.replace('<head>', `<head><base href="${siteUrl}">`);

    const populatedHtml = finalHtml.replace(/\{(\w+)\}/g, (match, key) => {
      return proposalData.hasOwnProperty(key) ? proposalData[key] : match;
    });

    // --- START: Production-ready browser launch options ---
    browser = await puppeteer.launch({
      args: [...chromium.args, '--no-sandbox', '--disable-setuid-sandbox'], // Add essential flags
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });
    // --- END: Production-ready browser launch options ---

    const page = await browser.newPage();
    await page.setContent(populatedHtml, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' },
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="proposal.pdf"`);
    return res.status(200).send(pdfBuffer);

  } catch (error) {
    console.error('Error caught in PDF generation function:', error);
    return res.status(500).send({ message: 'An error occurred during PDF generation.', error: error.message });
  } finally {
    // Ensure the browser is always closed
    if (browser !== null) {
      await browser.close();
    }
  }
};
