<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const form = ref({
  username: '',
  password: '',
});
const showPassword = ref(false);
const isLoading = ref(false);
const errorMessage = ref('');

const isFormValid = computed(() => {
  return form.value.username.length >= 3 && form.value.password.length >= 6;
});

async function handleLogin() {
  if (!isFormValid.value) return;

  isLoading.value = true;
  errorMessage.value = '';

  try {
    await authStore.login({
      username: form.value.username,
      password: form.value.password,
    });

    const redirect = route.query.redirect as string;
    router.push(redirect || '/dashboard');
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      errorMessage.value =
        axiosError.response?.data?.message || 'Invalid username or password';
    } else {
      errorMessage.value = 'An error occurred. Please try again.';
    }
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <div class="login-page">
    <!-- Header -->
    <header class="login-header">
      <div class="header-content">
        <div class="logo-section">
          <div class="logo-icon">
            <v-icon size="28" color="white">mdi-bank</v-icon>
          </div>
          <div class="logo-text">
            <span class="bank-name">Mwanga Hakika Bank</span>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="login-main">
      <div class="login-container">
        <!-- Login Card -->
        <div class="login-card">
          <div class="card-header">
            <h1 class="card-title">IT Help Desk</h1>
            <p class="card-subtitle">Sign in to access your support portal</p>
          </div>

          <v-alert
            v-if="errorMessage"
            type="error"
            variant="tonal"
            class="mb-6"
            density="compact"
            closable
            @click:close="errorMessage = ''"
          >
            {{ errorMessage }}
          </v-alert>

          <v-form @submit.prevent="handleLogin" class="login-form">
            <div class="form-group">
              <label class="form-label">Username</label>
              <v-text-field
                v-model="form.username"
                placeholder="Enter your username"
                prepend-inner-icon="mdi-account-outline"
                type="text"
                autocomplete="username"
                :disabled="isLoading"
                required
                variant="outlined"
                density="comfortable"
                hide-details="auto"
                class="form-input"
              ></v-text-field>
            </div>

            <div class="form-group">
              <label class="form-label">Password</label>
              <v-text-field
                v-model="form.password"
                placeholder="Enter your password"
                prepend-inner-icon="mdi-lock-outline"
                :append-inner-icon="showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password"
                :disabled="isLoading"
                required
                variant="outlined"
                density="comfortable"
                hide-details="auto"
                class="form-input"
                @click:append-inner="showPassword = !showPassword"
              ></v-text-field>
            </div>

            <v-btn
              type="submit"
              color="primary"
              size="large"
              block
              :loading="isLoading"
              :disabled="!isFormValid"
              class="login-btn"
            >
              Sign In
            </v-btn>
          </v-form>

          <div class="help-section">
            <v-icon size="16" class="mr-1">mdi-help-circle-outline</v-icon>
            <span>Having trouble? Contact <a href="mailto:itsupport@mhb.co.tz" class="help-link">IT Support</a></span>
          </div>
        </div>

        <!-- Security Notice -->
        <div class="security-notice">
          <v-icon size="14" class="mr-1">mdi-shield-check</v-icon>
          <span>Secure connection. Your session is encrypted.</span>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="login-footer">
      <div class="footer-content">
        <p class="copyright">&copy; {{ new Date().getFullYear() }} Mwanga Hakika Bank. All rights reserved.</p>
        <p class="footer-links">
          <a href="#">Privacy Policy</a>
          <span class="divider">|</span>
          <a href="#">Terms of Service</a>
        </p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
}

/* Header */
.login-header {
  background: #00a0d1;
  padding: 16px 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  width: 44px;
  height: 44px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bank-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: white;
  letter-spacing: -0.01em;
}

/* Main */
.login-main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
}

.login-container {
  width: 100%;
  max-width: 420px;
}

/* Card */
.login-card {
  background: white;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
  border: 1px solid #e8ecf0;
}

.card-header {
  text-align: center;
  margin-bottom: 32px;
}

.card-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a2b3c;
  margin-bottom: 8px;
}

.card-subtitle {
  font-size: 0.9rem;
  color: #64748b;
}

/* Form */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.form-input :deep(.v-field) {
  border-radius: 8px;
}

.form-input :deep(.v-field__outline) {
  color: #d1d5db;
}

.form-input :deep(.v-field--focused .v-field__outline) {
  color: #00a0d1;
}

.login-btn {
  margin-top: 8px;
  height: 48px !important;
  font-size: 0.95rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  text-transform: none;
  border-radius: 8px;
}

/* Help Section */
.help-section {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #e8ecf0;
  text-align: center;
  font-size: 0.85rem;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
}

.help-link {
  color: #00a0d1;
  text-decoration: none;
  font-weight: 500;
}

.help-link:hover {
  text-decoration: underline;
}

/* Security Notice */
.security-notice {
  margin-top: 16px;
  text-align: center;
  font-size: 0.75rem;
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Footer */
.login-footer {
  padding: 20px 24px;
  background: white;
  border-top: 1px solid #e8ecf0;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.copyright {
  font-size: 0.8rem;
  color: #64748b;
  margin: 0;
}

.footer-links {
  font-size: 0.75rem;
  color: #94a3b8;
  margin: 0;
}

.footer-links a {
  color: #64748b;
  text-decoration: none;
}

.footer-links a:hover {
  color: #00a0d1;
}

.footer-links .divider {
  margin: 0 8px;
  color: #d1d5db;
}

/* Responsive */
@media (max-width: 480px) {
  .login-card {
    padding: 28px 24px;
  }

  .card-title {
    font-size: 1.3rem;
  }

  .login-header {
    padding: 12px 16px;
  }

  .bank-name {
    font-size: 1.1rem;
  }
}
</style>
