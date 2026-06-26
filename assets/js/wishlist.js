/**
 * Wishlist page controller
 * ------------------------
 * Saved artwork IDs are stored locally for the static prototype. Replace the
 * persistence helpers in app.js with the commerce platform customer API when
 * customer accounts are connected.
 */
document.addEventListener("DOMContentLoaded", () => {
  const mount = document.querySelector("[data-wishlist-content]");
  if (!mount) return;

  function render() {
    const products = getWishlist()
      .map((id) => getProductById(id))
      .filter(Boolean);

    if (!products.length) {
      mount.innerHTML = `
        <div class="wishlist-empty">
          <p class="eyebrow">Nothing saved yet</p>
          <h2>Build a collection at your own pace.</h2>
          <p>Use the heart on any artwork to keep it here while you compare mood, scale and edition details.</p>
          <a class="button button--dark" href="shop.html">Browse all prints</a>
        </div>`;
      return;
    }

    mount.innerHTML = `
      <div class="section-heading section-heading--compact">
        <div><p class="eyebrow">${products.length} saved ${products.length === 1 ? "artwork" : "artworks"}</p><h2>Pieces worth another look.</h2></div>
        <a class="text-link" href="shop.html">Continue shopping</a>
      </div>
      <div class="product-grid product-grid--three">${products.map((product) => productCardMarkup(product)).join("")}</div>`;
  }

  document.addEventListener("wishlist:updated", render);
  render();
});
