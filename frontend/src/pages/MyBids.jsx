import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { myBidsSuccess, bidsStart, bidsFailure } from '../store/slices/bidSlice';
import { bidAPI } from '../services/api';
import { io } from 'socket.io-client';

const MyBids = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { myBids, isLoading, error } = useSelector((state) => state.bids);
  const [filter, setFilter] = useState('all');
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (user) {
      fetchMyBids();

      // Set up real-time socket connection
      const newSocket = io('http://localhost:5000');
      setSocket(newSocket);

      // Join user's room for notifications
      console.log('Joining user room with ID:', user._id);
      newSocket.emit('joinUserRoom', user._id);

      // Listen for connection
      newSocket.on('connect', () => {
        console.log('Socket connected:', newSocket.id);
      });

      // Listen for bid status updates
      newSocket.on('hired', (data) => {
        console.log('🎉 Received hired notification:', data);
        // Refresh bids to show updated status
        fetchMyBids();
      });

      newSocket.on('bid_rejected', (data) => {
        console.log('❌ Received rejection notification:', data);
        // Refresh bids to show updated status
        fetchMyBids();
      });

      // Listen for disconnect
      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
      });

      return () => {
        newSocket.close();
      };
    }
  }, [user]);

  const fetchMyBids = async () => {
    dispatch(bidsStart());
    try {
      const response = await bidAPI.getMyBids();
      dispatch(myBidsSuccess(response.data.bids));
    } catch (error) {
      dispatch(bidsFailure(error.response?.data?.message || 'Failed to fetch your bids'));
    }
  };

  const filteredBids = (myBids || []).filter(bid => {
    if (filter === 'all') return true;
    return bid.status === filter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'hired': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'hired': return '✅';
      case 'rejected': return '❌';
      default: return '❓';
    }
  };

  const getGigStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800';
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Debug: Always show something to test if component renders
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Please Log In</h2>
          <p className="text-gray-600 mb-6">You need to be logged in to view your bids.</p>
          <a href="/login" className="bg-blue-600 text-white px-6 py-3 rounded-lg">
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          My Bids
        </h1>
        <p className="text-xl text-gray-600">
          Track your submitted bids and their status
        </p>
      </div>

      {/* Stats Overview */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="bg-blue-100 rounded-xl p-3">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Bids</p>
              <p className="text-2xl font-bold text-gray-900">{myBids.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="bg-yellow-100 rounded-xl p-3">
              <span className="text-xl">⏳</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">
                {myBids.filter(bid => bid.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="bg-green-100 rounded-xl p-3">
              <span className="text-xl">✅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Hired</p>
              <p className="text-2xl font-bold text-gray-900">
                {myBids.filter(bid => bid.status === 'hired').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="bg-red-100 rounded-xl p-3">
              <span className="text-xl">❌</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-gray-900">
                {myBids.filter(bid => bid.status === 'rejected').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6">
        <div className="bg-white rounded-2xl shadow-lg p-2 border border-gray-100">
          <div className="flex space-x-2">
            {[
              { key: 'all', label: 'All Bids', count: myBids.length },
              { key: 'pending', label: 'Pending', count: myBids.filter(b => b.status === 'pending').length },
              { key: 'hired', label: 'Hired', count: myBids.filter(b => b.status === 'hired').length },
              { key: 'rejected', label: 'Rejected', count: myBids.filter(b => b.status === 'rejected').length }
            ].map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  filter === key
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                {label} ({count})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-8 bg-red-50 border-l-4 border-red-500 p-6 rounded-xl shadow-lg animate-slideDown">
          <div className="flex items-center">
            <svg className="h-6 w-6 text-red-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full mb-4">
            <svg className="animate-spin h-8 w-8 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p className="text-xl text-gray-600 font-medium">Loading your bids...</p>
        </div>
      ) : filteredBids.length === 0 ? (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full mb-6">
            <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-2xl font-semibold text-gray-700 mb-2">
            {filter === 'all' ? 'No bids submitted yet' : `No ${filter} bids`}
          </h3>
          <p className="text-gray-500 mb-6">
            {filter === 'all'
              ? 'Start bidding on gigs to see your applications here.'
              : `You don't have any ${filter} bids yet.`
            }
          </p>
          {filter === 'all' && (
            <Link
              to="/gigs"
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 inline-flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Browse Gigs to Bid On
            </Link>
          )}
        </div>
      ) : (
        <>
          {/* Results Count */}
          <div className="mb-6 flex items-center justify-between">
            <p className="text-gray-600">
              Showing <span className="font-semibold text-gray-900">{filteredBids.length}</span> of{' '}
              <span className="font-semibold text-gray-900">{myBids.length}</span> bids
            </p>
            <div className="text-sm text-gray-500">
              Sorted by most recent
            </div>
          </div>

          {/* Bids Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBids.map((bid, index) => (
              <div
                key={bid._id}
                className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden border border-gray-100"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Status Badge */}
                <div className="absolute top-4 right-4 z-10">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(bid.status)} ${
                    bid.status === 'hired' ? 'ring-2 ring-green-300 animate-pulse' : ''
                  }`}>
                    <span className="mr-2">{getStatusIcon(bid.status)}</span>
                    {bid.status === 'hired' ? '🎉 HIRED!' : bid.status.toUpperCase()}
                  </div>
                </div>

                <div className="p-6">
                  {/* Gig Title */}
                  <Link
                    to={`/gigs/${bid.gigId._id}`}
                    className="block mb-4"
                  >
                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200 pr-20">
                      {bid.gigId.title}
                    </h3>
                  </Link>

                  {/* Bid Price */}
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-1">Your Bid</p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                      ₹{bid.price}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Gig Budget: ₹{bid.gigId.budget}
                    </p>
                  </div>

                  {/* Bid Message */}
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-2">Your Message</p>
                    <p className="text-gray-700 text-sm line-clamp-3 bg-gray-50 p-3 rounded-lg">
                      {bid.message}
                    </p>
                  </div>

                  {/* Gig Status */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Gig Status</span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${getGigStatusColor(bid.gigId.status)}`}>
                        {bid.gigId.status}
                      </span>
                    </div>
                  </div>

                  {/* Bid Date */}
                  <div className="mb-6">
                    <p className="text-sm text-gray-500">
                      Submitted {new Date(bid.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-3">
                    <Link
                      to={`/gigs/${bid.gigId._id}`}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 flex items-center justify-center text-sm"
                    >
                      View Gig
                      <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </Link>
                  </div>
                </div>

                {/* Hover Effect Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default MyBids;
