import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { authAPI } from '../services/api';
import { io } from 'socket.io-client';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const socketRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close notifications dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showNotifications && !event.target.closest('.notification-container')) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

  // Initialize socket connection
  useEffect(() => {
    if (user && !socketRef.current) {
      console.log('Navbar: Initializing socket connection for user:', user._id);
      socketRef.current = io('http://localhost:5000');

      socketRef.current.on('connect', () => {
        console.log('Navbar: Socket connected');
        // Join user's room for notifications
        socketRef.current.emit('joinUserRoom', user._id);
      });

      // Listen for bid acceptance notifications
      socketRef.current.on('hired', (data) => {
        console.log('Navbar: Received hired notification:', data);
        const newNotification = {
          id: Date.now(),
          type: 'hired',
          message: data.message || 'Congratulations! You have been hired!',
          gigTitle: data.gigTitle,
          timestamp: new Date()
        };
        setNotifications(prev => [newNotification, ...prev]);
      });

      socketRef.current.on('disconnect', () => {
        console.log('Navbar: Socket disconnected');
      });
    }

    return () => {
      if (socketRef.current) {
        console.log('Navbar: Cleaning up socket connection');
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [user]);

  // Handle user room joining when user changes
  useEffect(() => {
    if (user && socketRef.current && socketRef.current.connected) {
      console.log('Navbar: Joining user room:', user._id);
      socketRef.current.emit('joinUserRoom', user._id);
    }
  }, [user]);

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      dispatch(logout());
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      dispatch(logout());
      navigate('/login');
    }
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur-md shadow-lg' 
        : 'bg-gradient-to-r from-blue-600 to-purple-600'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link 
            to="/" 
            className={`text-2xl font-bold transition-colors duration-300 ${
              isScrolled ? 'text-blue-600' : 'text-white'
            } hover:scale-105 transform`}
          >
            GigFlow
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/gigs" 
              className={`transition-all duration-300 hover:scale-105 ${
                isScrolled 
                  ? 'text-gray-700 hover:text-blue-600' 
                  : 'text-white/90 hover:text-white'
              }`}
            >
              Browse Gigs
            </Link>
            
            {user ? (
              <>
                <Link 
                  to="/dashboard" 
                  className={`transition-all duration-300 hover:scale-105 ${
                    isScrolled 
                      ? 'text-gray-700 hover:text-blue-600' 
                      : 'text-white/90 hover:text-white'
                  }`}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/create-gig" 
                  className={`transition-all duration-300 hover:scale-105 ${
                    isScrolled 
                      ? 'text-gray-700 hover:text-blue-600' 
                      : 'text-white/90 hover:text-white'
                  }`}
                >
                  Post Gig
                </Link>
                <Link 
                  to="/my-gigs" 
                  className={`transition-all duration-300 hover:scale-105 ${
                    isScrolled 
                      ? 'text-gray-700 hover:text-blue-600' 
                      : 'text-white/90 hover:text-white'
                  }`}
                >
                  My Gigs
                </Link>
                <Link 
                  to="/my-bids" 
                  className={`transition-all duration-300 hover:scale-105 ${
                    isScrolled 
                      ? 'text-gray-700 hover:text-blue-600' 
                      : 'text-white/90 hover:text-white'
                  }`}
                >
                  My Bids
                </Link>
                <div className="flex items-center space-x-3">
                  {/* Notification Bell */}
                  <div className="relative notification-container">
                    <button
                      onClick={handleNotificationClick}
                      className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 ${
                        isScrolled
                          ? 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
                          : 'text-white/90 hover:text-white hover:bg-white/20'
                      }`}
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM13.6 7.6a4 4 0 00-7.2 0v4.8a4 4 0 01-1.6 3.2H9a2 2 0 004 0h2.8a4 4 0 01-1.6-3.2V7.6z" />
                      </svg>
                      {notifications.length > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {notifications.length}
                        </span>
                      )}
                    </button>

                    {/* Notification Dropdown */}
                    {showNotifications && (
                      <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                        <div className="p-4 border-b border-gray-200">
                          <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
                        </div>
                        <div className="max-h-64 overflow-y-auto">
                          {notifications.length === 0 ? (
                            <div className="p-4 text-center text-gray-500">
                              No notifications yet
                            </div>
                          ) : (
                            notifications.map((notification) => (
                              <div key={notification.id} className="p-4 border-b border-gray-100 hover:bg-gray-50">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center mb-2">
                                      <span className="text-green-600 mr-2">🎉</span>
                                      <span className="font-semibold text-gray-800">Bid Accepted!</span>
                                    </div>
                                    <p className="text-sm text-gray-700 mb-1">{notification.message}</p>
                                    {notification.gigTitle && (
                                      <p className="text-sm text-blue-600 font-medium">
                                        Gig: {notification.gigTitle}
                                      </p>
                                    )}
                                    <p className="text-xs text-gray-500 mt-1">
                                      {notification.timestamp.toLocaleString()}
                                    </p>
                                  </div>
                                  <button
                                    onClick={() => removeNotification(notification.id)}
                                    className="ml-2 text-gray-400 hover:text-gray-600"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                        {notifications.length > 0 && (
                          <div className="p-3 border-t border-gray-200">
                            <button
                              onClick={() => setNotifications([])}
                              className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
                            >
                              Clear All
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <span className={`font-medium ${
                    isScrolled ? 'text-gray-700' : 'text-white'
                  }`}>
                    Welcome, {user.name}
                  </span>
                  <button
                    onClick={handleLogout}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105 ${
                      isScrolled
                        ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600'
                        : 'bg-white/20 backdrop-blur-sm text-white hover:bg-white/30'
                    }`}
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className={`transition-all duration-300 hover:scale-105 ${
                    isScrolled 
                      ? 'text-gray-700 hover:text-blue-600' 
                      : 'text-white/90 hover:text-white'
                  }`}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-green-400 to-blue-500 text-white px-6 py-2 rounded-lg font-medium hover:from-green-500 hover:to-blue-600 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`md:hidden transition-colors duration-300 ${
              isScrolled ? 'text-gray-700' : 'text-white'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/20">
            <div className="flex flex-col space-y-3">
              <Link 
                to="/gigs" 
                className={`transition-colors duration-300 ${
                  isScrolled ? 'text-gray-700 hover:text-blue-600' : 'text-white/90 hover:text-white'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Browse Gigs
              </Link>
              {user ? (
                <>
                  <Link 
                    to="/dashboard" 
                    className={`transition-colors duration-300 ${
                      isScrolled ? 'text-gray-700 hover:text-blue-600' : 'text-white/90 hover:text-white'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    to="/create-gig" 
                    className={`transition-colors duration-300 ${
                      isScrolled ? 'text-gray-700 hover:text-blue-600' : 'text-white/90 hover:text-white'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Post Gig
                  </Link>
                  <Link 
                    to="/my-gigs" 
                    className={`transition-colors duration-300 ${
                      isScrolled ? 'text-gray-700 hover:text-blue-600' : 'text-white/90 hover:text-white'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    My Gigs
                  </Link>
                  <Link 
                    to="/my-bids" 
                    className={`transition-colors duration-300 ${
                      isScrolled ? 'text-gray-700 hover:text-blue-600' : 'text-white/90 hover:text-white'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    My Bids
                  </Link>
                  <div className="flex items-center justify-between pt-3 border-t border-white/20">
                    <span className={isScrolled ? 'text-gray-700' : 'text-white'}>
                      Welcome, {user.name}
                    </span>
                    <button
                      onClick={handleLogout}
                      className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-lg text-sm hover:from-red-600 hover:to-pink-600 transition-all duration-300"
                    >
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className={`transition-colors duration-300 ${
                      isScrolled ? 'text-gray-700 hover:text-blue-600' : 'text-white/90 hover:text-white'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="bg-gradient-to-r from-green-400 to-blue-500 text-white px-6 py-2 rounded-lg hover:from-green-500 hover:to-blue-600 transition-all duration-300 text-center"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
