// task_assignees.js - Assigned-to dropdown handling

const contacts = [
  { id: "sm", name: "Sofia Müller", avatarClass: "avatar-sm", initials: "SM" },
  { id: "am", name: "Anton Mayer", avatarClass: "avatar-am", initials: "AM" },
  { id: "as", name: "Anja Schulz", avatarClass: "avatar-as", initials: "AS" },
  {
    id: "bz",
    name: "Benedikt Ziegler",
    avatarClass: "avatar-bz",
    initials: "BZ",
  },
  {
    id: "de",
    name: "David Eisenberg",
    avatarClass: "avatar-de",
    initials: "DE",
  },
];

let selectedAssignees = [];

/**
 * Initialize the Assigned To multi-select.
 */
function initAssignedTo() {
  const input = document.getElementById("assignedToInput");
  const dropdown = document.getElementById("assignedToDropdown");
  const list = document.getElementById("assignedToList");
  const selectedContainer = document.getElementById("assignedToSelected");

  if (!input || !dropdown || !list || !selectedContainer) return;

  renderContactOptions();

  input.addEventListener("focus", showDropdown);
  input.addEventListener("click", showDropdown);
  input.addEventListener("input", filterContacts);

  document.addEventListener("click", (event) => {
    if (!input.contains(event.target) && !dropdown.contains(event.target)) {
      hideDropdown();
    }
  });

  dropdown.addEventListener("click", (e) => e.stopPropagation());
}


/**
 * Initialize Assigned-To controls scoped to a specific container element (e.g. overlay content).
 * Uses the same global `selectedAssignees` array but renders/attaches listeners inside `root`.
 * @param {HTMLElement} root
 */
function initAssignedToScoped(root) {
  if (!root || !(root instanceof HTMLElement)) return;

  const input = root.querySelector('.assigned-to-input') || root.querySelector('#assignedToInput');
  const dropdown = root.querySelector('.assigned-to-dropdown') || root.querySelector('#assignedToDropdown');
  const list = root.querySelector('#assignedToList') || root.querySelector('.assigned-to-dropdown ul');
  const selectedContainer = root.querySelector('.assigned-to-selected') || root.querySelector('#assignedToSelected');

  if (!input || !dropdown || !list || !selectedContainer) return;

  function renderContactOptionsScoped(filteredContacts = contacts) {
    list.innerHTML = "";

    filteredContacts.forEach((contact) => {
      const isSelected = selectedAssignees.includes(contact.id);
      const li = document.createElement("li");
      li.classList.toggle("selected", isSelected);

      li.innerHTML = `
        <div class="contact-info">
          <div class="avatar ${contact.avatarClass}">${contact.initials}</div>
          <span class="contact-name">${escapeHtml(contact.name)}</span>
        </div>
        <div class="checkmark-box ${isSelected ? "checked" : ""}"></div>
      `;

      li.addEventListener("click", (e) => {
        e.preventDefault();
        toggleAssigneeScoped(contact.id, li);
      });

      list.appendChild(li);
    });
  }

  function filterContactsScoped() {
    const query = input.value.trim().toLowerCase();
    const filtered = contacts.filter((c) => c.name.toLowerCase().includes(query));
    renderContactOptionsScoped(filtered);
  }

  function toggleAssigneeScoped(id, listItemElement = null) {
    const index = selectedAssignees.indexOf(id);
    const wasSelected = index !== -1;

    if (wasSelected) {
      selectedAssignees = selectedAssignees.filter((x) => x !== id);
    } else {
      selectedAssignees.push(id);
    }

    if (listItemElement) {
      listItemElement.classList.toggle("selected", !wasSelected);
      const box = listItemElement.querySelector(".checkmark-box");
      if (box) box.classList.toggle("checked", !wasSelected);
    }

    filterContactsScoped();
    renderSelectedBadgesScoped();
  }

  function renderSelectedBadgesScoped() {
    selectedContainer.innerHTML = "";

    selectedAssignees.forEach((id) => {
      const contact = contacts.find((c) => c.id === id);
      if (!contact) return;

      const badge = document.createElement("div");
      badge.className = "assigned-to-badge avatar-only";
      badge.innerHTML = `
        <div class="avatar ${contact.avatarClass}">${contact.initials}</div>
      `;

      const removeEl = badge.querySelector('.remove');
      if (removeEl) {
        removeEl.addEventListener('click', (e) => {
          e.preventDefault();
          toggleAssigneeScoped(id);
        });
      }

      selectedContainer.appendChild(badge);
    });
  }

  input.addEventListener("focus", () => {
    dropdown.style.display = "block";
    selectedContainer.style.display = "none";
    filterContactsScoped();
  });
  input.addEventListener("click", (e) => { e.stopPropagation(); dropdown.style.display = 'block'; selectedContainer.style.display = 'none'; filterContactsScoped(); });
  input.addEventListener("input", filterContactsScoped);

  document.addEventListener("click", (event) => {
    if (!input.contains(event.target) && !dropdown.contains(event.target)) {
      dropdown.style.display = "none";
      selectedContainer.style.display = "flex";
    }
  });

  dropdown.addEventListener("click", (e) => e.stopPropagation());

  renderContactOptionsScoped();
  renderSelectedBadgesScoped();
}

