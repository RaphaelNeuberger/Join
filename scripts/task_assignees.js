/**
 * @fileoverview Task assignee selection and management
 * @module task_assignees
 */

/**
 * Default contact list for task assignment
 * @type {Array<{id: string, name: string, avatarClass: string, initials: string}>}
 */
const contacts = [
  { id: "sm", name: "Sofia Müller", avatarClass: "avatar-sm", initials: "SM" },
  { id: "am", name: "Anton Mayer", avatarClass: "avatar-am", initials: "AM" },
  { id: "as", name: "Anja Schulz", avatarClass: "avatar-as", initials: "AS" },
  { id: "bz", name: "Benedikt Ziegler", avatarClass: "avatar-bz", initials: "BZ" },
  { id: "de", name: "David Eisenberg", avatarClass: "avatar-de", initials: "DE" },
];

/**
 * Currently selected assignee IDs
 * @type {Array<string>}
 */
let selectedAssignees = [];

/**
 * Initializes the assigned-to dropdown component
 */
function initAssignedTo() {
  const input = document.getElementById("assignedToInput");
  const dropdown = document.getElementById("assignedToDropdown");
  const list = document.getElementById("assignedToList");
  const selectedContainer = document.getElementById("assignedToSelected");
  if (!input || !dropdown || !list || !selectedContainer) return;
  renderContactOptions();
  attachAssignedToHandlers(input, dropdown, list, selectedContainer);
}

/**
 * Attaches event handlers to assigned-to input and dropdown
 * @param {HTMLElement} input - The input element
 * @param {HTMLElement} dropdown - The dropdown container
 * @param {HTMLElement} list - The contact list element
 * @param {HTMLElement} selectedContainer - The selected badges container
 */
function attachAssignedToHandlers(input, dropdown, list, selectedContainer) {
  input.addEventListener("focus", showDropdown);
  input.addEventListener("click", () => handleInputClick(input, dropdown));
  attachToggleHandler(input, dropdown);
  input.addEventListener("input", filterContacts);
  document.addEventListener("click", (e) => { if (!input.contains(e.target) && !dropdown.contains(e.target)) hideDropdown(); });
  dropdown.addEventListener("click", (e) => e.stopPropagation());
}

/**
 * Handles input click to toggle dropdown visibility
 * @param {HTMLElement} input - The input element
 * @param {HTMLElement} dropdown - The dropdown container
 */
function handleInputClick(input, dropdown) {
  const wrapper = input.closest(".assigned-to-wrapper");
  if (dropdown.style.display === "block") { hideDropdown(); if (wrapper) wrapper.classList.remove("is-open"); }
  else { showDropdown(); if (wrapper) wrapper.classList.add("is-open"); }
}

/**
 * Attaches toggle button handler for dropdown
 * @param {HTMLElement} input - The input element
 * @param {HTMLElement} dropdown - The dropdown container
 */
function attachToggleHandler(input, dropdown) {
  const wrapper = input.closest(".assigned-to-wrapper");
  if (!wrapper) return;
  const toggleEl = wrapper.querySelector(".assigned-to-toggle");
  if (!toggleEl) return;
  toggleEl.addEventListener("click", (ev) => {
    ev.stopPropagation();
    if (dropdown.style.display === "block") { hideDropdown(); wrapper.classList.remove("is-open"); }
    else { showDropdown(); wrapper.classList.add("is-open"); }
  });
}

/**
 * Scoped elements for overlay assignee dropdown
 * @type {Object}
 */
let scopedElements = {};

/**
 * Initializes assignee dropdown within a scoped root element
 * @param {HTMLElement} root - The root element containing the dropdown
 */
function initAssignedToScoped(root) {
  if (!root || !(root instanceof HTMLElement)) return;
  const input = root.querySelector('.assigned-to-input') || root.querySelector('#assignedToInput');
  const dropdown = root.querySelector('.assigned-to-dropdown') || root.querySelector('#assignedToDropdown');
  const list = root.querySelector('#assignedToList') || root.querySelector('.assigned-to-dropdown ul');
  const selectedContainer = root.querySelector('.assigned-to-selected') || root.querySelector('#assignedToSelected');
  if (!input || !dropdown || !list || !selectedContainer) return;
  scopedElements = { input, dropdown, list, selectedContainer };
  attachScopedListeners();
  renderContactOptionsScoped();
  renderSelectedBadgesScoped();
}

/**
 * Attaches event listeners for scoped dropdown
 */
function attachScopedListeners() {
  const { input, dropdown, selectedContainer } = scopedElements;
  input.addEventListener("click", (e) => { e.stopPropagation(); toggleScopedDropdown(); });
  attachScopedToggle();
  input.addEventListener("input", filterContactsScoped);
  document.addEventListener("click", (e) => { if (!input.contains(e.target) && !dropdown.contains(e.target)) closeScopedDropdown(); });
  dropdown.addEventListener("click", (e) => e.stopPropagation());
}

