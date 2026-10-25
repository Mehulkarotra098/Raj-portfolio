// Screenshots Raj's live projects and downloads his published portfolio images.
import { chromium } from 'playwright';
import fs from 'node:fs';
const OUT = 'src/assets/capture';
fs.mkdirSync(OUT, { recursive: true });
const shots = [
  { name: 'neohire', url: 'https://www.neohire.site', wait: 3500 },
  { name: 'neohire-2', url: 'https://www.neohire.site', wait: 3500, scroll: 1100 },
  { name: 'indian-jobs', url: 'https://indian-jobs-ten.vercel.app', wait: 5000 },
  { name: 'indian-jobs-2', url: 'https://indian-jobs-ten.vercel.app', wait: 5000, scroll: 700 },
];
const files = ['neohire-live.png', 'indian-jobs-live.png', 'cover-pixel-dev.png', 'avatars/raj-avatar-pixel-classic.png', 'apex36-mark.png'];
for (const f of files) {
  try {
    const r = await fetch('https://rajchauhan.dev/portfolio/' + f);
    if (r.ok) fs.writeFileSync(`${OUT}/site-${f.replace('/', '-')}`, Buffer.from(await r.arrayBuffer()));
    console.log(f, r.status);
  } catch (e) { console.log(f, 'failed', String(e)); }
}
const b = await chromium.launch();
for (const s of shots) {
  try {
    const p = await b.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
    await p.goto(s.url, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
    await p.waitForTimeout(s.wait);
    if (s.scroll) { await p.mouse.wheel(0, s.scroll); await p.waitForTimeout(2500); }
    await p.screenshot({ path: `${OUT}/${s.name}.png` });
    console.log('shot', s.name);
    await p.close();
  } catch (e) { console.log('shot failed', s.name, String(e)); }
}
await b.close();
