import ivm from 'isolated-vm'
import fs from 'fs'
import path from 'path'

// 加载签名算法
const aBogusPath = path.join(process.cwd(), 'src/lib/parsers/a_bogus.js')
const xBogusPath = path.join(process.cwd(), 'src/lib/parsers/x_bogus.js')

const aBogusCode = fs.readFileSync(aBogusPath, 'utf-8')
const xBogusCode = fs.readFileSync(xBogusPath, 'utf-8')

// 生成 a_bogus 签名
export async function generateABogus(url: string, userAgent: string): Promise<string> {
  const isolate = new ivm.Isolate({ memoryLimit: 128 })
  const context = await isolate.createContext()
  const jail = context.global

  await jail.set('global', jail.derefInto())
  await jail.set('_url', url)
  await jail.set('_userAgent', userAgent)

  const query = new URL(url).searchParams.toString()
  await jail.set('_query', query)

  const code = aBogusCode + '\ngenerate_a_bogus(_query, _userAgent);'

  const script = await isolate.compileScript(code)
  const result = await script.run(context)

  context.release()
  isolate.dispose()
  return result
}

// 生成 x_bogus 签名
export async function generateXBogus(url: string, userAgent: string): Promise<string> {
  const isolate = new ivm.Isolate({ memoryLimit: 128 })
  const context = await isolate.createContext()
  const jail = context.global

  await jail.set('global', jail.derefInto())
  await jail.set('_url', url)
  await jail.set('_userAgent', userAgent)

  const query = new URL(url).searchParams.toString()
  await jail.set('_query', query)

  const code = xBogusCode + '\nsign(_query, _userAgent);'

  const script = await isolate.compileScript(code)
  const result = await script.run(context)

  context.release()
  isolate.dispose()
  return result
}

// 生成 msToken
export function generateMsToken(length: number = 107): string {
  const chars = 'ABCDEFGHIGKLMNOPQRSTUVWXYZabcdefghigklmnopqrstuvwxyz0123456789='
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// 生成 ttwid
export async function generateTtwid(url: string): Promise<{ ttwid: string; webid: string }> {
  const axios = (await import('axios')).default

  const response = await axios.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8'
    },
    timeout: 5000
  })

  const cookies = response.headers['set-cookie'] || []
  const ttwidMatch = cookies.find((c: string) => c.includes('ttwid'))
  const ttwid = ttwidMatch?.match(/ttwid=([^;]+)/)?.[1] || ''

  const webidMatch = response.data.match(/"user_unique_id":"([^"]+)"/)
  const webid = webidMatch?.[1] || ''

  return { ttwid, webid }
}
