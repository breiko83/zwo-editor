const chromium = require('chrome-aws-lambda');


exports.handler = async (event, context, callback) => {

  const browser = await chromium.puppeteer.launch();
  
  const page = await browser.newPage();

  // Set the viewport to your preferred og:image size
  await page.setViewport({
    width: 1000,
    height: 1000,
    // My macbook is retina, so this should be 2 while testing locally
    deviceScaleFactor: 1,
  });

  
  await page.goto('http://localhost:8888/editor/xvb7zq2cmo', { "waitUntil": "networkidle0" });  
  const element = await page.$('#editor');

  await element.screenshot({ 
    path: 'xvb7zq2cmo.jpeg',
    type: 'jpeg',
    quality: 100
  });

  await browser.close();

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: `Complete screenshot`
    })
  }

}