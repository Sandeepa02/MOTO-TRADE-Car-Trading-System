import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PreferencePanel from '../components/PreferencePanel';
import RecommendationCard from '../components/RecommendationCard';
import AlternativeCard from '../components/AlternativeCard';
import { API_CONFIG } from '../config/apiConfig';

// System Prompt for AI - return only IDs from provided vehicles
const SYSTEM_PROMPT = `You are an expert automotive consultant AI. Your task is to recommend 3 vehicles based on user preferences from the available vehicle database.

IMPORTANT INSTRUCTIONS:
1. You MUST respond ONLY with a valid JSON object in this exact format (no additional text):
{
  "primaryId": "string",
  "primaryDescription": "string",
  "alternatives": [
    { "id": "string", "tag": "string" },
    { "id": "string", "tag": "string" }
  ]
}

2. Match vehicles to user's filters:
   - Budget: Select vehicles within the min-max price range (in LKR)
   - Usage: Consider primary use case (daily commute, weekend adventure, family trips)
   - Vehicle Type: Match selected type (sedan, SUV, hatchback, truck, cab, etc.)
   - Features: Prioritize vehicles with requested features (safety, eco, leather, AWD)

3. Provide logical recommendations:
   - Primary recommendation should be the BEST match
   - Alternatives should be viable options with different strengths
   - Add appropriate tags like "Best Value", "Most Efficient", "Best for Family", etc.

4. CRITICAL: Choose only from the provided AVAILABLE VEHICLES list.
5. CRITICAL: Do not invent vehicles, names, model years, IDs, or image URLs.
6. If no perfect match exists, select the closest available IDs from the provided list only.`;

