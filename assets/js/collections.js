/**
 * Collection landing page
 * -----------------------
 * Collection cards, print sets and limited editions are generated from the
 * shared catalogue so the site never displays conflicting product details.
 */
document.addEventListener("DOMContentLoaded", () => {
  const collectionGrid = document.querySelector("[data-collection-grid]");
  const bundleGrid = document.querySelector("[data-collection-bundles]");
  const limitedGrid = document.querySelector("[data-limited-grid]");

  const countFor = (collection) => collection.type === "featured"
    ? PRODUCTS.filter((product) => product.featured).length
    : PRODUCTS.filter((product) => product.category === collection.value).length;

  if (collectionGrid) {
    collectionGrid.innerHTML = COLLECTIONS.map((collection) => `
      <a class="collection-card" href="shop.html?${collection.type === "featured" ? "collection=Featured" : `category=${encodeURIComponent(collection.value)}`}">
        <img src="${imageUrl(collection.image, 1100, 1250)}" srcset="${imageUrl(collection.image, 620, 760)} 620w, ${imageUrl(collection.image, 1100, 1250)} 1100w" sizes="(max-width:760px) 92vw,46vw" width="1100" height="1250" alt="${collection.alt}" loading="lazy" decoding="async">
        <div><p>${collection.description}</p><h3>${collection.name}</h3><span>${String(countFor(collection)).padStart(2, "0")} works ↗</span></div>
      </a>`).join("");
  }

  if (bundleGrid) {
    bundleGrid.innerHTML = PRODUCTS
      .filter((product) => product.category === "Bundles")
      .map((product) => productCardMarkup(product, { imageHeight: 820, sizes: "(max-width:860px) 92vw,48vw" }))
      .join("");
  }

  if (limitedGrid) {
    limitedGrid.innerHTML = PRODUCTS
      .filter((product) => product.edition.includes("Limited") && product.category !== "Bundles")
      .slice(0, 3)
      .map((product) => productCardMarkup(product))
      .join("");
  }
});
