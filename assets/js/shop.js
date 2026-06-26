/**
 * Shop archive controller
 * -----------------------
 * Provides category, featured, limited-edition, orientation and keyword
 * filtering. Filter choices are written to the URL so views can be shared.
 */

document.addEventListener("DOMContentLoaded", () => {
  const grid = document.querySelector("[data-product-grid]");
  if (!grid) return;

  const filterButtons = [...document.querySelectorAll("[data-shop-filter]")];
  const orientationSelect = document.querySelector("[data-orientation-filter]");
  const searchInput = document.querySelector("[data-shop-search]");
  const resultsCount = document.querySelector("[data-results-count]");
  const viewTitle = document.querySelector("[data-shop-view-title]");
  const sortSelect = document.querySelector("[data-sort-filter]");

  const params = new URLSearchParams(window.location.search);
  const initialCategory = params.get("category");
  const initialCollection = params.get("collection");
  const initialQuery = params.get("q") || "";

  let filters = {
    mode: initialCategory ? "category" : initialCollection ? "collection" : "all",
    value: initialCategory || initialCollection || "All",
    orientation: params.get("orientation") || "All",
    query: initialQuery,
    sort: params.get("sort") || "featured"
  };

  searchInput.value = initialQuery;
  orientationSelect.value = filters.orientation;
  if (sortSelect) sortSelect.value = filters.sort;

  function buttonMatches(button) {
    return button.dataset.filterMode === filters.mode && button.dataset.shopFilter === filters.value;
  }

  filterButtons.forEach((button) => button.classList.toggle("is-active", buttonMatches(button)));
  if (!filterButtons.some(buttonMatches)) {
    const allButton = filterButtons.find((button) => button.dataset.filterMode === "all");
    allButton?.classList.add("is-active");
    filters = { ...filters, mode: "all", value: "All" };
  }

  function productMatchesSpecialCollection(product) {
    if (filters.mode !== "collection") return true;
    if (filters.value === "Featured") return Boolean(product.featured);
    if (filters.value === "Limited Editions") return product.edition.includes("Limited");
    return true;
  }

  function writeUrl() {
    const next = new URLSearchParams();
    if (filters.mode === "category") next.set("category", filters.value);
    if (filters.mode === "collection") next.set("collection", filters.value);
    if (filters.orientation !== "All") next.set("orientation", filters.orientation);
    if (filters.query.trim()) next.set("q", filters.query.trim());
    if (filters.sort !== "featured") next.set("sort", filters.sort);
    const query = next.toString();
    history.replaceState(null, "", `${location.pathname}${query ? `?${query}` : ""}`);
  }

  function render() {
    const query = filters.query.trim().toLowerCase();
    const filtered = PRODUCTS.filter((product) => {
      const categoryMatch = filters.mode !== "category" || product.category === filters.value;
      const collectionMatch = productMatchesSpecialCollection(product);
      const orientationMatch = filters.orientation === "All" || product.orientation === filters.orientation;
      const queryMatch = !query || [product.title, product.category, product.edition, product.description, product.story]
        .join(" ").toLowerCase().includes(query);
      return categoryMatch && collectionMatch && orientationMatch && queryMatch;
    }).sort((a, b) => {
      if (filters.sort === "title-asc") return a.title.localeCompare(b.title);
      if (filters.sort === "price-asc") return getProductUnitPrice(a, "A5") - getProductUnitPrice(b, "A5");
      if (filters.sort === "price-desc") return getProductUnitPrice(b, "A5") - getProductUnitPrice(a, "A5");
      return Number(Boolean(b.featured)) - Number(Boolean(a.featured));
    });

    const activeLabel = filters.mode === "all" ? "All prints" : filters.value;
    viewTitle.textContent = activeLabel;
    resultsCount.textContent = `${filtered.length} ${filtered.length === 1 ? "artwork" : "artworks"}`;

    grid.innerHTML = filtered.length
      ? filtered.map((product) => productCardMarkup(product)).join("")
      : `<div class="no-results"><p class="eyebrow">No matching artwork</p><h2>Try a broader search or another collection.</h2><button class="button button--dark" type="button" data-clear-filters>Clear filters</button></div>`;

    writeUrl();
  }

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      filters.mode = button.dataset.filterMode;
      filters.value = button.dataset.shopFilter;
      filterButtons.forEach((item) => item.classList.toggle("is-active", item === button));
      render();
    });
  });

  orientationSelect.addEventListener("change", () => {
    filters.orientation = orientationSelect.value;
    render();
  });

  sortSelect?.addEventListener("change", () => {
    filters.sort = sortSelect.value;
    render();
  });

  searchInput.addEventListener("input", () => {
    filters.query = searchInput.value;
    render();
  });

  grid.addEventListener("click", (event) => {
    if (!event.target.closest("[data-clear-filters]")) return;
    filters = { mode: "all", value: "All", orientation: "All", query: "", sort: "featured" };
    filterButtons.forEach((item) => item.classList.toggle("is-active", item.dataset.filterMode === "all"));
    orientationSelect.value = "All";
    searchInput.value = "";
    if (sortSelect) sortSelect.value = "featured";
    render();
  });

  render();
});
