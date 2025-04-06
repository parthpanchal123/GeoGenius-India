import { City } from '@/types/city';
import citiesData from '@/resources/query.json';

// Define the CityDetails interface
export interface CityDetails {
  title: string;
  description: string;
  extract: string;
  imageUrl: string | null;
  images: string[];
  coordinates?: {
    lat: number;
    lon: number;
  };
  population?: number;
}

/**
 * Fetches details about a random Indian city using the local cities data
 * @returns Promise with city details including title, description, extract, and image URL
 */
async function getRandomIndianCity(): Promise<any> {
  try {
    // Filter and clean the cities from the JSON file
    const cities = citiesData
      .filter((city: any) => {
        const cityName = city.cityLabel;
        return (
          cityName &&
          /^[A-Za-z\s]+$/.test(cityName) && // Only allow English letters and spaces
          cityName.length >= 2 && // Must be at least 2 characters
          cityName.length <= 50 && // Reasonable maximum length
          !cityName.toLowerCase().includes('district') &&
          !cityName.toLowerCase().includes('municipality') &&
          city.lat && city.lon // Ensure we have coordinates
        );
      })
      .map((city: any) => ({
        name: city.cityLabel,
        population: city.population ? parseInt(city.population) : undefined,
        coordinates: {
          lat: parseFloat(city.lat),
          lon: parseFloat(city.lon)
        }
      }));

    if (cities.length === 0) {
      throw new Error('No valid cities found in the data');
    }

    // Use crypto for better randomization
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    const randomIndex = Math.floor(array[0] / (0xffffffff + 1) * cities.length);
    const randomCity = cities[randomIndex];
    
    // Get Wikipedia content for additional information
    const wikiDetails = await fetchCityDetails(randomCity.name);
    
    // Ensure coordinates and population are properly passed
    const cityDetails = {
      ...wikiDetails,
      population: randomCity.population,
      coordinates: randomCity.coordinates
    };

    // Generate location hints immediately
    const locationHints = generateLocationBasedHints(
      randomCity.coordinates.lat,
      randomCity.coordinates.lon,
      randomCity.population
    );

    return {
      ...cityDetails,
      initialHints: locationHints // Pass location hints separately
    };
  } catch (error) {
    throw error;
  }
}

