// Five illustrated "stations" for the What I do flow: API → Cloud → Data → AI → UI.
// Each one is three SVG layers (back / mid / front) stacked in 3D so the card has real depth
// when it tilts. Every moving part is a CSS animation that only runs while its station is active.
const L = (z, body, cls = '') => `<div class="lyr ${cls}" style="--z:${z}"><svg viewBox="0 0 320 240" preserveAspectRatio="xMidYMid meet">${body}</svg></div>`;
const t = (x, y, s, cls = 'tx') => `<text class="${cls}" x="${x}" y="${y}">${s}</text>`;

// 01 API: a router taking requests and answering them
const api = () => [
  L(0, `<rect class="pl" x="22" y="26" width="276" height="188" rx="16"/>
    <path class="ln" d="M22 58h276"/>
    <circle class="o" cx="42" cy="42" r="4"/><circle class="g" cx="56" cy="42" r="4"/><circle class="g" cx="70" cy="42" r="4"/>
    ${t(90, 46, 'api · routes', 'tx sm')}`),
  L(34, `${[['GET', '/jobs', 82], ['POST', '/auth/login', 124], ['PUT', '/profile', 166]].map(([m, p, y], i) => `
    <g class="rt" style="--i:${i}">
      <rect class="${i === 0 ? 'o' : 'pill'}" x="44" y="${y}" width="${m.length * 11 + 16}" height="24" rx="12"/>
      ${t(52, y + 16, m, i === 0 ? 'tx dk b' : 'tx b')}
      ${t(56 + m.length * 11 + 16, y + 16, p, 'tx')}
      <g class="ok"><rect class="okb" x="236" y="${y + 2}" width="44" height="20" rx="10"/>${t(245, y + 16, '200', 'tx gr b')}</g>
    </g>`).join('')}`),
  L(70, `${[94, 136, 178].map((y, i) => `<circle class="pk o" style="--i:${i}" cx="-10" cy="${y}" r="5"/>`).join('')}
    ${[94, 136, 178].map((y, i) => `<circle class="rs" style="--i:${i}" cx="282" cy="${y}" r="4"/>`).join('')}
    <g class="lock"><rect class="w" x="210" y="134" width="16" height="12" rx="3"/><path class="lk" d="M213.5 134v-3.5a4.5 4.5 0 0 1 9 0v3.5"/></g>`, 'front'),
].join('');

// 02 Cloud: serverless functions that scale up and down
const cloud = () => [
  L(0, `<rect class="pl" x="16" y="14" width="288" height="212" rx="18"/><path class="cl" d="M78 196h170a46 46 0 0 0 4-92 64 64 0 0 0-122-16 48 48 0 0 0-52 108z"/>
    <circle class="ring" cx="160" cy="132" r="70"/>`),
  L(36, `${[['resume', 92], ['score', 160], ['notify', 228]].map(([n, x], i) => `
    <g class="fn" style="--i:${i}; transform-origin:${x}px 140px">
      <rect class="${i === 1 ? 'o' : 'chip'}" x="${x - 30}" y="116" width="60" height="48" rx="12"/>
      ${t(x - 7, 145, 'λ', i === 1 ? 'tx dk xl' : 'tx xl')}
      ${t(x - 22, 182, n, 'tx sm')}
    </g>`).join('')}`),
  L(72, `${[[40, 70], [262, 60], [270, 176]].map(([x, y], i) => `<g class="cube" style="--i:${i}"><path class="cb-t" d="M${x} ${y}l14-8 14 8-14 8z"/><path class="cb-l" d="M${x} ${y}v16l14 8v-16z"/><path class="cb-r" d="M${x + 28} ${y}v16l-14 8v-16z"/></g>`).join('')}
    <g class="up"><path class="o" d="M160 36l12 14h-7v14h-10v-14h-7z"/></g>`, 'front'),
].join('');

