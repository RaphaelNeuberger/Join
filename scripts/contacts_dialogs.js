// scripts/contacts_dialogs.js
// Contact dialog and form handlers

/**
 * Open add contact dialog
 */
function openAddContactDialog() {
  const dialog = document.getElementById("addContactDialog");
  if (dialog) {
    dialog.classList.add("active");
    document.body.style.overflow = "hidden";
  }
}

/**
 * Close add contact dialog
 */
function closeAddContactDialog() {
  const dialog = document.getElementById("addContactDialog");
  if (dialog) {
    dialog.classList.remove("active");
    document.body.style.overflow = "";
    const form = document.getElementById("addContactForm");
    if (form) form.reset();
    clearValidationErrors("add");
  }
}

/**
 * Open edit contact dialog
 */
function openEditContactDialog() {
  const contact = window.getCurrentContact();
  if (!contact) {
    alert("Please select a contact first!");
    return;
  }

  const dialog = document.getElementById("editContactDialog");
  if (!dialog) return;

  document.getElementById("editContactName").value = contact.name || "";
  document.getElementById("editContactEmail").value = contact.email || "";
  document.getElementById("editContactPhone").value = contact.phone || "";

  const avatar = document.getElementById("editContactAvatar");
  if (avatar) {
    const initials = (contact.name || "")
      .split(" ")
      .map((s) => s.charAt(0))
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase();
    avatar.textContent = initials;
  }

  dialog.classList.add("active");
  document.body.style.overflow = "hidden";
}

/**
 * Restore mobile contact view after dialog close.
 */
function restoreMobileContactView() {
  const isMobile = window.innerWidth <= 1023;
  if (isMobile) {
    const contact = window.getCurrentContact();
    if (contact) window.showMobileContactDetail(contact);
  }
}

/**
 * Close edit contact dialog
 */
function closeEditContactDialog() {
  const dialog = document.getElementById("editContactDialog");
  if (dialog) {
    dialog.classList.remove("active");
    document.body.style.overflow = "";
    clearValidationErrors("edit");
  }
  restoreMobileContactView();
}

/**
 * Delete contact from dialog
 */
function deleteContactFromDialog() {
  deleteCurrentContact();
  closeEditContactDialog();
}

/**
 * Delete current contact
 */
async function deleteCurrentContact() {
  const contact = window.getCurrentContact();
  if (!contact || !contact.id) {
    alert("No contact selected!");
    return;
  }

  if (!confirm(`Do you really want to delete ${contact.name}?`)) {
    return;
  }

  try {
    if (!window.remove || !window.ref || !window.firebaseDb) {
      alert("Firebase is not ready yet. Please try again.");
      return;
    }

    const contactRef = window.ref(window.firebaseDb, `contacts/${contact.id}`);
    await window.remove(contactRef);
  } catch (error) {
    console.error("Error deleting contact:", error);
    console.error("Error details:", error.code, error.message);
    alert("Error deleting contact: " + (error.message || "Unknown error"));
  }
}

/**
 * Select newly added contact
 */
function selectNewlyAddedContact(id, name, email, phone) {
  const contact = { id, name, email, phone };
  const isMobile = window.innerWidth <= 1023;

  if (isMobile) {
    window.showMobileContactDetail(contact);
  } else {
    const contactItems = document.querySelectorAll(".contact-item");
    let targetItem = null;

    contactItems.forEach((item) => {
      const nameEl = item.querySelector(".user-name");
      if (nameEl && nameEl.textContent === name) {
        targetItem = item;
      }
    });

    if (targetItem) {
      targetItem.click();
    }
  }
}

/**
 * Show success message
 */
function showSuccessMessage(message) {
  const infoArea = document.querySelector(".info-contact-area");
  if (!infoArea) return;

  const originalContent = infoArea.innerHTML;

  infoArea.innerHTML = `
    <div class="success-message-wrapper">
      <div class="contact-success-message">
        ${message}
      </div>
    </div>
  `;

  setTimeout(() => {
    infoArea.innerHTML = originalContent;
  }, 2000);
}

/**
 * Show validation error for input field
 */
function showValidationError(inputId, errorId, message) {
  const input = document.getElementById(inputId);
  const error = document.getElementById(errorId);

  if (input) {
    input.classList.add("input-error");
    input.classList.remove("input-success");
  }

  if (error) {
    error.textContent = message;
    error.style.display = "block";
  }
}

/**
 * Clear all validation errors
 */
function clearValidationErrors(formType) {
  if (formType === "add") {
    clearFieldError("newContactName", "errorContactName");
    clearFieldError("newContactEmail", "errorContactEmail");
    clearFieldError("newContactPhone", "errorContactPhone");
  } else if (formType === "edit") {
    clearFieldError("editContactName", "errorEditName");
    clearFieldError("editContactEmail", "errorEditEmail");
    clearFieldError("editContactPhone", "errorEditPhone");
  }
}

/**
 * Clear error for single field
 */
function clearFieldError(inputId, errorId) {
  const input = document.getElementById(inputId);
  const error = document.getElementById(errorId);

  if (input) {
    input.classList.remove("input-error");
    input.classList.remove("input-success");
  }

  if (error) {
    error.textContent = "";
    error.style.display = "none";
  }
}

