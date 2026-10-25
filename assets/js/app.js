/* ---------- Helpers ---------- */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const inr = n => '₹' + Number(n).toLocaleString('en-IN');
const qs = k => new URLSearchParams(location.search).get(k);
const findProduct = id => PRODUCTS.find(p => p.id === id);

/* ---------- Store (localStorage) ---------- */
const Store = {
  get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },

  getCart() { return this.get('sl_cart', []); },
  saveCart(c) { this.set('sl_cart', c); renderCartCount(); },
  addToCart(id, qty = 1) {
    const cart = this.getCart();
    const line = cart.find(l => l.id === id);
    const isFirst = cart.length === 0;
    line ? (line.qty += qty) : cart.push({ id, qty });
    this.saveCart(cart);
    return isFirst;
  },
  setQty(id, qty) {
    const cart = this.getCart().map(l => l.id === id ? { ...l, qty } : l).filter(l => l.qty > 0);
    this.saveCart(cart);
  },
  removeFromCart(id) { this.saveCart(this.getCart().filter(l => l.id !== id)); },
  clearCart() { this.saveCart([]); },
  cartLines() {
    return this.getCart().map(l => ({ ...l, product: findProduct(l.id) })).filter(l => l.product);
  },
  cartSummary() {
    const lines = this.cartLines();
    return {
      itemCount: lines.reduce((s, l) => s + l.qty, 0),
      cartTotal: lines.reduce((s, l) => s + l.qty * l.product.price, 0),
      currencyCode: 'INR'
    };
  },

  getUser() { return this.get('sl_user', null); },
  setUser(u) { this.set('sl_user', u); }
};

/* ---------- Shared layout ---------- */
function renderLayout() {
  const user = Store.getUser();
  const header = document.createElement('header');
  header.className = 'site-header';
  header.innerHTML = `
    <div class="wrap header-row">
      <a href="index.html" class="logo" data-link-name="logo">Shop<span>Lab</span></a>
      <form class="search" action="search.html" id="headerSearch">
        <input name="q" type="search" placeholder="Search products…" aria-label="Search" value="${qs('q') ? escapeHtml(qs('q')) : ''}">
        <button type="submit" aria-label="Search">🔍</button>
      </form>
      <nav class="header-actions">
        ${user
          ? `<span class="hello">Hi, ${escapeHtml(user.name)}</span> <a href="#" id="logoutLink" data-link-name="logout">Logout</a>`
          : `<a href="login.html" data-link-name="login">Login</a>`}
        <a href="cart.html" class="cart-link" data-link-name="cart icon">🛒 <span id="cartCount">0</span></a>
      </nav>
    </div>
    <nav class="cat-nav"><div class="wrap">
      ${Object.entries(CATEGORIES).map(([k, v]) =>
        `<a href="category.html?c=${k}" data-link-name="nav:${k}">${v}</a>`).join('')}
    </div></nav>`;
  document.body.prepend(header);

  const footer = document.createElement('footer');
  footer.className = 'site-footer';
  footer.innerHTML = `
    <div class="wrap footer-row">
      <form id="newsletterForm" class="newsletter" data-form-name="newsletter" novalidate>
        <strong>Get deals in your inbox</strong>
        <input type="email" name="email" placeholder="you@example.com" required>
        <button type="submit">Subscribe</button>
        <span class="form-msg"></span>
      </form>
      <p class="muted">ShopLab is a demo store for practising Adobe Analytics / Tags implementation. Nothing is for sale.</p>
    </div>`;
  document.body.append(footer);

  renderCartCount();

  $('#logoutLink')?.addEventListener('click', e => {
    e.preventDefault();
    DL.push({ event: 'userLogout', user: { loginStatus: 'guest', userID: '' } });
    Store.setUser(null);
    location.reload();
  });

  bindForm($('#newsletterForm'), form => {
    const email = form.email.value.trim();
    if (!/^\S+@\S+\.\S+$/.test(email)) return 'Please enter a valid email';
    form.reset();
    $('.form-msg', form).textContent = 'Subscribed ✓';
  });

  // Generic link tracking: any element with data-link-name
  document.addEventListener('click', e => {
    const a = e.target.closest('[data-link-name]');
    if (!a) return;
    DL.push({ event: 'linkClick', link: { linkName: a.dataset.linkName, linkRegion: a.closest('[data-region]')?.dataset.region || regionOf(a), linkURL: a.href || '' } });
  });
}

