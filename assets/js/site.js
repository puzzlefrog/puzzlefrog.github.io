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

  /* Contact form: sends the enquiry to PuzzleFrog by email through Web3Forms, then shows
     the thank-you message. Without this script the form still posts straight to Web3Forms. */
  var form = doc.getElementById("enquiry-form");
  if (form) {
    var status = doc.getElementById("form-status");
    var sent = doc.getElementById("enquiry-done");
    var typeField = form.elements.namedItem("type");
    var preset = new URLSearchParams(window.location.search).get("type");
    var presets = { candidate: "Request a candidate", consulting: "Consulting", talent: "Join the talent pool", other: "Something else" };
    if (preset && presets[preset] && typeField) { typeField.value = presets[preset]; }
    var emailInstead = "email us at info@puzzlefrog.com.au.";

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var button = form.querySelector('button[type="submit"]');
      var say = function (text) { status.textContent = text; };

      /* Collect the answers, leaving out optional boxes that were left empty. */
      var data = {};
      new FormData(form).forEach(function (value, key) {
        if (String(value).trim()) { data[key] = String(value).trim(); }
      });
      if (data.botcheck) { return; } /* hidden spam trap: people never tick it */
      if (!data.access_key) {
        say("Sorry, this form isn’t working right now. Please " + emailInstead);
        return;
      }
      data.subject = data.type + ": " + data.name + (data.organisation ? " (" + data.organisation + ")" : "");
      data.replyto = data.email;

      button.disabled = true;
      say("Sending…");
      fetch(form.action, {
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
          form.hidden = true;
          sent.hidden = false;
          sent.focus();
        })
        .catch(function () {
          button.disabled = false;
          say("Sorry, your message didn’t send. Please try again, or " + emailInstead);
        });
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
    var emailUs = "email your details to careers@puzzlefrog.com.au.";

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