// Helper function to fetch city details from Wikipedia
async function fetchCityDetails(cityName: string): Promise<any> {
  try {
    // Use a more reliable approach with a single API call
    const apiUrl = "https://en.wikipedia.org/w/api.php?" + 
      new URLSearchParams({
        action: "query",
        titles: cityName,
        prop: "extracts|pageimages|info|coordinates",
        exintro: "1",
        explaintext: "1",
        piprop: "original",
        inprop: "url",
        format: "json",
        origin: "*"
      }).toString();

    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`Wikipedia API HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.query?.pages) {
      throw new Error('No pages found in Wikipedia response');
    }

    const pages = data.query.pages;
    const pageId = Object.keys(pages)[0];
    const page = pages[pageId];

    if (!page || page.missing) {
      throw new Error(`Page not found for: ${cityName}`);
    }

    // Extract the first paragraph as description
    const extract = page.extract || "";
    const description = extract.split('\n\n')[0];

    // Get the main image
    let images = [];
    if (page.original?.source) {
      images.push(page.original.source);
    }

    // If we have additional images from the page, add them
    if (page.images) {
      // Make a separate call to get image URLs
      const imageNames = page.images
        .filter((img: any) => {
          const title = img.title.toLowerCase();
          return (
            (title.endsWith('.jpg') || 
             title.endsWith('.jpeg') || 
             title.endsWith('.png')) &&
            !title.includes('icon') &&
            !title.includes('logo') &&
            !title.includes('map') &&
            !title.includes('flag') &&
            !title.includes('seal')
          );
        })
        .slice(0, 5) // Limit to 5 images
        .map((img: any) => img.title)
        .join('|');

      if (imageNames) {
        try {
          const imageInfoUrl = "https://en.wikipedia.org/w/api.php?" + 
            new URLSearchParams({
              action: "query",
              titles: imageNames,
              prop: "imageinfo",
              iiprop: "url",
              format: "json",
              origin: "*"
            }).toString();

          const imageResponse = await fetch(imageInfoUrl);
          const imageData = await imageResponse.json();

          if (imageData.query?.pages) {
            Object.values(imageData.query.pages).forEach((imagePage: any) => {
              if (imagePage.imageinfo?.[0]?.url) {
                images.push(imagePage.imageinfo[0].url);
              }
            });
          }
        } catch (error) {
          console.error('Error fetching Wikipedia images:', error);
        }
      }
    }

    // Remove duplicate images
    images = Array.from(new Set(images));

    // If no images were found, use a placeholder
    if (images.length === 0) {
      images = ['/placeholder-city.avif'];
    }

    return {
      city: cityName,
      title: page.title || cityName,
      description: description,
      extract: extract,
      imageUrl: images[0],
      images: images,
      url: page.fullurl,
      coordinates: page.coordinates?.[0]
    };
  } catch (error) {
    throw error;
  }
}

async function fetchPixabayImages(cityName: string): Promise<string[]> {
  try {
    const query = `${cityName} india city architecture`;
    const url = `https://pixabay.com/api/?q=${encodeURIComponent(query)}&image_type=photo&category=places&orientation=horizontal&safesearch=true&per_page=3`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.hits && data.hits.length > 0) {
      return data.hits.map((hit: any) => hit.webformatURL);
    }
    return [];
  } catch (error) {
    console.error('Error fetching Pixabay images:', error);
    return [];
  }
}

async function fetchUnsplashImages(cityName: string): Promise<string[]> {
  try {
    const query = `${cityName} india city`;
    const url = `https://api.unsplash.com/photos/random?query=${encodeURIComponent(query)}&count=3&orientation=landscape`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (Array.isArray(data) && data.length > 0) {
      return data.map((photo: any) => photo.urls.regular);
    }
    return [];
  } catch (error) {
    console.error('Error fetching Unsplash images:', error);
    return [];
  }
}

async function fetchGoogleCustomSearchImages(cityName: string): Promise<string[]> {
  try {
    const query = `${cityName} india city landmark`;
    const url = `https://customsearch.googleapis.com/customsearch/v1?q=${encodeURIComponent(query)}&searchType=image&imgSize=large&imgType=photo&num=3`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.items && data.items.length > 0) {
      return data.items.map((item: any) => item.link);
    }
    return [];
  } catch (error) {
    console.error('Error fetching Google Custom Search images:', error);
    return [];
  }
}

// Add this helper function for fallback images
function getFallbackImagesByCategory(categories: string[]): string[] {
  const fallbackImages: string[] = [];
  
  // Add relevant placeholder images based on city categories
  if (categories.includes('coastal')) {
    fallbackImages.push('/images/coastal-city.jpg');
  }
  if (categories.includes('tech')) {
    fallbackImages.push('/images/tech-city.jpg');
  }
  if (categories.includes('historical')) {
    fallbackImages.push('/images/historical-city.jpg');
  }
  if (categories.includes('religious')) {
    fallbackImages.push('/images/religious-city.jpg');
  }
  if (categories.includes('capital')) {
    fallbackImages.push('/images/capital-city.jpg');
  }
  
  // Add a generic city image if no specific categories match
  if (fallbackImages.length === 0) {
    fallbackImages.push('/images/generic-indian-city.jpg');
  }
  
  return fallbackImages;
}

