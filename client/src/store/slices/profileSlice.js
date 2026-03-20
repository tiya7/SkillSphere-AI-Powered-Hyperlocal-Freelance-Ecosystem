import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// ─── Async Thunks ──────────────────────────────────────────────────────────────

export const fetchMyProfile = createAsyncThunk('profile/fetchMe', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/profile/me');
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch profile');
  }
});

export const updateBaseProfile = createAsyncThunk('profile/update', async (data, { rejectWithValue }) => {
  try {
    const res = await api.put('/profile/update', data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Update failed');
  }
});

export const updateFreelancerProfile = createAsyncThunk('profile/updateFreelancer', async (data, { rejectWithValue }) => {
  try {
    const res = await api.put('/profile/freelancer', data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Update failed');
  }
});

export const updateClientProfile = createAsyncThunk('profile/updateClient', async (data, { rejectWithValue }) => {
  try {
    const res = await api.put('/profile/client', data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Update failed');
  }
});

export const uploadAvatar = createAsyncThunk('profile/uploadAvatar', async (file, { rejectWithValue }) => {
  try {
    const formData = new FormData();
    formData.append('avatar', file);
    const res = await api.post('/profile/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Upload failed');
  }
});

export const changePassword = createAsyncThunk('profile/changePassword', async (data, { rejectWithValue }) => {
  try {
    const res = await api.put('/profile/change-password', data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Password change failed');
  }
});

// ─── Slice ─────────────────────────────────────────────────────────────────────

const profileSlice = createSlice({
  name: 'profile',
  initialState: {
    profile: null,      // role-specific profile (Freelancer or Client doc)
    isLoading: false,
    isUpdating: false,
    error: null,
  },
  reducers: {
    clearProfileError(state) { state.error = null; },
    setProfile(state, action) { state.profile = action.payload; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyProfile.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(fetchMyProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload.profile;
      })
      .addCase(fetchMyProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    builder
      .addCase(updateBaseProfile.pending, (state) => { state.isUpdating = true; })
      .addCase(updateBaseProfile.fulfilled, (state) => { state.isUpdating = false; })
      .addCase(updateBaseProfile.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
      });

    builder
      .addCase(updateFreelancerProfile.pending, (state) => { state.isUpdating = true; })
      .addCase(updateFreelancerProfile.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.profile = action.payload.profile;
      })
      .addCase(updateFreelancerProfile.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
      });

    builder
      .addCase(updateClientProfile.pending, (state) => { state.isUpdating = true; })
      .addCase(updateClientProfile.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.profile = action.payload.profile;
      })
      .addCase(updateClientProfile.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
      });

    builder
      .addCase(uploadAvatar.pending, (state) => { state.isUpdating = true; })
      .addCase(uploadAvatar.fulfilled, (state) => { state.isUpdating = false; })
      .addCase(uploadAvatar.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
      });
  },
});

export const { clearProfileError, setProfile } = profileSlice.actions;

export const selectProfile = (state) => state.profile.profile;
export const selectProfileLoading = (state) => state.profile.isLoading;
export const selectProfileUpdating = (state) => state.profile.isUpdating;

export default profileSlice.reducer;
