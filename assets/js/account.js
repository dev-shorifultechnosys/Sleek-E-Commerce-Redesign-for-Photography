/**
 * Account interface validation
 * ----------------------------
 * This prototype validates the form locally. Connect the submit callback to
 * the client’s Shopify, WooCommerce or custom customer-account endpoint.
 */
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("[data-account-form]");
  const message = document.querySelector("[data-account-message]");
  if (!form || !message) return;

  const loadedAt = Date.now();
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (form.querySelector(".honeypot")?.value || Date.now() - loadedAt < 1200) return;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    message.textContent = "Account authentication is ready to connect to the production commerce platform.";
  });
});
