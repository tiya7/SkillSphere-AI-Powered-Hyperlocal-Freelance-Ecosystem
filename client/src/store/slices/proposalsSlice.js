import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const submitProposal = createAsyncThunk('proposals/submit', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/proposals', data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to submit proposal');
  }
});

export const fetchMyProposals = createAsyncThunk('proposals/fetchMy', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/proposals/my');
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch proposals');
  }
});

export const fetchGigProposals = createAsyncThunk('proposals/fetchForGig', async (gigId, { rejectWithValue }) => {
  try {
    const res = await api.get(`/proposals/gig/${gigId}`);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch proposals');
  }
});

export const acceptProposal = createAsyncThunk('proposals/accept', async (id, { rejectWithValue }) => {
  try {
    const res = await api.put(`/proposals/${id}/accept`);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to accept proposal');
  }
});

export const rejectProposal = createAsyncThunk('proposals/reject', async (id, { rejectWithValue }) => {
  try {
    const res = await api.put(`/proposals/${id}/reject`);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to reject proposal');
  }
});

export const withdrawProposal = createAsyncThunk('proposals/withdraw', async (id, { rejectWithValue }) => {
  try {
    const res = await api.put(`/proposals/${id}/withdraw`);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to withdraw proposal');
  }
});

const proposalsSlice = createSlice({
  name: 'proposals',
  initialState: {
    myProposals: [],
    gigProposals: [],
    isLoading: false,
    isSubmitting: false,
    error: null,
  },
  reducers: {
    clearProposalError(state) { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitProposal.pending, (state) => { state.isSubmitting = true; state.error = null; })
      .addCase(submitProposal.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.myProposals.unshift(action.payload.proposal);
      })
      .addCase(submitProposal.rejected, (state, action) => { state.isSubmitting = false; state.error = action.payload; });

    builder
      .addCase(fetchMyProposals.pending, (state) => { state.isLoading = true; })
      .addCase(fetchMyProposals.fulfilled, (state, action) => { state.isLoading = false; state.myProposals = action.payload.proposals; })
      .addCase(fetchMyProposals.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; });

    builder
      .addCase(fetchGigProposals.pending, (state) => { state.isLoading = true; })
      .addCase(fetchGigProposals.fulfilled, (state, action) => { state.isLoading = false; state.gigProposals = action.payload.proposals; })
      .addCase(fetchGigProposals.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; });

    builder
      .addCase(acceptProposal.fulfilled, (state, action) => {
        const idx = state.gigProposals.findIndex((p) => p._id === action.payload.proposal._id);
        if (idx !== -1) state.gigProposals[idx] = action.payload.proposal;
      });

    builder
      .addCase(rejectProposal.fulfilled, (state, action) => {
        const idx = state.gigProposals.findIndex((p) => p._id === action.payload.proposal._id);
        if (idx !== -1) state.gigProposals[idx] = action.payload.proposal;
      });

    builder
      .addCase(withdrawProposal.fulfilled, (state, action) => {
        const idx = state.myProposals.findIndex((p) => p._id === action.payload.proposal._id);
        if (idx !== -1) state.myProposals[idx] = action.payload.proposal;
      });
  },
});

export const { clearProposalError } = proposalsSlice.actions;
export const selectMyProposals = (state) => state.proposals.myProposals;
export const selectGigProposals = (state) => state.proposals.gigProposals;
export const selectProposalsLoading = (state) => state.proposals.isLoading;
export const selectProposalsSubmitting = (state) => state.proposals.isSubmitting;
export default proposalsSlice.reducer;
