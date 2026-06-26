/**
 * Order confirmation presentation
 * -------------------------------
 * Reads the temporary order payload created by checkout.js. A production
 * build should render verified order data returned by the payment platform.
 */
document.addEventListener("DOMContentLoaded", () => {
  const card = document.querySelector("[data-confirmation-card]");
  if (!card) return;

  let order = null;
  try {
    order = JSON.parse(localStorage.getItem(LAST_ORDER_KEY));
  } catch (error) {
    order = null;
  }

  const queryOrder = new URLSearchParams(location.search).get("order");
  const orderNumber = order?.orderNumber || queryOrder || "Awaiting checkout";
  const firstName = order?.firstName ? `, ${order.firstName}` : "";

  card.innerHTML = `
    <span class="confirmation-tick" aria-hidden="true">✓</span>
    <p class="eyebrow">Order confirmed · ${orderNumber}</p>
    <h1>Thank you${firstName}.</h1>
    <p>Your selection is now in the studio queue. A confirmation will be sent to <strong>${order?.email || "the email supplied at checkout"}</strong>.</p>
    <div class="confirmation-summary">
      <div><span>Order reference</span><strong>${orderNumber}</strong></div>
      <div><span>Total</span><strong>${order ? formatMoney(order.total) : "Recorded at checkout"}</strong></div>
      <div><span>Preparation</span><strong>2–4 business days</strong></div>
    </div>
    <div class="confirmation-actions"><a class="button button--dark" href="shop.html">Continue browsing</a><a class="button button--outline" href="index.html">Return home</a></div>`;
});