async function fetchWikipediaInfo(cityName: string): Promise<string[]> {
  try {
    // First, search for the city page
    const searchUrl = "https://en.wikipedia.org/w/api.php?" + 
      new URLSearchParams({
        action: "query",
        list: "search",
        srsearch: `${cityName} city India`,
        format: "json",
        origin: "*"
      }).toString();

    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();

    if (!searchData.query?.search?.[0]?.pageid) {
      return [];
    }

    // Get the full page content
    const pageUrl = "https://en.wikipedia.org/w/api.php?" + 
      new URLSearchParams({
        action: "query",
        pageids: searchData.query.search[0].pageid.toString(),
        prop: "extracts",
        exintro: "1",
        format: "json",
        origin: "*",
        explaintext: "1"
      }).toString();

    const pageResponse = await fetch(pageUrl);
    const pageData = await pageResponse.json();
    const pageId = searchData.query.search[0].pageid;
    const extract = pageData.query?.pages?.[pageId]?.extract;

    if (!extract) {
      return [];
    }

    // Create variations of the city name to filter out
    const cityVariations = [
      cityName.toLowerCase(),
      ...cityName.toLowerCase().split(' '),
      cityName.toLowerCase().replace(/\s+/g, ''),
    ];

    // Split into sentences and filter out unwanted content
    const sentences = extract
      .split(/[.!?]+/)
      .map((s: string) => s.trim())
      .filter((s: string) => {
        const lowerS = s.toLowerCase();
        return (
          s.length > 20 && 
          // Filter out sentences with technical or unwanted information
          !lowerS.includes('census') &&
          !lowerS.includes('population') &&
          !lowerS.includes('coordinates') &&
          !lowerS.includes('elevation') &&
          !lowerS.includes('demographics') &&
          !lowerS.includes('according to') &&
          !lowerS.includes('square') &&
          !lowerS.includes('km²') &&
          !lowerS.includes('kilometers') &&
          !lowerS.includes('metres') &&
          !lowerS.includes('located in') &&
          !lowerS.includes('situated in') &&
          !lowerS.includes('lies in') &&
          !lowerS.includes('capital of') &&
          // Filter out sentences that might contain the city name or its variations
          !cityVariations.some(v => lowerS.includes(v)) &&
          // Filter out sentences that start with common location patterns
          !/^it (is|was|lies|sits)/.test(lowerS) &&
          !/^(the|this) city/.test(lowerS)
        );
      })
      .map((s: string) => {
        // Replace any remaining instances of "the city" with "it"
        return s.replace(/\b(the|this) city\b/gi, 'it');
      });

    // Return unique, interesting facts
    const hints = sentences
      .filter((s: string, i: number, arr: string[]) => arr.indexOf(s) === i) // Remove duplicates
      .slice(0, 5); // Limit to 5 hints

    return hints.length >= 3 ? hints : []; // Only return hints if we have at least 3 good ones
  } catch (error) {
    console.error('Error fetching Wikipedia info:', error);
    return [];
  }
}

function generateLocationBasedHints(lat: number, lon: number, population?: number): string[] {
  const hints: string[] = [];

  // Region-based hints (North/South/Central India)
  if (lat > 28) {
    hints.push('This city is in the northern part of India');
  } else if (lat < 15) {
    hints.push('This city is in the southern part of India');
  } else if (lat >= 15 && lat <= 28) {
    hints.push('This city is in central India');
  }

  // Coastal hints with more precise longitude ranges
  if (lon > 83) {
    hints.push('This city is near the eastern coast of India');
  } else if (lon < 73) {
    hints.push('This city is near the western coast of India');
  }

  // Population-based hints with more specific categories
  if (population) {
    if (population > 5000000) {
      hints.push(`This is a major metropolitan city with a population over ${Math.floor(population/1000000)} million`);
    } else if (population > 1000000) {
      hints.push(`This city has a population of over ${Math.floor(population/100000)/10} million people`);
    } else if (population > 500000) {
      hints.push(`This is a medium-sized city with about ${Math.floor(population/1000)*1000} residents`);
    } else if (population > 100000) {
      hints.push(`This is a smaller city with about ${Math.floor(population/1000)*1000} residents`);
    } else {
      hints.push('This is a small urban center');
    }
  }

  return hints;
}

