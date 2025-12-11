function isGuestUser(user) {
  return user.isGuest || !user.name || user.name.trim() === "";
}

function calculateInitials(name) {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  if (parts.length === 1 && parts[0].length >= 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return "G";
}

function getUserInitials() {
  try {
    const data = localStorage.getItem("loggedInUser");
    if (!data) return "G";
    const user = JSON.parse(data);
    if (isGuestUser(user)) return "G";
    return calculateInitials(user.name);
  } catch (e) {
    return "G";
  }
}

function showInitials() {
  const span = document.getElementById("userInitials");
  if (!span) {
    setTimeout(showInitials, 100);
    return;
  }
  span.textContent = getUserInitials();
}

showInitials();
setTimeout(showInitials, 200);
setTimeout(showInitials, 500);
setTimeout(showInitials, 1000);
