let chromium: any = null
let browser: any = null
let context: any = null
let playwrightAvailable = true

const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36'

async function loadPlaywright(): Promise<boolean> {
  if (chromium) return true
  if (!playwrightAvailable) return false
  
  try {
    const pw = await import('playwright-core')
    chromium = pw.chromium
    return true
  } catch {
    playwrightAvailable = false
    return false
  }
}

async function getBrowser(): Promise<any> {
  if (!(await loadPlaywright())) {
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
  return browser
}

async function getContext(): Promise<any> {
  if (!context) {
    const b = await getBrowser()
    context = await b.newContext({
      userAgent: USER_AGENT,
      viewport: { width: 1920, height: 1080 },
      locale: 'zh-CN'
    })
  }
  return context
}

export async function fetchWithBrowser(url: string): Promise<string> {
  const ctx = await getContext()
  const page = await ctx.newPage()

  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 })
    return await page.content()
  } finally {
    await page.close()
  }
}

export async function executeInBrowser<T>(fn: () => Promise<T>): Promise<T> {
  const ctx = await getContext()
  const page = await ctx.newPage()

  try {
    await page.goto('about:blank')
    return await page.evaluate(fn)
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
