/**
 * Full cart page controller
 * -------------------------
 * Shows filled and empty states, quantity controls, shipping progress and
 * relevant recommendations without distracting from checkout.
 */

document.addEventListener("DOMContentLoaded", () => {
  const mount = document.querySelector("[data-cart-page]");
  if (!mount) return;

  function recommendations(excludedIds = []) {
    return PRODUCTS.filter((product) => product.featured && !excludedIds.includes(product.id) && product.category !== "Bundles").slice(0, 3);
  }

  function renderRecommendations(products, title = "A few considered suggestions") {
    return `
      <section class="section section--paper cart-recommendations">
        <div class="container">
          <div class="section-heading"><div><p class="eyebrow">Continue looking</p><h2>${title}</h2></div><a class="text-link" href="shop.html">View all prints</a></div>
          <div class="product-grid product-grid--three">${products.map(product => productCardMarkup(product)).join("")}</div>
        </div>
      </section>`;
  }

  function render() {
    const cart = getCart();

    if (!cart.length) {
      mount.innerHTML = `
        <section class="empty-page"><div class="container"><p class="eyebrow">Your bag is empty</p><h1>Choose a photograph for the space you live in.</h1><a class="button button--dark" href="shop.html">Browse the collection</a></div></section>
        ${renderRecommendations(recommendations(), "Start with the current studio edit")}`;
      return;
    }

    const totals = cartTotals();
    const cartIds = cart.map(item => item.id);

    mount.innerHTML = `
      <div class="container cart-page">
        <div class="cart-page__items">
          <div class="page-heading page-heading--compact"><p class="eyebrow">Your selection</p><h1>Shopping bag</h1></div>
          <div class="shipping-progress shipping-progress--page" aria-label="Free shipping progress">
            <p>${totals.remainingForFreeShipping ? `Add ${formatMoney(totals.remainingForFreeShipping)} more for complimentary shipping.` : "Complimentary shipping has been unlocked."}</p>
            <span><i style="width:${totals.freeShippingProgress}%"></i></span>
          </div>
          ${cart.map((item) => {
            const product = getProductById(item.id);
            const unitPrice = getProductUnitPrice(product, item.size);
            return `
              <article class="cart-line">
                <a class="cart-line__image" href="product.html?id=${product.id}">${productPicture(product, { width: 500, height: 620, sizes: "180px" })}</a>
                <div class="cart-line__details">
                  <div><p class="eyebrow">${product.edition}</p><h2><a href="product.html?id=${product.id}">${product.title}</a></h2><p>${item.size} ${product.category === "Bundles" ? "set" : "print"} · ${formatMoney(unitPrice)}</p></div>
                  <div class="cart-line__bottom"><div class="quantity-control"><button type="button" data-line-decrease="${product.id}" data-size="${item.size}" aria-label="Decrease quantity">−</button><span>${item.quantity}</span><button type="button" data-line-increase="${product.id}" data-size="${item.size}" aria-label="Increase quantity">+</button></div><strong>${formatMoney(unitPrice * item.quantity)}</strong><button class="text-button" type="button" data-line-remove="${product.id}" data-size="${item.size}">Remove</button></div>
                </div>
              </article>`;
          }).join("")}
        </div>

        <aside class="order-summary">
          <p class="eyebrow">Order summary</p><h2>Ready for checkout</h2>
          <div class="summary-row"><span>Subtotal</span><strong>${formatMoney(totals.subtotal)}</strong></div>
          <div class="summary-row"><span>Tracked shipping</span><strong>${totals.shipping ? formatMoney(totals.shipping) : "Complimentary"}</strong></div>
          <div class="summary-row summary-row--total"><span>Total</span><strong>${formatMoney(totals.total)}</strong></div>
          <a class="button button--dark button--full" href="checkout.html">Secure checkout</a>
          <p class="small-print">Taxes are included where applicable. Payment details are handled by the connected secure payment provider.</p>
        </aside>
      </div>
      ${renderRecommendations(recommendations(cartIds), "Works that complement your selection")}`;
  }

  mount.addEventListener("click", (event) => {
    const decrease = event.target.closest("[data-line-decrease]");
    const increase = event.target.closest("[data-line-increase]");
    const remove = event.target.closest("[data-line-remove]");

    if (decrease || increase) {
      const trigger = decrease || increase;
      const id = decrease ? trigger.dataset.lineDecrease : trigger.dataset.lineIncrease;
      const size = trigger.dataset.size;
      const item = getCart().find((entry) => entry.id === id && entry.size === size);
      if (item) updateCartItem(id, size, item.quantity + (increase ? 1 : -1));
      render();
    }
    if (remove) {
      removeCartItem(remove.dataset.lineRemove, remove.dataset.size);
      render();
    }
  });

  render();
});
