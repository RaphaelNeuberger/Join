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
  input.addEventListener("click", () => {
    const wrapper = input.closest(".assigned-to-wrapper");
    if (dropdown.style.display === "block") {
      hideDropdown();
      if (wrapper) wrapper.classList.remove("is-open");
    } else {
      showDropdown();
      if (wrapper) wrapper.classList.add("is-open");
    }
  });

  const wrapper = input.closest(".assigned-to-wrapper");
  if (wrapper) {
    const toggleEl = wrapper.querySelector(".assigned-to-toggle");
    if (toggleEl) toggleEl.addEventListener("click", (ev) => {
      ev.stopPropagation();
      if (dropdown.style.display === "block") { hideDropdown(); wrapper.classList.remove("is-open"); }
      else { showDropdown(); wrapper.classList.add("is-open"); }
    });
  }

  input.addEventListener("input", filterContacts);
  document.addEventListener("click", (event) => { if (!input.contains(event.target) && !dropdown.contains(event.target)) hideDropdown(); });
  dropdown.addEventListener("click", (e) => e.stopPropagation());
}

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
    const wrapper = input.closest('.assigned-to-wrapper');
    if (wrapper) wrapper.classList.add('is-open');
    filterContactsScoped();
  });
  input.addEventListener("click", (e) => { e.stopPropagation();
    const wrapper = input.closest('.assigned-to-wrapper');
    if (dropdown.style.display === 'block') {
      dropdown.style.display = 'none';
      if (wrapper) wrapper.classList.remove('is-open');
      selectedContainer.style.display = 'flex';
    } else {
      dropdown.style.display = 'block';
      if (wrapper) wrapper.classList.add('is-open');
      selectedContainer.style.display = 'none';
      filterContactsScoped();
    }
  });
  try {
    const wrapperScoped = input.closest('.assigned-to-wrapper');
    if (wrapperScoped) {
      const toggleEl = wrapperScoped.querySelector('.assigned-to-toggle');
      if (toggleEl) {
        toggleEl.addEventListener('click', (ev) => {
          ev.stopPropagation();
          const wrapper2 = input.closest('.assigned-to-wrapper');
          if (dropdown.style.display === 'block') {
            dropdown.style.display = 'none';
            if (wrapper2) wrapper2.classList.remove('is-open');
            selectedContainer.style.display = 'flex';
          } else {
            dropdown.style.display = 'block';
            if (wrapper2) wrapper2.classList.add('is-open');
            selectedContainer.style.display = 'none';
            filterContactsScoped();
          }
        });
      }
    }
  } catch (e) {
  }
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

function showDropdown() {
  const dropdown = document.getElementById("assignedToDropdown");
  const selectedContainer = document.getElementById("assignedToSelected");
  if (!dropdown) return;
  dropdown.style.display = "block";
  if (selectedContainer) selectedContainer.style.display = "none";
  const input = document.getElementById('assignedToInput');
  if (input) {
    const wrapper = input.closest('.assigned-to-wrapper');
    if (wrapper) wrapper.classList.add('is-open');
  }
  filterContacts();
}

function hideDropdown() {
  const dropdown = document.getElementById("assignedToDropdown");
  const selectedContainer = document.getElementById("assignedToSelected");
  if (!dropdown) return;
  dropdown.style.display = "none";
  
  if (selectedContainer) {
    if (selectedAssignees.length > 0) {
      selectedContainer.style.display = "flex";
    } else {
      selectedContainer.style.display = "none";
    }
  }
  
  const input = document.getElementById('assignedToInput');
  if (input) {
    const wrapper = input.closest('.assigned-to-wrapper');
    if (wrapper) wrapper.classList.remove('is-open');
  }
}

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

function filterContacts() {
  const input = document.getElementById("assignedToInput");
  const query = input.value.trim().toLowerCase();
  const filtered = contacts.filter((c) => c.name.toLowerCase().includes(query));
  renderContactOptions(filtered);
}

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

function renderSelectedBadges() {
  const selectedContainer = document.getElementById("assignedToSelected");
  selectedContainer.innerHTML = "";

  if (selectedAssignees.length === 0) {
    selectedContainer.style.display = "none";
    return;
  }

  selectedContainer.style.display = "flex";

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

function resetAssignedTo() {
  selectedAssignees = [];
  renderSelectedBadges();
}
