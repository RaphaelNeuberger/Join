const contacts = [
  { id: "sm", name: "Sofia Müller", avatarClass: "avatar-sm", initials: "SM" },
  { id: "am", name: "Anton Mayer", avatarClass: "avatar-am", initials: "AM" },
  { id: "as", name: "Anja Schulz", avatarClass: "avatar-as", initials: "AS" },
  { id: "bz", name: "Benedikt Ziegler", avatarClass: "avatar-bz", initials: "BZ" },
  { id: "de", name: "David Eisenberg", avatarClass: "avatar-de", initials: "DE" },
];

let selectedAssignees = [];

function initAssignedTo() {
  const input = document.getElementById("assignedToInput");
  const dropdown = document.getElementById("assignedToDropdown");
  const list = document.getElementById("assignedToList");
  const selectedContainer = document.getElementById("assignedToSelected");
  if (!input || !dropdown || !list || !selectedContainer) return;
  renderContactOptions();
  attachAssignedToHandlers(input, dropdown, list, selectedContainer);
}

function attachAssignedToHandlers(input, dropdown, list, selectedContainer) {
  input.addEventListener("focus", showDropdown);
  input.addEventListener("click", () => handleInputClick(input, dropdown));
  attachToggleHandler(input, dropdown);
  input.addEventListener("input", filterContacts);
  document.addEventListener("click", (e) => { if (!input.contains(e.target) && !dropdown.contains(e.target)) hideDropdown(); });
  dropdown.addEventListener("click", (e) => e.stopPropagation());
}

function handleInputClick(input, dropdown) {
  const wrapper = input.closest(".assigned-to-wrapper");
  if (dropdown.style.display === "block") { hideDropdown(); if (wrapper) wrapper.classList.remove("is-open"); }
  else { showDropdown(); if (wrapper) wrapper.classList.add("is-open"); }
}

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

let scopedElements = {};

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

function attachScopedListeners() {
  const { input, dropdown, selectedContainer } = scopedElements;
  input.addEventListener("click", (e) => { e.stopPropagation(); toggleScopedDropdown(); });
  attachScopedToggle();
  input.addEventListener("input", filterContactsScoped);
  document.addEventListener("click", (e) => { if (!input.contains(e.target) && !dropdown.contains(e.target)) closeScopedDropdown(); });
  dropdown.addEventListener("click", (e) => e.stopPropagation());
}

function attachScopedToggle() {
  const { input, dropdown } = scopedElements;
  const wrapper = input.closest('.assigned-to-wrapper');
  if (!wrapper) return;
  const toggleEl = wrapper.querySelector('.assigned-to-toggle');
  if (toggleEl) toggleEl.addEventListener('click', (ev) => { ev.stopPropagation(); toggleScopedDropdown(); });
}

function openScopedDropdown() {
  const { input, dropdown, selectedContainer } = scopedElements;
  dropdown.style.display = "block";
  selectedContainer.style.display = "none";
  const wrapper = input.closest('.assigned-to-wrapper');
  if (wrapper) wrapper.classList.add('is-open');
  filterContactsScoped();
}

function closeScopedDropdown() {
  const { input, dropdown, selectedContainer } = scopedElements;
  dropdown.style.display = "none";
  selectedContainer.style.display = "flex";
  const wrapper = input.closest('.assigned-to-wrapper');
  if (wrapper) wrapper.classList.remove('is-open');
}

function toggleScopedDropdown() {
  const { dropdown } = scopedElements;
  if (dropdown.style.display === 'block') closeScopedDropdown();
  else openScopedDropdown();
}

function renderContactOptionsScoped(filteredContacts = contacts) {
  const { list } = scopedElements;
  list.innerHTML = "";
  filteredContacts.forEach((contact) => {
    const li = createContactLiScoped(contact);
    list.appendChild(li);
  });
}

function createContactLiScoped(contact) {
  const isSelected = selectedAssignees.includes(contact.id);
  const li = document.createElement("li");
  li.classList.toggle("selected", isSelected);
  li.innerHTML = `<div class="contact-info"><div class="avatar ${contact.avatarClass}">${contact.initials}</div><span class="contact-name">${escapeHtml(contact.name)}</span></div><div class="checkmark-box ${isSelected ? "checked" : ""}"></div>`;
  li.addEventListener("click", (e) => { e.preventDefault(); toggleAssigneeScoped(contact.id, li); });
  return li;
}

function filterContactsScoped() {
  const { input } = scopedElements;
  const query = input.value.trim().toLowerCase();
  const filtered = contacts.filter((c) => c.name.toLowerCase().includes(query));
  renderContactOptionsScoped(filtered);
}

