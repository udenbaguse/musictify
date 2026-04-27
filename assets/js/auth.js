// ========== CLERK INTEGRATION ==========

function initClerk() {
  if (typeof Clerk === "undefined") {
    console.warn("Clerk SDK not loaded, using local auth");
    initLocalAuth();
    return;
  }

  clerkInstance = new Clerk(CLERK_PUB_KEY);

  clerkInstance
    .load({
      appearance: {
        layout: {
          socialButtonsVariant: "iconButton",
          socialButtonsPlacement: "bottom",
        },
        elements: {
          formButtonPrimary: "clerk-btn-primary",
          card: "clerk-card",
          headerTitle: "clerk-header",
          footer: "clerk-footer",
          dividerLine: "clerk-divider",
          dividerText: "clerk-divider-text",
          identityPreviewAvatarBox: "clerk-avatar",
          formFieldInput: "clerk-input",
          formFieldLabel: "clerk-label",
        },
        variables: {
          colorPrimary: "#1ed760",
          colorBackground: "#07120f",
          colorInputBackground: "rgba(255,255,255,0.03)",
          colorText: "#edf7f2",
          colorTextOnBrandPrimary: "#07270f",
        },
      },
    })
    .then(() => {
      clerkLoaded = true;

      // Check if user already signed in
      if (clerkInstance.user) {
        onClerkAuthSuccess(clerkInstance.user);
      }
    })
    .catch((err) => {
      console.warn("Clerk init failed, using local auth:", err);
      initLocalAuth();
    });
}

function onClerkAuthSuccess(user) {
  if (!user) return;

  const userName =
    user.firstName + " " + user.lastName ||
    user.emailAddresses?.[0]?.emailAddress?.split("@")[0] ||
    user.email?.split("@")[0] ||
    "User";
  const userEmail = user.emailAddresses?.[0]?.emailAddress || user.email || "";

  if (loginPage) loginPage.classList.add("hidden");
  if (registerPage) registerPage.classList.add("hidden");
  if (mainApp) mainApp.classList.remove("hidden");

  if (userAvatar)
    userAvatar.textContent = userName.trim().charAt(0).toUpperCase();
  if (userNameEl) userNameEl.textContent = userName;
  if (userEmailEl) userEmailEl.textContent = userEmail;

  localStorage.setItem(
    "musictify_user",
    JSON.stringify({
      id: user.id || user.userId,
      name: userName,
      email: userEmail,
      clerkUser: true,
      isLoggedIn: true,
    }),
  );
}

function signOut() {
  localStorage.removeItem("musictify_user");
  if (mainApp) mainApp.classList.add("hidden");
  if (loginPage) loginPage.classList.remove("hidden");
}

function attemptGoogleLogin() {
  const notice = document.createElement("div");
  notice.style.cssText =
    "background:rgba(219,68,55,0.2);border:1px solid rgba(219,68,55,0.4);border-radius:8px;padding:12px;margin:12px 0;color:#DB4437;font-size:13px;text-align:center;";
  notice.textContent =
    "Google OAuth requires Clerk backend. Use email login or sign up.";
  document.getElementById("loginForm").prepend(notice);
  setTimeout(() => notice.remove(), 5000);
}

function attemptFacebookLogin() {
  const notice = document.createElement("div");
  notice.style.cssText =
    "background:rgba(66,103,178,0.2);border:1px solid rgba(66,103,178,0.4);border-radius:8px;padding:12px;margin:12px 0;color:#4267B2;font-size:13px;text-align:center;";
  notice.textContent =
    "Facebook OAuth requires Clerk backend. Use email login or sign up.";
  document.getElementById("loginForm").prepend(notice);
  setTimeout(() => notice.remove(), 5000);
}

function attemptGoogleRegister() {
  const notice = document.createElement("div");
  notice.style.cssText =
    "background:rgba(219,68,55,0.2);border:1px solid rgba(219,68,55,0.4);border-radius:8px;padding:12px;margin:12px 0;color:#DB4437;font-size:13px;text-align:center;";
  notice.textContent =
    "Google OAuth requires Clerk backend. Use email sign up or login.";
  document.getElementById("registerForm").prepend(notice);
  setTimeout(() => notice.remove(), 5000);
}

function attemptFacebookRegister() {
  const notice = document.createElement("div");
  notice.style.cssText =
    "background:rgba(66,103,178,0.2);border:1px solid rgba(66,103,178,0.4);border-radius:8px;padding:12px;margin:12px 0;color:#4267B2;font-size:13px;text-align:center;";
  notice.textContent =
    "Facebook OAuth requires Clerk backend. Use email sign up or login.";
  document.getElementById("registerForm").prepend(notice);
  setTimeout(() => notice.remove(), 5000);
}

