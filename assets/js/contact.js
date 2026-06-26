/**
 * Contact form protection and feedback
 * ------------------------------------
 * Honeypot and minimum-completion-time checks deter basic automated spam.
 * Production must also validate, sanitise and rate-limit submissions server-side.
 */
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("[data-contact-form]");
  const message = document.querySelector("[data-contact-message]");
  if (!form || !message) return;

  const loadedAt = Date.now();
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (form.querySelector(".honeypot")?.value || Date.now() - loadedAt < 1400) return;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    message.textContent = "Thank you. Your enquiry has been received. The studio will reply within two business days.";
    form.reset();
  });
});
