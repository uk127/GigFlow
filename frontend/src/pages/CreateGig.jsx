import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { gigCreateSuccess, gigsFailure } from '../store/slices/gigSlice';
import { gigAPI } from '../services/api';

const CreateGig = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget: '',
  });
  const [isFocused, setIsFocused] = useState({
    title: false,
    description: false,
    budget: false,
  });
  const [charCount, setCharCount] = useState({
    title: 0,
    description: 0,
  });
  const { title, description, budget } = formData;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { error } = useSelector((state) => state.gigs);

  useEffect(() => {
    setCharCount({
      title: title.length,
      description: description.length,
    });
  }, [title, description]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const onFocus = (field) => {
    setIsFocused({ ...isFocused, [field]: true });
  };

  const onBlur = (field) => {
    setIsFocused({ ...isFocused, [field]: false });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await gigAPI.createGig({
        title,
        description,
        budget: parseFloat(budget),
      });
      dispatch(gigCreateSuccess(response.data.gig));
      navigate('/my-gigs');
    } catch (error) {
      dispatch(gigsFailure(error.response?.data?.message || 'Failed to create gig'));
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fadeIn">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full mb-4">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
          Post a New Gig
        </h1>
        <p className="text-xl text-gray-600">
          Share your project requirements and find the perfect freelancer
        </p>
      </div>
      
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20">
        {error && (
          <div className="mb-8 bg-red-50 border-l-4 border-red-500 p-6 rounded-xl animate-slideDown">
            <div className="flex items-center">
              <svg className="h-6 w-6 text-red-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}
        
        <form onSubmit={onSubmit} className="space-y-8">
          {/* Title Field */}
          <div className="space-y-2">
            <label className="block text-lg font-semibold text-gray-800 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Gig Title *
            </label>
            <div className="relative">
              <input
                type="text"
                name="title"
                value={title}
                onChange={onChange}
                onFocus={() => onFocus('title')}
                onBlur={() => onBlur('title')}
                className={`w-full px-4 py-4 text-lg border-2 rounded-xl focus:outline-none transition-all duration-300 bg-white/50 backdrop-blur-sm ${
                  isFocused.title 
                    ? 'border-blue-500 ring-4 ring-blue-500/20' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                placeholder="e.g., Build a responsive React website"
                required
                maxLength="100"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-400">
                {charCount.title}/100
              </div>
            </div>
          </div>

          {/* Description Field */}
          <div className="space-y-2">
            <label className="block text-lg font-semibold text-gray-800 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Project Description *
            </label>
            <div className="relative">
              <textarea
                name="description"
                value={description}
                onChange={onChange}
                onFocus={() => onFocus('description')}
                onBlur={() => onBlur('description')}
                className={`w-full px-4 py-4 text-lg border-2 rounded-xl focus:outline-none transition-all duration-300 bg-white/50 backdrop-blur-sm resize-none h-40 ${
                  isFocused.description 
                    ? 'border-blue-500 ring-4 ring-blue-500/20' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                placeholder="Describe the project requirements, expected deliverables, timeline, and any specific skills needed..."
                required
                maxLength="1000"
              />
              <div className="absolute right-3 bottom-3 text-sm text-gray-400">
                {charCount.description}/1000
              </div>
            </div>
          </div>

          {/* Budget Field */}
          <div className="space-y-2">
            <label className="block text-lg font-semibold text-gray-800 flex items-center">
              <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Budget (₹) *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="text-2xl text-gray-400">₹</span>
              </div>
              <input
                type="number"
                name="budget"
                value={budget}
                onChange={onChange}
                onFocus={() => onFocus('budget')}
                onBlur={() => onBlur('budget')}
                className={`w-full pl-12 pr-4 py-4 text-lg border-2 rounded-xl focus:outline-none transition-all duration-300 bg-white/50 backdrop-blur-sm ${
                  isFocused.budget 
                    ? 'border-green-500 ring-4 ring-green-500/20' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                placeholder="500"
                required
                min="1"
                step="0.01"
              />
            </div>
            <p className="text-sm text-gray-500">
              Set a competitive budget to attract qualified freelancers
            </p>
          </div>

          {/* Tips Section */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Pro Tips for a Great Gig Post
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Be specific about required skills and experience level
              </li>
              <li className="flex items-start">
                <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Include clear deliverables and timeline expectations
              </li>
              <li className="flex items-start">
                <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Research market rates for competitive pricing
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/my-gigs')}
              className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200 transform hover:scale-105"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-500/50 transition-all duration-200 transform hover:scale-105 flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Post Gig
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGig;
