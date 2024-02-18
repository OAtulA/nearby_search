import React, { useState } from 'react';
import axios from 'axios';

export const Categories = ({ categories, selectedCategory, handleCategorySelect }) => {
  return (
    <div className="mt-4">
      <span className="mr-2 font-bold">Categories:</span>
      {categories.map((category, index) => (
        <button
          key={index}
          className={`bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded ${selectedCategory === category && 'bg-teal-500 text-white'
            }`}
          onClick={() => handleCategorySelect(category)}
        >
          {category}
        </button>
      ))}
    </div>
  );
};

function getIPLocation() {
  // Make a GET request to a geolocation API or service
  let obj;
  fetch('https://ipapi.co/json/')
    .then(response => response.json())
    .then(data => {
      const { latitude, longitude } = data;
      obj = { latitude, longitude };
      // Use latitude and longitude here
      console.log("Latitude:", latitude);
      console.log("Longitude:", longitude);
    })
    .catch(error => {
      console.error('Error:', error.message);
      return;
    });

  return obj;
}

function getLocation() {
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    } else {
      reject("Geolocation is not supported by this browser.");
    }
  });
}

// component to list search results
const SearchResults = ({ searchResults }) => {

  return(
    <ul>
      {searchResults.map((result, index) => 
      (<li key={index}><span>result</span></li>))}
    </ul>
  )
}

const SearchComponent = () => {
  // State variables
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchRadius, setSearchRadius] = useState(10); // Default radius: 10km
  const [searchResults, setSearchResults] = useState([]);

  const categories = ['car-repair', 'electronics-repair', 'e-waste-collection', 'old-age-home', 'specially-abled-children', 'orphanage'];

  // Function to handle search term input change
  const handleSearchInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Function to handle category selection
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  // Function to handle search radius change
  const handleRadiusChange = (e) => {
    setSearchRadius(e.target.value);
  };

  // Function to handle search submission
  const handleSearchSubmit = async () => {
    let latitude, longitude;
    // Implement search functionality here, using searchTerm, selectedCategory, and searchRadius
    console.log('Search submitted:', searchTerm, selectedCategory, searchRadius);
    // This will be sent to backend    

    await getLocation()
      .then(position => {
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;

        // Use latitude and longitude here
        console.log("Latitude:", latitude);
        console.log("Longitude:", longitude);

        // You can return the latitude and longitude if needed
        return { latitude, longitude };
      })
      .catch(error => {
        try {
          let location = getIPLocation();
          latitude = location.latitude;
          longitude = location.longitude;
        } catch (error) {
          console.log(error.message);
        }
      });
    
    //send these to the backend at localhost:3001/nearby-search
    let opts={
      body:{
        searchTerm: searchTerm,
        latitude: latitude,
        longitude: longitude,
        radius: searchRadius,
        category: selectedCategory
      }
    }
    let places = [];
    await axios.post('http://localhost:3001/api/nearby-search', opts)
      .then(res => {  
        places = res.data;
        console.log(places);       
        setSearchResults(places) 
      })
      .catch(error=>{console.log(error.message)})
  };

  return (
    <div className="container mx-auto mt-8">
      {/* Search bar */}
      <div className="flex items-center border-b border-b-2 border-teal-500 py-2">
        <input
          className="appearance-none bg-transparent border-none w-full text-gray-700 mr-3 py-1 px-2 leading-tight focus:outline-none"
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={handleSearchInputChange}
        />
        <button
          className="bg-teal-500 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded"
          onClick={handleSearchSubmit}
        >
          Search
        </button>
      </div>

      {/* Category filters */}

      <Categories
        categories={categories}
        selectedCategory={selectedCategory}
        handleCategorySelect={handleCategorySelect}
      />

      {/* Search radius slider */}
      <div className="mt-4">
        <span className="mr-2 font-bold">Search Radius:</span>
        <input
          className="w-48"
          type="range"
          min="5"
          max="50"
          value={searchRadius}
          onChange={handleRadiusChange}
        />
        <span className="ml-2">{searchRadius} km</span>
      </div>

      {/* Search results */}
      <SearchResults searchResults={searchResults} />


    </div>
  );
};

export default SearchComponent;