// Function to fetch a random city for the game
export const fetchRandomCity = async (): Promise<City> => {
  try {
    const city = await getRandomIndianCity();
    return city;
  } catch (error) {
    return getRandomFallbackCity();
  }
};

// Helper function to get a random fallback city
function getRandomFallbackCity(): City {
  const fallbackCities = [
    {
      id: 'mumbai',
      name: 'Mumbai',
      alternateNames: ['Bombay'],
      images: ['/placeholder-city.jpg'],
      hints: [
        'Financial capital of India',
        'Home to Bollywood film industry',
        'Known for its bustling local trains'
      ],
      state: 'Maharashtra',
      difficulty: 1 as 1 | 2 | 3,
      categories: ['coastal', 'financial', 'metropolitan']
    },
    {
      id: 'delhi',
      name: 'Delhi',
      alternateNames: ['New Delhi'],
      images: ['/placeholder-city.jpg'],
      hints: [
        'Capital of India',
        'Home to the Red Fort',
        'Known for its diverse cuisine'
      ],
      state: 'Delhi',
      difficulty: 1 as 1 | 2 | 3,
      categories: ['capital', 'historical', 'metropolitan']
    },
    {
      id: 'bangalore',
      name: 'Bangalore',
      alternateNames: ['Bengaluru'],
      images: ['/placeholder-city.jpg'],
      hints: [
        'Known as the Silicon Valley of India',
        'Home to many tech companies',
        'Known for its pleasant climate'
      ],
      state: 'Karnataka',
      difficulty: 1 as 1 | 2 | 3,
      categories: ['tech', 'metropolitan']
    },
    {
      id: 'chennai',
      name: 'Chennai',
      alternateNames: ['Madras'],
      images: ['/placeholder-city.jpg'],
      hints: [
        'Major port city on the east coast',
        'Known for its classical music and dance',
        'Home to Marina Beach'
      ],
      state: 'Tamil Nadu',
      difficulty: 1 as 1 | 2 | 3,
      categories: ['coastal', 'cultural', 'metropolitan']
    },
    {
      id: 'kolkata',
      name: 'Kolkata',
      alternateNames: ['Calcutta'],
      images: ['/placeholder-city.jpg'],
      hints: [
        'Former capital of British India',
        'Known for its literary and artistic heritage',
        'Home to the Howrah Bridge'
      ],
      state: 'West Bengal',
      difficulty: 1 as 1 | 2 | 3,
      categories: ['cultural', 'historical', 'metropolitan']
    }
  ];
  
  const randomIndex = Math.floor(Math.random() * fallbackCities.length);
  return fallbackCities[randomIndex];
}

