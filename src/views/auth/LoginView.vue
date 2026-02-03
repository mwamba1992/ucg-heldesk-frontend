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
  <div class="login-container">
    <div class="login-left">
      <div class="brand">
        <div class="brand-icon">
          <v-icon size="48" color="white">mdi-headset</v-icon>
        </div>
        <h1 class="brand-title">MHB Help Desk</h1>
        <p class="brand-subtitle">Your IT Support Portal</p>
      </div>

      <div class="features">
        <div class="feature-item">
          <v-icon color="white" class="mr-3">mdi-ticket-confirmation</v-icon>
          <span>Track your support tickets</span>
        </div>
        <div class="feature-item">
          <v-icon color="white" class="mr-3">mdi-clock-fast</v-icon>
          <span>Get quick resolutions</span>
        </div>
        <div class="feature-item">
          <v-icon color="white" class="mr-3">mdi-shield-check</v-icon>
          <span>Secure & reliable support</span>
        </div>
      </div>
    </div>

    <div class="login-right">
      <v-card class="login-card" elevation="0">
        <v-card-text class="pa-8">
          <div class="text-center mb-8">
            <h2 class="text-h4 font-weight-bold mb-2">Welcome back</h2>
            <p class="text-body-1 text-grey">Sign in to your account</p>
          </div>

          <v-alert
            v-if="errorMessage"
            type="error"
            variant="tonal"
            class="mb-6"
            rounded="lg"
            closable
            @click:close="errorMessage = ''"
          >
            {{ errorMessage }}
          </v-alert>

          <v-form @submit.prevent="handleLogin">
            <v-text-field
              v-model="form.username"
              label="Username"
              prepend-inner-icon="mdi-account-outline"
              type="text"
              autocomplete="username"
              :disabled="isLoading"
              required
              class="mb-4"
            ></v-text-field>

            <v-text-field
              v-model="form.password"
              label="Password"
              prepend-inner-icon="mdi-lock-outline"
              :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="current-password"
              :disabled="isLoading"
              required
              class="mb-6"
              @click:append-inner="showPassword = !showPassword"
            ></v-text-field>

            <v-btn
              type="submit"
              color="primary"
              size="x-large"
              block
              :loading="isLoading"
              :disabled="!isFormValid"
              class="mb-4 login-btn"
            >
              <v-icon left class="mr-2">mdi-login</v-icon>
              Sign In
            </v-btn>
          </v-form>

          <div class="text-center">
            <p class="text-caption text-grey-darken-1">
              Need help? Contact
              <a href="#" class="text-primary text-decoration-none font-weight-medium">IT Support</a>
            </p>
          </div>
        </v-card-text>
      </v-card>

      <p class="copyright">
        &copy; {{ new Date().getFullYear() }} MHB Organization. All rights reserved.
      </p>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  min-height: 100vh;
}

.login-left {
  flex: 1;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 48px;
  position: relative;
  overflow: hidden;
}

.login-left::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 60%);
  animation: rotate 30s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.brand {
  text-align: center;
  z-index: 1;
  margin-bottom: 48px;
}

.brand-icon {
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  backdrop-filter: blur(10px);
}

.brand-title {
  color: white;
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 8px;
}

.brand-subtitle {
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.125rem;
}

.features {
  z-index: 1;
}

.feature-item {
  display: flex;
  align-items: center;
  color: rgba(255, 255, 255, 0.9);
  padding: 12px 0;
  font-size: 1rem;
}

.login-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 48px;
  background: #f8fafc;
}

.login-card {
  width: 100%;
  max-width: 440px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.05), 0 8px 10px -6px rgb(0 0 0 / 0.05);
}

.login-btn {
  height: 52px !important;
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.copyright {
  margin-top: 32px;
  color: #94a3b8;
  font-size: 0.875rem;
}

@media (max-width: 960px) {
  .login-left {
    display: none;
  }

  .login-right {
    flex: 1;
  }
}
</style>
