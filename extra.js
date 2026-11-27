/* Baraka West Mini Hardware website — "how did you hear", bulk orders for schools/hotels/churches,
   share a product, delivery & payment, FAQ and seasonal banners. Loaded after site.js. */

Object.assign(window.SW_DICT || {}, {
  'How did you hear about us?': 'Ulitujuaje?', 'Choose (optional)': 'Chagua (hiari)', 'Google / Maps': 'Google / Ramani', 'Friend or family': 'Rafiki au familia',
  'A fundi / carpenter': 'Fundi / seremala', 'Poster or flyer': 'Bango au kipeperushi', 'Radio': 'Redio', 'Passing the shop': 'Nilipita dukani', 'Other': 'Nyingine',
  'Share': 'Shiriki', 'Delivery & payment': 'Usafirishaji na malipo', 'Delivery areas': 'Maeneo tunayofikisha', 'How to pay': 'Jinsi ya kulipa',
  'Ask us': 'Tuulize', 'M-Pesa Till (Buy Goods)': 'M-Pesa Till (Lipa na M-Pesa)', 'Paybill': 'Paybill', 'Account': 'Akaunti',
  'Cash, M-Pesa or bank at the counter. For big orders and sofa jobs we take a deposit — the rest when it is ready.': 'Pesa taslimu, M-Pesa au benki dukani. Kwa oda kubwa na kazi za sofa tunachukua amana — iliyobaki ikiwa tayari.',
  'Questions people ask': 'Maswali yanayoulizwa', 'Bulk orders for schools, hotels & churches': 'Oda za jumla kwa shule, hoteli na makanisa',
  'Get a bulk quote': 'Pata bei ya jumla', 'Organisation name': 'Jina la shirika', 'What do you need? (items and quantities)': 'Unahitaji nini? (bidhaa na idadi)',
  'When do you need it? (optional)': 'Unahitaji lini? (hiari)', 'Send request': 'Tuma ombi', 'Contact name': 'Jina la mhusika',
  'Request sent! Your number is': 'Ombi limetumwa! Nambari yako ni', 'We will call you with prices on': 'Tutakupigia na bei kwa',
  'Pay a deposit': 'Lipa amana', 'Just in': 'Mpya dukani', 'See photos': 'Ona picha', 'See photo': 'Ona picha', 'Reserve for pickup': 'Hifadhi uchukue', 'Ask about this item': 'Uliza kuhusu bidhaa hii',
});
const WHERE_HEARD = [['google', 'Google / Maps'], ['facebook', 'Facebook'], ['whatsapp', 'WhatsApp'], ['friend', 'Friend or family'], ['fundi', 'A fundi / carpenter'],
  ['poster', 'Poster or flyer'], ['radio', 'Radio'], ['passing', 'Passing the shop'], ['other', 'Other']];
let heardChoice = '';
let heardSent = false;
try { heardSent = localStorage.getItem('baraka_heard') === '1'; } catch (e) {}
function heardField(){
  if (heardSent) return '';
  return `<div class="res-field"><label for="heardSel">${esc(t('How did you hear about us?'))}</label>
    <select id="heardSel" onchange="heardChoice=this.value"><option value="">${esc(t('Choose (optional)'))}</option>
    ${WHERE_HEARD.map(([k, l]) => `<option value="${k}" ${heardChoice === k ? 'selected' : ''}>${esc(t(l))}</option>`).join('')}</select></div>`;
}
// Counted once per phone, only after a request is actually sent.
function sendHeard(){
  if (!heardChoice || heardSent) return;
  logEvent('heard', heardChoice); heardSent = true;
  try { localStorage.setItem('baraka_heard', '1'); } catch (e) {}
}
function insertBefore(id, html){ const el = document.getElementById(id); if (el && html && !document.getElementById('heardSel')) el.insertAdjacentHTML('beforebegin', html); }
function paymentLine(){
  const p = (window.SITE_INFO || {}).payment || {};
  if (p.till) return `${t('M-Pesa Till (Buy Goods)')}: <b>${esc(p.till)}</b>${p.name ? ` (${esc(p.name)})` : ''}`;
  if (p.paybill) return `${t('Paybill')}: <b>${esc(p.paybill)}</b>${p.account ? ` · ${t('Account')}: <b>${esc(p.account)}</b>` : ''}${p.name ? ` (${esc(p.name)})` : ''}`;
  return '';
}

