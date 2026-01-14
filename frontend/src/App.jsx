import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';

import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import GigList from './pages/GigList';
import GigDetails from './pages/GigDetails';
import CreateGig from './pages/CreateGig';
import MyGigs from './pages/MyGigs';
import MyBids from './pages/MyBids';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
          <Navbar />
          <main className="container mx-auto px-4 pt-20 pb-8">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={<Navigate to="/gigs" replace />} />
              <Route path="/gigs" element={<GigList />} />
              <Route path="/gigs/:id" element={<GigDetails />} />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/create-gig" element={
                <ProtectedRoute>
                  <CreateGig />
                </ProtectedRoute>
              } />
              <Route path="/my-gigs" element={
                <ProtectedRoute>
                  <MyGigs />
                </ProtectedRoute>
              } />
              <Route path="/my-bids" element={
                <ProtectedRoute>
                  <MyBids />
                </ProtectedRoute>
              } />
            </Routes>
          </main>
        </div>
      </Router>
    </Provider>
  );
}

export default App;
