/**
 * API Configuration file
 * This file centralizes all API configuration to avoid hardcoding values across the application
 */

// Environment variables would normally come from .env file in a real application
// For development, you can modify this directly, but in production,
// these would be set in the deployment environment
const config = {
  api: {
    key: process.env.REACT_APP_FOOTBALL_API_KEY || '9936c4915bc698fe218bd47567f19268',
    baseUrl: 'https://v3.football.api-sports.io',
    timeout: 10000, // 10 seconds
    retryAttempts: 3,
  },
  cache: {
    enabled: true,
    duration: 1000 * 60 * 60, // 1 hour in milliseconds
    localStorageEnabled: true
  },
  features: {
    offlineMode: true,
    heatmaps: true
  },
  // API-Sports Football API uses these IDs
  defaultLeagueId: 39, // English Premier League
  defaultSeason: '2024', // Current season
};

/**
 * Validates if the API key is properly configured
 * @returns {boolean} Whether the API key is valid
 */
export const validateApiKey = () => {
  const apiKey = config.api.key;
  
  if (!apiKey || apiKey === 'YOUR_API_KEY') {
    console.error(
      'API Key is not configured. Please set your API key in the .env file or config.js.'
    );
    return false;
  }
  
  // Basic format validation - can be expanded based on specific API requirements
  if (apiKey.length < 10) {
    console.error('API Key appears to be invalid (too short)');
    return false;
  }
  
  return true;
};

export default config;