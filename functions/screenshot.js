const chromium = require('chrome-aws-lambda');

exports.handler = async (event, context, callback) => {

  const browser = await chromium.puppeteer.launch();
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1800, height: 850 })

  
  await page.goto('http://localhost:8888/editor/xvb7zq2cmo', { "waitUntil": "networkidle0" });  
  const elements = await page.$('#editor');
  await elements.screenshot({ path: 'screenshot.png'});

  await browser.close();

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: `Complete screenshot`
    })
  }

}