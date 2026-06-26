/* ========================================================================== 
   J. Fletcher Art — shared storefront interactions
   Framework-free, progressively enhanced, and organised by feature.
   ========================================================================== */
(() => {
  'use strict';

  const catalog = window.JFA_CATALOG || [];
  const prices = window.JFA_SIZE_PRICES || { A5: 99, A4: 149, A3: 219 };
  const CART_KEY = 'jfa-cart-v1';
  const ORDER_KEY = 'jfa-last-order-v1';
  const money = new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', minimumFractionDigits: 0 });

  const icons = {
    heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"/></svg>',
    bag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path d="M6 8h12l1 13H5L6 8Z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>'
  };

  /* General helpers ------------------------------------------------------- */
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const getProduct = id => catalog.find(product => product.id === id);
  const formatPrice = value => money.format(Number(value) || 0);
  const safeText = value => String(value ?? '').replace(/[<>]/g, '');

  function getCart() {
    try {
      const parsed = JSON.parse(localStorage.getItem(CART_KEY));
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartCount();
    document.dispatchEvent(new CustomEvent('jfa:cart-updated', { detail: cart }));
  }

  function cartCount(cart = getCart()) {
    return cart.reduce((total, item) => total + Number(item.quantity || 0), 0);
  }

  function cartSubtotal(cart = getCart()) {
    return cart.reduce((total, item) => total + (prices[item.size] || prices.A5) * Number(item.quantity || 0), 0);
  }

  function updateCartCount() {
    const count = cartCount();
    $$('.cart-count').forEach(el => {
      el.textContent = count;
      el.hidden = count === 0;
    });
  }

  function addToCart(productId, size = 'A5', quantity = 1) {
    const product = getProduct(productId);
    if (!product) return;
    const cart = getCart();
    const key = `${productId}-${size}`;
    const existing = cart.find(item => item.key === key);
    if (existing) existing.quantity += Number(quantity);
    else cart.push({ key, productId, size, quantity: Number(quantity) });
    saveCart(cart);
    showToast(product, size);
  }

  function removeFromCart(key) {
    saveCart(getCart().filter(item => item.key !== key));
  }

  function updateCartItem(key, quantity) {
    const cart = getCart();
    const item = cart.find(entry => entry.key === key);
    if (!item) return;
    item.quantity = Math.max(1, Number(quantity) || 1);
    saveCart(cart);
  }

  function productCard(product, options = {}) {
    const badge = product.edition.includes('Signed') ? 'Signed' : (product.bestseller ? 'Best seller' : 'Open edition');
    const quickClass = options.quickVisible ? ' product-card__quick--visible' : '';
    const cardClass = options.cardClass ? ` ${options.cardClass}` : '';
    const quick = options.quick === false ? '' : `<button class="button button--light button--full product-card__quick${quickClass}" data-add-to-cart="${product.id}" aria-label="Add ${safeText(product.name)} in A5 to cart">Quick add · ${formatPrice(prices.A5)}</button>`;
    return `
      <article class="product-card reveal${cardClass}" data-category="${safeText(product.category)}" data-product-id="${product.id}">
        <div class="product-card__media">
          <a class="product-card__image-link" href="product.html?id=${product.id}" aria-label="View ${safeText(product.name)}">
            <span class="product-card__badge">${safeText(badge)}</span>
            <img src="${product.image}" srcset="${product.image} 1x, ${product.image2x} 2x" alt="${safeText(product.name)}, fine art photography print" width="900" height="1125" loading="lazy" decoding="async">
          </a>
          ${quick}
        </div>
        <div class="product-card__body">
          <div class="product-card__meta">${safeText(product.category)}</div>
          <h3 class="product-card__name"><a href="product.html?id=${product.id}">${safeText(product.name)}</a></h3>
          <div class="product-card__bottom">
            <span class="product-card__price">From ${formatPrice(prices.A5)}</span>
            <span class="product-card__edition">${safeText(product.edition)}</span>
          </div>
        </div>
      </article>`;
  }

  /* Header, menu and search ------------------------------------------------ */
  function setupHeader() {
    const header = $('.site-header');
    if (!header) return;
    const sync = () => header.classList.toggle('is-scrolled', window.scrollY > 12);
    sync();
    window.addEventListener('scroll', sync, { passive: true });
  }

  function setupMenu() {
    const panel = $('#mobile-menu');
    const open = $('[data-menu-open]');
    const close = $('[data-menu-close]');
    if (!panel || !open || !close) return;

    const setOpen = state => {
      panel.classList.toggle('is-open', state);
      panel.setAttribute('aria-hidden', String(!state));
      open.setAttribute('aria-expanded', String(state));
      document.body.classList.toggle('menu-open', state);
      if (state) close.focus();
      else open.focus();
    };

    open.addEventListener('click', () => setOpen(true));
    close.addEventListener('click', () => setOpen(false));
    panel.addEventListener('click', event => {
      if (event.target.matches('a')) setOpen(false);
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && panel.classList.contains('is-open')) setOpen(false);
    });
  }

  function setupSearch() {
    const overlay = $('#search-overlay');
    const input = $('#global-search');
    const results = $('#search-results');
    const openButtons = $$('[data-search-open]');
    const close = $('[data-search-close]');
    if (!overlay || !input || !results || !close) return;

    const setOpen = state => {
      overlay.classList.toggle('is-open', state);
      overlay.setAttribute('aria-hidden', String(!state));
      document.body.classList.toggle('search-open', state);
      if (state) setTimeout(() => input.focus(), 80);
    };

    const render = query => {
      const term = query.trim().toLowerCase();
      const matches = term
        ? catalog.filter(product => `${product.name} ${product.category} ${product.edition}`.toLowerCase().includes(term)).slice(0, 7)
        : catalog.filter(product => product.featured).slice(0, 5);
      results.innerHTML = matches.length ? matches.map(product => `
        <a class="search-result" href="product.html?id=${product.id}">
          <img src="${product.image}" alt="" width="76" height="70">
          <span><strong>${safeText(product.name)}</strong><br><small>${safeText(product.category)} · From ${formatPrice(prices.A5)}</small></span>
          <span aria-hidden="true">→</span>
        </a>`).join('') : '<p>No artworks matched your search.</p>';
    };

    openButtons.forEach(button => button.addEventListener('click', () => { setOpen(true); render(''); }));
    close.addEventListener('click', () => setOpen(false));
    overlay.addEventListener('click', event => { if (event.target === overlay) setOpen(false); });
    input.addEventListener('input', () => render(input.value));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && overlay.classList.contains('is-open')) setOpen(false);
    });
  }

  /* Homepage features ----------------------------------------------------- */
  function setupHero() {
    const hero = $('.hero');
    if (!hero) return;
    const slides = $$('.hero-slide', hero);
    const dots = $$('.hero-dot', hero);
    let active = 0;
    let timer;

    const show = index => {
      active = (index + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.classList.toggle('is-active', i === active));
      dots.forEach((dot, i) => {
        dot.classList.toggle('is-active', i === active);
        dot.setAttribute('aria-current', i === active ? 'true' : 'false');
      });
    };

    const start = () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || slides.length < 2) return;
      clearInterval(timer);
      timer = setInterval(() => show(active + 1), 6500);
    };

    dots.forEach((dot, i) => dot.addEventListener('click', () => { show(i); start(); }));
    hero.addEventListener('mouseenter', () => clearInterval(timer));
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function renderProductTargets() {
    $$('[data-products], [data-product-ids]').forEach(target => {
      const mode = target.dataset.products;
      const limit = Number(target.dataset.limit || 8);
      const ids = (target.dataset.productIds || '').split(',').map(id => id.trim()).filter(Boolean);
      let products = ids.length ? ids.map(getProduct).filter(Boolean) : catalog;
      if (!ids.length && mode === 'featured') products = catalog.filter(product => product.featured);
      if (!ids.length && mode === 'bestsellers') products = catalog.filter(product => product.bestseller);
      if (!ids.length && target.dataset.category) products = catalog.filter(product => product.category === target.dataset.category);
      const visibleProducts = products.slice(0, limit);
      const forceQuick = target.dataset.forceQuick || '';
      target.innerHTML = visibleProducts.map((product, index) => {
        const options = {};
        if (forceQuick === 'last' && index === visibleProducts.length - 1) options.quickVisible = true;
        if (/^\d+$/.test(forceQuick) && index === Number(forceQuick) - 1) options.quickVisible = true;
        return productCard(product, options);
      }).join('');
    });
  }

  function setupSpotlight() {
    const spotlight = $('[data-spotlight]');
    if (!spotlight) return;
    const product = getProduct(spotlight.dataset.spotlight) || catalog[0];
    const name = $('[data-spotlight-name]', spotlight);
    const edition = $('[data-spotlight-edition]', spotlight);
    const description = $('[data-spotlight-description]', spotlight);
    const image = $('[data-spotlight-image]', spotlight);
    const price = $('[data-spotlight-price]', spotlight);
    const add = $('[data-spotlight-add]', spotlight);
    let size = 'A5';
    if (name) name.textContent = product.name;
    if (edition) edition.textContent = product.edition;
    if (description) description.textContent = product.description;
    if (image) {
      image.src = product.image;
      image.srcset = `${product.image} 1x, ${product.image2x} 2x`;
      image.alt = `${product.name}, fine art print`;
    }
    const update = () => { if (price) price.textContent = formatPrice(prices[size]); };
    $$('[data-spotlight-size]', spotlight).forEach(button => button.addEventListener('click', () => {
      size = button.dataset.spotlightSize;
      $$('[data-spotlight-size]', spotlight).forEach(item => item.classList.toggle('is-active', item === button));
      update();
    }));
    if (add) add.addEventListener('click', () => addToCart(product.id, size, 1));
    update();
  }

  /* Shop filtering -------------------------------------------------------- */
  function setupShop() {
    const grid = $('#shop-grid');
    if (!grid) return;
    const checkboxes = $$('[data-filter-category]');
    const toneInputs = $$('[data-filter-tone]');
    const sort = $('#shop-sort');
    const count = $('#shop-count');
    const search = $('#shop-search');
    const panel = $('#filter-panel');
    const toggle = $('[data-filter-toggle]');
    const close = $('[data-filter-close]');

    const render = () => {
      const categories = checkboxes.filter(input => input.checked).map(input => input.value);
      const tones = toneInputs.filter(input => input.checked).map(input => input.value);
      const term = (search?.value || '').trim().toLowerCase();
      let products = catalog.filter(product => {
        const categoryMatch = !categories.length || categories.includes(product.category);
        const toneMatch = !tones.length || tones.some(tone => product.tones.includes(tone));
        const searchMatch = !term || `${product.name} ${product.category} ${product.description}`.toLowerCase().includes(term);
        return categoryMatch && toneMatch && searchMatch;
      });

      if (sort?.value === 'name') products.sort((a,b) => a.name.localeCompare(b.name));
      if (sort?.value === 'featured') products.sort((a,b) => Number(b.featured) - Number(a.featured));
      if (sort?.value === 'edition') products.sort((a,b) => a.edition.localeCompare(b.edition));
      grid.innerHTML = products.length ? products.map(product => productCard(product)).join('') : '<div class="empty-state"><h2 class="title">No prints found</h2><p>Try removing one or more filters.</p></div>';
      if (count) count.textContent = `${products.length} print${products.length === 1 ? '' : 's'}`;
      setupReveal();
    };

    const initialCategory = new URLSearchParams(location.search).get('category');
    if (initialCategory) {
      const match = checkboxes.find(input => input.value === initialCategory);
      if (match) match.checked = true;
    }

    [...checkboxes, ...toneInputs].forEach(input => input.addEventListener('change', render));
    sort?.addEventListener('change', render);
    search?.addEventListener('input', render);
    toggle?.addEventListener('click', () => panel?.classList.add('is-open'));
    close?.addEventListener('click', () => panel?.classList.remove('is-open'));
    render();
  }

  /* Product detail -------------------------------------------------------- */
  function setupProductPage() {
    const root = $('#product-detail');
    if (!root) return;
    const id = new URLSearchParams(location.search).get('id') || 'summit-of-silence';
    const product = getProduct(id) || catalog[0];
    let selectedSize = 'A5';

    document.title = `${product.name} | J. Fletcher Art`;
    const assign = (selector, value) => { const el = $(selector, root); if (el) el.textContent = value; };
    assign('[data-product-name]', product.name);
    assign('[data-product-category]', product.category);
    assign('[data-product-edition]', product.edition);
    assign('[data-product-description]', product.description);
    assign('[data-product-story]', product.story);
    assign('[data-product-price]', formatPrice(prices[selectedSize]));

    $$('[data-product-image]', root).forEach((img, index) => {
      img.src = index === 1 && product.category === 'Nature' ? 'assets/img/hero-mountain.jpg' : product.image;
      img.srcset = index === 1 && product.category === 'Nature'
        ? 'assets/img/hero-mountain.jpg 1x, assets/img/hero-mountain@2x.jpg 2x'
        : `${product.image} 1x, ${product.image2x} 2x`;
      img.alt = index ? `${product.name} print detail and crop` : `${product.name}, fine art photography print`;
    });

    $$('[data-product-size]', root).forEach(button => button.addEventListener('click', () => {
      selectedSize = button.dataset.productSize;
      $$('[data-product-size]', root).forEach(item => item.classList.toggle('is-active', item === button));
      assign('[data-product-price]', formatPrice(prices[selectedSize]));
      assign('[data-selected-size]', selectedSize);
    }));

    const qty = $('#product-quantity');
    $('[data-qty-minus]', root)?.addEventListener('click', () => qty.value = Math.max(1, Number(qty.value || 1) - 1));
    $('[data-qty-plus]', root)?.addEventListener('click', () => qty.value = Math.min(10, Number(qty.value || 1) + 1));
    $('[data-product-add]', root)?.addEventListener('click', () => addToCart(product.id, selectedSize, Number(qty.value || 1)));
    $('[data-buy-now]', root)?.addEventListener('click', () => {
      addToCart(product.id, selectedSize, Number(qty.value || 1));
      location.href = 'checkout.html';
    });

    const recs = $('#product-recommendations');
    if (recs) recs.innerHTML = catalog.filter(item => item.id !== product.id && (item.category === product.category || item.bestseller)).slice(0,4).map(item => productCard(item)).join('');
  }

  /* Cart ------------------------------------------------------------------ */
  function renderCartPage() {
    const list = $('#cart-list');
    if (!list) return;
    const summarySubtotal = $('#cart-subtotal');
    const summaryTotal = $('#cart-total');
    const empty = $('#cart-empty');
    const checkoutButton = $('#cart-checkout');

    const render = () => {
      const cart = getCart();
      if (!cart.length) {
        list.innerHTML = '';
        empty.hidden = false;
        checkoutButton?.setAttribute('disabled', 'disabled');
      } else {
        empty.hidden = true;
        checkoutButton?.removeAttribute('disabled');
        list.innerHTML = cart.map(item => {
          const product = getProduct(item.productId);
          if (!product) return '';
          return `
            <article class="cart-item" data-cart-key="${item.key}">
              <a href="product.html?id=${product.id}"><img src="${product.image}" alt="${safeText(product.name)}" width="150" height="180"></a>
              <div>
                <div class="cart-item__meta">${safeText(product.category)} · ${safeText(product.edition)}</div>
                <h3><a href="product.html?id=${product.id}">${safeText(product.name)}</a></h3>
                <p class="cart-item__meta">Print size: ${item.size}</p>
                <div class="cart-item__actions">
                  <div class="quantity">
                    <button type="button" data-cart-minus aria-label="Reduce quantity">−</button>
                    <input type="number" min="1" max="10" value="${item.quantity}" data-cart-quantity aria-label="Quantity">
                    <button type="button" data-cart-plus aria-label="Increase quantity">+</button>
                  </div>
                  <button class="link-button" type="button" data-cart-remove>Remove</button>
                </div>
              </div>
              <strong class="cart-item__price">${formatPrice(prices[item.size] * item.quantity)}</strong>
            </article>`;
        }).join('');
      }
      const subtotal = cartSubtotal(cart);
      if (summarySubtotal) summarySubtotal.textContent = formatPrice(subtotal);
      if (summaryTotal) summaryTotal.textContent = formatPrice(subtotal);
    };

    list.addEventListener('click', event => {
      const item = event.target.closest('[data-cart-key]');
      if (!item) return;
      const key = item.dataset.cartKey;
      const input = $('[data-cart-quantity]', item);
      if (event.target.matches('[data-cart-minus]')) updateCartItem(key, Number(input.value) - 1);
      if (event.target.matches('[data-cart-plus]')) updateCartItem(key, Number(input.value) + 1);
      if (event.target.matches('[data-cart-remove]')) removeFromCart(key);
    });
    list.addEventListener('change', event => {
      if (event.target.matches('[data-cart-quantity]')) {
        const item = event.target.closest('[data-cart-key]');
        updateCartItem(item.dataset.cartKey, event.target.value);
      }
    });
    document.addEventListener('jfa:cart-updated', render);
    render();
  }

  /* Checkout and order confirmation -------------------------------------- */
  function checkoutSummary(target) {
    const cart = getCart();
    if (!target) return;
    target.innerHTML = cart.map(item => {
      const product = getProduct(item.productId);
      if (!product) return '';
      return `<div class="checkout-item">
        <img src="${product.image}" alt="${safeText(product.name)}" width="68" height="78">
        <div><h3>${safeText(product.name)}</h3><small>${item.size} · Qty ${item.quantity}</small></div>
        <strong>${formatPrice(prices[item.size] * item.quantity)}</strong>
      </div>`;
    }).join('');
    $('#checkout-subtotal') && ($('#checkout-subtotal').textContent = formatPrice(cartSubtotal(cart)));
    $('#checkout-total') && ($('#checkout-total').textContent = formatPrice(cartSubtotal(cart)));
  }

  function setupCheckout() {
    const form = $('#checkout-form');
    if (!form) return;
    const cart = getCart();
    checkoutSummary($('#checkout-items'));
    if (!cart.length) {
      form.innerHTML = '<div class="empty-state"><h1 class="title">Your cart is empty</h1><p>Add a print before checking out.</p><a class="button" href="shop.html">Shop prints</a></div>';
      return;
    }

    form.addEventListener('submit', event => {
      event.preventDefault();
      const required = $$('[required]', form);
      let valid = true;
      required.forEach(field => {
        const error = field.closest('.field')?.querySelector('.field-error');
        const invalid = !field.value.trim();
        field.setAttribute('aria-invalid', String(invalid));
        if (error) error.textContent = invalid ? 'Please complete this field.' : '';
        if (invalid) valid = false;
      });
      const email = $('#checkout-email');
      if (email?.value && !/^\S+@\S+\.\S+$/.test(email.value)) {
        const error = email.closest('.field')?.querySelector('.field-error');
        if (error) error.textContent = 'Enter a valid email address.';
        valid = false;
      }
      if (!valid) {
        $('[aria-invalid="true"]', form)?.focus();
        return;
      }

      const data = new FormData(form);
      const order = {
        number: `JFA-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`,
        date: new Date().toISOString(),
        customer: `${data.get('firstName')} ${data.get('lastName')}`,
        email: data.get('email'),
        city: data.get('city'),
        items: cart,
        total: cartSubtotal(cart)
      };
      localStorage.setItem(ORDER_KEY, JSON.stringify(order));
      localStorage.removeItem(CART_KEY);
      location.href = 'confirmation.html';
    });
  }

  function setupConfirmation() {
    const root = $('#confirmation');
    if (!root) return;
    let order;
    try { order = JSON.parse(localStorage.getItem(ORDER_KEY)); } catch { order = null; }
    if (!order) return;
    $('[data-order-number]', root).textContent = order.number;
    $('[data-order-email]', root).textContent = order.email;
    $('[data-order-total]', root).textContent = formatPrice(order.total);
  }

  /* Forms, newsletter and anti-spam -------------------------------------- */
  function setupForms() {
    $$('.newsletter-form').forEach(form => form.addEventListener('submit', event => {
      event.preventDefault();
      const input = $('input[type="email"]', form);
      if (!input?.value || !/^\S+@\S+\.\S+$/.test(input.value)) {
        input?.setAttribute('aria-invalid', 'true');
        input?.focus();
        return;
      }
      input.setAttribute('aria-invalid', 'false');
      showMessageToast('You are on the list', 'Thank you for subscribing.');
      form.reset();
    }));

    const contact = $('#contact-form');
    if (contact) {
      contact.dataset.started = String(Date.now());
      contact.addEventListener('submit', event => {
        event.preventDefault();
        const status = $('#contact-status');
        const honeypot = $('[name="website"]', contact);
        const elapsed = Date.now() - Number(contact.dataset.started || Date.now());
        if (honeypot?.value || elapsed < 2500) {
          status.className = 'form-status is-visible is-error';
          status.textContent = 'The form could not be submitted. Please try again.';
          return;
        }
        if (!contact.checkValidity()) {
          contact.reportValidity();
          return;
        }
        status.className = 'form-status is-visible is-success';
        status.textContent = 'Thanks. Your enquiry has been prepared successfully. Connect this form to your secure server or CRM before launch.';
        contact.reset();
        contact.dataset.started = String(Date.now());
      });
    }
  }

  /* Event delegation and visual feedback --------------------------------- */
  function setupCartDelegation() {
    document.addEventListener('click', event => {
      const button = event.target.closest('[data-add-to-cart]');
      if (!button) return;
      event.preventDefault();
      addToCart(button.dataset.addToCart, button.dataset.size || 'A5', 1);
    });
  }

  function showToast(product, size) {
    const toast = $('#cart-toast');
    if (!toast) return;
    const img = $('img', toast);
    const title = $('[data-toast-title]', toast);
    const meta = $('[data-toast-meta]', toast);
    img.src = product.image;
    img.alt = '';
    title.textContent = `${product.name} added`;
    meta.textContent = `${size} · ${formatPrice(prices[size])}`;
    toast.classList.add('is-visible');
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove('is-visible'), 3800);
  }

  function showMessageToast(titleText, metaText) {
    const toast = $('#cart-toast');
    if (!toast) return;
    const img = $('img', toast);
    img.src = 'assets/img/water-lily.jpg';
    img.alt = '';
    $('[data-toast-title]', toast).textContent = titleText;
    $('[data-toast-meta]', toast).textContent = metaText;
    toast.classList.add('is-visible');
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove('is-visible'), 3800);
  }

  function setupReveal() {
    const items = $$('.reveal:not(.is-visible)');
    if (!items.length) return;
    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      items.forEach(item => item.classList.add('is-visible'));
      return;
    }
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -5%', threshold: .08 });
    items.forEach(item => observer.observe(item));
  }


  /* Homepage luxury presentation ----------------------------------------- */
  function setupHomeLuxuryPresentation() {
    if (!document.body.classList.contains('home-page')) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const revealGroups = [
      ['.collection-layout .reveal', 70],
      ['.product-grid--homepage-featured .product-card', 90],
      ['.product-row--homepage .product-card', 65],
      ['.bundle-grid .bundle-card', 85],
      ['.home-purchase-guide__assurance', 70],
      ['.home-purchase-guide__step', 80],
      ['.journal-grid .journal-card', 90]
    ];

    revealGroups.forEach(([selector, interval]) => {
      $$(selector).forEach((item, index) => {
        item.style.setProperty('--reveal-delay', `${Math.min(index * interval, 360)}ms`);
      });
    });

    const editorialReveals = [
      ...$$('.home-page .section-head'),
      ...$$('.home-page .spotlight__intro, .home-page .spotlight__image, .home-page .spotlight__details'),
      ...$$('.home-page .quote-band blockquote, .home-page .story-split__copy, .home-page .story-split__image'),
      ...$$('.home-page .home-purchase-guide__intro')
    ];
    editorialReveals.forEach((item, index) => {
      item.classList.add('reveal', 'home-editorial-reveal');
      item.style.setProperty('--reveal-delay', `${Math.min((index % 3) * 90, 180)}ms`);
    });

    if (reduceMotion || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    const interactiveCards = $$('.home-page .product-grid--homepage-featured .product-card, .home-page .product-row--homepage .product-card');
    interactiveCards.forEach(card => {
      const media = $('.product-card__media', card);
      if (!media) return;
      let frame = 0;
      const update = event => {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => {
          const rect = media.getBoundingClientRect();
          const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
          const y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
          media.style.setProperty('--lux-x', `${(x - .5) * -8}px`);
          media.style.setProperty('--lux-y', `${(y - .5) * -8}px`);
          media.style.setProperty('--glare-x', `${x * 100}%`);
          media.style.setProperty('--glare-y', `${y * 100}%`);
        });
      };
      const reset = () => {
        cancelAnimationFrame(frame);
        media.style.setProperty('--lux-x', '0px');
        media.style.setProperty('--lux-y', '0px');
        media.style.setProperty('--glare-x', '50%');
        media.style.setProperty('--glare-y', '45%');
      };
      media.addEventListener('pointermove', update, { passive: true });
      media.addEventListener('pointerleave', reset, { passive: true });
    });
  }

  function setCurrentNav() {
    const file = location.pathname.split('/').pop() || 'index.html';
    $$('[data-nav-link]').forEach(link => {
      if (link.getAttribute('href') === file) link.setAttribute('aria-current', 'page');
    });
  }

  function setYear() {
    $$('[data-current-year]').forEach(el => el.textContent = new Date().getFullYear());
  }

  /* Initialise ------------------------------------------------------------ */
  document.addEventListener('DOMContentLoaded', () => {
    setupHeader();
    setupMenu();
    setupSearch();
    setupHero();
    renderProductTargets();
    setupSpotlight();
    setupShop();
    setupProductPage();
    renderCartPage();
    setupCheckout();
    setupConfirmation();
    setupForms();
    setupCartDelegation();
    updateCartCount();
    setupHomeLuxuryPresentation();
    setupReveal();
    setCurrentNav();
    setYear();
  });
})();
