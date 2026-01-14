import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  gigs: [],
  myGigs: [],
  currentGig: null,
  isLoading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    total: 0,
  },
  myGigsPagination: {
    currentPage: 1,
    totalPages: 1,
    total: 0,
  },
};

const gigSlice = createSlice({
  name: 'gigs',
  initialState,
  reducers: {
    gigsStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    gigsSuccess: (state, action) => {
      state.isLoading = false;
      state.gigs = action.payload.gigs;
      state.pagination = {
        currentPage: action.payload.currentPage,
        totalPages: action.payload.totalPages,
        total: action.payload.total,
      };
      state.error = null;
    },
    gigDetailsSuccess: (state, action) => {
      state.isLoading = false;
      state.currentGig = action.payload;
      state.error = null;
    },
    gigCreateSuccess: (state, action) => {
      state.isLoading = false;
      state.gigs.unshift(action.payload);
      state.myGigs.unshift(action.payload);
      state.error = null;
    },
    gigUpdateSuccess: (state, action) => {
      state.isLoading = false;
      const index = state.gigs.findIndex(gig => gig._id === action.payload._id);
      if (index !== -1) {
        state.gigs[index] = action.payload;
      }
      if (state.currentGig?._id === action.payload._id) {
        state.currentGig = action.payload;
      }
      state.error = null;
    },
    gigDeleteSuccess: (state, action) => {
      state.isLoading = false;
      state.gigs = state.gigs.filter(gig => gig._id !== action.payload);
      if (state.currentGig?._id === action.payload) {
        state.currentGig = null;
      }
      state.error = null;
    },
    gigsFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    myGigsSuccess: (state, action) => {
      state.isLoading = false;
      state.myGigs = action.payload.gigs;
      state.myGigsPagination = {
        currentPage: action.payload.currentPage,
        totalPages: action.payload.totalPages,
        total: action.payload.total,
      };
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  gigsStart,
  gigsSuccess,
  gigDetailsSuccess,
  gigCreateSuccess,
  gigUpdateSuccess,
  gigDeleteSuccess,
  gigsFailure,
  myGigsSuccess,
  clearError,
} = gigSlice.actions;

export default gigSlice.reducer;
