let browser: any = null
let context: any = null

const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36'

async function loadPlaywright(): Promise<any> {
  try {
    // 使用 require 而不是 import，避免 Next.js 静态分析
    const pw = require('playwright-core')
    return pw.chromium
  } catch {
    return null
  }
}

export async function fetchWithBrowser(url: string): Promise<string> {
  const chromium = await loadPlaywright()
  if (!chromium) {
    throw new Error('Playwright not available')
  }

  if (!browser) {
    browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled'
      ]
    })
  }

  if (!context) {
    context = await browser.newContext({
      userAgent: USER_AGENT,
      viewport: { width: 1920, height: 1080 },
      locale: 'zh-CN'
    })
  }

  const page = await context.newPage()

  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 })
    return await page.content()
  } finally {
    await page.close()
  }
}

export async function closeBrowser(): Promise<void> {
  if (context) {
    await context.close()
    context = null
  }
  if (browser) {
    await browser.close()
    browser = null
  }
}