const _openReservationX = openReservation;
openReservation = function (message){
  _openReservationX(message);
  insertBefore('resSend', heardField());
};
const _sendReservationX = sendReservation;
sendReservation = async function (){
  const before = document.getElementById('resSend');
  await _sendReservationX();
  // Sent when the form was replaced by the confirmation (no "resSend" button any more).
  if (before && !document.getElementById('resSend')) {
    sendHeard();
    const line = paymentLine();
    if (line) document.getElementById('resBody')?.insertAdjacentHTML('beforeend', `<p class="pay-note">${esc(t('Pay a deposit'))} — ${line}</p>`);
  }
};
const _openVisitX = openVisit;
openVisit = function (message, keep){ _openVisitX(message, keep); insertBefore('vSend', heardField()); };
const _sendVisitX = sendVisit;
sendVisit = async function (){ await _sendVisitX(); if (!document.getElementById('vSend')) sendHeard(); };

/* ═══ Bulk orders (schools, hotels, churches, contractors) ═══ */
function openBulk(message, keep){
  keep = keep || {};
  openSiteModal(t('Bulk orders for schools, hotels & churches'), `
    <p style="font-size:13.5px;color:rgba(59,42,32,.75);margin:6px 0 8px;">Boarding mattresses, foam, curtain fabric, church cushions, hotel furniture repairs — tell us what you need and we call back with a written quotation.</p>
    <div class="res-field"><label for="bOrg">${esc(t('Organisation name'))}</label><input id="bOrg" maxlength="80" value="${esc(keep.org || '')}" placeholder="e.g. Kabarnet High School"></div>
    <div class="res-field"><label for="bName">${esc(t('Contact name'))}</label><input id="bName" autocomplete="name" maxlength="80" value="${esc(keep.name || '')}"></div>
    <div class="res-field"><label for="bPhone">${esc(t('Phone (M-Pesa / WhatsApp)'))}</label><input id="bPhone" type="tel" autocomplete="tel" placeholder="07xx xxx xxx" maxlength="15" value="${esc(keep.phone || '')}"></div>
    <div class="res-field"><label for="bNeed">${esc(t('What do you need? (items and quantities)'))}</label><textarea id="bNeed" rows="4" maxlength="400" placeholder="e.g. 120 boarding mattresses 3x6 ft, 4 inch">${esc(keep.need || '')}</textarea></div>
    <div class="res-field"><label for="bWhen">${esc(t('When do you need it? (optional)'))}</label><input id="bWhen" maxlength="60" value="${esc(keep.when || '')}" placeholder="e.g. before opening day, 6 January"></div>
    ${heardField()}
    ${message ? `<div class="res-err">${esc(message)}</div>` : ''}
    <button type="button" class="btn-gold-full press" id="bSend" onclick="sendBulk()">${esc(t('Send request'))}</button>`);
}
async function sendBulk(){
  const v = (id) => document.getElementById(id).value.trim();
  const keep = { org: v('bOrg'), name: v('bName'), phone: v('bPhone'), need: v('bNeed'), when: v('bWhen') };
  const phone = keep.phone.replace(/[\s-]/g, '');
  if (keep.org.length < 2) return openBulk(t('Please enter the organisation name.'), keep);
  if (keep.name.length < 2) return openBulk(t('Please enter your name.'), keep);
  if (!/^(\+?254|0)?[17]\d{8}$/.test(phone)) return openBulk(t('Please enter a valid Kenyan phone number.'), keep);
  if (keep.need.length < 3) return openBulk(t('Please say what you need.'), keep);
  const btn = document.getElementById('bSend'); btn.disabled = true; btn.textContent = t('Sending…');
  try {
    const data = await rpc('book_visit', { p_name: keep.name, p_phone: phone, p_branch_id: BRANCH_IDS[state.branch] || null,
      p_item: `Bulk quote: ${keep.org}`.slice(0, 120), p_details: [keep.need, keep.when && `Needed: ${keep.when}`].filter(Boolean).join(' · ').slice(0, 500) });
    sendHeard();
    openSiteModal(t('Bulk orders for schools, hotels & churches'), `
      <p style="font-size:16px;margin:14px 0 6px;"><b>${esc(t('Request sent! Your number is'))} ${esc(data.reference)}.</b></p>
      <p style="font-size:14px;color:rgba(59,42,32,.8);">${esc(t('We will call you with prices on'))} ${esc(keep.phone)}.</p>`);
  } catch (err) { openBulk(rpcMessage(err.code || ''), keep); }
}

