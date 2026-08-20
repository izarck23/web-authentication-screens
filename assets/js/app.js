document.addEventListener('DOMContentLoaded', () => {
  const screens = document.querySelectorAll('.screen');

  const toSigninBtn = document.getElementById('toSigninBtn');
  const toSignupBtn = document.getElementById('toSignupBtn');

  const signupForm = document.getElementById('signupForm');
  const signinForm = document.getElementById('signinForm');

  const signupMessage = document.getElementById('signupMessage');
  const signinMessage = document.getElementById('signinMessage');

  const signupSubmit = document.getElementById('signupSubmit');
  const signinSubmit = document.getElementById('signinSubmit');

  const forgotPasswordBtn = document.getElementById('forgotPasswordBtn');

  const AUTH_CONFIG = {
    baseURL: 'http://localhost:5000',
    endpoints: {
      signup: '/api/auth/signup',
      login: '/api/auth/login',
      forgotPassword: '/api/auth/forgot-password'
    },
    headers: {
      'Content-Type': 'application/json'
    }
  };

  function showScreen(screenId) {
    screens.forEach((screen) => screen.classList.remove('is-active'));

    const target = document.getElementById(screenId);
    if (target) {
      target.classList.add('is-active');
    }
  }

  function setMessage(element, message = '', type = '') {
    element.textContent = message;
    element.className = 'form-message';
    if (type) element.classList.add(type);
  }

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  async function apiRequest(endpoint, payload) {
    const response = await fetch(`${AUTH_CONFIG.baseURL}${endpoint}`, {
      method: 'POST',
      headers: AUTH_CONFIG.headers,
      body: JSON.stringify(payload)
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || 'Request failed');
    }

    return data;
  }

  if (toSigninBtn) {
    toSigninBtn.addEventListener('click', () => showScreen('signinScreen'));
  }

  if (toSignupBtn) {
    toSignupBtn.addEventListener('click', () => showScreen('signupScreen'));
  }

  document.querySelectorAll('[data-open]').forEach((button) => {
    button.addEventListener('click', () => {
      showScreen(button.dataset.open);
    });
  });

  document.querySelectorAll('[data-back]').forEach((button) => {
    button.addEventListener('click', () => {
      showScreen(button.dataset.back);
    });
  });

  if (signupForm) {
    signupForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const name = document.getElementById('signupName').value.trim();
      const email = document.getElementById('signupEmail').value.trim();
      const password = document.getElementById('signupPassword').value;
      const termsAccepted = document.getElementById('terms').checked;

      if (!name || !email || !password) {
        setMessage(signupMessage, 'Please fill in all fields.', 'error');
        return;
      }

      if (!validateEmail(email)) {
        setMessage(signupMessage, 'Please enter a valid email address.', 'error');
        return;
      }

      if (password.length < 6) {
        setMessage(signupMessage, 'Password must be at least 6 characters.', 'error');
        return;
      }

      if (!termsAccepted) {
        setMessage(signupMessage, 'Please accept the personal data agreement.', 'error');
        return;
      }

      signupSubmit.disabled = true;
      signupSubmit.textContent = 'Creating...';
      setMessage(signupMessage, 'Creating account...', 'success');

      try {
        const payload = { name, email, password };
        const data = await apiRequest(AUTH_CONFIG.endpoints.signup, payload);

        setMessage(signupMessage, data.message || 'Account created successfully', 'success');

        document.getElementById('signinEmail').value = email;
        document.getElementById('signinPassword').value = '';

        setTimeout(() => {
          signupForm.reset();
          showScreen('signinScreen');
          setMessage(signinMessage, 'Account created. Please sign in.', 'success');
        }, 700);
      } catch (error) {
        setMessage(signupMessage, error.message || 'Signup failed.', 'error');
      } finally {
        signupSubmit.disabled = false;
        signupSubmit.textContent = 'Sign up';
      }
    });
  }

  if (signinForm) {
    signinForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const email = document.getElementById('signinEmail').value.trim();
      const password = document.getElementById('signinPassword').value;
      const remember = document.getElementById('rememberMe').checked;

      if (!email || !password) {
        setMessage(signinMessage, 'Please enter your email and password.', 'error');
        return;
      }

      if (!validateEmail(email)) {
        setMessage(signinMessage, 'Please enter a valid email address.', 'error');
        return;
      }

      signinSubmit.disabled = true;
      signinSubmit.textContent = 'Signing in...';
      setMessage(signinMessage, 'Checking credentials...', 'success');

      try {
        const payload = { email, password, remember };
        const data = await apiRequest(AUTH_CONFIG.endpoints.login, payload);

        if (data.token) {
          localStorage.setItem('authToken', data.token);
        }

        setMessage(signinMessage, data.message || 'Login successful', 'success');

        // Example redirect after successful auth:
        // window.location.href = '/dashboard.html';
      } catch (error) {
        setMessage(signinMessage, error.message || 'Login failed.', 'error');
      } finally {
        signinSubmit.disabled = false;
        signinSubmit.textContent = 'Sign in';
      }
    });
  }

  if (forgotPasswordBtn) {
    forgotPasswordBtn.addEventListener('click', async () => {
      const email = document.getElementById('signinEmail').value.trim();

      if (!validateEmail(email)) {
        setMessage(signinMessage, 'Enter a valid email first.', 'error');
        return;
      }

      setMessage(signinMessage, 'Sending reset link...', 'success');

      try {
        const data = await apiRequest(AUTH_CONFIG.endpoints.forgotPassword, { email });
        setMessage(signinMessage, data.message || 'Password reset link sent.', 'success');
      } catch (error) {
        setMessage(signinMessage, error.message || 'Unable to send reset link.', 'error');
      }
    });
  }

  showScreen('welcomeScreen');
});