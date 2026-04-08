import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const fetchGigs = createAsyncThunk('gigs/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const query = new URLSearchParams(params).toString();
    const res = await api.get(`/gigs?${query}`);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch gigs');
  }
});

export const fetchGig = createAsyncThunk('gigs/fetchOne', async (id, { rejectWithValue }) => {
  try {
    const res = await api.get(`/gigs/${id}`);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch gig');
  }
});

export const createGig = createAsyncThunk('gigs/create', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/gigs', data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create gig');
  }
});

export const fetchMyGigs = createAsyncThunk('gigs/fetchMy', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/gigs/my/gigs');
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch gigs');
  }
});

export const fetchMatchedGigs = createAsyncThunk('gigs/fetchMatched', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/gigs/matched/freelancer');
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch matched gigs');
  }
});

export const deleteGig = createAsyncThunk('gigs/delete', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/gigs/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete gig');
  }
});

const gigsSlice = createSlice({
  name: 'gigs',
  initialState: {
    gigs: [],
    myGigs: [],
    matchedGigs: [],
    currentGig: null,
    total: 0,
    pages: 1,
    currentPage: 1,
    isLoading: false,
    isCreating: false,
    error: null,
    filters: {
      search: '',
      category: 'all',
      budgetMin: '',
      budgetMax: '',
      sort: 'newest',
      location: '',
      isRemote: false,
    },
  },
  reducers: {
    setFilters(state, action) { state.filters = { ...state.filters, ...action.payload }; },
    clearFilters(state) {
      state.filters = { search: '', category: 'all', budgetMin: '', budgetMax: '', sort: 'newest', location: '', isRemote: false };
    },
    clearCurrentGig(state) { state.currentGig = null; },
    clearError(state) { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGigs.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(fetchGigs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.gigs = action.payload.gigs;
        state.total = action.payload.total;
        state.pages = action.payload.pages;
        state.currentPage = action.payload.currentPage;
      })
      .addCase(fetchGigs.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; });

    builder
      .addCase(fetchGig.pending, (state) => { state.isLoading = true; })
      .addCase(fetchGig.fulfilled, (state, action) => { state.isLoading = false; state.currentGig = action.payload.gig; })
      .addCase(fetchGig.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; });

    builder
      .addCase(createGig.pending, (state) => { state.isCreating = true; })
      .addCase(createGig.fulfilled, (state, action) => {
        state.isCreating = false;
        state.myGigs.unshift(action.payload.gig);
      })
      .addCase(createGig.rejected, (state, action) => { state.isCreating = false; state.error = action.payload; });

    builder
      .addCase(fetchMyGigs.pending, (state) => { state.isLoading = true; })
      .addCase(fetchMyGigs.fulfilled, (state, action) => { state.isLoading = false; state.myGigs = action.payload.gigs; })
      .addCase(fetchMyGigs.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; });

    builder
      .addCase(fetchMatchedGigs.pending, (state) => { state.isLoading = true; })
      .addCase(fetchMatchedGigs.fulfilled, (state, action) => { state.isLoading = false; state.matchedGigs = action.payload.gigs; })
      .addCase(fetchMatchedGigs.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; });

    builder
      .addCase(deleteGig.fulfilled, (state, action) => {
        state.myGigs = state.myGigs.filter((g) => g._id !== action.payload);
        state.gigs = state.gigs.filter((g) => g._id !== action.payload);
      });
  },
});

export const { setFilters, clearFilters, clearCurrentGig, clearError } = gigsSlice.actions;
export const selectGigs = (state) => state.gigs.gigs;
export const selectMyGigs = (state) => state.gigs.myGigs;
export const selectMatchedGigs = (state) => state.gigs.matchedGigs;
export const selectCurrentGig = (state) => state.gigs.currentGig;
export const selectGigsLoading = (state) => state.gigs.isLoading;
export const selectGigsCreating = (state) => state.gigs.isCreating;
export const selectGigsFilters = (state) => state.gigs.filters;
export const selectGigsTotal = (state) => state.gigs.total;
export const selectGigsPages = (state) => state.gigs.pages;
export default gigsSlice.reducer;
