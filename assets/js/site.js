/* PuzzleFrog Pty Ltd: small progressive enhancements. The site works without this file. */
(function () {
  "use strict";
  var doc = document;

  /* Mobile menu: a disclosure button that shows and hides the main navigation. */
  var toggle = doc.querySelector(".nav-toggle");
  var nav = doc.getElementById("site-nav");
  if (toggle && nav) {
    var setOpen = function (open) {
      toggle.setAttribute("aria-expanded", String(open));
      nav.classList.toggle("is-open", open);
    };
    toggle.addEventListener("click", function () {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });
    doc.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setOpen(false);
        toggle.focus();
      }
    });
  }

  /* Keep the copyright year current. The HTML holds a static year as a fallback. */
  var year = String(new Date().getFullYear());
  doc.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = year; });

  /* Contact form: opens the visitor's own email app with the message filled in.
     Nothing is sent to or stored by this website or any third-party form service. */
  var form = doc.getElementById("enquiry-form");
  if (form) {
    var status = doc.getElementById("form-status");
    var typeField = form.elements.namedItem("type");
    var preset = new URLSearchParams(window.location.search).get("type");
    var presets = { candidate: "Request a candidate", consulting: "Consulting", talent: "Join the talent pool", other: "Something else" };
    if (preset && presets[preset] && typeField) { typeField.value = presets[preset]; }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var value = function (name) {
        var field = form.elements.namedItem(name);
        return field ? String(field.value).trim() : "";
      };
      var type = value("type");
      var name = value("name");
      var org = value("organisation");
      var lines = ["Enquiry type: " + type, "Name: " + name, "Email: " + value("email")];
      if (value("phone")) { lines.push("Phone: " + value("phone")); }
      if (org) { lines.push("Organisation: " + org); }
      lines.push("", value("message"));

      var subject = type + " (" + name + (org ? ", " + org : "") + ")";
      var to = form.getAttribute("data-to");
      var href = "mailto:" + to + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(lines.join("\r\n"));

      if (status) {
        status.textContent = "Your email app should now open with your message ready to send. If it doesn't, email us at " + to + ".";
      }
      window.location.href = href;
    });
  }
})();
