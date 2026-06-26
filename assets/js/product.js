/**
 * Product detail controller
 * -------------------------
 * Builds a complete purchase page with purposeful gallery views, live size
 * pricing, dynamic interior scale and related-work recommendations.
 */

document.addEventListener("DOMContentLoaded", () => {
  const mount = document.querySelector("[data-product-page]");
  if (!mount) return;

  const params = new URLSearchParams(window.location.search);
  const product = getProductById(params.get("id")) || PRODUCTS[0];
  const isBundle = product.category === "Bundles";
  const isLimited = product.edition.includes("Limited");
  const editionTotal = Number(product.editionSize.match(/\d+/)?.[0] || 25);
  const remainingEdition = isLimited
    ? Math.max(3, editionTotal - (PRODUCTS.findIndex((item) => item.id === product.id) * 2 + 7))
    : null;

  document.title = `${product.title} | J. Fletcher Art`;

  const sizeOptions = Object.entries(SIZE_PRICES).map(([size]) => {
    const price = getProductUnitPrice(product, size);
    return `<label><input type="radio" name="size" value="${size}" ${size === "A4" ? "checked" : ""}><span><strong>${size}</strong><small>${formatMoney(price)}</small></span></label>`;
  }).join("");

  mount.innerHTML = `
    <div class="container product-breadcrumb" aria-label="Breadcrumb">
      <a href="index.html">Home</a><span>·</span>
      <a href="${productCollectionUrl(product)}">${product.category}</a><span>·</span>
      <span aria-current="page">${product.title}</span>
    </div>

    <div class="container product-detail">
      <div class="product-detail__gallery" data-product-gallery>
        <nav class="gallery-nav" aria-label="Artwork views">
          <a href="#artwork-view">Artwork</a><a href="#detail-view">Detail</a><a href="#paper-view">Paper</a><a href="#room-view">In a room</a><a href="#packaging-view">Packaging</a>
        </nav>

        <figure class="product-detail__main-image" id="artwork-view">
          ${productPicture(product, {
            width: 1500,
            height: product.orientation === "Landscape" ? 1120 : 1780,
            sizes: "(max-width: 980px) 100vw, 58vw",
            loading: "eager",
            fetchpriority: "high"
          })}
          <figcaption>Full artwork view</figcaption>
        </figure>

        <figure class="product-detail__detail-crop" id="detail-view">
          ${productPicture(product, {
            className: "is-detail-crop",
            width: 1400,
            height: 860,
            sizes: "(max-width: 980px) 100vw, 58vw",
            alt: `${product.title} close detail showing tone and texture`
          })}
          <figcaption>Detail crop</figcaption>
        </figure>

        <figure class="material-detail" id="paper-view">
          <div class="paper-visual" aria-label="Layered cotton paper and print detail">
            <span class="paper-visual__sheet paper-visual__sheet--back"></span>
            <span class="paper-visual__sheet paper-visual__sheet--middle"></span>
            <span class="paper-visual__sheet paper-visual__sheet--front"><img src="${imageUrl(product.image, 900, 1080)}" alt="${product.title} printed on archival cotton paper" loading="lazy" decoding="async"></span>
            <span class="paper-visual__stamp">310 gsm · Cotton rag · Matte</span>
          </div>
          <div class="material-detail__note"><p class="eyebrow">Museum-grade material</p><h3>Cotton paper with a soft, tactile surface.</h3><p>Archival pigment inks preserve subtle tonal shifts without reflective gloss.</p></div>
          <figcaption>Paper and print detail</figcaption>
        </figure>

        <figure class="product-room-scene" id="room-view">
          <img
            class="product-room-scene__background"
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=86"
            srcset="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=82 800w, https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=86 1600w"
            sizes="(max-width: 980px) 100vw, 58vw"
            width="1600" height="1050"
            alt="Calm living space used to demonstrate framed print scale"
            loading="lazy" decoding="async">
          <span class="product-room-scene__frame is-a4" data-room-frame aria-hidden="true"><img src="${imageUrl(product.image, 700, 900)}" alt=""></span>
          <span class="room-size-label" data-room-size>A4 scale preview</span>
          <figcaption>Interior scale preview</figcaption>
        </figure>

        <figure class="packaging-detail" id="packaging-view">
          <div class="packaging-visual" aria-label="Rigid art mailer, wrapped print and authenticity card">
            <span class="packaging-visual__mailer"><i>J. Fletcher Art</i><b>Fine Art Photography</b></span>
            <span class="packaging-visual__tissue"><img src="${imageUrl(product.image, 640, 780)}" alt="" loading="lazy" decoding="async"></span>
            <span class="packaging-visual__certificate"><small>Certificate of authenticity</small><strong>${product.title}</strong><em>${isLimited ? product.editionSize : "Studio print"}</em></span>
          </div>
          <div class="packaging-detail__card"><p class="eyebrow">Protected in transit</p><h3>Rigid, recyclable and tracked.</h3><p>${isLimited ? "The signed print and authenticity card are packed together." : "The print is protected with acid-free tissue and a rigid mailer."}</p></div>
          <figcaption>Packaging and authenticity</figcaption>
        </figure>
      </div>

      <aside class="product-detail__info">
        <p class="eyebrow">${product.edition}</p>
        <div class="product-title-row">
          <h1>${product.title}</h1>
          <button class="product-wishlist" type="button" data-wishlist-toggle="${product.id}" aria-label="Save ${product.title} to wishlist" aria-pressed="false">
            <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M20.8 4.7a5.4 5.4 0 0 0-7.6 0L12 5.9l-1.2-1.2a5.4 5.4 0 1 0-7.6 7.6L12 21l8.8-8.7a5.4 5.4 0 0 0 0-7.6Z"></path></svg>
          </button>
        </div>
        <p class="product-detail__lead">${product.description}</p>

        <div class="product-status" aria-label="Artwork availability">
          <span>${product.editionSize}</span><span>${isLimited ? `${remainingEdition} remaining` : product.availability}</span><span>${isBundle ? "Coordinated set" : "Frame not included"}</span>
        </div>

        <div class="product-price" data-product-price>${formatMoney(getProductUnitPrice(product, "A4"))}</div>

        <fieldset class="size-selector">
          <legend>Choose ${isBundle ? "set" : "print"} size</legend>
          ${sizeOptions}
        </fieldset>
        <p class="delivery-estimate">Prepared in 2–4 business days · Tracked delivery available</p>

        <div class="product-actions">
          <div class="quantity-control quantity-control--large">
            <button type="button" data-product-decrease aria-label="Decrease quantity">−</button><span data-product-quantity>1</span><button type="button" data-product-increase aria-label="Increase quantity">+</button>
          </div>
          <button class="button button--dark button--grow" type="button" data-add-to-cart>Add to bag</button>
        </div>

        <div class="assurance-list">
          <p><span>01</span> ${isBundle ? "Two coordinated archival prints" : "Archival pigment print"} on museum-grade cotton paper</p>
          <p><span>02</span> Carefully packed in a rigid, recyclable mailer</p>
          <p><span>03</span> ${isLimited ? "Numbered, signed and supplied with an authenticity card" : "Printed to order and individually quality checked"}</p>
        </div>

        <details open><summary>The story behind the image</summary><p>${product.story}</p></details>
        <details><summary>Print specifications</summary><p>${isBundle ? "The set contains two unframed prints in the same selected size." : "Available in A5, A4 and A3. Unframed."} Each print includes a clean white border for handling and framing.</p></details>
        <details><summary>Shipping and returns</summary><p>Flat-rate tracked delivery within Australia. Complimentary shipping applies above ${formatMoney(SITE.freeShippingThreshold)}. Contact the studio within 14 days if your order arrives damaged.</p></details>
      </aside>
    </div>

    <section class="section section--paper">
      <div class="container">
        <div class="section-heading"><div><p class="eyebrow">Continue the collection</p><h2>Works with a similar mood</h2></div><a class="text-link" href="shop.html">View all prints</a></div>
        <div class="product-grid product-grid--three" data-related-products></div>
      </div>
    </section>`;

  updateWishlistUI();

  const price = mount.querySelector("[data-product-price]");
  const quantityText = mount.querySelector("[data-product-quantity]");
  const roomFrame = mount.querySelector("[data-room-frame]");
  const roomSize = mount.querySelector("[data-room-size]");
  let quantity = 1;

  mount.querySelectorAll('input[name="size"]').forEach((input) => {
    input.addEventListener("change", () => {
      price.textContent = formatMoney(getProductUnitPrice(product, input.value));
      roomFrame.className = `product-room-scene__frame is-${input.value.toLowerCase()}`;
      roomSize.textContent = `${input.value} scale preview`;
    });
  });

  mount.querySelector("[data-product-decrease]").addEventListener("click", () => {
    quantity = Math.max(1, quantity - 1);
    quantityText.textContent = quantity;
  });
  mount.querySelector("[data-product-increase]").addEventListener("click", () => {
    quantity += 1;
    quantityText.textContent = quantity;
  });
  mount.querySelector("[data-add-to-cart]").addEventListener("click", () => {
    const size = mount.querySelector('input[name="size"]:checked').value;
    addToCart(product.id, size, quantity);
  });

  const related = PRODUCTS.filter((item) => item.id !== product.id && (item.category === product.category || item.featured)).slice(0, 3);
  mount.querySelector("[data-related-products]").innerHTML = related.map((item) => productCardMarkup(item, { showQuickAdd: true })).join("");
});