// Form submit handlers
document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("addContactForm");
  if (form) {
    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      clearValidationErrors("add");

      const name = document.getElementById("newContactName").value.trim();
      const email = document.getElementById("newContactEmail").value.trim();
      const phone = document.getElementById("newContactPhone").value.trim();

      let hasError = false;

      if (!name) {
        showValidationError(
          "newContactName",
          "errorContactName",
          "Please enter a name"
        );
        hasError = true;
      } else {
        // Check if name contains only letters, spaces, hyphens, and apostrophes
        const namePattern = /^[a-zA-Z\u00C0-\u024F\u1E00-\u1EFF\s'\-\.]+$/;
        if (!namePattern.test(name)) {
          showValidationError(
            "newContactName",
            "errorContactName",
            "Name can only contain letters, spaces, hyphens, and apostrophes"
          );
          hasError = true;
        }
      }

      if (!email) {
        showValidationError(
          "newContactEmail",
          "errorContactEmail",
          "Please enter an email address"
        );
        hasError = true;
      } else {
        const emailPattern =
          /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
        if (!emailPattern.test(email)) {
          showValidationError(
            "newContactEmail",
            "errorContactEmail",
            "Please enter a valid email (e.g. name@domain.com)"
          );
          hasError = true;
        }
      }

      if (!phone) {
        showValidationError(
          "newContactPhone",
          "errorContactPhone",
          "Please enter a phone number"
        );
        hasError = true;
      } else {
        // Check if phone contains only allowed characters (digits, +, -, (, ), space)
        const phonePattern = /^[0-9+\-\(\)\s]+$/;
        if (!phonePattern.test(phone)) {
          showValidationError(
            "newContactPhone",
            "errorContactPhone",
            "Phone number can only contain digits and +, -, (, ), space"
          );
          hasError = true;
        } else {
          const phoneDigits = phone.replace(/[^0-9]/g, "");
          if (phoneDigits.length < 6) {
            showValidationError(
              "newContactPhone",
              "errorContactPhone",
              "Phone number must have at least 6 digits"
            );
            hasError = true;
          }
        }
      }

      if (hasError) return;

      const emailExists = await window.checkEmailExists(email);
      if (emailExists) {
        showValidationError(
          "newContactEmail",
          "errorContactEmail",
          "This email address is already registered"
        );
        return;
      }

      try {
        const newContactRef = await window.push(
          window.ref(window.firebaseDb, "contacts"),
          { name, email, phone }
        );

        closeAddContactDialog();
        window.showToast("Contact successfully created");

        setTimeout(() => {
          selectNewlyAddedContact(newContactRef.key, name, email, phone);
        }, 500);
      } catch (error) {
        console.error("Error adding contact:", error);
        alert("Error adding contact. Please try again.");
      }
    });
  }

  const editForm = document.getElementById("editContactForm");
  if (editForm) {
    editForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      clearValidationErrors("edit");

      const contact = window.getCurrentContact();
      if (!contact || !contact.id) {
        return;
      }

      const name = document.getElementById("editContactName").value.trim();
      const email = document.getElementById("editContactEmail").value.trim();
      const phone = document.getElementById("editContactPhone").value.trim();

      let hasError = false;

      if (!name) {
        showValidationError(
          "editContactName",
          "errorEditName",
          "Please enter a name"
        );
        hasError = true;
      } else {
        // Check if name contains only letters, spaces, hyphens, and apostrophes
        const namePattern = /^[a-zA-Z\u00C0-\u024F\u1E00-\u1EFF\s'\-\.]+$/;
        if (!namePattern.test(name)) {
          showValidationError(
            "editContactName",
            "errorEditName",
            "Name can only contain letters, spaces, hyphens, and apostrophes"
          );
          hasError = true;
        }
      }

      if (!email) {
        showValidationError(
          "editContactEmail",
          "errorEditEmail",
          "Please enter an email address"
        );
        hasError = true;
      } else {
        const emailPattern =
          /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
        if (!emailPattern.test(email)) {
          showValidationError(
            "editContactEmail",
            "errorEditEmail",
            "Please enter a valid email (e.g. name@domain.com)"
          );
          hasError = true;
        }
      }

      if (!phone) {
        showValidationError(
          "editContactPhone",
          "errorEditPhone",
          "Please enter a phone number"
        );
        hasError = true;
      } else {
        // Check if phone contains only allowed characters (digits, +, -, (, ), space)
        const phonePattern = /^[0-9+\-\(\)\s]+$/;
        if (!phonePattern.test(phone)) {
          showValidationError(
            "editContactPhone",
            "errorEditPhone",
            "Phone number can only contain digits and +, -, (, ), space"
          );
          hasError = true;
        } else {
          const phoneDigits = phone.replace(/[^0-9]/g, "");
          if (phoneDigits.length < 6) {
            showValidationError(
              "editContactPhone",
              "errorEditPhone",
              "Phone number must have at least 6 digits"
            );
            hasError = true;
          }
        }
      }

      if (hasError) return;

      try {
        if (!window.set || !window.ref || !window.firebaseDb) {
          alert("Firebase is not ready yet. Please try again.");
          return;
        }

        const contactRef = window.ref(
          window.firebaseDb,
          `contacts/${contact.id}`
        );

        await window.set(contactRef, { name, email, phone });
        closeEditContactDialog();
      } catch (error) {
        console.error("Error updating contact:", error);
        console.error("Error details:", error.code, error.message);
        alert("Error updating contact: " + (error.message || "Unknown error"));
      }
    });
  }
});
