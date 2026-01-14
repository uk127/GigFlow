import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { gigsStart, myGigsSuccess, gigsFailure } from '../store/slices/gigSlice';
import { bidsStart, myBidsSuccess, bidsFailure } from '../store/slices/bidSlice';
import { gigAPI, bidAPI } from '../services/api';
import { io } from 'socket.io-client';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { myGigs, myGigsPagination, isLoading: gigsLoading } = useSelector((state) => state.gigs);
  const { myBids, isLoading: bidsLoading } = useSelector((state) => state.bids);

  const [statsData, setStatsData] = useState({
    totalGigs: 0,
    totalBids: 0,
    activeProjects: 0,
    successRate: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (user) {
      // Set up real-time socket connection
      const socket = io('http://localhost:5000');

      // Join user's room for notifications
      socket.emit('joinUserRoom', user._id);

      // Listen for activity updates
      socket.on('hired', () => {
        console.log('Dashboard: Received hired notification, refreshing data');
        fetchDashboardData();
      });

      socket.on('bid_rejected', () => {
        console.log('Dashboard: Received rejection notification, refreshing data');
        fetchDashboardData();
      });

      // Listen for focus events to refresh data when returning to dashboard
      const handleFocus = () => {
        console.log('Dashboard: Window focused, refreshing data');
        fetchDashboardData();
      };

      window.addEventListener('focus', handleFocus);

      return () => {
        socket.close();
        window.removeEventListener('focus', handleFocus);
      };
    }
  }, [user]);

  useEffect(() => {
    if (myGigs && myBids) {
      calculateStats();
    }
  }, [myGigs, myBids]);

  const fetchDashboardData = async () => {
    try {
      // Fetch my gigs
      dispatch(gigsStart());
      const gigsResponse = await gigAPI.getMyGigs({ page: 1, limit: 5 });
      dispatch(myGigsSuccess(gigsResponse.data));

      // Fetch my bids
      dispatch(bidsStart());
      const bidsResponse = await bidAPI.getMyBids();
      dispatch(myBidsSuccess(bidsResponse.data.bids));
    } catch (error) {
      console.error('Dashboard data fetch error:', error);
      // Set default values on error
      setStatsData({
        totalGigs: 0,
        totalBids: 0,
        activeProjects: 0,
        successRate: 0
      });
    }
  };

  const calculateStats = () => {
    try {
      const totalGigs = myGigsPagination?.total || 0;
      const totalBids = Array.isArray(myBids) ? myBids.length : 0;
      const activeProjects = Array.isArray(myGigs?.gigs) ? myGigs.gigs.filter(gig => gig?.status === 'assigned').length : 0;
      const hiredBids = Array.isArray(myBids) ? myBids.filter(bid => bid?.status === 'hired').length : 0;
      const successRate = totalBids > 0 ? Math.round((hiredBids / totalBids) * 100) : 0;

      setStatsData({
        totalGigs,
        totalBids,
        activeProjects,
        successRate
      });
    } catch (error) {
      console.error('Error calculating stats:', error);
      setStatsData({
        totalGigs: 0,
        totalBids: 0,
        activeProjects: 0,
        successRate: 0
      });
    }
  };

  const quickActions = [
    {
      title: 'Post a Gig',
      description: 'Share your project requirements',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      ),
      color: 'from-blue-600 to-purple-600',
      to: '/create-gig',
    },
    {
      title: 'Browse Gigs',
      description: 'Find freelance opportunities',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      color: 'from-green-600 to-emerald-600',
      to: '/gigs',
    },
    {
      title: 'My Gigs',
      description: 'Manage your job postings',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      color: 'from-orange-600 to-red-600',
      to: '/my-gigs',
    },
    {
      title: 'My Bids',
      description: 'Track your applications',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: 'from-pink-600 to-rose-600',
      to: '/my-bids',
    },
  ];

  const stats = [
    {
      label: 'Total Gigs Posted',
      value: statsData.totalGigs.toString(),
      change: '+0%',
      isPositive: true,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
    {
      label: 'Total Bids Submitted',
      value: statsData.totalBids.toString(),
      change: '+0%',
      isPositive: true,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
      ),
    },
    // {
    //   label: 'Active Projects',
    //   value: statsData.activeProjects.toString(),
    //   change: '+0%',
    //   isPositive: true,
    //   icon: (
    //     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    //       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    //     </svg>
    //   ),
    // },
    // {
    //   label: 'Success Rate',
    //   value: `${statsData.successRate}%`,
    //   change: '+0%',
    //   isPositive: true,
    //   icon: (
    //     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    //       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    //     </svg>
    //   ),
    // },
  ];

  return (
    <div className="animate-fadeIn">
      {/* Welcome Header */}
      <div className="mb-10">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 text-white shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                Welcome back, {user?.name || 'User'}! 👋
              </h1>
              <p className="text-xl text-blue-100">
                Ready to find amazing opportunities or post your next project?
              </p>
            </div>
            <div className="hidden lg:block">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
                <div className="text-center">
                  <div className="text-3xl font-bold mb-1">GigFlow</div>
                  <div className="text-sm text-blue-100">Your Freelance Hub</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-10">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-3">
                <div className="text-white">{stat.icon}</div>
              </div>
              <span className={`text-sm font-semibold px-2 py-1 rounded-full ${
                stat.isPositive
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}>
                {stat.change}
              </span>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              to={action.to}
              className="group relative bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden border border-gray-100"
            >
              {/* Gradient Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>

              {/* Icon */}
              <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${action.color} rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <div className="text-white">{action.icon}</div>
              </div>

              {/* Content */}
              <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-200">
                {action.title}
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                {action.description}
              </p>

              {/* Arrow */}
              <div className="flex items-center text-blue-600 font-medium text-sm group-hover:text-blue-700 transition-colors duration-200">
                Get Started
                <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Gigs */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800">Recent Gigs</h3>
            <Link to="/my-gigs" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
              View All →
            </Link>
          </div>
          {gigsLoading ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full mb-4">
                <svg className="animate-spin h-8 w-8 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <p className="text-xl text-gray-600 font-medium">Loading your gigs...</p>
            </div>
          ) : Array.isArray(myGigs) && myGigs.length > 0 ? (
            <div className="space-y-4">
              {myGigs.slice(0, 3).map((gig) => (
                <div key={gig?._id || Math.random()} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1 line-clamp-1">{gig?.title || 'Untitled Gig'}</h4>
                    <p className="text-sm text-gray-600 line-clamp-1">{gig?.description || 'No description'}</p>
                    <div className="flex items-center mt-2 text-sm text-gray-500">
                      <span className="font-medium text-green-600">₹{gig?.budget || 0}</span>
                      <span className="mx-2">•</span>
                      <span>{gig?.createdAt ? new Date(gig.createdAt).toLocaleDateString() : 'Unknown date'}</span>
                    </div>
                  </div>
                  <Link
                    to={`/gigs/${gig?._id}`}
                    className="ml-4 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 text-sm"
                  >
                    View
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-gray-600 mb-4">No gigs posted yet</p>
              <Link
                to="/create-gig"
                className="inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Post Your First Gig
              </Link>
            </div>
          )}
        </div>

        {/* Recent Bids */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800">Recent Bids</h3>
            <Link to="/my-bids" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
              View All →
            </Link>
          </div>
          {bidsLoading ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-pink-600 to-rose-600 rounded-full mb-4">
                <svg className="animate-spin h-8 w-8 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <p className="text-xl text-gray-600 font-medium">Loading your bids...</p>
            </div>
          ) : Array.isArray(myBids) && myBids.length > 0 ? (
            <div className="space-y-4">
              {myBids.slice(0, 3).map((bid) => (
                <div key={bid?._id || Math.random()} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1 line-clamp-1">{bid?.gigId?.title || 'Gig Title'}</h4>
                    <p className="text-sm text-gray-600 line-clamp-1">{bid?.message || 'No message'}</p>
                    <div className="flex items-center mt-2 text-sm text-gray-500">
                      <span className={`font-medium px-2 py-1 rounded-full text-xs ${
                        bid?.status === 'hired'
                          ? 'bg-green-100 text-green-800'
                          : bid?.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {bid?.status || 'unknown'}
                      </span>
                      <span className="mx-2">•</span>
                      <span className="font-medium text-green-600">₹{bid?.price || 0}</span>
                      <span className="mx-2">•</span>
                      <span>{bid?.createdAt ? new Date(bid.createdAt).toLocaleDateString() : 'Unknown date'}</span>
                    </div>
                  </div>
                  <Link
                    to={`/gigs/${bid?.gigId?._id}`}
                    className="ml-4 bg-pink-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-pink-700 transition-colors duration-200 text-sm"
                  >
                    View Gig
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
              </div>
              <p className="text-gray-600 mb-4">No bids submitted yet</p>
              <Link
                to="/gigs"
                className="inline-flex items-center bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl font-medium hover:from-green-700 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Browse Gigs
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Tips Section */}
      <div className="mt-10 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-200">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <svg className="w-6 h-6 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          Getting Started Tips
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start space-x-3">
            <div className="bg-blue-100 rounded-full p-2 flex-shrink-0">
              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-1">Complete Your Profile</h4>
              <p className="text-sm text-gray-600">Add details about your skills and experience to attract better opportunities.</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="bg-purple-100 rounded-full p-2 flex-shrink-0">
              <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-1">Start Browsing</h4>
              <p className="text-sm text-gray-600">Explore available gigs and submit competitive bids to win projects.</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="bg-green-100 rounded-full p-2 flex-shrink-0">
              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-1">Post Your First Gig</h4>
              <p className="text-sm text-gray-600">Share your project requirements and find the perfect freelancer for your needs.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
