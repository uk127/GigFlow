import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  bids: [],
  gigBids: [],
  myBids: [],
  isLoading: false,
  error: null,
};

const bidSlice = createSlice({
  name: 'bids',
  initialState,
  reducers: {
    bidsStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    gigBidsSuccess: (state, action) => {
      state.isLoading = false;
      state.gigBids = action.payload;
      state.error = null;
    },
    myBidsSuccess: (state, action) => {
      state.isLoading = false;
      state.myBids = Array.isArray(action.payload) ? action.payload : [];
      state.error = null;
    },
    bidCreateSuccess: (state, action) => {
      state.isLoading = false;
      state.myBids.unshift(action.payload);
      state.error = null;
    },
    bidUpdateSuccess: (state, action) => {
      state.isLoading = false;
      const index = state.gigBids.findIndex(bid => bid._id === action.payload._id);
      if (index !== -1) {
        state.gigBids[index] = action.payload;
      }
      const myBidIndex = state.myBids.findIndex(bid => bid._id === action.payload._id);
      if (myBidIndex !== -1) {
        state.myBids[myBidIndex] = action.payload;
      }
      state.error = null;
    },
    bidsFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  bidsStart,
  gigBidsSuccess,
  myBidsSuccess,
  bidCreateSuccess,
  bidUpdateSuccess,
  bidsFailure,
  clearError,
} = bidSlice.actions;

export default bidSlice.reducer;
