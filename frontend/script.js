// Placeholder for future interactivity
console.log("Video Game Bulletin loaded");

document.addEventListener("DOMContentLoaded", () => {
  const role = localStorage.getItem("vgbRole") || "guest"; // Default role

  // Buttons
  const loginBtn = document.querySelector(".login");
  const signupBtn = document.querySelector(".signup");
  const logoutBtn = document.querySelector(".logout");

  /* =========================
     Login & Signup Simulation
     ========================= */
  if (loginBtn) {
    loginBtn.addEventListener("click", () => {
      // For demo, ask which role to simulate
      const choice = prompt("Log in as:\n1. Registered User\n2. Admin", "1");

      if (choice === "2") {
        localStorage.setItem("vgbRole", "admin");
        alert("Logged in as Admin.");
        redirectPage("admin");
      } else {
        localStorage.setItem("vgbRole", "user");
        alert("Logged in as User.");
        redirectPage("user");
      }
    });
  }

  if (signupBtn) {
    signupBtn.addEventListener("click", () => {
      localStorage.setItem("vgbRole", "user");
      alert("Account created! Logged in as User.");
      redirectPage("user");
    });
  }

  /* =========================
     Logout
     ========================= */
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.setItem("vgbRole", "guest");
      alert("You have logged out.");
      redirectPage("guest");
    });
  }

  /* =========================
     Role-Based Redirect Logic
     ========================= */
  const currentFile = window.location.pathname.split("/").pop();

  function redirectPage(role) {
    if (currentFile.includes("index") || currentFile === "") {
      window.location.href = role === "admin"
        ? "admin_index.html"
        : role === "user"
        ? "user_index.html"
        : "index.html";
    } else if (currentFile.includes("calendar")) {
      window.location.href = role === "admin"
        ? "admin_calendar.html"
        : role === "user"
        ? "user_calendar.html"
        : "calendar.html";
    } else if (currentFile.includes("reviews")) {
      window.location.href = role === "admin"
        ? "admin_reviews.html"
        : role === "user"
        ? "user_reviews.html"
        : "reviews.html";
    } else {
      window.location.href = "index.html";
    }
  }

  /* =========================
     Auto-Redirect Protection
     ========================= */
  // Prevent unauthorized access
  if (role === "guest" && (currentFile.startsWith("user_") || currentFile.startsWith("admin_"))) {
    alert("Access denied. Please log in first.");
    window.location.href = "index.html";
  } else if (role === "user" && currentFile.startsWith("admin_")) {
    alert("Admins only.");
    window.location.href = "user_index.html";
  }
});