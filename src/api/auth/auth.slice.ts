import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { UserType } from '@/types/user';
import {
  register,
  login,
  logout,
  fetchMe,
  forgotPassword,
  resetPassword,
} from '@/api/auth/auth.actions';

interface AuthState {
  user: UserType | null;
  hydrating: boolean;
  initialized: boolean;
  loading: {
    login: boolean;
    register: boolean;
    forgot: boolean;
    reset: boolean;
    logout: boolean;
  };
  errors: {
    login: string | null;
    register: string | null;
    forgot: string | null;
    reset: string | null;
    logout: string | null;
  };
}

const initialState: AuthState = {
  user: null,
  loading: {
    login: false,
    register: false,
    forgot: false,
    reset: false,
    logout: false,
  },
  errors: {
    login: null,
    register: null,
    forgot: null,
    reset: null,
    logout: null,
  },
  hydrating: true,
  initialized: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Local-only auth reset (no network call). Used when a token refresh
    // fails, so we clear the user without firing a pointless /auth/logout.
    clearAuth: state => {
      state.user = null;
    },
    updateUser: (state, action: PayloadAction<UserType>) => {
      state.user = action.payload;
    },
    clearAuthErrors: state => {
      state.errors = {
        login: null,
        register: null,
        forgot: null,
        reset: null,
        logout: null,
      };
    },
    setLoginError: (state, action: PayloadAction<string>) => {
      state.errors.login = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      // register
      .addCase(register.pending, state => {
        state.loading.register = true;
        state.errors.register = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading.register = false;
        state.user = action.payload.data;
        state.errors.register = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading.register = false;
        state.errors.register =
          action.payload?.message ?? 'Registration failed';
      })

      // login
      .addCase(login.pending, state => {
        state.loading.login = true;
        state.errors.login = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading.login = false;
        state.user = action.payload.data;
        state.errors.login = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading.login = false;
        state.errors.login = action.payload?.message ?? 'Login failed';
      })

      // logout
      .addCase(logout.fulfilled, state => {
        state.user = null;
        state.errors.logout = null;
      })
      .addCase(logout.rejected, (state, action) => {
        if (action.payload?.status !== 0) {
          state.user = null;
        }
        state.errors.logout = action.payload?.message ?? 'Logout failed';
      })

      // fetchMe runs on app startup to restore user from cookie
      .addCase(fetchMe.pending, state => {
        state.hydrating = true;
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.hydrating = false;
        state.user = action.payload.data;
        state.initialized = true;
      })
      .addCase(fetchMe.rejected, state => {
        state.hydrating = false;
        state.user = null;
        state.initialized = true;
      })

      // forgotPassword
      .addCase(forgotPassword.pending, state => {
        state.loading.forgot = true;
        state.errors.forgot = null;
      })
      .addCase(forgotPassword.fulfilled, state => {
        state.loading.forgot = false;
        state.errors.forgot = null;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading.forgot = false;
        state.errors.forgot =
          action.payload?.message ?? 'Forgot password request failed';
      })

      // resetPassword
      .addCase(resetPassword.pending, state => {
        state.loading.reset = true;
        state.errors.reset = null;
      })
      .addCase(resetPassword.fulfilled, state => {
        state.loading.reset = false;
        state.errors.reset = null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading.reset = false;
        state.errors.reset =
          action.payload?.message ?? 'Reset password request failed';
      });
  },
});

export const { clearAuth, updateUser, clearAuthErrors, setLoginError } =
  authSlice.actions;

export default authSlice.reducer;
