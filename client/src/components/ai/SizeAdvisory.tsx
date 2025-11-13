'use client';

import { useState } from 'react';
import { Ruler, X } from 'lucide-react';
import axios from 'axios';

interface SizeAdvisoryProps {
  productName?: string;
  availableSizes?: string[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ecommerce-fashion-tj0t.onrender.com';

export default function SizeAdvisory({
  productName = 'this item',
  availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
}: SizeAdvisoryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [measurements, setMeasurements] = useState({
    height: '',
    weight: '',
    chest: '',
    waist: '',
  });
  const [recommendation, setRecommendation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const getRecommendation = async () => {
    // Validate all fields are filled
    if (!measurements.height || !measurements.weight || !measurements.chest || !measurements.waist) {
      setError('Please fill in all measurements');
      return;
    }

    // Validate measurements are positive numbers
    const height = parseFloat(measurements.height);
    const weight = parseFloat(measurements.weight);
    const chest = parseFloat(measurements.chest);
    const waist = parseFloat(measurements.waist);

    if (height <= 0 || weight <= 0 || chest <= 0 || waist <= 0) {
      setError('Please enter valid positive numbers for all measurements');
      return;
    }

    if (height > 300 || weight > 300 || chest > 200 || waist > 200) {
      setError('Please enter realistic measurements');
      return;
    }

    setIsLoading(true);
    setRecommendation('');
    setError('');

    try {
      console.log('Sending request to:', `${API_URL}/api/ai/size-recommendation`);
      console.log('Request data:', {
        productName,
        measurements,
        availableSizes,
      });

      const response = await axios.post(
        `${API_URL}/api/ai/size-recommendation`,
        {
          productName,
          measurements: {
            height: measurements.height,
            weight: measurements.weight,
            chest: measurements.chest,
            waist: measurements.waist,
          },
          availableSizes,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 30000, // 30 second timeout
        }
      );

      console.log('Response:', response.data);
      setRecommendation(response.data.recommendation);
    } catch (error: any) {
      console.error('Size Advisory Error:', error);
      
      let errorMessage = 'Unable to get recommendation. Please try again.';
      
      if (error.response) {
        // Server responded with error status
        console.error('Error response:', error.response.data);
        errorMessage = error.response.data?.error || error.response.data?.details || errorMessage;
      } else if (error.request) {
        // Request made but no response received
        console.error('No response received:', error.request);
        errorMessage = 'No response from server. Please check your connection.';
      } else {
        // Error setting up the request
        console.error('Request setup error:', error.message);
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setMeasurements({
      height: '',
      weight: '',
      chest: '',
      waist: '',
    });
    setRecommendation('');
    setError('');
  };

  const handleClose = () => {
    setIsOpen(false);
    resetForm();
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <Ruler className="w-4 h-4" />
        Find My Size
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Ruler className="w-5 h-5" />
                <h3 className="text-lg font-bold">Smart Size Advisory</h3>
              </div>
              <button 
                onClick={handleClose} 
                className="hover:bg-blue-700 rounded p-1 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                Enter your measurements to get a personalized size recommendation for{' '}
                <strong>{productName}</strong>
              </p>

              {/* Measurement Inputs */}
              <div className="space-y-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Height (cm) *
                  </label>
                  <input
                    type="number"
                    value={measurements.height}
                    onChange={(e) =>
                      setMeasurements({ ...measurements, height: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 170"
                    min="0"
                    max="300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Weight (kg) *
                  </label>
                  <input
                    type="number"
                    value={measurements.weight}
                    onChange={(e) =>
                      setMeasurements({ ...measurements, weight: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 65"
                    min="0"
                    max="300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Chest (cm) *
                  </label>
                  <input
                    type="number"
                    value={measurements.chest}
                    onChange={(e) =>
                      setMeasurements({ ...measurements, chest: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 90"
                    min="0"
                    max="200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Waist (cm) *
                  </label>
                  <input
                    type="number"
                    value={measurements.waist}
                    onChange={(e) =>
                      setMeasurements({ ...measurements, waist: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 75"
                    min="0"
                    max="200"
                  />
                </div>
              </div>

              {/* Available Sizes */}
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Available Sizes:
                </p>
                <div className="flex flex-wrap gap-2">
                  {availableSizes.map((size) => (
                    <span
                      key={size}
                      className="px-3 py-1 bg-blue-50 border border-blue-200 text-blue-700 rounded-full text-sm font-medium"
                    >
                      {size}
                    </span>
                  ))}
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Get Recommendation Button */}
              <button
                onClick={getRecommendation}
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium transition-colors mb-4"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    Analyzing...
                  </span>
                ) : (
                  'Get Size Recommendation'
                )}
              </button>

              {/* Recommendation Result */}
              {recommendation && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-bold text-green-800 mb-2 flex items-center gap-2">
                    <Ruler className="w-4 h-4" />
                    Recommendation:
                  </h4>
                  <p className="text-sm text-green-700 whitespace-pre-wrap">
                    {recommendation}
                  </p>
                </div>
              )}

              {/* How to Measure Guide */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    const guide = document.getElementById('measure-guide');
                    if (guide) {
                      guide.classList.toggle('hidden');
                    }
                  }}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  📏 How to measure yourself?
                </button>
                <div id="measure-guide" className="hidden mt-2 text-xs text-gray-600 space-y-1">
                  <p><strong>Height:</strong> Stand straight against a wall</p>
                  <p><strong>Weight:</strong> Use a scale in the morning</p>
                  <p><strong>Chest:</strong> Measure around the fullest part</p>
                  <p><strong>Waist:</strong> Measure around natural waistline</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
