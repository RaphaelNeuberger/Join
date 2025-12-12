const AVATAR_COLORS = [
  "rgb(110, 82, 255)",
  "rgb(253, 112, 255)",
  "rgb(70, 47, 138)",
  "rgb(255, 188, 43)",
  "rgb(30, 214, 193)",
  "rgb(255, 123, 0)",
];

function getInitials(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => (part[0] || "").toUpperCase())
    .join("");
}

function getAvatarColor(name = "", index = 0) {
  if (!AVATAR_COLORS.length) {
    return "#ff7a00";
  }

  const nameStr = String(name || "");
  const hash = nameStr
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);

  const colorIndex = (hash + index) % AVATAR_COLORS.length;
  return AVATAR_COLORS[colorIndex];
}

function getInitialsFromName(name) {
  var parts = String(name).trim().split(" ");
  if (!parts.length) return "";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (
    parts[0].charAt(0).toUpperCase() +
    parts[parts.length - 1].charAt(0).toUpperCase()
  );
}

function formatDateToDDMMYY(dateStr) {
  if (!dateStr) return "-";
  const parts = String(dateStr).split("-");
  if (parts.length !== 3) return dateStr;
  const [y, m, d] = parts;
  const yy = y.slice(2);
  return `${d}/${m}/${yy}`;
}

function capitalize(str) {
  if (!str) return "";
  str = String(str);
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function normalizePriority(p) {
  const v = String(p || "Medium").toLowerCase();
  if (v.startsWith("u")) return "Urgent";
  if (v.startsWith("l")) return "Low";
  return "Medium";
}

function priorityColor(priority) {
  const p = normalizePriority(priority);
  if (p === "Urgent") return "#ff3d00";
  if (p === "Low") return "#5be84a";
  return "#ffab2b";
}
