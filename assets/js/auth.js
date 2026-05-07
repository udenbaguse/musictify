// ========== CLERK BACKEND AUTHENTICATION ==========

let authToken = null;

// Initialize auth - check session from localStorage or backend
async function initClerk() {
  // Check for saved session token
  const savedUser = localStorage.getItem("musictify_user");
  if (savedUser) {
    const userData = JSON.parse(savedUser);
    if (userData.isLoggedIn && userData.sessionToken) {
      authToken = userData.sessionToken;
      // Verify session with backend
      try {
        const response = await fetch(`${API_URL}/api/auth/session`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        if (response.ok) {
          const data = await response.json();
          onClerkAuthSuccess(data.user);
          return;
        }
      } catch (error) {
        console.warn("Session verification failed:", error);
      }
    }
  }

  // No valid session, fallback to local or show login
  initLocalAuth();
}

// Handle successful Clerk auth
function onClerkAuthSuccess(user) {
  if (!user) return;

  const userName = user.firstName + " " + user.lastName || user.email?.split("@")[0] || "User";
  const userEmail = user.email || "";

  if (loginPage) loginPage.classList.add("hidden");
  if (registerPage) registerPage.classList.add("hidden");
  if (mainApp) mainApp.classList.remove("hidden");

  if (userAvatar) userAvatar.textContent = userName.trim().charAt(0).toUpperCase();
  if (userNameEl) userNameEl.textContent = userName;
  if (userEmailEl) userEmailEl.textContent = userEmail;

  localStorage.setItem(
    "musictify_user",
    JSON.stringify({
      id: user.id,
      name: userName,
      email: userEmail,
      clerkUser: true,
      isLoggedIn: true,
      sessionToken: authToken,
    }),
  );
}

// Email/Password Sign Up (renamed to maintain compatibility)
async function handleLocalRegister(e) {
  e.preventDefault();
  const name = document.getElementById("regName").value.trim();
  const email = document.getElementById("regEmail").value.trim();
  const password = document.getElementById("regPassword").value;

  let valid = true;
  const nameErr = document.getElementById("regNameErr");
  const emailErr = document.getElementById("regEmailErr");
  const passErr = document.getElementById("regPasswordErr");

  if (nameErr) nameErr.textContent = "";
  if (emailErr) emailErr.textContent = "";
  if (passErr) passErr.textContent = "";

  if (!name) {
    if (nameErr) nameErr.textContent = "Name is required";
    valid = false;
  } else if (name.length < 2) {
    if (nameErr) nameErr.textContent = "Name must be at least 2 characters";
    valid = false;
  }

  if (!email) {
    if (emailErr) emailErr.textContent = "Email is required";
    valid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    if (emailErr) emailErr.textContent = "Please enter a valid email";
    valid = false;
  }

  if (!password) {
    if (passErr) passErr.textContent = "Password is required";
    valid = false;
  } else if (password.length < 6) {
    if (passErr) passErr.textContent = "Password must be at least 6 characters";
    valid = false;
  }

  if (!valid) return false;

  try {
    const [firstName, ...lastNameParts] = name.split(" ");
    const lastName = lastNameParts.join(" ") || "";

    const response = await fetch(`${API_URL}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, firstName, lastName }),
    });

    const data = await response.json();

    if (!response.ok) {
      if (emailErr) emailErr.textContent = data.error || "Signup failed";
      return false;
    }

    authToken = data.sessionToken;
    onClerkAuthSuccess(data.user);
    return true;
  } catch (error) {
    console.error("Signup error:", error);
    if (passErr) passErr.textContent = "Network error. Please try again.";
    return false;
  }
}

// Email/Password Sign In (renamed to maintain compatibility)
async function handleLocalLogin(e) {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  let valid = true;
  const emailErr = document.getElementById("loginEmailErr");
  const passErr = document.getElementById("loginPasswordErr");

  if (emailErr) emailErr.textContent = "";
  if (passErr) passErr.textContent = "";

  if (!email) {
    if (emailErr) emailErr.textContent = "Email is required";
    valid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    if (emailErr) emailErr.textContent = "Please enter a valid email";
    valid = false;
  }

  if (!password) {
    if (passErr) passErr.textContent = "Password is required";
    valid = false;
  }

  if (!valid) return false;

  try {
    const response = await fetch(`${API_URL}/api/auth/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      if (passErr) passErr.textContent = data.error || "Invalid credentials";
      return false;
    }

    authToken = data.sessionToken;
    onClerkAuthSuccess(data.user);
    return true;
  } catch (error) {
    console.error("Signin error:", error);
    if (passErr) passErr.textContent = "Network error. Please try again.";
    return false;
  }
}

// OAuth Sign In (redirect to backend)
function clerkSignInWithGoogle() {
  window.location.href = `${API_URL}/api/auth/oauth/google`;
}

function clerkSignInWithFacebook() {
  window.location.href = `${API_URL}/api/auth/oauth/facebook`;
}

// OAuth Sign Up (redirect to backend)
function clerkSignUpWithGoogle() {
  window.location.href = `${API_URL}/api/auth/oauth/google`;
}

function clerkSignUpWithFacebook() {
  window.location.href = `${API_URL}/api/auth/oauth/facebook`;
}

// Logout
async function signOut() {
  if (authToken) {
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${authToken}` },
      });
    } catch (error) {
      console.error("Logout error:", error);
    }
  }

  authToken = null;
  localStorage.removeItem("musictify_user");

  if (mainApp) mainApp.classList.add("hidden");
  if (loginPage) loginPage.classList.remove("hidden");
}

// ========== LOCAL AUTH (fallback) ==========

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function initLocalAuth() {
  const user = JSON.parse(localStorage.getItem("musictify_user"));
  if (user && user.isLoggedIn) {
    showApp(user);
  } else {
    showLogin();
  }
}

function showLogin() {
  if (loginPage) loginPage.classList.remove("hidden");
  if (registerPage) registerPage.classList.add("hidden");
  if (mainApp) mainApp.classList.add("hidden");
}

function showRegister() {
  if (loginPage) loginPage.classList.add("hidden");
  if (registerPage) registerPage.classList.remove("hidden");
  if (mainApp) mainApp.classList.add("hidden");
}

function showApp(user) {
  if (loginPage) loginPage.classList.add("hidden");
  if (registerPage) registerPage.classList.add("hidden");
  if (mainApp) mainApp.classList.remove("hidden");

  if (user && userAvatar && userNameEl && userEmailEl) {
    userAvatar.textContent = (user.name || user.email || "U").charAt(0).toUpperCase();
    userNameEl.textContent = user.name || user.email || "User";
    userEmailEl.textContent = user.email || "";
  }
}

// OAuth notices - disabled since we use backend OAuth
function attemptGoogleLogin() {
  clerkSignInWithGoogle();
}

function attemptFacebookLogin() {
  clerkSignInWithFacebook();
}

function attemptGoogleRegister() {
  clerkSignUpWithGoogle();
}

function attemptFacebookRegister() {
  clerkSignUpWithFacebook();
}