const AISuggestion = () => {
  const navigate = useNavigate();
  const fallbackVehicleImage = 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=1200&q=80';
  
  // State to capture all filter values
  const [filters, setFilters] = useState({
    budget: { min: 10000000, max: 10000000 },
    usage: null,
    vehicleType: null,
    features: []
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [recommendations, setRecommendations] = useState(null);
  const [error, setError] = useState(null);
  const [infoMessage, setInfoMessage] = useState('');
  const [loadingStep, setLoadingStep] = useState('');
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [vehicleDatabase, setVehicleDatabase] = useState([]);

  // Fetch vehicles from database on component mount
  React.useEffect(() => {
    fetchVehicleDatabase();
  }, []);

  React.useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const timer = setInterval(() => {
      setCooldownSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownSeconds]);

  const fetchVehicleDatabase = async () => {
    try {
      const response = await fetch(`${API_CONFIG.BACKEND_API_URL}/vehicles`);
      if (!response.ok) {
        throw new Error('Failed to fetch vehicle database');
      }
      const data = await response.json();
      setVehicleDatabase(data.data || []);
    } catch (err) {
      console.error('Error fetching vehicle database:', err);
      setError('Failed to load vehicle database. Please ensure the backend server is running.');
    }
  };

  const formatPrice = (price) => {
    const value = Number(price);
    if (Number.isNaN(value) || value <= 0) return 'Price on request';
    return `Rs. ${(value / 1000000).toFixed(1)}M`;
  };

  const withCardDefaults = (vehicle, extra = {}) => ({
    ...vehicle,
    id: vehicle._id || vehicle.id,
    image: vehicle.image || fallbackVehicleImage,
    priceFormatted: vehicle.priceFormatted || formatPrice(vehicle.price),
    rating: Number(vehicle.rating ?? 0),
    features: Array.isArray(vehicle.features) ? vehicle.features.slice(0, 5) : [],
    fuelType: vehicle.fuelType || 'N/A',
    transmission: vehicle.transmission || 'N/A',
    ...extra
  });

  const buildRecommendationsFromDatabase = (rawRecommendations, allowedVehicles) => {
    if (!vehicleDatabase || vehicleDatabase.length === 0) {
      return null;
    }

    const allowedIds = new Set(
      (Array.isArray(allowedVehicles) ? allowedVehicles : vehicleDatabase)
        .map((vehicle) => String(vehicle._id || vehicle.id))
    );
    const candidatePool = vehicleDatabase.filter((vehicle) => allowedIds.has(String(vehicle._id || vehicle.id)));
    const pool = candidatePool.length > 0 ? candidatePool : vehicleDatabase;

    const byId = new Map(vehicleDatabase.map((vehicle) => [String(vehicle._id || vehicle.id), vehicle]));
    const aiPrimaryId = String(rawRecommendations?.primaryId ?? '');
    const aiPrimaryFromDb = byId.get(aiPrimaryId);
    const primaryFromDb = aiPrimaryFromDb && allowedIds.has(String(aiPrimaryFromDb._id || aiPrimaryFromDb.id))
      ? aiPrimaryFromDb
      : pool[0];
    const usedIds = new Set([String(primaryFromDb._id || primaryFromDb.id)]);

    const aiAlternatives = Array.isArray(rawRecommendations?.alternatives) ? rawRecommendations.alternatives : [];
    const alternativesFromDb = [];

    aiAlternatives.forEach((item) => {
      const id = String(item?.id ?? '');
      const matched = byId.get(id);
      const matchedId = String(matched?._id || matched?.id || '');
      if (matched && !usedIds.has(matchedId) && alternativesFromDb.length < 2) {
        usedIds.add(matchedId);
        alternativesFromDb.push(withCardDefaults(matched, { tag: item?.tag || 'Alternative' }));
      }
    });

    for (const vehicle of pool) {
      if (alternativesFromDb.length >= 2) break;
      const id = String(vehicle._id || vehicle.id);
      if (!usedIds.has(id)) {
        usedIds.add(id);
        alternativesFromDb.push(withCardDefaults(vehicle, { tag: 'Alternative' }));
      }
    }

    return {
      primaryRecommendation: withCardDefaults(primaryFromDb, {
        description: rawRecommendations?.primaryDescription || primaryFromDb.description || 'Recommended based on your selected preferences.'
      }),
      alternativeSuggestions: alternativesFromDb
    };
  };

  // Handle finding match with real AI API call
  const handleFindMatch = (preferences) => {
    if (isLoading || cooldownSeconds > 0) {
      return;
    }

    // Check if database is loaded
    if (!vehicleDatabase || vehicleDatabase.length === 0) {
      setError('Vehicle database not loaded. Please wait a moment or refresh the page.');
      return;
    }

    // Update filters state
    setFilters(preferences);
    setIsLoading(true);
    setShowResults(false);
    setError(null);
    setLoadingStep('Analyzing your preferences...');
    
    // Prepare the user prompt based on filters
    const usageMap = {
      'daily': 'Daily City Commute',
      'weekend': 'Weekend Adventure',
      'family': 'Family Trips'
    };
    
    const vehicleTypeMap = {
      'sedan': 'Compact Sedan',
      'suv': 'Modern SUV',
      'hatchback': 'Family Hatchback',
      'truck': 'Cargo Truck',
      'cab': 'Cab / Taxi'
    };
    
    const featureMap = {
      'safety': 'Safety Assist',
      'eco': 'Fuel Eco Mode',
      'leather': 'Leather Seats',
      'awd': '4x4 AWD'
    };

    const compactVehicles = vehicleDatabase.map((vehicle) => ({
      id: vehicle._id || vehicle.id,
      name: vehicle.name,
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      price: vehicle.price,
      vehicleType: vehicle.vehicleType,
      fuelType: vehicle.fuelType,
      rating: vehicle.rating,
      features: Array.isArray(vehicle.features) ? vehicle.features.slice(0, 5) : []
    }));

    const filteredVehicles = compactVehicles
      .filter((vehicle) => vehicle.price >= preferences.budget.min && vehicle.price <= preferences.budget.max)
      .filter((vehicle) => !preferences.vehicleType || vehicle.vehicleType === preferences.vehicleType);

    const aiVehicleInput = (filteredVehicles.length > 0 ? filteredVehicles : compactVehicles).slice(0, 20);

    const userPrompt = `Recommend 1 best vehicle and 2 alternatives as valid JSON.

BUDGET: Rs. ${(preferences.budget.min / 1000000).toFixed(1)}M to Rs. ${(preferences.budget.max / 1000000).toFixed(1)}M (${preferences.budget.min} - ${preferences.budget.max} LKR)
PRIMARY USAGE: ${preferences.usage ? usageMap[preferences.usage] + ' (' + preferences.usage + ')' : 'Not specified'}
VEHICLE TYPE: ${preferences.vehicleType ? vehicleTypeMap[preferences.vehicleType] + ' (' + preferences.vehicleType + ')' : 'Not specified'}
REQUIRED FEATURES: ${preferences.features.length > 0 ? preferences.features.map(f => featureMap[f]).join(', ') + ' (' + preferences.features.join(', ') + ')' : 'None specified'}

AVAILABLE VEHICLES TO CHOOSE FROM (compact JSON):
${JSON.stringify(aiVehicleInput)}

Please analyze my requirements and suggest the best 3 vehicles from the available database that match my criteria.
Remember: return only vehicle IDs from the provided list.`;

    // Call OpenRouter API
    callOpenRouterAPI(SYSTEM_PROMPT, userPrompt, aiVehicleInput);
  };

  // Function to call OpenRouter API
  const callOpenRouterAPI = async (systemPrompt, userPrompt, allowedVehicles) => {
    try {
      setLoadingStep('Connecting to AI...');
      
      // Check if API key is configured
      if (API_CONFIG.OPENROUTER_API_KEY === 'YOUR_OPENROUTER_API_KEY_HERE') {
        throw new Error('Please configure your OpenRouter API key in src/config/apiConfig.js. Get one from https://openrouter.ai/keys');
      }

      setLoadingStep('Sending request to OpenRouter...');
      
      const response = await fetch(API_CONFIG.OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_CONFIG.OPENROUTER_API_KEY}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Moto Trade AI Suggestion'
        },
        body: JSON.stringify({
          model: API_CONFIG.OPENROUTER_MODEL || 'openrouter/auto',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.1,
          max_tokens: 1200
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `API Error: ${response.status}`);
      }

      setLoadingStep('Processing AI response...');
      const data = await response.json();
      
      console.log('Full API Response:', data);
      
      // Extract the AI's response text (OpenAI-compatible schema)
      const aiResponseText = data.choices?.[0]?.message?.content;
      
      if (!aiResponseText) {
        console.error('No choices/message content found:', data);
        throw new Error('No response from AI. Please try again.');
      }

      console.log('Raw AI Response Length:', aiResponseText.length);
      console.log('Raw AI Response:', aiResponseText);
      
      // Parse JSON from AI response
      let recommendations;
      try {
        // With response_mime_type: "application/json", should be pure JSON
        // But we'll clean markdown just in case
        const cleanJson = aiResponseText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
        recommendations = JSON.parse(cleanJson);
        
        // Validate strict DB-id response structure
        if (!recommendations.primaryId || !Array.isArray(recommendations.alternatives)) {
          throw new Error('Invalid response format from AI');
        }
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        const cleanedText = aiResponseText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
        console.error('Clean JSON Preview:', cleanedText.substring(0, 500));
        
        // Try multiple extraction strategies
        let extractedJson = cleanedText;
        
        // Strategy 1: Try to find complete JSON object
        const jsonMatch = aiResponseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          extractedJson = jsonMatch[0].replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
        }
        
        // Strategy 2: Attempt to fix common issues and parse
        try {
          recommendations = JSON.parse(extractedJson);
          if (recommendations.primaryId && Array.isArray(recommendations.alternatives)) {
            console.log('✓ Successfully parsed after cleanup');
          } else {
            throw new Error('Missing required fields');
          }
        } catch (secondError) {
          console.error('Second parse attempt failed:', secondError);
          
          // Strategy 3: Check if response was truncated
          if (!aiResponseText.includes('}')) {
            console.error('Response appears truncated - no closing brace found');
            throw new Error('AI response was cut off. This usually happens with large requests. Try narrowing your search criteria.');
          }
          
          // Strategy 4: Try to manually build from partial data
          try {
            // Look for the last complete object we can find
            const lastBraceIndex = extractedJson.lastIndexOf('}');
            if (lastBraceIndex > 0) {
              const partialJson = extractedJson.substring(0, lastBraceIndex + 1);
              recommendations = JSON.parse(partialJson);
              if (recommendations.primaryId) {
                console.log('✓ Recovered partial response');
                // Provide empty alternatives if missing
                if (!Array.isArray(recommendations.alternatives)) {
                  recommendations.alternatives = [];
                }
              } else {
                throw new Error('Could not recover primary recommendation');
              }
            } else {
              throw new Error('No valid JSON structure found');
            }
          } catch {
            console.error('All recovery attempts failed...');
            throw new Error('AI returned incomplete data. Please try again with simpler criteria.');
          }
        }
      }
      
      const strictRecommendations = buildRecommendationsFromDatabase(recommendations, allowedVehicles);
      if (!strictRecommendations) {
        throw new Error('No vehicles available to build recommendations.');
      }

      setRecommendations(strictRecommendations);
      setIsLoading(false);
      setShowResults(true);
      
      // Scroll to results
      setTimeout(() => {
        document.getElementById('results-section')?.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }, 100);
      
    } catch (err) {
      console.error('OpenRouter API Error:', err);
      const retryMatch = String(err?.message || '').match(/retry in\s+([\d.]+)s/i);
      if (retryMatch) {
        const seconds = Math.ceil(Number(retryMatch[1]));
        if (!Number.isNaN(seconds) && seconds > 0) {
          setCooldownSeconds(seconds);
        }
      }
      setError(err.message || 'Failed to get AI recommendations. Please check your API key and try again.');
      setIsLoading(false);
      setShowResults(false);
    }
  };

  const handleViewDetails = (vehicle) => {
    if (vehicle?._id || vehicle?.id) {
      navigate(`/car-details/${vehicle._id || vehicle.id}`);
      return;
    }
    setInfoMessage(`Viewing details for ${vehicle.name} is not available right now.`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3 flex items-center justify-center gap-3">
            <img src="/gemini-logo.svg" alt="Gemini" className="w-11 h-11" />
            <span>AI Suggestion Agent</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover your perfect vehicle match powered by intelligent recommendations
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Side - Preference Panel */}
          <div className="animate-fade-in">
            <PreferencePanel
              onFindMatch={handleFindMatch}
              isLoading={isLoading || cooldownSeconds > 0}
            />
          </div>

          {/* Right Side - AI Recommendations */}
          <div id="results-section" className="space-y-6">
            {!showResults && !isLoading && (
              <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-12">
                <div className="mx-auto flex max-w-md flex-col items-center text-center">
                  <div
                    className="mb-6 flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 text-blue-600 ring-1 ring-blue-100"
                    aria-hidden
                  >
                    <svg className="h-11 w-11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold leading-snug text-gray-900 sm:text-[1.65rem]">
                    Ready to Find Your Perfect Match?
                  </h3>
                  <p className="mt-3 text-base leading-relaxed text-gray-600">
                    Set your preferences on the left and let our AI suggest the ideal vehicle for you
                  </p>
                  <ul className="mt-8 flex w-full flex-col items-stretch gap-3 text-sm text-gray-600 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-8 sm:gap-y-2">
                    <li className="flex items-center justify-center gap-2 sm:justify-start">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                        ✓
                      </span>
                      Smart Matching
                    </li>
                    <li className="flex items-center justify-center gap-2 sm:justify-start">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                        ✓
                      </span>
                      Best Value
                    </li>
                    <li className="flex items-center justify-center gap-2 sm:justify-start">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                        ✓
                      </span>
                      Verified Deals
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {isLoading && (
              <div className="space-y-6">
                {/* Loading state with AI thinking animation */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                  <div className="text-center mb-6">
                    <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-6"></div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3 flex items-center justify-center gap-2">
                      <img src="/gemini-logo.svg" alt="Gemini" className="w-7 h-7" />
                      <span>{loadingStep}</span>
                    </h3>
                    <p className="text-gray-600 text-lg">
                      Our AI is analyzing your preferences and finding the perfect vehicles
                    </p>
                    <div className="mt-6 flex justify-center space-x-2">
                      <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                  
                  {/* Progress indicator */}
                  <div className="max-w-md mx-auto">
                    <div className="bg-gray-200 rounded-full h-2.5 mb-4">
                      <div className="bg-blue-600 h-2.5 rounded-full animate-pulse" style={{ width: '70%' }}></div>
                    </div>
                  </div>
                  
                  <div className="space-y-4 mt-8">
                    <div className="animate-pulse">
                      <div className="h-64 bg-gray-200 rounded-xl mb-4"></div>
                      <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
                
                {/* Additional loading cards */}
                <div className="grid grid-cols-1 gap-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white rounded-xl shadow-lg p-4 animate-pulse">
                      <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
                <div className="text-red-500 text-4xl mb-3">⚠️</div>
                <h3 className="text-lg font-bold text-red-800 mb-2">Oops! Something went wrong</h3>
                <p className="text-red-600 mb-4">{error}</p>
                {cooldownSeconds > 0 ? (
                  <p className="text-red-700 text-sm mb-4">Please wait {cooldownSeconds}s before trying again.</p>
                ) : null}
                <button
                  onClick={() => handleFindMatch(filters)}
                  disabled={isLoading || cooldownSeconds > 0}
                  className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  {cooldownSeconds > 0 ? `Retry in ${cooldownSeconds}s` : 'Try Again'}
                </button>
              </div>
            )}

            {infoMessage ? (
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-blue-700 text-sm text-center">
                {infoMessage}
              </div>
            ) : null}

            {showResults && recommendations && (
              <div className="space-y-6 animate-slide-up">
                {/* Primary Recommendation */}
                <RecommendationCard
                  vehicle={recommendations.primaryRecommendation}
                  isLoading={false}
                  onViewDetails={handleViewDetails}
                />

                {/* Alternative Suggestions */}
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <span className="mr-2">💡</span> More Recommendations
                  </h3>
                  <div className="overflow-x-auto pb-4">
                    <div className="flex space-x-4 min-w-max">
                      {recommendations.alternativeSuggestions.map((vehicle) => (
                        <AlternativeCard
                          key={vehicle.id}
                          vehicle={vehicle}
                          onViewDetails={handleViewDetails}
                        />
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 0.6s ease-out;
        }
      `}</style>
    </div>
  );
};

export default AISuggestion;