/* ═══ Share a product on WhatsApp + its own link (/?p=12) ═══ */
function productLink(p){ return `${location.origin}/?p=${Number(p.id)}`; }
function shareProduct(id){
  const p = PRODUCTS.find(x => x.id === Number(id));
  if (!p) return;
  logEvent('share', p.id);
  const price = p.price > 0 ? ` — KES ${p.price.toLocaleString()}${p.unit ? ' / ' + unitShort(p.unit) : ''}` : '';
  const text = `${p.name}${price} at Baraka West Mini Hardware, Kabarnet: ${productLink(p)}`;
  if (navigator.share) { navigator.share({ title: p.name, text, url: productLink(p) }).catch(() => {}); return; }
  window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank', 'noopener');
}
function addShareButtons(){
  document.querySelectorAll('.product-card .product-body, .featured-card').forEach(card => {
    if (card.querySelector('.btn-share')) return;
    const m = /addToReservation\((\d+)\)/.exec(card.querySelector('.btn-reserve')?.getAttribute('onclick') || '');
    if (!m) return;
    card.insertAdjacentHTML('beforeend', `<button type="button" class="btn-share press" onclick="shareProduct(${m[1]})" aria-label="Share on WhatsApp">↗ ${esc(t('Share'))}</button>`);
  });
}
const _renderProductsX = renderProducts;
renderProducts = function (){ const r = _renderProductsX.apply(this, arguments); addShareButtons(); return r; };
const _renderFeaturedX = renderFeatured;
renderFeatured = function (){ _renderFeaturedX(); addShareButtons(); };
function openProduct(p){
  const b = BRANCHES[state.branch];
  openSiteModal(p.name, `
    <div style="height:200px;border-radius:12px;margin:10px 0;background:${p.swatch};"></div>
    <div class="price" style="font-size:20px;">${priceHtml(p)}</div>${availability(p)}
    ${p.detail ? `<p style="font-size:14px;color:rgba(59,42,32,.8);">${esc(p.detail)}</p>` : ''}
    <button type="button" class="btn-gold-full press" onclick="closeSiteModal(); addToReservation(${Number(p.id)})">${esc(t('Reserve for pickup'))}</button>
    <a class="btn-wa press" style="margin-top:8px;display:inline-flex;" target="_blank" rel="noreferrer" href="https://wa.me/${b.whatsapp}?text=${encodeURIComponent(`Hi, I'm interested in ${p.name}.`)}">${esc(t('Ask about this item'))}</a>
    <button type="button" class="btn-share press" onclick="shareProduct(${Number(p.id)})">↗ ${esc(t('Share'))}</button>`);
}
(function openLinkedProduct(){
  const id = Number(new URLSearchParams(location.search).get('p'));
  if (!id) return;
  let tries = 0;
  const timer = setInterval(() => {
    const p = PRODUCTS.find(x => x.id === id);
    if (p || ++tries > 40) {
      clearInterval(timer);
      if (!p) return;
      if (p.cat && CAT_PATHS[p.cat]) setCat(p.cat, true);
      document.getElementById('catalog')?.scrollIntoView();
      openProduct(p); logEvent('view', p.id);
    }
  }, 250);
})();

/* ═══ Delivery & payment, FAQ ═══ */
function renderDeliveryPay(){
  const info = window.SITE_INFO || {};
  const box = document.getElementById('deliveryPay');
  if (!box) return;
  const areas = Array.isArray(info.delivery) ? info.delivery : [];
  const pay = paymentLine();
  box.innerHTML = `<div class="dp-card"><h3>${esc(t('Delivery areas'))}</h3>
      ${areas.length ? `<table class="dp-table">${areas.map(a => `<tr><td>${esc(a.area)}</td><td class="num">${a.fee == null ? esc(t('Ask us')) : a.fee === 0 ? 'Free' : 'KES ' + Number(a.fee).toLocaleString()}</td><td>${esc(a.days || '')}</td></tr>`).join('')}</table>`
        : `<p>From Kabarnet to Marigat, Eldama Ravine and beyond — ask us for the delivery cost of your order.</p>`}</div>
    <div class="dp-card"><h3>${esc(t('How to pay'))}</h3>
      ${pay ? `<p class="dp-pay">${pay}</p>` : ''}
      <p>${esc(t('Cash, M-Pesa or bank at the counter. For big orders and sofa jobs we take a deposit — the rest when it is ready.'))}</p></div>`;
}
const _renderSiteInfoX = renderSiteInfo;
renderSiteInfo = function (){ _renderSiteInfoX(); renderDeliveryPay(); renderNews(); };

/* ═══ Notice photos ("New fabrics just arrived" + pictures) ═══ */
function renderNews(){
  const info = window.SITE_INFO || {};
  const box = document.getElementById('news');
  if (!box) return;
  const photos = (info.notice_photos || []).map(p => ({ url: safeImageUrl(p.url), caption: p.caption || '' })).filter(p => p.url);
  box.hidden = !(info.notice && photos.length);
  if (box.hidden) return;
  document.getElementById('newsTitle').textContent = info.notice;
  document.getElementById('newsRow').innerHTML = photos.map((p, i) => `<button type="button" data-photo="${i}" aria-label="${esc(t('See photo'))} ${i + 1}">
    <img src="${esc(p.url)}" alt="${esc(p.caption || info.notice)}" loading="lazy" decoding="async"></button>`).join('');
  document.getElementById('newsRow').onclick = (e) => { const b = e.target.closest('[data-photo]'); if (b) { const p = photos[Number(b.dataset.photo)]; openPhoto(p.url, p.caption || info.notice); } };
  const nb = document.getElementById('noticeBar');
  if (nb && !nb.querySelector('a')) nb.insertAdjacentHTML('beforeend', ` <a href="#news">${esc(t('See photos'))} ↓</a>`);
}

/* ═══ Seasonal banner (and /back-to-school, /christmas links for posters and Facebook) ═══ */
function seasonFor(date){
  const m = date.getUTCMonth() + 1, d = date.getUTCDate();
  if (m === 12 && d >= 26 || m === 1 || (m === 2 && d <= 10) || location.pathname === '/back-to-school')
    return { id: 'school', title: 'Back to school', text: 'Boarding mattresses, pillows and foam for students and schools — bulk prices for schools.', cat: 'mattress', bulk: true };
  if (m === 11 && d >= 15 || (m === 12 && d <= 25) || location.pathname === '/christmas')
    return { id: 'xmas', title: 'New sofa for Christmas', text: 'Re-upholster your sofa or get new cushions before the visitors arrive — book early.', calc: true };
  return null;
}
function renderSeason(){
  const s = seasonFor(new Date(Date.now() + 3 * 3600000));
  const el = document.getElementById('seasonBar');
  if (!el || !s) return;
  el.hidden = false;
  el.innerHTML = `<b>${esc(t(s.title))}</b> <span>${esc(t(s.text))}</span>
    ${s.cat ? `<button type="button" class="press" onclick="setCat('${s.cat}'); document.getElementById('catalog').scrollIntoView({behavior:'smooth'})">${esc(t('See prices'))}</button>` : ''}
    ${s.bulk ? `<button type="button" class="press" onclick="openBulk()">${esc(t('Get a bulk quote'))}</button>` : ''}
    ${s.calc ? `<button type="button" class="press" onclick="document.getElementById('calculator').scrollIntoView({behavior:'smooth'})">${esc(t('Get a quote'))}</button>` : ''}`;
  if (location.pathname === '/back-to-school' && s.cat) setTimeout(() => setCat(s.cat, true), 0);
}
renderSeason();
renderDeliveryPay();
addShareButtons();
