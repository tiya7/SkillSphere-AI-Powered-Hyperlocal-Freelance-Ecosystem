import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// ─── Async Thunks ─────────────────────────────────────────────────────────────

export const registerUser = createAsyncThunk('auth/register', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/register', data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Registration failed');
  }
});

export const loginUser = createAsyncThunk('auth/login', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/login', data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Login failed');
  }
});

export const googleAuth = createAsyncThunk('auth/google', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/google', data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Google auth failed');
  }
});

export const verifyTwoFactor = createAsyncThunk('auth/verify2fa', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/2fa/verify-login', data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || '2FA verification failed');
  }
});

export const logoutUser = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await api.post('/auth/logout');
    return {};
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const fetchMe = createAsyncThunk('auth/me', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/auth/me');
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const refreshAccessToken = createAsyncThunk('auth/refresh', async (_, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/refresh-token');
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const setupTwoFactor = createAsyncThunk('auth/setup2fa', async (_, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/2fa/setup');
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const enableTwoFactor = createAsyncThunk('auth/enable2fa', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/2fa/enable', data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

// ─── Slice ─────────────────────────────────────────────────────────────────────

const initialState = {
  user: null,
  accessToken: localStorage.getItem('accessToken') || null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false, // app startup check
  error: null,
  requiresTwoFactor: false,
  twoFactorUserId: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError(state) { state.error = null; },
    setCredentials(state, action) {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
      if (action.payload.accessToken) {
        localStorage.setItem('accessToken', action.payload.accessToken);
      }
    },
    clearCredentials(state) {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.requiresTwoFactor = false;
      state.twoFactorUserId = null;
      localStorage.removeItem('accessToken');
    },
    updateUser(state, action) {
      state.user = { ...state.user, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    // Register
    builder
      .addCase(registerUser.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(registerUser.fulfilled, (state) => { state.isLoading = false; })
      .addCase(registerUser.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; });

    // Login
    builder
      .addCase(loginUser.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.requiresTwoFactor) {
          state.requiresTwoFactor = true;
          state.twoFactorUserId = action.payload.userId;
        } else {
          state.user = action.payload.user;
          state.accessToken = action.payload.accessToken;
          state.isAuthenticated = true;
          localStorage.setItem('accessToken', action.payload.accessToken);
        }
      })
      .addCase(loginUser.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; });

    // Google Auth
    builder
      .addCase(googleAuth.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(googleAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.isAuthenticated = true;
        localStorage.setItem('accessToken', action.payload.accessToken);
      })
      .addCase(googleAuth.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; });

    // 2FA Verify
    builder
      .addCase(verifyTwoFactor.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(verifyTwoFactor.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.isAuthenticated = true;
        state.requiresTwoFactor = false;
        state.twoFactorUserId = null;
        localStorage.setItem('accessToken', action.payload.accessToken);
      })
      .addCase(verifyTwoFactor.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; });

    // Logout
    builder
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null; state.accessToken = null;
        state.isAuthenticated = false;
        localStorage.removeItem('accessToken');
      });

    // Fetch Me
    builder
      .addCase(fetchMe.pending, (state) => { state.isLoading = true; })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isInitialized = true;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(fetchMe.rejected, (state) => {
        state.isLoading = false;
        state.isInitialized = true;
        state.isAuthenticated = false;
        state.user = null;
        localStorage.removeItem('accessToken');
      });

    // Refresh Token
    builder
      .addCase(refreshAccessToken.fulfilled, (state, action) => {
        state.accessToken = action.payload.accessToken;
        localStorage.setItem('accessToken', action.payload.accessToken);
      });
  },
});

export const { clearError, setCredentials, clearCredentials, updateUser } = authSlice.actions;

// Selectors
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectIsLoading = (state) => state.auth.isLoading;
export const selectAuthError = (state) => state.auth.error;
export const selectRequiresTwoFactor = (state) => state.auth.requiresTwoFactor;
export const selectTwoFactorUserId = (state) => state.auth.twoFactorUserId;
export const selectIsInitialized = (state) => state.auth.isInitialized;
export const selectAccessToken = (state) => state.auth.accessToken;

export default authSlice.reducer;