function toggleAssigneeScoped(id, listItemElement = null) {
  const wasSelected = selectedAssignees.includes(id);
  if (wasSelected) selectedAssignees = selectedAssignees.filter((x) => x !== id);
  else selectedAssignees.push(id);
  if (listItemElement) updateListItemScoped(listItemElement, !wasSelected);
  filterContactsScoped();
  renderSelectedBadgesScoped();
}

function updateListItemScoped(li, isNowSelected) {
  li.classList.toggle("selected", isNowSelected);
  const box = li.querySelector(".checkmark-box");
  if (box) box.classList.toggle("checked", isNowSelected);
}

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

function showDropdown() {
  const dropdown = document.getElementById("assignedToDropdown");
  const selectedContainer = document.getElementById("assignedToSelected");
  if (!dropdown) return;
  dropdown.style.display = "block";
  if (selectedContainer) selectedContainer.style.display = "none";
  setWrapperOpen(true);
  filterContacts();
}

function hideDropdown() {
  const dropdown = document.getElementById("assignedToDropdown");
  const selectedContainer = document.getElementById("assignedToSelected");
  if (!dropdown) return;
  dropdown.style.display = "none";
  if (selectedContainer) selectedContainer.style.display = selectedAssignees.length > 0 ? "flex" : "none";
  setWrapperOpen(false);
}

function setWrapperOpen(open) {
  const input = document.getElementById('assignedToInput');
  if (!input) return;
  const wrapper = input.closest('.assigned-to-wrapper');
  if (wrapper) wrapper.classList.toggle('is-open', open);
}

function renderContactOptions(filteredContacts = contacts) {
  const list = document.getElementById("assignedToList");
  list.innerHTML = "";
  filteredContacts.forEach((contact) => list.appendChild(createContactLi(contact)));
}

function createContactLi(contact) {
  const isSelected = selectedAssignees.includes(contact.id);
  const li = document.createElement("li");
  li.classList.toggle("selected", isSelected);
  li.innerHTML = `<div class="contact-info"><div class="avatar ${contact.avatarClass}">${contact.initials}</div><span class="contact-name">${escapeHtml(contact.name)}</span></div><div class="checkmark-box ${isSelected ? "checked" : ""}"></div>`;
  li.addEventListener("click", (e) => { e.preventDefault(); toggleAssignee(contact.id, li); });
  return li;
}

function filterContacts() {
  const input = document.getElementById("assignedToInput");
  const query = input.value.trim().toLowerCase();
  const filtered = contacts.filter((c) => c.name.toLowerCase().includes(query));
  renderContactOptions(filtered);
}

function toggleAssignee(id, listItemElement = null) {
  const wasSelected = selectedAssignees.includes(id);
  if (wasSelected) selectedAssignees = selectedAssignees.filter((x) => x !== id);
  else selectedAssignees.push(id);
  if (listItemElement) updateListItem(listItemElement, !wasSelected);
  filterContacts();
  renderSelectedBadges();
}

function updateListItem(li, isNowSelected) {
  li.classList.toggle("selected", isNowSelected);
  const box = li.querySelector(".checkmark-box");
  if (box) box.classList.toggle("checked", isNowSelected);
}

function renderSelectedBadges() {
  const selectedContainer = document.getElementById("assignedToSelected");
  const dropdown = document.getElementById("assignedToDropdown");
  selectedContainer.innerHTML = "";
  if (selectedAssignees.length === 0) { selectedContainer.style.display = "none"; return; }
  const isDropdownOpen = dropdown && dropdown.style.display === "block";
  selectedContainer.style.display = isDropdownOpen ? "none" : "flex";
  selectedAssignees.forEach((id) => appendBadge(selectedContainer, id));
}

function appendBadge(container, id) {
  const contact = contacts.find((c) => c.id === id);
  if (!contact) return;
  const badge = document.createElement("div");
  badge.className = "assigned-to-badge avatar-only";
  badge.innerHTML = `<div class="avatar ${contact.avatarClass}">${contact.initials}</div>`;
  container.appendChild(badge);
}

function getAssignedTo() {
  return selectedAssignees.map((id) => {
    const contact = contacts.find((c) => c.id === id);
    return contact ? { name: contact.name, id: contact.id, avatarClass: contact.avatarClass, initials: contact.initials } : null;
  }).filter(Boolean);
}

function resetAssignedTo() {
  selectedAssignees = [];
  renderSelectedBadges();
}
