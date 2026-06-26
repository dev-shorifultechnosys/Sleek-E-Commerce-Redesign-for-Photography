/**
 * Checkout page controller
 * ------------------------
 * Validates the front-end checkout, stores a temporary confirmation payload
 * and redirects to a dedicated confirmation page. Replace the marked callback
 * with the client's Shopify/WooCommerce/payment-provider session at launch.
 */

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("[data-checkout-form]");
  const summary = document.querySelector("[data-checkout-summary]");
  if (!form || !summary) return;

  const cart = getCart();
  const totals = cartTotals();
  if (!cart.length) {
    window.location.href = "cart.html";
    return;
  }

  const shippingLabel = document.querySelector("[data-checkout-shipping]");
  if (shippingLabel) shippingLabel.textContent = totals.shipping ? formatMoney(totals.shipping) : "Complimentary";

  summary.innerHTML = `
    <div class="checkout-summary__items">
      ${cart.map((item) => {
        const product = getProductById(item.id);
        const unitPrice = getProductUnitPrice(product, item.size);
        return `<div class="checkout-item"><div class="checkout-item__image">${productPicture(product, { width: 220, height: 260, sizes: "72px" })}<span>${item.quantity}</span></div><div><strong>${product.title}</strong><p>${item.size} ${product.category === "Bundles" ? "set" : "print"}</p></div><strong>${formatMoney(unitPrice * item.quantity)}</strong></div>`;
      }).join("")}
    </div>
    <div class="summary-row"><span>Subtotal</span><strong>${formatMoney(totals.subtotal)}</strong></div>
    <div class="summary-row"><span>Shipping</span><strong>${totals.shipping ? formatMoney(totals.shipping) : "Complimentary"}</strong></div>
    <div class="summary-row summary-row--total"><span>Total AUD</span><strong>${formatMoney(totals.total)}</strong></div>`;

  const loadedAt = Date.now();
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const honeypot = form.querySelector(".honeypot");
    if (honeypot?.value || Date.now() - loadedAt < 1500) return;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    button.textContent = "Connecting secure payment…";

    const formData = new FormData(form);
    const orderNumber = `JF-${String(Date.now()).slice(-6)}`;
    const order = {
      orderNumber,
      firstName: formData.get("firstName"),
      email: formData.get("email"),
      paymentMethod: formData.get("payment"),
      deliveryMethod: formData.get("delivery"),
      total: totals.total,
      items: cart.map(item => ({ ...item, title: getProductById(item.id)?.title || item.id }))
    };

    /*
     * PRODUCTION INTEGRATION POINT
     * Create a secure payment session here with Shopify Payments, Stripe,
     * PayPal or the client's existing platform, then redirect to the provider.
     * The timeout below only demonstrates the approved confirmation flow.
     */
    setTimeout(() => {
      localStorage.setItem(LAST_ORDER_KEY, JSON.stringify(order));
      localStorage.removeItem(CART_KEY);
      window.location.href = `confirmation.html?order=${encodeURIComponent(orderNumber)}`;
    }, 850);
  });
});
