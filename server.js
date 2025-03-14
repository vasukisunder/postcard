const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
require('dotenv').config();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 12345;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.get('/api/capture-snapshot', async (req, res) => {
  try {
    const snapshot = await captureWorldSnapshot();
    res.json(snapshot);
  } catch (error) {
    console.error('Error capturing snapshot:', error);
    res.status(500).json({ error: 'Failed to capture snapshot' });
  }
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working' });
});

// Helper function to get a random item from an array
const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

// List of major cities for random selection
const majorCities = [
  { name: 'Tokyo', country: 'JP', lat: 35.6895, lon: 139.6917 },
  { name: 'New York', country: 'US', lat: 40.7128, lon: -74.0060 },
  { name: 'London', country: 'GB', lat: 51.5074, lon: -0.1278 },
  { name: 'Paris', country: 'FR', lat: 48.8566, lon: 2.3522 },
  { name: 'Sydney', country: 'AU', lat: -33.8688, lon: 151.2093 },
  { name: 'Rio de Janeiro', country: 'BR', lat: -22.9068, lon: -43.1729 },
  { name: 'Cairo', country: 'EG', lat: 30.0444, lon: 31.2357 },
  { name: 'Mumbai', country: 'IN', lat: 19.0760, lon: 72.8777 },
  { name: 'Beijing', country: 'CN', lat: 39.9042, lon: 116.4074 },
  { name: 'Cape Town', country: 'ZA', lat: -33.9249, lon: 18.4241 },
  { name: 'Mexico City', country: 'MX', lat: 19.4326, lon: -99.1332 },
  { name: 'Berlin', country: 'DE', lat: 52.5200, lon: 13.4050 },
  { name: 'Moscow', country: 'RU', lat: 55.7558, lon: 37.6173 },
  { name: 'Bangkok', country: 'TH', lat: 13.7563, lon: 100.5018 },
  { name: 'Buenos Aires', country: 'AR', lat: -34.6037, lon: -58.3816 }
];

