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
 * Show the dropdown.
 */
function showDropdown() {
  const dropdown = document.getElementById("assignedToDropdown");
  dropdown.style.display = "block";
  filterContacts();
}

/**
 * Hide the dropdown.
 */
function hideDropdown() {
  const dropdown = document.getElementById("assignedToDropdown");
  dropdown.style.display = "none";
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
    badge.className = "assigned-to-badge";
    badge.innerHTML = `
      <div class="avatar ${contact.avatarClass}">${contact.initials}</div>
      <span>${escapeHtml(contact.name)}</span>
      <span class="remove" onclick="toggleAssignee('${id}')">X</span>
    `;
    selectedContainer.appendChild(badge);
  });
}

/**
 * Get assigned-to as array of names.
 */
function getAssignedTo() {
  return selectedAssignees.map((id) => {
    const contact = contacts.find((c) => c.id === id);
    return contact ? contact.name : "";
  });
}

/**
 * Reset assigned-to selection.
 */
function resetAssignedTo() {
  selectedAssignees = [];
  renderSelectedBadges();
}
