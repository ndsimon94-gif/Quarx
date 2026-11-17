// Renders the Quarx mark to every PNG the app and PWA need.
//   node scripts/make-icons.cjs   (uses the pre-installed Playwright Chromium)
const { chromium } = require('playwright');
const path = require('path');

const mark = (bg, pad) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="100%" height="100%">
  ${
    bg
      ? `<defs><radialGradient id="g" cx="50%" cy="100%" r="80%"><stop offset="0" stop-color="#d9773a" stop-opacity=".45"/><stop offset=".6" stop-color="#07080f" stop-opacity="0"/></radialGradient></defs>
  <rect width="32" height="32" fill="#07080f"/><rect width="32" height="32" fill="url(#g)"/>`
      : ''
  }
  <g transform="translate(${pad} ${pad}) scale(${(32 - 2 * pad) / 32})">
    <circle cx="16" cy="16" r="15" stroke="#f2a65a" stroke-opacity=".55" stroke-width="1" fill="none"/>
    <path d="M16 5 L17.6 13.4 L26 15 L17.6 16.6 L16 25 L14.4 16.6 L6 15 L14.4 13.4 Z" fill="#fff4dc"/>
    <circle cx="16" cy="27.2" r="1.6" fill="#f2a65a"/>
  </g>
</svg>`;

const jobs = [
  ['assets/images/icon.png', 1024, true, 5],
  ['assets/images/favicon.png', 48, true, 2],
  ['assets/images/splash-icon.png', 512, false, 2],
  ['public/icons/icon-192.png', 192, true, 4],
  ['public/icons/icon-512.png', 512, true, 4],
  ['public/icons/maskable-512.png', 512, true, 8],
  ['public/icons/apple-touch-icon.png', 180, true, 4],
];

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  for (const [out, size, bg, pad] of jobs) {
    await page.setViewportSize({ width: size, height: size });
    await page.setContent(
      `<html><body style="margin:0;background:transparent">${mark(bg, pad)}</body></html>`,
    );
    await page.screenshot({ path: path.join(__dirname, '..', out), omitBackground: !bg });
    console.log('wrote', out);
  }
  await browser.close();
})();