function regionOf(el) {
  if (el.closest('.site-header')) return 'header';
  if (el.closest('.site-footer')) return 'footer';
  return 'body';
}

function renderCartCount() {
  const el = $('#cartCount');
  if (el) el.textContent = Store.cartSummary().itemCount;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/* ---------- Form tracking helper ---------- */
// validate(form) returns an error string, or nothing on success
function bindForm(form, validate) {
  if (!form) return;
  const name = form.dataset.formName;
  let started = false;
  form.addEventListener('input', () => {
    if (started) return;
    started = true;
    DL.push({ event: 'formStart', form: { formName: name } });
  });
  form.addEventListener('submit', e => {
    e.preventDefault();
    const err = validate(form);
    const msg = $('.form-msg', form);
    if (err) {
      if (msg) { msg.textContent = err; msg.classList.add('error'); }
      DL.push({ event: 'formError', form: { formName: name, formError: err } });
      return;
    }
    msg?.classList.remove('error');
    DL.push({ event: 'formSubmit', form: { formName: name } });
    started = false;
    form.dispatchEvent(new CustomEvent('tracked-submit'));
  });
}

/* ---------- Product card ---------- */
function productCard(p, i, listName) {
  return `
    <article class="card" data-product-id="${p.id}">
      <a href="product.html?id=${p.id}" class="card-link" data-list="${listName}" data-position="${i + 1}">
        <div class="thumb">${p.emoji}</div>
        <h3>${p.name}</h3>
      </a>
      <p class="price">${inr(p.price)}</p>
      <button class="btn add-btn" data-id="${p.id}">Add to cart</button>
    </article>`;
}

function bindProductGrid(container, list, listName) {
  DL.push({
    event: 'productListView',
    productList: { listName, listCount: list.length },
    productListItems: list.map((p, i) => ({ ...DL.product(p), position: i + 1 }))
  });
  container.addEventListener('click', e => {
    const link = e.target.closest('.card-link');
    if (link) {
      const p = findProduct(link.closest('.card').dataset.productId);
      DL.push({ event: 'productListClick', productList: { listName }, productListItems: [{ ...DL.product(p), position: +link.dataset.position }] });
    }
    const btn = e.target.closest('.add-btn');
    if (btn) addToCart(btn.dataset.id, 1, listName);
  });
}

function addToCart(id, qty, source) {
  const p = findProduct(id);
  const isCartOpen = Store.addToCart(id, qty);
  DL.push({
    event: 'cartAdd',
    cartAction: { source, isCartOpen },
    productListItems: [DL.product(p, qty)],
    cart: Store.cartSummary()
  });
  toast(`Added ${p.name} to cart`);
}

function toast(text) {
  let t = $('#toast');
  if (!t) { t = document.createElement('div'); t.id = 'toast'; document.body.append(t); }
  t.textContent = text;
  t.classList.add('show');
  clearTimeout(t._h);
  t._h = setTimeout(() => t.classList.remove('show'), 1800);
}

/* ---------- Pages ---------- */
const Pages = {
  home() {
    DL.pageLoaded({ name: 'home', type: 'home', section: 'home' });
    const featured = ['P1002', 'P2001', 'P3001', 'P4001'].map(findProduct);
    const grid = $('#featured');
    grid.innerHTML = featured.map((p, i) => productCard(p, i, 'home:featured')).join('');
    bindProductGrid(grid, featured, 'home:featured');

    const promo = $('#heroPromo');
    DL.push({ event: 'promoView', promotion: { promoID: promo.dataset.promoId, promoName: promo.dataset.promoName, promoPosition: 'hero' } });
    $('a', promo).addEventListener('click', () =>
      DL.push({ event: 'promoClick', promotion: { promoID: promo.dataset.promoId, promoName: promo.dataset.promoName, promoPosition: 'hero' } }));
  },

  category() {
    const c = CATEGORIES[qs('c')] ? qs('c') : 'phones';
    const label = CATEGORIES[c];
    document.title = `${label} | ShopLab`;
    $('#catTitle').textContent = label;
    DL.pageLoaded({ name: `category:${c}`, type: 'category', section: 'category', subSection: c });
    const list = PRODUCTS.filter(p => p.category === c);
    const grid = $('#catGrid');
    grid.innerHTML = list.map((p, i) => productCard(p, i, `category:${c}`)).join('');
    bindProductGrid(grid, list, `category:${c}`);
  },

  product() {
    const p = findProduct(qs('id'));
    if (!p) {
      $('#pdp').innerHTML = '<p>Product not found. <a href="index.html">Back to home</a></p>';
      DL.pageLoaded({ name: 'error:product not found', type: 'errorPage', section: 'error' });
      return;
    }
    document.title = `${p.name} | ShopLab`;
    $('#pdp').innerHTML = `
      <nav class="crumbs"><a href="index.html">Home</a> › <a href="category.html?c=${p.category}">${CATEGORIES[p.category]}</a> › ${p.name}</nav>
      <div class="pdp-grid">
        <div class="pdp-img">${p.emoji}</div>
        <div>
          <p class="muted">${p.brand} · SKU ${p.sku}</p>
          <h1>${p.name}</h1>
          <p class="price big">${inr(p.price)}</p>
          <p>${p.desc}</p>
          <div class="qty-row">
            <label>Qty <input id="qty" type="number" min="1" max="10" value="1"></label>
            <button class="btn" id="pdpAdd">Add to cart</button>
          </div>
        </div>
      </div>`;
    DL.pageLoaded({ name: `product:${p.name.toLowerCase()}`, type: 'product', section: 'product', subSection: p.category });
    DL.push({ event: 'productView', productListItems: [DL.product(p)] });
    $('#pdpAdd').addEventListener('click', () => addToCart(p.id, Math.max(1, +$('#qty').value || 1), 'pdp'));

    const related = PRODUCTS.filter(x => x.category === p.category && x.id !== p.id);
    const grid = $('#related');
    grid.innerHTML = related.map((x, i) => productCard(x, i, 'pdp:related')).join('');
    bindProductGrid(grid, related, 'pdp:related');
  },

  cart() {
    DL.pageLoaded({ name: 'cart', type: 'cart', section: 'checkout' });
    const lines = Store.cartLines();
    DL.push({ event: 'cartView', productListItems: lines.map(l => DL.product(l.product, l.qty)), cart: Store.cartSummary() });
    renderCart();
  },

  checkout() {
    const lines = Store.cartLines();
    if (!lines.length) { location.href = 'cart.html'; return; }
    DL.pageLoaded({ name: 'checkout:shipping', type: 'checkout', section: 'checkout', subSection: 'shipping' });
    DL.push({ event: 'checkoutStart', productListItems: lines.map(l => DL.product(l.product, l.qty)), cart: Store.cartSummary() });
    renderSummary($('#orderSummary'), lines);

    const user = Store.getUser();
    const form = $('#checkoutForm');
    if (user) { form.name.value = user.name; form.email.value = user.email; }

    bindForm(form, f => {
      if (!f.name.value.trim()) return 'Name is required';
      if (!/^\S+@\S+\.\S+$/.test(f.email.value)) return 'Valid email is required';
      if (!/^[1-9]\d{5}$/.test(f.pincode.value)) return 'Enter a 6-digit PIN code';
      if (!f.payment.value) return 'Choose a payment method';
    });

    // Step tracking when user moves into payment section
    $('#paymentFieldset').addEventListener('change', () => {
      if (form._payStep) return;
      form._payStep = true;
      DL.push({ event: 'checkoutStep', checkout: { step: 2, stepName: 'payment' } });
    });

    form.addEventListener('tracked-submit', () => {
      const summary = Store.cartSummary();
      const shipping = summary.cartTotal >= 5000 ? 0 : 99;
      const order = {
        orderID: 'SL' + Date.now().toString().slice(-8),
        lines: Store.cartLines().map(l => ({ id: l.id, qty: l.qty })),
        subtotal: summary.cartTotal,
        shipping,
        total: summary.cartTotal + shipping,
        paymentMethod: form.payment.value,
        pincode: form.pincode.value,
        coupon: form.coupon.value.trim().toUpperCase()
      };
      Store.set('sl_lastOrder', order);
      Store.clearCart();
      location.href = 'confirmation.html';
    });
  },

  confirmation() {
    const order = Store.get('sl_lastOrder', null);
    if (!order) { $('#confirm').innerHTML = '<p>No recent order. <a href="index.html">Continue shopping</a></p>'; DL.pageLoaded({ name: 'confirmation:empty', type: 'confirmation', section: 'checkout' }); return; }
    const lines = order.lines.map(l => ({ ...l, product: findProduct(l.id) })).filter(l => l.product);
    $('#confirm').innerHTML = `
      <h1>Thank you! 🎉</h1>
      <p>Your order <strong>${order.orderID}</strong> is confirmed.</p>
      <div id="confSummary"></div>
      <p><a class="btn" href="index.html">Continue shopping</a></p>`;
    renderSummary($('#confSummary'), lines, order.shipping);
    DL.pageLoaded({ name: 'checkout:confirmation', type: 'confirmation', section: 'checkout', subSection: 'confirmation' });

    // Only fire purchase once per order (protects against refresh double-counting)
    const fired = Store.get('sl_firedOrders', []);
    if (!fired.includes(order.orderID)) {
      DL.push({
        event: 'purchase',
        transaction: {
          orderID: order.orderID,
          subtotal: order.subtotal,
          shipping: order.shipping,
          total: order.total,
          paymentMethod: order.paymentMethod,
          couponCode: order.coupon,
          currencyCode: 'INR',
          shippingPincode: order.pincode
        },
        productListItems: lines.map(l => DL.product(l.product, l.qty))
      });
      Store.set('sl_firedOrders', [...fired, order.orderID].slice(-20));
    }
  },

  search() {
    const q = (qs('q') || '').trim();
    const terms = q.toLowerCase();
    const results = terms ? PRODUCTS.filter(p => `${p.name} ${p.brand} ${p.category} ${p.desc}`.toLowerCase().includes(terms)) : [];
    $('#searchTitle').textContent = q ? `Results for “${q}”` : 'Search';
    DL.pageLoaded({ name: 'search results', type: 'search', section: 'search' });
    DL.push({ event: 'searchPerformed', search: { searchTerm: terms, searchResults: results.length, searchType: 'header' } });
    const grid = $('#searchGrid');
    if (!results.length) { grid.innerHTML = `<p class="muted">No products found${q ? ' for “' + escapeHtml(q) + '”' : ''}.</p>`; return; }
    grid.innerHTML = results.map((p, i) => productCard(p, i, 'search results')).join('');
    bindProductGrid(grid, results, 'search results');
  },

  login() {
    DL.pageLoaded({ name: 'login', type: 'account', section: 'account' });
    const form = $('#loginForm');
    bindForm(form, f => {
      if (!/^\S+@\S+\.\S+$/.test(f.email.value)) return 'Enter a valid email';
      if (f.password.value.length < 4) return 'Password must be at least 4 characters';
    });
    form.addEventListener('tracked-submit', () => {
      const email = form.email.value.trim().toLowerCase();
      const user = { id: 'U' + hash(email), name: email.split('@')[0], email };
      Store.setUser(user);
      DL.push({ event: 'userLogin', user: { loginStatus: 'logged in', userID: user.id, loginMethod: 'email' } });
      location.href = qs('next') || 'index.html';
    });
  }
};

function renderCart() {
  const lines = Store.cartLines();
  const box = $('#cartBox');
  if (!lines.length) { box.innerHTML = '<p>Your cart is empty. <a href="index.html">Start shopping</a></p>'; return; }
  const sum = Store.cartSummary();
  box.innerHTML = `
    <table class="cart-table">
      <thead><tr><th>Product</th><th>Price</th><th>Qty</th><th>Total</th><th></th></tr></thead>
      <tbody>${lines.map(l => `
        <tr data-id="${l.id}">
          <td><a href="product.html?id=${l.id}">${l.product.emoji} ${l.product.name}</a></td>
          <td>${inr(l.product.price)}</td>
          <td><input class="qty-input" type="number" min="1" max="10" value="${l.qty}"></td>
          <td>${inr(l.product.price * l.qty)}</td>
          <td><button class="link-btn remove-btn">Remove</button></td>
        </tr>`).join('')}
      </tbody>
    </table>
    <div class="cart-foot">
      <p>Subtotal: <strong>${inr(sum.cartTotal)}</strong> <span class="muted">(${sum.itemCount} items)</span></p>
      <a href="checkout.html" class="btn" data-link-name="proceed to checkout">Proceed to checkout</a>
    </div>`;

  $$('.remove-btn', box).forEach(b => b.addEventListener('click', () => {
    const id = b.closest('tr').dataset.id;
    const line = lines.find(l => l.id === id);
    Store.removeFromCart(id);
    DL.push({ event: 'cartRemove', productListItems: [DL.product(line.product, line.qty)], cart: Store.cartSummary() });
    renderCart();
  }));
  $$('.qty-input', box).forEach(inp => inp.addEventListener('change', () => {
    const id = inp.closest('tr').dataset.id;
    const line = lines.find(l => l.id === id);
    const qty = Math.max(0, Math.min(10, +inp.value || 0));
    const diff = qty - line.qty;
    Store.setQty(id, qty);
    if (diff > 0) DL.push({ event: 'cartAdd', cartAction: { source: 'cart qty', isCartOpen: false }, productListItems: [DL.product(line.product, diff)], cart: Store.cartSummary() });
    if (diff < 0) DL.push({ event: 'cartRemove', productListItems: [DL.product(line.product, -diff)], cart: Store.cartSummary() });
    renderCart();
  }));
}

function renderSummary(el, lines, shipping) {
  const subtotal = lines.reduce((s, l) => s + l.qty * l.product.price, 0);
  const ship = shipping ?? (subtotal >= 5000 ? 0 : 99);
  el.innerHTML = `
    <div class="summary">
      <h3>Order summary</h3>
      ${lines.map(l => `<div class="sum-row"><span>${l.product.name} × ${l.qty}</span><span>${inr(l.qty * l.product.price)}</span></div>`).join('')}
      <div class="sum-row"><span>Shipping</span><span>${ship ? inr(ship) : 'Free'}</span></div>
      <div class="sum-row total"><span>Total</span><span>${inr(subtotal + ship)}</span></div>
    </div>`;
}

function hash(s) {
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h.toString(36).toUpperCase();
}

/* ---------- Data layer debug panel (toggle with ?dldebug=0 to hide) ---------- */
function initDebugPanel() {
  if (qs('dldebug') === '0' || Store.get('sl_hidePanel', false)) return;
  const panel = document.createElement('aside');
  panel.id = 'dlPanel';
  panel.innerHTML = `<header><strong>adobeDataLayer</strong><span><button id="dlMin" title="Minimise">–</button><button id="dlClose" title="Hide (bring back with ?dldebug=1)">×</button></span></header><ol id="dlLog"></ol>`;
  document.body.append(panel);
  $('#dlMin').onclick = () => panel.classList.toggle('min');
  $('#dlClose').onclick = () => { Store.set('sl_hidePanel', true); panel.remove(); };
  window.DLPanel = {
    log(obj) {
      const li = document.createElement('li');
      li.innerHTML = `<details><summary>${escapeHtml(obj.event || 'state')}</summary><pre>${escapeHtml(JSON.stringify(obj, null, 2))}</pre></details>`;
      $('#dlLog').prepend(li);
    }
  };
  // replay anything pushed before the panel existed
  window.adobeDataLayer.forEach(o => typeof o === 'object' && window.DLPanel.log(o));
}

/* ---------- Boot ---------- */
document.addEventListener('DOMContentLoaded', () => {
  if (qs('dldebug') === '1') Store.set('sl_hidePanel', false);
  initDebugPanel();
  renderLayout();
  const page = document.body.dataset.page;
  Pages[page]?.();
  $('#headerSearch').addEventListener('submit', e => {
    if (!e.target.q.value.trim()) e.preventDefault();
  });
});
