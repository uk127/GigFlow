import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { gigsStart, myGigsSuccess, gigsFailure } from '../store/slices/gigSlice';
import { gigAPI } from '../services/api';

const MyGigs = () => {
  const [page, setPage] = useState(1);
  const dispatch = useDispatch();
  const { myGigs, isLoading, error, myGigsPagination } = useSelector((state) => state.gigs);

  useEffect(() => {
    fetchMyGigs();
  }, [page]);

  const fetchMyGigs = async () => {
    dispatch(gigsStart());
    try {
      const params = { page, limit: 9 };
      const response = await gigAPI.getMyGigs(params);
      dispatch(myGigsSuccess(response.data));
    } catch (error) {
      dispatch(gigsFailure(error.response?.data?.message || 'Failed to fetch your gigs'));
    }
  };

  const handleDeleteGig = async (gigId) => {
    if (!window.confirm('Are you sure you want to delete this gig?')) return;

    try {
      await gigAPI.deleteGig(gigId);
      // Refetch gigs after deletion
      fetchMyGigs();
    } catch (error) {
      dispatch(gigsFailure(error.response?.data?.message || 'Failed to delete gig'));
    }
  };

  return (
    <div className="animate-fadeIn">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              My Gigs
            </h1>
            <p className="text-xl text-gray-600">
              Manage your posted gigs and track their progress
            </p>
          </div>
          <Link
            to="/create-gig"
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Post New Gig
          </Link>
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
          <p className="text-xl text-gray-600 font-medium">Loading your gigs...</p>
        </div>
      ) : myGigs.length === 0 ? (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full mb-6">
            <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-2xl font-semibold text-gray-700 mb-2">No gigs posted yet</h3>
          <p className="text-gray-500 mb-6">Start by creating your first gig to find talented freelancers.</p>
          <Link
            to="/create-gig"
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 inline-flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Your First Gig
          </Link>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center">
                <div className="bg-blue-100 rounded-xl p-3">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Gigs</p>
                  <p className="text-2xl font-bold text-gray-900">{myGigsPagination.total}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center">
                <div className="bg-green-100 rounded-xl p-3">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Gigs</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {myGigs.filter(gig => gig.status === 'open').length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center">
                <div className="bg-purple-100 rounded-xl p-3">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">In Progress</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {myGigs.filter(gig => gig.status === 'in-progress').length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-6 flex items-center justify-between">
            <p className="text-gray-600">
              Showing <span className="font-semibold text-gray-900">{myGigs.length}</span> of{' '}
              <span className="font-semibold text-gray-900">{myGigsPagination.total}</span> gigs
            </p>
          </div>

          {/* Gig Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myGigs.map((gig, index) => (
              <div
                key={gig._id}
                className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden border border-gray-100"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Status Badge */}
                <div className="absolute top-4 right-4 z-10">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                    gig.status === 'open'
                      ? 'bg-green-100 text-green-800'
                      : gig.status === 'in-progress'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    <span className={`w-2 h-2 rounded-full mr-2 ${
                      gig.status === 'open'
                        ? 'bg-green-500'
                        : gig.status === 'in-progress'
                        ? 'bg-blue-500'
                        : 'bg-gray-500'
                    }`}></span>
                    {gig.status}
                  </span>
                </div>

                <div className="p-6">
                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200 pr-20">
                    {gig.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 mb-6 line-clamp-3 text-sm leading-relaxed">
                    {gig.description}
                  </p>

                  {/* Budget and Date */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Budget</p>
                        <p className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                          ₹{gig.budget}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500 mb-1">Posted</p>
                        <p className="text-sm text-gray-700 font-medium">
                          {new Date(gig.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-3 pt-4 border-t border-gray-100">
                    <Link
                      to={`/gigs/${gig._id}`}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 flex items-center justify-center text-sm"
                    >
                      View Details
                    </Link>
                    {gig.status === 'open' && (
                      <button
                        onClick={() => handleDeleteGig(gig._id)}
                        className="bg-red-50 text-red-600 px-4 py-2 rounded-xl font-medium hover:bg-red-100 transition-all duration-200 flex items-center justify-center text-sm"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>

                {/* Hover Effect Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {myGigsPagination.totalPages > 1 && (
            <div className="mt-12 flex justify-center">
              <div className="flex items-center space-x-2 bg-white rounded-xl shadow-lg p-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <div className="px-4 py-2 text-sm font-medium text-gray-700">
                  Page <span className="text-blue-600 font-bold">{page}</span> of{' '}
                  <span className="text-blue-600 font-bold">{myGigsPagination.totalPages}</span>
                </div>

                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === myGigsPagination.totalPages}
                  className="px-4 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MyGigs;
