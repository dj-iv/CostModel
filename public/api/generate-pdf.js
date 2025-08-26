// api/generate-pdf.js

const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');

module.exports = async (req, res) => {
  try {
    console.log("Screenshot test started.");

    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    
    // Use the simple Hello World content for this test
    await page.setContent('<html><body style="font-size: 3em; text-align: center; padding: 2em;"><h1>Hello World</h1><p>Screenshot Test</p></body></html>');

    // Instead of page.pdf(), we use page.screenshot()
    const imageBuffer = await page.screenshot({ type: 'png' });

    await browser.close();

    console.log("Screenshot created successfully. Size:", imageBuffer.length);

    // Send the response as a PNG image
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `attachment; filename="test-screenshot.png"`);
    return res.status(200).send(imageBuffer);

  } catch (error) {
    console.error('Error during screenshot test:', error);
    return res.status(500).send({ message: 'An error occurred during screenshot generation.', error: error.message });
  }
};