/**
 * Attaches toggle button handler for scoped dropdown
 */
function attachScopedToggle() {
  const { input, dropdown } = scopedElements;
  const wrapper = input.closest('.assigned-to-wrapper');
  if (!wrapper) return;
  const toggleEl = wrapper.querySelector('.assigned-to-toggle');
  if (toggleEl) toggleEl.addEventListener('click', (ev) => { ev.stopPropagation(); toggleScopedDropdown(); });
}

/**
 * Opens the scoped dropdown
 */
function openScopedDropdown() {
  const { input, dropdown, selectedContainer } = scopedElements;
  dropdown.style.display = "block";
  selectedContainer.style.display = "none";
  const wrapper = input.closest('.assigned-to-wrapper');
  if (wrapper) wrapper.classList.add('is-open');
  filterContactsScoped();
}

/**
 * Closes the scoped dropdown
 */
function closeScopedDropdown() {
  const { input, dropdown, selectedContainer } = scopedElements;
  dropdown.style.display = "none";
  selectedContainer.style.display = "flex";
  const wrapper = input.closest('.assigned-to-wrapper');
  if (wrapper) wrapper.classList.remove('is-open');
}

/**
 * Toggles the scoped dropdown visibility
 */
function toggleScopedDropdown() {
  const { dropdown } = scopedElements;
  if (dropdown.style.display === 'block') closeScopedDropdown();
  else openScopedDropdown();
}

/**
 * Renders contact options in scoped dropdown
 * @param {Array} [filteredContacts=contacts] - Filtered contacts to render
 */
function renderContactOptionsScoped(filteredContacts = contacts) {
  const { list } = scopedElements;
  list.innerHTML = "";
  filteredContacts.forEach((contact) => {
    const li = createContactLiScoped(contact);
    list.appendChild(li);
  });
}

/**
 * Creates a contact list item for scoped dropdown
 * @param {Object} contact - Contact object
 * @returns {HTMLElement} The list item element
 */
function createContactLiScoped(contact) {
  const isSelected = selectedAssignees.includes(contact.id);
  const li = document.createElement("li");
  li.classList.toggle("selected", isSelected);
  li.innerHTML = `<div class="contact-info"><div class="avatar ${contact.avatarClass}">${contact.initials}</div><span class="contact-name">${escapeHtml(contact.name)}</span></div><div class="checkmark-box ${isSelected ? "checked" : ""}"></div>`;
  li.addEventListener("click", (e) => { e.preventDefault(); toggleAssigneeScoped(contact.id, li); });
  return li;
}

/**
 * Filters contacts in scoped dropdown by search query
 */
function filterContactsScoped() {
  const { input } = scopedElements;
  const query = input.value.trim().toLowerCase();
  const filtered = contacts.filter((c) => c.name.toLowerCase().includes(query));
  renderContactOptionsScoped(filtered);
}

/**
 * Toggles assignee selection in scoped dropdown
 * @param {string} id - Contact ID
 * @param {HTMLElement|null} [listItemElement=null] - The list item element
 */
function toggleAssigneeScoped(id, listItemElement = null) {
  const wasSelected = selectedAssignees.includes(id);
  if (wasSelected) selectedAssignees = selectedAssignees.filter((x) => x !== id);
  else selectedAssignees.push(id);
  if (listItemElement) updateListItemScoped(listItemElement, !wasSelected);
  filterContactsScoped();
  renderSelectedBadgesScoped();
}

/**
 * Updates list item visual state in scoped dropdown
 * @param {HTMLElement} li - The list item element
 * @param {boolean} isNowSelected - Whether item is now selected
 */
function updateListItemScoped(li, isNowSelected) {
  li.classList.toggle("selected", isNowSelected);
  const box = li.querySelector(".checkmark-box");
  if (box) box.classList.toggle("checked", isNowSelected);
}

/**
 * Renders selected assignee badges in scoped container
 */
function renderSelectedBadgesScoped() {
  const { selectedContainer } = scopedElements;
  selectedContainer.innerHTML = "";
  selectedAssignees.forEach((id) => {
    const contact = contacts.find((c) => c.id === id);
    if (!contact) return;
    const badge = document.createElement("div");
    badge.className = "assigned-to-badge avatar-only";
    badge.innerHTML = `<div class="avatar ${contact.avatarClass}">${contact.initials}</div>`;
    selectedContainer.appendChild(badge);
  });
}

/**
 * Shows the assignee dropdown
 */