function clerkSignInWithGoogle() {
  if (clerkLoaded && clerkInstance) {
    clerkInstance.openSignIn({ strategy: "oauth_google" });
  }
}

function clerkSignInWithFacebook() {
  if (clerkLoaded && clerkInstance) {
    clerkInstance.openSignIn({ strategy: "oauth_facebook" });
  }
}

function clerkSignUpWithGoogle() {
  if (clerkLoaded && clerkInstance) {
    clerkInstance.openSignUp({ strategy: "oauth_google" });
  }
}

function clerkSignUpWithFacebook() {
  if (clerkLoaded && clerkInstance) {
    clerkInstance.openSignUp({ strategy: "oauth_facebook" });
  }
}

// ========== LOCAL AUTH ==========

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function handleLocalLogin(e) {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value.trim();
  const pass = document.getElementById("loginPassword").value;

  let valid = true;

  const emailErr = document.getElementById("loginEmailErr");
  const passErr = document.getElementById("loginPasswordErr");
  if (emailErr) emailErr.textContent = "";
  if (passErr) passErr.textContent = "";

  // Clear errors on input
  document.getElementById("loginEmail").addEventListener("input", function () {
    if (emailErr) emailErr.textContent = "";
  });
  document
    .getElementById("loginPassword")
    .addEventListener("input", function () {
      if (passErr) passErr.textContent = "";
    });

  if (!email) {
    if (emailErr) emailErr.textContent = "Email is required";
    valid = false;
  } else if (!validateEmail(email)) {
    if (emailErr) emailErr.textContent = "Please enter a valid email";
    valid = false;
  }

  if (!pass) {
    if (passErr) passErr.textContent = "Password is required";
    valid = false;
  } else if (pass.length < 6) {
    if (passErr) passErr.textContent = "Password must be at least 6 characters";
    valid = false;
  }

  if (!valid) return false;

  const users = JSON.parse(localStorage.getItem("musictify_users") || "[]");
  const user = users.find((u) => u.email === email && u.password === pass);

  if (!user) {
    if (passErr) passErr.textContent = "Invalid email or password";
    return false;
  }

  localStorage.setItem("musictify_user", JSON.stringify(user));
  showApp(user);
  return true;
}

function handleLocalRegister(e) {
  e.preventDefault();
  const name = document.getElementById("regName").value.trim();
  const email = document.getElementById("regEmail").value.trim();
  const pass = document.getElementById("regPassword").value;

  let valid = true;

  const nameErr = document.getElementById("regNameErr");
  const emailErr = document.getElementById("regEmailErr");
  const passErr = document.getElementById("regPasswordErr");
  if (nameErr) nameErr.textContent = "";
  if (emailErr) emailErr.textContent = "";
  if (passErr) passErr.textContent = "";

  // Clear errors on input
  document.getElementById("regName").addEventListener("input", function () {
    if (nameErr) nameErr.textContent = "";
  });
  document.getElementById("regEmail").addEventListener("input", function () {
    if (emailErr) emailErr.textContent = "";
  });
  document.getElementById("regPassword").addEventListener("input", function () {
    if (passErr) passErr.textContent = "";
  });

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
  } else if (!validateEmail(email)) {
    if (emailErr) emailErr.textContent = "Please enter a valid email";
    valid = false;
  }

  if (!pass) {
    if (passErr) passErr.textContent = "Password is required";
    valid = false;
  } else if (pass.length < 6) {
    if (passErr) passErr.textContent = "Password must be at least 6 characters";
    valid = false;
  }

  if (!valid) return false;

  const users = JSON.parse(localStorage.getItem("musictify_users") || "[]");
  if (users.find((u) => u.email === email)) {
    if (emailErr)
      emailErr.textContent = "Email already registered. Please log in.";
    return false;
  }

  const user = { name, email, password: pass };
  users.push(user);
  localStorage.setItem("musictify_users", JSON.stringify(users));
  user.isLoggedIn = true;
  localStorage.setItem("musictify_user", JSON.stringify(user));
  showApp(user);
  return true;
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
    userAvatar.textContent = (user.name || user.email || "U")
      .charAt(0)
      .toUpperCase();
    userNameEl.textContent = user.name || user.email || "User";
    userEmailEl.textContent = user.email || "";
  }
}