// Helper function for handling API errors
const fetchWithErrorHandling = async (url, options = {}) => {
  try {
    const response = await axios({
      url: options.url || url,
      method: options.method || 'GET',
      headers: options.headers || {},
      params: options.params || {}
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching from ${url}:`, error.message);
    return null;
  }
};

// Fetch weather data for a random city using RapidAPI
async function fetchWeatherData() {
  const city = getRandomItem(majorCities);
  const cityName = city.name; // Get the city name
  
  const options = {
    method: 'GET',
    url: `https://weather-api-by-any-city.p.rapidapi.com/weather/${cityName}`,
    headers: {
      'x-rapidapi-key': process.env.RAPIDAPI_KEY,
      'x-rapidapi-host': 'weather-api-by-any-city.p.rapidapi.com'
    }
  };
  
  const data = await fetchWithErrorHandling(options.url, options);
  
  if (!data || !data.current) {
    return { 
      text: "Weather information unavailable at this time."
    };
  }
  
  // Extract the weather data from the response using the correct structure
  const location = data.location;
  const current = data.current;
  
  // Format the weather text with the proper fields - added "conditions" after weather condition
  return {
    text: `The weather in ${location.name}, ${location.country} is ${current.temp_c}°C (${current.temp_f}°F) with ${current.condition.text.toLowerCase()} conditions. Humidity is at ${current.humidity}%.`,
    raw: {
      city: location.name,
      country: location.country,
      temperature_c: current.temp_c,
      temperature_f: current.temp_f,
      condition: current.condition.text,
      icon: current.condition.icon,
      humidity: current.humidity,
      wind_kph: current.wind_kph,
      wind_dir: current.wind_dir
    }
  };
}

// Fetch latest news headline using RapidAPI
async function fetchNewsHeadline() {
  // List of country codes to get more global coverage
  const countries = ['US', 'GB', 'CA', 'AU', 'IN', 'JP', 'FR', 'DE', 'BR', 'ZA'];
  
  // Randomly select a country
  const country = getRandomItem(countries);
  
  const options = {
    method: 'GET',
    url: 'https://real-time-news-data.p.rapidapi.com/top-headlines',
    params: {
      country: country,  // Randomly selected country
      lang: 'en',        // Keeping English for readability
      limit: '5'         // Get 5 articles to choose from
    },
    headers: {
      'x-rapidapi-key': process.env.RAPIDAPI_KEY,
      'x-rapidapi-host': 'real-time-news-data.p.rapidapi.com'
    }
  };
  
  const data = await fetchWithErrorHandling(options.url, options);
  
  if (!data || !data.data || data.data.length === 0) {
    return { 
      text: "No breaking news at the moment."
    };
  }
  
  // Get a random article from the results for more variety
  const article = getRandomItem(data.data);
  
  // Add the country to the text for context
  return {
    text: `Breaking news from ${getCountryName(country)}: "${article.title}" - ${article.source_name}`,
    image: article.photo_url,
    raw: {
      title: article.title,
      source: article.source_name,
      country: country,
      snippet: article.snippet,
      url: article.link,
      published: new Date(article.published_datetime_utc).toLocaleString()
    }
  };
}

// Helper function to convert country code to country name
function getCountryName(code) {
  const countries = {
    'US': 'United States',
    'GB': 'United Kingdom',
    'CA': 'Canada',
    'AU': 'Australia',
    'IN': 'India',
    'JP': 'Japan',
    'FR': 'France',
    'DE': 'Germany',
    'BR': 'Brazil',
    'ZA': 'South Africa'
  };
  return countries[code] || code;
}

// Fetch space imagery from NASA EPIC API (enhanced images)
async function fetchSpaceImagery() {
  // NASA EPIC API for Earth imagery - using enhanced instead of natural
  const url = `https://epic.gsfc.nasa.gov/api/enhanced?api_key=${process.env.NASA_API_KEY}`;
  
  const data = await fetchWithErrorHandling(url);
  
  if (!data || data.length === 0) {
    // Fallback to NASA Astronomy Picture of the Day
    const apodUrl = `https://api.nasa.gov/planetary/apod?api_key=${process.env.NASA_API_KEY}`;
    const apodData = await fetchWithErrorHandling(apodUrl);
    
    if (!apodData) {
      return { 
        text: "No Earth imagery available right now."
      };
    }
    
    return {
      text: `NASA's image of the day: "${apodData.title}"`,
      image: apodData.url,
      raw: {
        title: apodData.title,
        explanation: apodData.explanation.substring(0, 100) + '...'
      }
    };
  }
  
  // Get the most recent image
  const latestImage = data[0];
  const date = latestImage.date.split(' ')[0].replace(/-/g, '/');
  
  // The enhanced image URL format is slightly different from natural
  const imageUrl = `https://epic.gsfc.nasa.gov/archive/enhanced/${date}/png/${latestImage.image}.png`;
  
  return {
    text: `This is how Earth looks from space right now (enhanced view).`,
    image: imageUrl,
    raw: {
      date: latestImage.date,
      coordinates: latestImage.centroid_coordinates ? 
        `${latestImage.centroid_coordinates.lat.toFixed(2)}°, ${latestImage.centroid_coordinates.lon.toFixed(2)}°` : 
        'Deep Space'
    }
  };
}

// Fetch latest earthquake data
async function fetchEarthquakeData() {
  // USGS Earthquake API - past hour significant earthquakes
  const url = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_hour.geojson';
  
  const data = await fetchWithErrorHandling(url);
  
  if (!data || !data.features || data.features.length === 0) {
    // If no significant earthquakes in the past hour, get all 1.0+ magnitude in the past day
    const fallbackUrl = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/1.0_day.geojson';
    const fallbackData = await fetchWithErrorHandling(fallbackUrl);
    
    if (!fallbackData || !fallbackData.features || fallbackData.features.length === 0) {
      return { 
        text: "No significant earthquakes have been recorded recently."
      };
    }
    
    const quake = fallbackData.features[0];
    const place = quake.properties.place;
    const magnitude = quake.properties.mag;
    const quakeTime = new Date(quake.properties.time);
    const timeAgo = getTimeAgo(quakeTime);
    
    return {
      text: `The most recent earthquake was magnitude ${magnitude} ${place} ${timeAgo}.`,
      raw: {
        magnitude: magnitude,
        location: place,
        time: quakeTime.toISOString(),
        timeAgo: timeAgo
      }
    };
  }
  
  const quake = data.features[0];
  const place = quake.properties.place;
  const magnitude = quake.properties.mag;
  const quakeTime = new Date(quake.properties.time);
  const timeAgo = getTimeAgo(quakeTime);
  
  return {
    text: `The most recent significant earthquake was magnitude ${magnitude} ${place} ${timeAgo}.`,
    raw: {
      magnitude: magnitude,
      location: place,
      time: quakeTime.toISOString(),
      timeAgo: timeAgo
    }
  };
}

// Helper function to calculate relative time
function getTimeAgo(pastDate) {
  const now = new Date();
  const diffMs = now - pastDate;
  
  // Convert to minutes, hours, days
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  // Format the relative time
  if (diffMinutes < 1) {
    return 'just now';
  } else if (diffMinutes < 60) {
    return `${diffMinutes} ${diffMinutes === 1 ? 'minute' : 'minutes'} ago`;
  } else if (diffHours < 24) {
    const remainingMinutes = diffMinutes % 60;
    if (remainingMinutes === 0) {
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    } else {
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} and ${remainingMinutes} ${remainingMinutes === 1 ? 'minute' : 'minutes'} ago`;
    }
  } else {
    const remainingHours = diffHours % 24;
    const remainingMinutes = diffMinutes % 60;
    
    let result = `${diffDays} ${diffDays === 1 ? 'day' : 'days'}`;
    
    if (remainingHours > 0) {
      result += ` ${remainingHours} ${remainingHours === 1 ? 'hour' : 'hours'}`;
    }
    
    if (remainingMinutes > 0) {
      result += ` and ${remainingMinutes} ${remainingMinutes === 1 ? 'minute' : 'minutes'}`;
    }
    
    return result + ' ago';
  }
}

// Fetch financial data
async function fetchFinancialData() {
  // CoinGecko API for Bitcoin price
  const url = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true';
  
  const data = await fetchWithErrorHandling(url);
  
  if (!data || !data.bitcoin) {
    return { 
      text: "Bitcoin price information is currently unavailable."
    };
  }
  
  const price = data.bitcoin.usd;
  const change = data.bitcoin.usd_24h_change;
  const direction = change >= 0 ? 'up' : 'down';
  
  return {
    text: `Bitcoin is currently trading at $${price.toLocaleString()}, ${direction} ${Math.abs(change).toFixed(2)}% in the past 24 hours.`,
    raw: {
      price: price,
      change: change
    }
  };
}

// Fetch Wikipedia activity
async function fetchWikipediaActivity() {
  // Wikipedia Recent Changes API - get more results to filter
  const url = 'https://en.wikipedia.org/w/api.php?action=query&list=recentchanges&rcprop=title|timestamp|user&format=json&rctype=edit&rcshow=!bot&limit=20';
  
  const data = await fetchWithErrorHandling(url);
  
  if (!data || !data.query || !data.query.recentchanges || data.query.recentchanges.length === 0) {
    return { 
      text: "Wikipedia activity is currently unavailable."
    };
  }
  
  // Filter out non-article edits (user pages, talk pages, etc.)
  const contentEdits = data.query.recentchanges.filter(edit => {
    const title = edit.title;
    
    // Skip edits to these namespaces
    const nonContentPrefixes = [
      'User:', 'User talk:', 
      'Wikipedia:', 'Wikipedia talk:',
      'Talk:', 'Template:', 'Template talk:',
      'Category talk:', 'File talk:',
      'MediaWiki:', 'MediaWiki talk:',
      'Module:', 'Module talk:',
      'Draft:', 'Draft talk:',
      'Portal:', 'Portal talk:'
    ];
    
    // Check if the title starts with any of the excluded prefixes
    return !nonContentPrefixes.some(prefix => title.startsWith(prefix));
  });
  
  // If no content edits found after filtering
  if (contentEdits.length === 0) {
    return {
      text: "No main article edits on Wikipedia at the moment."
    };
  }
  
  // Get the most recent content edit
  const recentEdit = contentEdits[0];
  const time = new Date(recentEdit.timestamp);
  const timeAgo = getTimeAgo(time);
  
  return {
    text: `Someone just edited the Wikipedia article "${recentEdit.title}" ${timeAgo}.`,
    raw: {
      article: recentEdit.title,
      editor: recentEdit.user,
      timestamp: time.toISOString(),
      timeAgo: timeAgo
    }
  };
}

// Fetch moon phase data using the external API
async function fetchMoonPhaseData() {
  // Using the RapidAPI Moon Phase API
  const options = {
    method: 'GET',
    url: 'https://moon-phase.p.rapidapi.com/advanced',
    params: {
      lat: '51.4768',
      lon: '-0.0004'
    },
    headers: {
      'x-rapidapi-key': process.env.RAPIDAPI_KEY,
      'x-rapidapi-host': 'moon-phase.p.rapidapi.com'
    }
  };
  
  const data = await fetchWithErrorHandling(options.url, options);
  
  if (!data || !data.moon) {
    return { 
      text: "Moon phase information is currently unavailable."
    };
  }
  
  // Extract the relevant information from the API response
  const phaseName = data.moon.phase_name;
  const illumination = data.moon.illumination;
  const moonEmoji = data.moon.emoji || '';
  
  // Get eclipse information
  const nextSolarEclipse = data.sun?.next_solar_eclipse;
  const nextLunarEclipse = data.moon?.next_lunar_eclipse;
  
  // Format solar eclipse date
  const solarEclipseDate = nextSolarEclipse ? 
    new Date(nextSolarEclipse.timestamp * 1000).toLocaleDateString('en-US', {month: 'numeric', day: 'numeric', year: 'numeric'}) : 
    'unknown date';
  
  // Format lunar eclipse date
  const lunarEclipseDate = nextLunarEclipse ? 
    new Date(nextLunarEclipse.timestamp * 1000).toLocaleDateString('en-US', {month: 'numeric', day: 'numeric', year: 'numeric'}) : 
    'unknown date';
  
  // Format the moon text with combined phase and visibility
  const text = 
    `The moon ${moonEmoji} is currently in the ${phaseName.toLowerCase()} phase with ${illumination} visibility. ` +
    `There will be a ${nextSolarEclipse?.type || 'solar'} eclipse on ${solarEclipseDate}. ` +
    `There will be a ${nextLunarEclipse?.type || 'lunar'} eclipse on ${lunarEclipseDate}.`;
  
  return {
    text: text,
    raw: {
      phase: phaseName,
      illumination: illumination,
      emoji: moonEmoji,
      nextSolarEclipse: nextSolarEclipse ? {
        type: nextSolarEclipse.type,
        date: solarEclipseDate,
        visibility: nextSolarEclipse.visibility_regions
      } : null,
      nextLunarEclipse: nextLunarEclipse ? {
        type: nextLunarEclipse.type,
        date: lunarEclipseDate,
        visibility: nextLunarEclipse.visibility_regions
      } : null
    }
  };
}

// Main function to capture all data points
async function captureWorldSnapshot() {
  const timestamp = new Date().toISOString();
  const localTime = new Date().toLocaleString('en-US', { 
    hour: 'numeric', 
    minute: 'numeric',
    timeZoneName: 'short'
  });
  
  // Fetch all data points in parallel
  const [
    weather, 
    news, 
    space, 
    earthquake, 
    finance, 
    wikipedia,
    moonPhase
  ] = await Promise.all([
    fetchWeatherData(),
    fetchNewsHeadline(),
    fetchSpaceImagery(),
    fetchEarthquakeData(),
    fetchFinancialData(),
    fetchWikipediaActivity(),
    fetchMoonPhaseData()
  ]);
  
  // Format the moon phase data with line breaks
  const formattedMoonText = formatWithLineBreaks(moonPhase.text);
  
  // Create the receipt text with extra line spacing
  const receiptLines = [
    `It is ${localTime}.`,
    `This is what the Earth looks like right now.`,
    ``,
    weather.text,
    ``,
    news.text,
    ``,
    wikipedia.text,
    ``,
    formattedMoonText,
    ``,
    earthquake.text,
    ``,
    finance.text,
    ``,
    `Captured at ${new Date().toLocaleString()}`,
    `End of Earth snapshot`
  ];
  
  return {
    id: Date.now(),
    timestamp,
    localTime,
    earthImage: space.image,
    receiptText: receiptLines.join('\n'),
    dataPoints: {
      weather,
      news,
      space,
      earthquake,
      finance,
      wikipedia,
      moonPhase
    }
  };
}

// Helper function to format moon phase text with extra line breaks
function formatWithLineBreaks(text) {
  if (!text) return '';
  
  // Split the text by periods, but keep the periods
  return text.split('.').filter(sentence => sentence.trim() !== '')
    .map(sentence => sentence.trim() + '.')
    .join('\n\n');
}

app.get('/', (req, res) => {
  res.status(200).send('API Server is running');
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
