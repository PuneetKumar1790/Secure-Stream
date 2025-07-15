document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");
  const signupForm = document.getElementById("signup-form");

  if (loginForm) loginForm.addEventListener("submit", handleLogin);
  if (signupForm) signupForm.addEventListener("submit", handleSignup);
});

//  LOGIN
async function handleLogin(e) {
  e.preventDefault();

  const formData = new FormData(e.target);
  const email = formData.get("email");
  const password = formData.get("password");

  const submitButton = e.target.querySelector('button[type="submit"]');
  submitButton.textContent = "Logging in...";
  submitButton.disabled = true;

  try {
    const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", 
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      showError(data.msg || "Login failed");
      submitButton.textContent = "Login";
      submitButton.disabled = false;
      return;
    }

    window.location.href = "watch.html";
  } catch (err) {
    showError("Server error. Try again later.");
    console.error(err);
    submitButton.textContent = "Login";
    submitButton.disabled = false;
  }
}


//  SIGNUP FUNCTION
async function handleSignup(e) {
  e.preventDefault();

  const formData = new FormData(e.target);
  const username = formData.get("username");
  const email = formData.get("email");
  const password = formData.get("password");

  const submitButton = e.target.querySelector('button[type="submit"]');
  submitButton.textContent = "Signing up...";
  submitButton.disabled = true;

  try {
    const res = await fetch("http://localhost:5000/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", 
      body: JSON.stringify({ username, email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      showError(data.msg || "Signup failed");
      submitButton.textContent = "Sign Up";
      submitButton.disabled = false;
      return;
    }

    alert("Signup successful! Please log in.");
    window.location.href = "login.html";

  } catch (err) {
    showError("Server error. Try again later.");
    console.error(err);
    submitButton.textContent = "Sign Up";
    submitButton.disabled = false;
  }
}


//  SHOW ERROR
function showError(message) {
  const errorDiv = document.getElementById("error-message");
  if (!errorDiv) return;
  const errorText = errorDiv.querySelector("p");
  errorText.textContent = message;
  errorDiv.classList.remove("hidden");
}

// HIDE ERROR
function hideError() {
  const errorDiv = document.getElementById("error-message");
  if (errorDiv) errorDiv.classList.add("hidden");
}