// Function to generate hints based on city details
const generateHints = (cityDetails: CityDetails): string[] => {
  const hints: string[] = [];
  
  // Extract state information for hints
  const state = extractStateFromExtract(cityDetails.extract);
  if (state !== 'India') {
    hints.push(`Located in the state of ${state}`);
  }
  
  // Population-based hint
  if (cityDetails.population) {
    const population = cityDetails.population;
    if (population > 10000000) {
      hints.push('One of the largest cities in India by population');
    } else if (population > 5000000) {
      hints.push('A major metropolitan area in India');
    } else if (population > 1000000) {
      hints.push('A significant urban center in India');
    }
  }
  
  // Location-based hints
  if (cityDetails.coordinates) {
    const lat = cityDetails.coordinates.lat;
    const lng = cityDetails.coordinates.lon;
    
    // Coastal city hint (approximate)
    // if (Math.abs(lng - 72.8) < 5 || Math.abs(lng - 88.3) < 5) {
    //   hints.push('Likely a coastal city');
    // }
  }
  
  // Extract interesting facts from the extract without revealing the city name
  const extract = cityDetails.extract;
  const sentences = extract.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  for (const sentence of sentences) {
    // Skip sentences that contain the city name
    if (sentence.toLowerCase().includes(cityDetails.title.toLowerCase())) {
      continue;
    }
    
    // Look for interesting facts about the city
    if (sentence.includes('known for') || 
        sentence.includes('famous for') || 
        sentence.includes('home to') ||
        sentence.includes('located') ||
        sentence.includes('situated')) {
      // Remove the city name from the sentence if it appears
      let hint = sentence.replace(new RegExp(cityDetails.title, 'gi'), 'this city');
      hint = hint.replace(/\s+/g, ' ').trim();
      
      if (hint.length > 20 && !hints.includes(hint)) {
        hints.push(hint);
      }
    }
  }
  
  // If we don't have enough hints, add some generic ones
  if (hints.length < 3) {
    const genericHints = [
      'Known for its rich cultural heritage',
      'A popular tourist destination in India',
      'Home to several historical landmarks',
      'Famous for its local cuisine',
      'A hub for business and commerce',
      'Known for its vibrant arts scene',
      'A city with a mix of modern and traditional architecture'
    ];
    
    // Add generic hints until we have at least 3
    // while (hints.length < 3) {
    //   const randomIndex = Math.floor(Math.random() * genericHints.length);
    //   const hint = genericHints[randomIndex];
    //   if (!hints.includes(hint)) {
    //     hints.push(hint);
    //   }
    // }
  }
  
  return hints;
};

// Helper function to extract state from the extract text
const extractStateFromExtract = (extract: string): string => {
  // Common Indian states to look for
  const states = [
    'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Uttar Pradesh', 'Gujarat', 
    'Rajasthan', 'Madhya Pradesh', 'West Bengal', 'Andhra Pradesh', 'Telangana',
    'Kerala', 'Punjab', 'Haryana', 'Bihar', 'Odisha', 'Assam', 'Jharkhand',
    'Chhattisgarh', 'Uttarakhand', 'Himachal Pradesh', 'Goa', 'Delhi'
  ];
  
  for (const state of states) {
    if (extract.includes(state)) {
      return state;
    }
  }
  
  return 'India'; // Default if state not found
};

// Helper function to determine difficulty based on city details
const determineDifficulty = (cityDetails: CityDetails): 1 | 2 | 3 => {
  // If it's a well-known city (based on population or description)
  if (cityDetails.population && cityDetails.population > 5000000) {
    return 1; // Easy
  }
  
  // Check if it's mentioned in the extract as a major city
  const majorCityKeywords = ['capital', 'largest', 'major', 'important', 'significant'];
  for (const keyword of majorCityKeywords) {
    if (cityDetails.extract.toLowerCase().includes(keyword)) {
      return 1; // Easy
    }
  }
  
  // If it has coordinates but small population, it's medium difficulty
  if (cityDetails.coordinates && cityDetails.population && cityDetails.population < 1000000) {
    return 2; // Medium
  }
  
  // Default to hard
  return 3; // Hard
};

// Helper function to extract categories based on city details
const extractCategories = (cityDetails: CityDetails): string[] => {
  const categories: string[] = ['city'];
  
  // Add categories based on extract content
  const extractLower = cityDetails.extract.toLowerCase();
  
  if (extractLower.includes('capital')) {
    categories.push('capital');
  }
  
  if (extractLower.includes('coastal') || extractLower.includes('port') || extractLower.includes('sea')) {
    categories.push('coastal');
  }
  
  if (extractLower.includes('historical') || extractLower.includes('ancient')) {
    categories.push('historical');
  }
  
  if (extractLower.includes('tech') || extractLower.includes('technology') || extractLower.includes('IT')) {
    categories.push('tech');
  }
  
  if (extractLower.includes('temple') || extractLower.includes('religious')) {
    categories.push('religious');
  }
  
  return categories;
}; 