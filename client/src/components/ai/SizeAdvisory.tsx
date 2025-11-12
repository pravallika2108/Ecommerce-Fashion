'use client';

import { useState } from 'react';
import { Ruler, X } from 'lucide-react';

interface SizeAdvisoryProps {
  productName?: string;
  availableSizes?: string[];
}

export default function SizeAdvisory({ 
  productName = 'this item',
  availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
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
  const [apiKey, setApiKey] = useState('');

  const getRecommendation = async () => {
    if (!apiKey) {
      alert('Please set your API key first');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 512,
          messages: [
            {
              role: 'user',
              content: `As a fashion sizing expert, recommend the best size for ${productName}.
              
Available sizes: ${availableSizes.join(', ')}

Customer measurements:
- Height: ${measurements.height} cm
- Weight: ${measurements.weight} kg
- Chest: ${measurements.chest} cm
- Waist: ${measurements.waist} cm

Provide a concise size recommendation with reasoning.`,
            },
          ],
        }),
      });

      const data = await response.json();
      setRecommendation(data.content[0].text);
    } catch (error) {
      console.error('Error:', error);
      setRecommendation('Unable to get recommendation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <Ruler className="w-4 h-4" />
        Find My Size
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Smart Size Advisory</h3>
              <button onClick={() => setIsOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            {!apiKey ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Enter your Anthropic API key to use the size advisor.
                </p>
                <input
                  type="password"
                  placeholder="sk-ant-..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                />
                <p className="text-xs text-gray-500">
                  Get your key from{' '}
                  <a
                    href="https://console.anthropic.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    console.anthropic.com
                  </a>
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Height (cm)</label>
                    <input
                      type="number"
                      value={measurements.height}
                      onChange={(e) => setMeasurements({ ...measurements, height: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                      placeholder="170"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Weight (kg)</label>
                    <input
                      type="number"
                      value={measurements.weight}
                      onChange={(e) => setMeasurements({ ...measurements, weight: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                      placeholder="65"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Chest (cm)</label>
                    <input
                      type="number"
                      value={measurements.chest}
                      onChange={(e) => setMeasurements({ ...measurements, chest: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                      placeholder="90"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Waist (cm)</label>
                    <input
                      type="number"
                      value={measurements.waist}
                      onChange={(e) => setMeasurements({ ...measurements, waist: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                      placeholder="75"
                    />
                  </div>
                </div>

                <button
                  onClick={getRecommendation}
                  disabled={isLoading}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 mb-4"
                >
                  {isLoading ? 'Analyzing...' : 'Get Size Recommendation'}
                </button>

                {recommendation && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-bold text-green-800 mb-2">Recommendation:</h4>
                    <p className="text-sm text-green-700">{recommendation}</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
