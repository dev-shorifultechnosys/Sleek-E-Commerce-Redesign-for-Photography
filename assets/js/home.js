/**
 * Homepage merchandising
 * ----------------------
 * Product content is read from data.js so prices, artwork titles and edition
 * information remain consistent across the entire storefront.
 */
document.addEventListener("DOMContentLoaded", () => {
  const favouritesMount = document.querySelector("[data-home-favourites]");
  const bundlesMount = document.querySelector("[data-home-bundles]");

  if (favouritesMount) {
    const favourites = PRODUCTS
      .filter((product) => product.featured && product.category !== "Bundles")
      .slice(0, 4);

    favouritesMount.innerHTML = favourites
      .map((product) => productCardMarkup(product, {
        sizes: "(max-width:640px) 92vw,(max-width:1100px) 46vw,23vw"
      }))
      .join("");
  }

  if (bundlesMount) {
    const bundles = PRODUCTS.filter((product) => product.category === "Bundles");
    bundlesMount.innerHTML = bundles
      .map((product) => productCardMarkup(product, {
        imageHeight: 820,
        sizes: "(max-width:860px) 92vw,48vw"
      }))
      .join("");
  }
});
