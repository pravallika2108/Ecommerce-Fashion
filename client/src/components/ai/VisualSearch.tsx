'use client';

import { useState } from 'react';
import { Camera, Upload, X, Search } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ecommerce-fashion-tj0t.onrender.com';

export default function VisualSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [imageType, setImageType] = useState<string>('image/jpeg');
  const [results, setResults] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please upload a valid image file');
        return;
      }
      
      setError('');
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setImageType(file.type);
      };
      reader.readAsDataURL(file);
    }
  };

  const searchSimilarItems = async () => {
    if (!image) {
      setError('Please upload an image first');
      return;
    }

    setIsLoading(true);
    setResults('');
    setError('');

    try {
      // Remove data URL prefix to get base64 string
      const base64Image = image.split(',')[1];

      console.log('Sending request to:', `${API_URL}/api/ai/visual-search`);

      const response = await axios.post(`${API_URL}/api/ai/visual-search`, {
        imageBase64: base64Image,
        mediaType: imageType,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30 second timeout
      });

      setResults(response.data.analysis);
    } catch (error: any) {
      console.error('Visual Search Error:', error);
      
      let errorMessage = 'Unable to analyze image. Please try again.';
      
      if (error.response) {
        // Server responded with error
        errorMessage = error.response.data?.error || error.response.data?.details || errorMessage;
      } else if (error.request) {
        // Request made but no response
        errorMessage = 'No response from server. Please check your connection.';
      } else {
        // Error setting up request
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const resetSearch = () => {
    setImage(null);
    setResults('');
    setError('');
    setImageType('image/jpeg');
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
      >
        <Camera className="w-4 h-4" />
        Visual Search
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">AI Visual Search</h3>
              <button
                onClick={() => {
                  setIsOpen(false);
                  resetSearch();
                }}
                className="hover:bg-gray-100 rounded p-1 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Upload a photo of clothing to find similar items and get style suggestions
            </p>

            <div className="mb-4">
              {!image ? (
                <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-12 h-12 text-gray-400 mb-3" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or drag and
                      drop
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG, or JPEG (Max 5MB)</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </label>
              ) : (
                <div className="relative">
                  <img
                    src={image}
                    alt="Uploaded"
                    className="w-full h-64 object-contain rounded-lg bg-gray-50"
                  />
                  <button
                    onClick={resetSearch}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {image && (
              <button
                onClick={searchSimilarItems}
                disabled={isLoading}
                className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed mb-4 flex items-center justify-center gap-2 font-medium transition-colors"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    Analyzing Image...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Find Similar Items
                  </>
                )}
              </button>
            )}

            {results && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 max-h-64 overflow-y-auto">
                <h4 className="font-bold text-purple-800 mb-2 flex items-center gap-2">
                  <Camera className="w-4 h-4" />
                  Analysis Results:
                </h4>
                <p className="text-sm text-purple-700 whitespace-pre-wrap">{results}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