// 03 Data: rows flowing from a store into a chart
const data = () => [
  L(0, `<rect class="pl" x="22" y="26" width="276" height="188" rx="16"/>
    <path class="ln" d="M120 186h160M120 186V58"/>
    ${[90, 122, 154].map((y) => `<path class="ln dsh" d="M120 ${y}h160"/>`).join('')}`),
  L(34, `<g class="db"><ellipse class="w2" cx="66" cy="84" rx="28" ry="9"/><path class="w2" d="M38 84v74c0 5 13 9 28 9s28-4 28-9V84"/><path class="ln2" d="M38 108c0 5 13 9 28 9s28-4 28-9M38 132c0 5 13 9 28 9s28-4 28-9"/></g>
    ${[0, 1, 2, 3, 4].map((i) => `<rect class="${i === 4 ? 'o' : 'bar'} grow" style="--i:${i}; transform-origin:${136 + i * 30}px 186px" x="${136 + i * 30 - 9}" y="${186 - [50, 78, 60, 98, 118][i]}" width="18" height="${[50, 78, 60, 98, 118][i]}" rx="4"/>`).join('')}
    <path class="trend" d="M136 122 166 98 196 112 226 76 256 56" pathLength="1"/>`),
  L(70, `${[0, 1, 2].map((i) => `<circle class="dot" style="--i:${i}" cx="94" cy="124" r="4"/>`).join('')}
    <g class="tip"><rect class="w" x="214" y="22" width="84" height="34" rx="10"/>${t(226, 44, 'trend ↑', 'tx ink b')}</g>`, 'front'),
].join('');

// 04 AI: a small network lighting up, answering in a chat bubble
const ai = () => {
  const A = [[64, 70], [64, 120], [64, 170]], B = [[150, 52], [150, 100], [150, 148], [150, 196]], C = [[236, 96], [236, 152]];
  const edges = [...A.flatMap((a) => B.map((b) => [a, b])), ...B.flatMap((b) => C.map((c) => [b, c]))];
  return [
    L(0, `<rect class="pl" x="16" y="14" width="288" height="212" rx="18"/><circle class="halo" cx="150" cy="124" r="92"/><circle class="ring2" cx="150" cy="124" r="70"/>`),
    L(34, `${edges.map(([[x1, y1], [x2, y2]], i) => `<path class="edge" d="M${x1} ${y1}L${x2} ${y2}"/><path class="sig" style="--i:${i % 7}" pathLength="1" d="M${x1} ${y1}L${x2} ${y2}"/>`).join('')}
      ${[...A, ...B, ...C].map(([x, y], i) => `<circle class="${i >= 7 ? 'o nd' : 'node nd'}" style="--i:${i}" cx="${x}" cy="${y}" r="${i >= 7 ? 10 : 8}"/>`).join('')}`),
    L(72, `<g class="bub"><rect class="w" x="196" y="18" width="104" height="44" rx="14"/><path class="w" d="M212 60l-8 12 18-12z"/>
      ${[0, 1, 2].map((i) => `<circle class="typ" style="--i:${i}" cx="${226 + i * 16}" cy="40" r="5"/>`).join('')}</g>
      <path class="spark" d="M44 28l4 10 10 4-10 4-4 10-4-10-10-4 10-4z"/>`, 'front'),
  ].join('');
};

// 05 UI: the screen people actually use, assembling itself, with a click
const ui = () => [
  L(0, `<rect class="pl" x="18" y="20" width="250" height="186" rx="14"/><path class="ln" d="M18 46h250"/>
    <circle class="o" cx="34" cy="33" r="4"/><circle class="g" cx="48" cy="33" r="4"/><circle class="g" cx="62" cy="33" r="4"/>
    <rect class="url" x="84" y="26" width="140" height="14" rx="7"/>`),
  L(34, `<rect class="blk sb" x="30" y="58" width="44" height="136" rx="8"/>
    <rect class="blk hb" x="84" y="58" width="172" height="34" rx="8"/>
    ${[0, 1, 2].map((i) => `<rect class="${i === 0 ? 'o' : 'blk'} cd" style="--i:${i}" x="${84 + i * 60}" y="102" width="52" height="56" rx="8"/>`).join('')}
    <rect class="blk ft" x="84" y="168" width="110" height="26" rx="8"/>
    <g class="btn"><rect class="o" x="200" y="168" width="56" height="26" rx="13"/>${t(213, 185, 'Go', 'tx dk b')}</g>`),
  L(70, `<g class="ph"><rect class="phf" x="240" y="96" width="62" height="118" rx="12"/><rect class="o" x="248" y="112" width="46" height="18" rx="5"/><rect class="bar" x="248" y="136" width="46" height="30" rx="5"/><rect class="bar" x="248" y="172" width="30" height="8" rx="4"/></g>
    <g class="cur"><path class="w" d="M0 0l0 22 6-6 5 10 4-2-5-10h8z"/></g><circle class="ripple" cx="228" cy="181" r="6"/>`, 'front'),
].join('');

export const flowArt = { API: api, Cloud: cloud, Data: data, AI: ai, UI: ui };
export const flowCaption = {
  API: 'Requests in, answers out',
  Cloud: 'Functions that scale themselves',
  Data: 'Raw rows to one clear chart',
  AI: 'Models wired into the product',
  UI: 'The screen people actually use',
};
