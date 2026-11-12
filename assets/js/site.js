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

  /* Talent register: sends the answers to PuzzleFrog by email through Web3Forms, then shows
     the thank-you message. Without this script the form still posts straight to Web3Forms. */
  var register = doc.getElementById("register-form");
  if (register) {
    var regStatus = doc.getElementById("register-status");
    var done = doc.getElementById("register-done");
    var mainRole = register.elements.namedItem("main_role");
    var otherRoles = register.querySelectorAll('input[name="other_roles"]');
    var emailUs = "email your details to info@puzzlefrog.com.au.";

    /* Don't offer someone's main role again under "Other roles you could do". */
    var syncOtherRoles = function () {
      otherRoles.forEach(function (box) {
        var same = box.value === mainRole.value;
        box.disabled = same;
        if (same) { box.checked = false; }
      });
    };
    if (mainRole) {
      mainRole.addEventListener("change", syncOtherRoles);
      syncOtherRoles();
    }

    register.addEventListener("submit", function (event) {
      event.preventDefault();
      var button = register.querySelector('button[type="submit"]');
      var say = function (text) { regStatus.textContent = text; };

      /* Collect the answers. Several ticked roles are joined into one line. */
      var data = {};
      new FormData(register).forEach(function (value, key) {
        data[key] = data[key] ? data[key] + ", " + value : value;
      });
      if (data.botcheck) { return; } /* hidden spam trap: people never tick it */
      if (!data.access_key) {
        say("Sorry, this form isn’t switched on yet. Please " + emailUs);
        return;
      }
      data.subject = "Talent register: " + data.name;
      data.replyto = data.email;
      if (!data.other_roles) { data.other_roles = "None"; }

      button.disabled = true;
      say("Sending…");
      fetch(register.action, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(data)
      })
        .then(function (response) {
          return response.json().then(function (json) {
            if (!response.ok || json.success === false) { throw new Error(json.message || "Not sent"); }
          });
        })
        .then(function () {
          register.hidden = true;
          done.hidden = false;
          done.focus();
        })
        .catch(function () {
          button.disabled = false;
          say("Sorry, your details didn’t send. Please try again, or " + emailUs);
        });
    });
  }
})();