function showDropdown() {
  const dropdown = document.getElementById("assignedToDropdown");
  const selectedContainer = document.getElementById("assignedToSelected");
  if (!dropdown) return;
  dropdown.style.display = "block";
  if (selectedContainer) selectedContainer.style.display = "none";
  setWrapperOpen(true);
  filterContacts();
}

/**
 * Hides the assignee dropdown
 */
function hideDropdown() {
  const dropdown = document.getElementById("assignedToDropdown");
  const selectedContainer = document.getElementById("assignedToSelected");
  if (!dropdown) return;
  dropdown.style.display = "none";
  if (selectedContainer) selectedContainer.style.display = selectedAssignees.length > 0 ? "flex" : "none";
  setWrapperOpen(false);
}

/**
 * Sets the wrapper open state class
 * @param {boolean} open - Whether wrapper is open
 */
function setWrapperOpen(open) {
  const input = document.getElementById('assignedToInput');
  if (!input) return;
  const wrapper = input.closest('.assigned-to-wrapper');
  if (wrapper) wrapper.classList.toggle('is-open', open);
}

/**
 * Renders contact options in the dropdown list
 * @param {Array} [filteredContacts=contacts] - Contacts to render
 */
function renderContactOptions(filteredContacts = contacts) {
  const list = document.getElementById("assignedToList");
  list.innerHTML = "";
  filteredContacts.forEach((contact) => list.appendChild(createContactLi(contact)));
}

/**
 * Creates a contact list item element
 * @param {Object} contact - Contact object
 * @returns {HTMLElement} The list item element
 */
function createContactLi(contact) {
  const isSelected = selectedAssignees.includes(contact.id);
  const li = document.createElement("li");
  li.classList.toggle("selected", isSelected);
  li.innerHTML = `<div class="contact-info"><div class="avatar ${contact.avatarClass}">${contact.initials}</div><span class="contact-name">${escapeHtml(contact.name)}</span></div><div class="checkmark-box ${isSelected ? "checked" : ""}"></div>`;
  li.addEventListener("click", (e) => { e.preventDefault(); toggleAssignee(contact.id, li); });
  return li;
}

/**
 * Filters contacts by search query
 */
function filterContacts() {
  const input = document.getElementById("assignedToInput");
  const query = input.value.trim().toLowerCase();
  const filtered = contacts.filter((c) => c.name.toLowerCase().includes(query));
  renderContactOptions(filtered);
}

/**
 * Toggles an assignee selection
 * @param {string} id - Contact ID
 * @param {HTMLElement|null} [listItemElement=null] - The list item element
 */
function toggleAssignee(id, listItemElement = null) {
  const wasSelected = selectedAssignees.includes(id);
  if (wasSelected) selectedAssignees = selectedAssignees.filter((x) => x !== id);
  else selectedAssignees.push(id);
  if (listItemElement) updateListItem(listItemElement, !wasSelected);
  filterContacts();
  renderSelectedBadges();
}

/**
 * Updates list item visual state
 * @param {HTMLElement} li - The list item element
 * @param {boolean} isNowSelected - Whether item is now selected
 */
function updateListItem(li, isNowSelected) {
  li.classList.toggle("selected", isNowSelected);
  const box = li.querySelector(".checkmark-box");
  if (box) box.classList.toggle("checked", isNowSelected);
}

/**
 * Renders selected assignee badges
 */
function renderSelectedBadges() {
  const selectedContainer = document.getElementById("assignedToSelected");
  const dropdown = document.getElementById("assignedToDropdown");
  selectedContainer.innerHTML = "";
  if (selectedAssignees.length === 0) { selectedContainer.style.display = "none"; return; }
  const isDropdownOpen = dropdown && dropdown.style.display === "block";
  selectedContainer.style.display = isDropdownOpen ? "none" : "flex";
  selectedAssignees.forEach((id) => appendBadge(selectedContainer, id));
}

/**
 * Appends an assignee badge to a container
 * @param {HTMLElement} container - The container element
 * @param {string} id - Contact ID
 */
function appendBadge(container, id) {
  const contact = contacts.find((c) => c.id === id);
  if (!contact) return;
  const badge = document.createElement("div");
  badge.className = "assigned-to-badge avatar-only";
  badge.innerHTML = `<div class="avatar ${contact.avatarClass}">${contact.initials}</div>`;
  container.appendChild(badge);
}

/**
 * Gets assigned contacts data for form submission
 * @returns {Array<Object>} Array of assigned contact objects
 */
function getAssignedTo() {
  return selectedAssignees.map((id) => {
    const contact = contacts.find((c) => c.id === id);
    return contact ? { name: contact.name, id: contact.id, avatarClass: contact.avatarClass, initials: contact.initials } : null;
  }).filter(Boolean);
}

/**
 * Resets assignee selection
 */
function resetAssignedTo() {
  selectedAssignees = [];
  renderSelectedBadges();
}
