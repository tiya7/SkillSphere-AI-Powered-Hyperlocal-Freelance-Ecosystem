import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const fetchNotifications = createAsyncThunk('notifications/fetch', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/notifications?limit=10');
    return res.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const markAllRead = createAsyncThunk('notifications/markAllRead', async (_, { rejectWithValue }) => {
  try { await api.put('/notifications/read-all'); return true; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: { notifications: [], unreadCount: 0, isLoading: false },
  reducers: {
    addNotification(state, action) {
      state.notifications.unshift(action.payload);
      state.unreadCount += 1;
    },
    setUnreadCount(state, action) { state.unreadCount = action.payload; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => { state.isLoading = true; })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notifications = action.payload.notifications;
        state.unreadCount = action.payload.unreadCount;
      })
      .addCase(fetchNotifications.rejected, (state) => { state.isLoading = false; })
      .addCase(markAllRead.fulfilled, (state) => { state.unreadCount = 0; state.notifications = state.notifications.map(n => ({ ...n, isRead: true })); });
  },
});

export const { addNotification, setUnreadCount } = notificationsSlice.actions;
export const selectNotifications = (state) => state.notifications.notifications;
export const selectUnreadCount = (state) => state.notifications.unreadCount;
export default notificationsSlice.reducer;
