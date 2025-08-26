const puppeteer = require('puppeteer-core');
const chrome = require('chrome-aws-lambda');
const fs = require('fs');
const path = require('path');

// Helper function to read the HTML template file
const readTemplate = () => {
  const filePath = path.join(process.cwd(), 'Interactive-Universal-Proposal.html');
  return fs.readFileSync(filePath, 'utf8');
};

module.exports = async (req, res) => {
  // 1. Ensure this is a POST request
  if (req.method !== 'POST') {
    return res.status(405).send({ message: 'Only POST requests are allowed.' });
  }

  try {
    const proposalData = req.body;
    const baseHtml = readTemplate();

    // 2. Populate the HTML template with data
    const populatedHtml = baseHtml.replace(/\{(\w+)\}/g, (match, key) => {
      return proposalData.hasOwnProperty(key) ? proposalData[key] : match;
    });

    // 3. Launch the headless browser
    const browser = await puppeteer.launch({
      args: chrome.args,
      executablePath: await chrome.executablePath,
      headless: chrome.headless,
    });

    const page = await browser.newPage();
    // 4. Load the populated HTML into the page
    await page.setContent(populatedHtml, { waitUntil: 'networkidle0' });

    // 5. Generate the PDF buffer
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true, // Crucial for including colors and backgrounds
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm',
      },
    });

    await browser.close();

    // 6. Send the PDF back to the client
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="proposal.pdf"`);
    return res.status(200).send(pdfBuffer);

  } catch (error) {
    console.error('Error generating PDF:', error);
    return res.status(500).send({ message: 'An error occurred during PDF generation.' });
  }
};