/**
 * Show the dropdown.
 */
function showDropdown() {
  const dropdown = document.getElementById("assignedToDropdown");
  const selectedContainer = document.getElementById("assignedToSelected");
  dropdown.style.display = "block";
  if (selectedContainer) selectedContainer.style.display = "none";
  filterContacts();
}

/**
 * Hide the dropdown.
 */
function hideDropdown() {
  const dropdown = document.getElementById("assignedToDropdown");
  const selectedContainer = document.getElementById("assignedToSelected");
  dropdown.style.display = "none";
  if (selectedContainer) selectedContainer.style.display = "flex";
}

/**
 * Render contact options in dropdown.
 */
function renderContactOptions(filteredContacts = contacts) {
  const list = document.getElementById("assignedToList");
  list.innerHTML = "";

  filteredContacts.forEach((contact) => {
    const isSelected = selectedAssignees.includes(contact.id);
    const li = document.createElement("li");
    li.classList.toggle("selected", isSelected);

    li.innerHTML = `
      <div class="contact-info">
        <div class="avatar ${contact.avatarClass}">${contact.initials}</div>
        <span class="contact-name">${escapeHtml(contact.name)}</span>
      </div>
      <div class="checkmark-box ${isSelected ? "checked" : ""}"></div>
    `;

    li.addEventListener("click", (e) => {
      e.preventDefault();
      toggleAssignee(contact.id, li);
    });

    list.appendChild(li);
  });
}

/**
 * Filter contacts based on input value.
 */
function filterContacts() {
  const input = document.getElementById("assignedToInput");
  const query = input.value.trim().toLowerCase();
  const filtered = contacts.filter((c) => c.name.toLowerCase().includes(query));
  renderContactOptions(filtered);
}

/**
 * Toggle a contact's selection.
 */
function toggleAssignee(id, listItemElement = null) {
  const index = selectedAssignees.indexOf(id);
  const wasSelected = index !== -1;

  if (wasSelected) {
    selectedAssignees = selectedAssignees.filter((x) => x !== id);
  } else {
    selectedAssignees.push(id);
  }

  if (listItemElement) {
    listItemElement.classList.toggle("selected", !wasSelected);
    const box = listItemElement.querySelector(".checkmark-box");
    box.classList.toggle("checked", !wasSelected);
  }

  filterContacts();
  renderSelectedBadges();
}

/**
 * Render selected assignees as badges.
 */
function renderSelectedBadges() {
  const selectedContainer = document.getElementById("assignedToSelected");
  selectedContainer.innerHTML = "";

  selectedAssignees.forEach((id) => {
    const contact = contacts.find((c) => c.id === id);
    if (!contact) return;

    const badge = document.createElement("div");
    badge.className = "assigned-to-badge avatar-only";
    badge.innerHTML = `
      <div class="avatar ${contact.avatarClass}">${contact.initials}</div>
    `;
    selectedContainer.appendChild(badge);
  });
}

/**
 * Get assigned-to as array of objects with name, id, and avatarClass.
 */
function getAssignedTo() {
  return selectedAssignees.map((id) => {
    const contact = contacts.find((c) => c.id === id);
    return contact ? { 
      name: contact.name, 
      id: contact.id, 
      avatarClass: contact.avatarClass,
      initials: contact.initials
    } : null;
  }).filter(Boolean);
}

/**
 * Reset assigned-to selection.
 */
function resetAssignedTo() {
  selectedAssignees = [];
  renderSelectedBadges();
}
