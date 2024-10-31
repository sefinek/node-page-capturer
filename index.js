const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const fs = require('node:fs');
const path = require('node:path');

const DOMAIN = 'https://duckduckgo.com/?q=cat&iax=images&ia=images';
// const DOMAIN = 'https://sefinek.net';
const CAPTURE_FULL_PAGE = true;

const sanitizeFileName = url => url.replace(/[:\\/?&=]/g, '_');
const formatDate = () => new Date().toISOString().split('T')[0];
const formatTimestamp = () => new Date().toISOString().replace(/[:.]/g, '-');

(async () => {
	try {
		const browser = await puppeteer.launch({
			headless: false,
			defaultViewport: null,
			args: [
				'--no-sandbox',
				'--disable-setuid-sandbox',
				'--disable-dev-shm-usage',
				'--disable-accelerated-2d-canvas',
				'--no-zygote',
				'--no-first-run',
				'--disable-infobars',
				'--disable-features=site-per-process',
				'--disable-background-networking',
				'--disable-background-timer-throttling',
				'--disable-backgrounding-occluded-windows',
				'--disable-breakpad',
				'--disable-default-apps',
				'--disable-hang-monitor',
				'--disable-popup-blocking',
				'--disable-prompt-on-repost',
				'--disable-renderer-backgrounding',
				'--disable-sync',
				'--metrics-recording-only',
				'--mute-audio',
				'--no-crash-upload',
				'--no-default-browser-check',
				'--no-pings',
				'--password-store=basic',
				'--use-mock-keychain',
				'--disable-webrtc',
				'--start-maximized',
			],
		});

		const pages = await browser.pages();
		const page = pages[0];

		// Setting User-Agent etc.
		await page.setViewport({ width: 1920, height: 1080 });

		// Navigate to the target page
		await page.goto(DOMAIN, { waitUntil: 'networkidle2', timeout: 10000 });

		// Waiting for the full content to load
		await new Promise(resolve => setTimeout(resolve, 1000));

		// Taking a screenshot
		const saveDir = path.join(__dirname, 'screenshots', sanitizeFileName(new URL(DOMAIN).hostname), formatDate());
		fs.mkdirSync(saveDir, { recursive: true });
		await page.screenshot({
			path: path.join(saveDir, `${CAPTURE_FULL_PAGE ? 'fullscreen' : 'page'}_${formatTimestamp()}.png`),
			fullPage: CAPTURE_FULL_PAGE,
		});

		await browser.close();
	} catch (err) {
		console.error(err);
		process.exit(1);
	}
})();