# 🚀 Gemini API Setup Guide for Moto Trade

## Step 1: Get Your FREE Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Copy the generated API key

## Step 2: Configure API Key

1. Open `src/config/apiConfig.js`
2. Replace `'YOUR_GEMINI_API_KEY_HERE'` with your actual API key:

```javascript
export const API_CONFIG = {
  GEMINI_API_KEY: 'AIzaSyD...your-actual-key-here', // Paste your key here
  // ... rest of config
};
```

## Step 3: Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to the **AI Suggestion** page

3. Set your preferences:
   - Budget range
   - Primary usage (Daily, Weekend, Family)
   - Vehicle type (Sedan, SUV, Hatchback, Truck)
   - Features (Safety, Eco, Leather, AWD)

4. Click **"FIND MY IDEAL MATCH"**

5. Watch as the AI analyzes your preferences and returns personalized recommendations!

## How It Works

### AI Integration Flow:

1. **User Input** → You set preferences in the UI
2. **Request Building** → App creates a detailed prompt with your criteria + vehicle database
3. **Gemini API Call** → Sends request to Google's Gemini AI
4. **AI Analysis** → Gemini analyzes vehicles and matches to your needs
5. **JSON Response** → AI returns structured vehicle recommendations
6. **Display Results** → App shows primary recommendation + 2 alternatives

### System Prompt:
The AI is instructed to:
- Respond ONLY with valid JSON
- Match vehicles to your budget, usage, vehicle type, and features
- Provide a primary recommendation and 2 alternatives
- Add helpful tags like "Best Value", "Most Efficient", etc.

## Troubleshooting

### Error: "Please configure your Gemini API key"
- **Solution**: Make sure you've updated `src/config/apiConfig.js` with your actual API key

### Error: "API Error: 400" or "Invalid API Key"
- **Solution**: Check that your API key is correctly copied (no extra spaces)
- Verify the key hasn't expired

### Error: "Failed to parse AI response"
- **Solution**: This can happen if the AI returns unexpected formatting
- Try again - it's usually a temporary issue

### No results showing
- **Solution**: Check browser console (F12) for error messages
- Ensure you have internet connectivity
- Verify the Gemini API is accessible in your region

## Rate Limits & Pricing

**Gemini API Free Tier:**
- 60 requests per minute
- 1,500 requests per day
- Completely FREE for development!

**Paid Tier:**
- $0.000125 per 1K characters (input)
- $0.000375 per 1K characters (output)

## Customization Options

### Adjust AI Behavior
Edit the `SYSTEM_PROMPT` in `AISuggestion.jsx`:
- Change temperature (creativity): Lower = more focused, Higher = more creative
- Modify maxOutputTokens for longer/shorter responses
- Add additional constraints or preferences

### Expand Vehicle Database
Add more vehicles in `src/config/apiConfig.js`:
```javascript
const vehicles = [
   {
      id: 7,
      name: "Your New Vehicle",
      brand: "Brand Name",
      model: "Model Name",
      year: 2024,
      price: 3000000,
      priceFormatted: "Rs. 3,000,000",
      rating: 4.8,
      image: "image-url",
      features: ["Feature 1", "Feature 2"],
      fuelType: "Petrol",
      transmission: "Automatic",
      vehicleType: "sedan",
      usage: ["daily", "family"],
      description: "Vehicle description"
   }
];
```

## Security Best Practices

⚠️ **IMPORTANT**: Never commit your API key to version control!

1. Add `src/config/apiConfig.js` to `.gitignore`
2. Use environment variables in production:
   ```javascript
   GEMINI_API_KEY: import.meta.env.VITE_GEMINI_API_KEY
   ```
3. Create a `.env` file:
   ```
   VITE_GEMINI_API_KEY=your-api-key-here
   ```

## Next Steps

1. ✅ Test with different preference combinations
2. ✅ Add more vehicles to the database
3. ✅ Customize the AI's recommendation logic
4. ✅ Implement vehicle comparison feature
5. ✅ Add save favorites functionality
6. ✅ Create detailed vehicle view pages

## Support

- **Gemini API Docs**: https://ai.google.dev/docs
- **API Console**: https://console.cloud.google.com/apis/credentials
- **Status Page**: https://status.cloud.google.com/

---

Happy coding! 🎉
