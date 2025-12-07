// Ultra-robuste Version – funktioniert immer

function showInitials() {
  const span = document.getElementById("userInitials");
  if (!span) {
    // Falls DOM noch nicht bereit → nochmal in 100ms versuchen
    setTimeout(showInitials, 100);
    return;
  }

  let initials = "G"; // Standard = Gast

  try {
    const data = localStorage.getItem("loggedInUser");
    if (data) {
      const user = JSON.parse(data);

      if (
        user.isGuest ||
        user.name === null ||
        user.name === "" ||
        user.name.trim() === ""
      ) {
        initials = "G";
      } else {
        const parts = user.name.trim().split(/\s+/);
        if (parts.length >= 2) {
          initials = (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        } else if (parts.length === 1 && parts[0].length >= 1) {
          initials = parts[0].substring(0, 2).toUpperCase();
        }
      }
    }
  } catch (e) {
    console.log("localStorage error, showing G");
  }

  span.textContent = initials;
}

// 3-mal versuchen (für den Fall, dass Header per JS nachgeladen wird)
showInitials();
setTimeout(showInitials, 200);
setTimeout(showInitials, 500);
setTimeout(showInitials, 1000);
