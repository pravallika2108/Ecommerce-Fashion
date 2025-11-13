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

  const getRecommendation = async () => {
    if (!measurements.height || !measurements.weight || !measurements.chest || !measurements.waist) {
      alert('Please fill in all measurements');
      return;
    }

    setIsLoading(true);
    setRecommendation('');

    try {
      const response = await axios.post(`${API_URL}/api/ai/size-recommendation`, {
        productName,
        measurements,
        availableSizes,
      });

      setRecommendation(response.data.recommendation);
    } catch (error) {
      console.error('Error:', error);
      setRecommendation('Unable to get recommendation. Please try again.');
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
              <button onClick={handleClose} className="hover:bg-blue-700 rounded p-1 transition-colors">
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
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    value={measurements.height}
                    onChange={(e) =>
                      setMeasurements({ ...measurements, height: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 170"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    value={measurements.weight}
                    onChange={(e) =>
                      setMeasurements({ ...measurements, weight: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 65"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Chest (cm)
                  </label>
                  <input
                    type="number"
                    value={measurements.chest}
                    onChange={(e) =>
                      setMeasurements({ ...measurements, chest: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 90"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Waist (cm)
                  </label>
                  <input
                    type="number"
                    value={measurements.waist}
                    onChange={(e) =>
                      setMeasurements({ ...measurements, waist: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 75"
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
            </div>
          </div>
        </div>
      )}
    </>
  );
}
