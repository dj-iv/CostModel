// api/generate-pdf.js

const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');
const fs = require('fs');
const path = require('path');

// Helper function to read the HTML template file
const readTemplate = () => {
  const filePath = path.join(process.cwd(), 'public', 'interactive-proposal.html');
  return fs.readFileSync(filePath, 'utf8');
};

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).send({ message: 'Only POST requests are allowed.' });
  }

  try {
    const proposalData = req.body;
    let baseHtml = '';

    // In a serverless environment, the path might be different.
    // We check the Vercel-specific path first, then the local path.
    const vercelPath = path.join('/var/task', 'public', 'interactive-proposal.html');
    if (fs.existsSync(vercelPath)) {
        baseHtml = fs.readFileSync(vercelPath, 'utf8');
    } else {
        baseHtml = readTemplate(); // Fallback for local development
    }

    const populatedHtml = baseHtml.replace(/\{(\w+)\}/g, (match, key) => {
      return proposalData.hasOwnProperty(key) ? proposalData[key] : match;
    });

    // Launch the headless browser using the new library
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(), // Note the function call here
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

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="proposal.pdf"`);
    return res.status(200).send(pdfBuffer);

  } catch (error) {
    console.error('Error generating PDF:', error);
    return res.status(500).send({ message: 'An error occurred during PDF generation.' });
  }
};
