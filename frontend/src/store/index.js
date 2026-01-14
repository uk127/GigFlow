import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import gigSlice from './slices/gigSlice';
import bidSlice from './slices/bidSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    gigs: gigSlice,
    bids: bidSlice,
  },
});
