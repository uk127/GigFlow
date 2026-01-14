import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { gigDetailsSuccess, gigsFailure } from '../store/slices/gigSlice';
import { gigBidsSuccess, bidCreateSuccess, bidUpdateSuccess, bidsStart, bidsFailure } from '../store/slices/bidSlice';
import { gigAPI, bidAPI } from '../services/api';

const GigDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { currentGig, isLoading: gigLoading } = useSelector((state) => state.gigs);
  const { gigBids, isLoading: bidsLoading, error } = useSelector((state) => state.bids);

  const [bidForm, setBidForm] = useState({
    message: '',
    price: '',
  });
  const [showBidForm, setShowBidForm] = useState(false);
  const [hasUserBid, setHasUserBid] = useState(false);

  useEffect(() => {
    fetchGigDetails();
  }, [id]);

  useEffect(() => {
    if (currentGig && user) {
      // Check if user is the gig owner
      if (currentGig.ownerId._id === user._id) {
        fetchGigBids();
      } else {
        // Check if user has already bid on this gig
        checkUserBid();
      }
    }
  }, [currentGig, user]);

  const fetchGigDetails = async () => {
    try {
      const response = await gigAPI.getGigById(id);
      dispatch(gigDetailsSuccess(response.data.gig));
    } catch (error) {
      dispatch(gigsFailure(error.response?.data?.message || 'Failed to fetch gig details'));
    }
  };

  const fetchGigBids = async () => {
    dispatch(bidsStart());
    try {
      const response = await bidAPI.getBidsByGig(id);
      dispatch(gigBidsSuccess(response.data.bids));
    } catch (error) {
      dispatch(bidsFailure(error.response?.data?.message || 'Failed to fetch bids'));
    }
  };

  const checkUserBid = async () => {
    try {
      const response = await bidAPI.getMyBids();
      const userBids = response.data.bids;
      const existingBid = userBids.find(bid => bid.gigId._id === id);
      setHasUserBid(!!existingBid);
    } catch (error) {
      console.error('Error checking user bid:', error);
    }
  };

  const handleBidSubmit = async (e) => {
    e.preventDefault();
    dispatch(bidsStart());

    try {
      const response = await bidAPI.createBid({
        gigId: id,
        message: bidForm.message,
        price: parseFloat(bidForm.price),
      });
      dispatch(bidCreateSuccess(response.data.bid));
      setHasUserBid(true);
      setShowBidForm(false);
      setBidForm({ message: '', price: '' });
    } catch (error) {
      dispatch(bidsFailure(error.response?.data?.message || 'Failed to submit bid'));
    }
  };

  const handleHireFreelancer = async (bidId) => {
    if (!window.confirm('Are you sure you want to hire this freelancer? This action cannot be undone.')) {
      return;
    }

    dispatch(bidsStart());
    try {
      const response = await bidAPI.hireFreelancer(bidId);
      dispatch(bidUpdateSuccess(response.data.bid));
      // Refresh gig details to get updated status
      await fetchGigDetails();
      // Refresh bids list to show updated statuses
      await fetchGigBids();
      // Show success message
      alert('Freelancer hired successfully! Notifications have been sent.');
    } catch (error) {
      dispatch(bidsFailure(error.response?.data?.message || 'Failed to hire freelancer'));
    }
  };

  const isGigOwner = currentGig && user && currentGig.ownerId._id === user._id;
  const canBid = currentGig && user && currentGig.status === 'open' && currentGig.ownerId._id !== user._id && !hasUserBid;

  if (gigLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full mb-4">
            <svg className="animate-spin h-8 w-8 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p className="text-xl text-gray-600 font-medium">Loading gig details...</p>
        </div>
      </div>
    );
  }

  if (!currentGig) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Gig Not Found</h2>
          <p className="text-gray-600 mb-6">The gig you're looking for doesn't exist or has been removed.</p>
          <Link
            to="/gigs"
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
          >
            Browse Gigs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <Link
              to="/gigs"
              className="text-blue-600 hover:text-blue-700 font-medium flex items-center"
            >
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Gigs
            </Link>
          </div>
          <div className="flex items-center space-x-3">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
              currentGig.status === 'open'
                ? 'bg-green-100 text-green-800'
                : currentGig.status === 'assigned'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              <span className={`w-2 h-2 rounded-full mr-2 ${
                currentGig.status === 'open'
                  ? 'bg-green-500'
                  : currentGig.status === 'assigned'
                  ? 'bg-blue-500'
                  : 'bg-gray-500'
              }`}></span>
              {currentGig.status}
            </span>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                {currentGig.title}
              </h1>
              <div className="flex items-center space-x-6 mb-6">
                <div className="flex items-center text-gray-600">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="font-medium">{currentGig.ownerId.name}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{new Date(currentGig.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                ₹{currentGig.budget}
              </div>
              <div className="text-sm text-gray-500">Budget</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Gig Description */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Project Description</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {currentGig.description}
              </p>
            </div>
          </div>

          {/* Bidding Section for Non-Owners */}
          {!isGigOwner && (
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Submit Your Bid</h2>

              {currentGig.status !== 'open' ? (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <p className="text-gray-600">This gig is no longer accepting bids.</p>
                </div>
              ) : hasUserBid ? (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-600">You have already submitted a bid for this gig.</p>
                </div>
              ) : (
                <>
                  {!showBidForm ? (
                    <div className="text-center py-8">
                      <p className="text-gray-600 mb-6">
                        Ready to take on this project? Submit your competitive bid below.
                      </p>
                      <button
                        onClick={() => setShowBidForm(true)}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
                      >
                        Submit Your Bid
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleBidSubmit} className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Your Message *
                        </label>
                        <textarea
                          value={bidForm.message}
                          onChange={(e) => setBidForm({ ...bidForm, message: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm resize-none h-32"
                          placeholder="Introduce yourself and explain why you're the perfect fit for this project..."
                          required
                          maxLength="500"
                        />
                        <div className="text-sm text-gray-500 mt-1">
                          {bidForm.message.length}/500 characters
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Your Price (₹) *
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <span className="text-xl text-gray-400">₹</span>
                          </div>
                          <input
                            type="number"
                            value={bidForm.price}
                            onChange={(e) => setBidForm({ ...bidForm, price: e.target.value })}
                            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                            placeholder="500"
                            required
                            min="1"
                            step="0.01"
                          />
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          Original budget: ₹{currentGig.budget}
                        </p>
                      </div>

                      {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl">
                          <p className="text-red-700">{error}</p>
                        </div>
                      )}

                      <div className="flex justify-end space-x-4">
                        <button
                          type="button"
                          onClick={() => setShowBidForm(false)}
                          className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={bidsLoading}
                          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center"
                        >
                          {bidsLoading ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Submitting...
                            </>
                          ) : (
                            'Submit Bid'
                          )}
                        </button>
                      </div>
                    </form>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Gig Owner Actions or Bid Status */}
          {isGigOwner ? (
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Gig Management</h3>
              <div className="space-y-3">
                <Link
                  to={`/my-gigs`}
                  className="block w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 text-center"
                >
                  Manage My Gigs
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Bid Status</h3>
              <div className="text-center">
                {hasUserBid ? (
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                ) : (
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-3">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                )}
                <p className={`font-medium ${hasUserBid ? 'text-green-600' : 'text-gray-600'}`}>
                  {hasUserBid ? 'Bid Submitted' : 'No Bid Yet'}
                </p>
              </div>
            </div>
          )}

          {/* Bids List (Only for Gig Owner) */}
          {isGigOwner && (
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Bids Received ({gigBids.length})</h3>

              {bidsLoading ? (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full mb-2">
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                  <p className="text-sm text-gray-600">Loading bids...</p>
                </div>
              ) : gigBids.length === 0 ? (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-3">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-600">No bids received yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {gigBids.map((bid) => (
                    <div
                      key={bid._id}
                      className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow duration-200"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="font-semibold text-gray-800">{bid.freelancerId.name}</div>
                          <div className="text-sm text-gray-500">
                            {new Date(bid.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">₹{bid.price}</div>
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                            bid.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : bid.status === 'hired'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {bid.status}
                          </div>
                        </div>
                      </div>

                      <p className="text-gray-700 text-sm mb-4 line-clamp-3">{bid.message}</p>

                      {bid.status === 'pending' && currentGig.status === 'open' && (
                        <button
                          onClick={() => handleHireFreelancer(bid._id)}
                          disabled={bidsLoading}
                          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                          {bidsLoading ? 'Hiring...' : 'Hire Freelancer'}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GigDetails;
