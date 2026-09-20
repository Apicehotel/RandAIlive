const target = process.argv[2] || 'https://apicehotel.vercel.app/randailive'

const response = await fetch(target, { redirect: 'follow' })
const html = await response.text()
const title = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim() || ''
const result = { target, status: response.status, finalUrl: response.url, title }

if (!response.ok) {
  console.error(JSON.stringify({ ...result, ok: false, reason: `HTTP ${response.status}` }, null, 2))
  process.exit(1)
}

if (/RandApp\s*-\s*Manutenzioni|RandApp/i.test(html)) {
  console.error(JSON.stringify({ ...result, ok: false, reason: 'official route is still served by RandApp, not RandAILive' }, null, 2))
  process.exit(1)
}

if (!/RandAILive/i.test(`${title}\n${html}`)) {
  console.error(JSON.stringify({ ...result, ok: false, reason: 'RandAILive marker not found in the published shell' }, null, 2))
  process.exit(1)
}

console.log(JSON.stringify({ ...result, ok: true }, null, 2))
