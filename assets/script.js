// DOM SELECTORS
const inputCityEl = document.querySelector("#input-city");
const btnSearch = document.querySelector("#btn-search");
const searchHistoryEl = document.querySelector("#search-history");
const searchedCitiesEl = document.querySelector("#searched-cities");
const btnClearSearch = document.querySelector("#btn-clear-search");
const forecastCurrentEl = document.querySelector("#forecast-current");
const forecastCurrentCardEl = document.querySelector("#forecast-current-card");
const forecast5DayEl = document.querySelector("#forecast-5day");
const forecast5DayCardsEl = document.querySelector("#forecast-5day-cards");

const unitName = {
    imperial: {
      windSpeed: "mph",
      temp: "F",
    }
  }
// VARIABLES
const keyOpenWeather = "0b4bc08b18d9058d6e168427316c86b4";
let units;

// FUNCTIONS
// Handle getting city weather
async function getCityWeather(city){
  let cityFound;
  let cityWeather;

  // Wrap API fetch call functions with try-catch block to handle errors
  try {
    // Find City with lat & long
    cityFound = await geocodeCity(city);
    // Get City weather data
    cityWeather = await getWeatherData(cityFound);
  } catch (error) {
    console.warn(error);
    return;
  }

  // Display weather results
  displayForecastCurrent(cityFound.name, cityWeather.current);
  displayForecast5Day(cityWeather.daily);
};

// used async/await to handle error 
async function geocodeCity(city){
  // Create request url
  const geoURL = new URL("https://api.openweathermap.org/geo/1.0/direct");
  const params = new URLSearchParams({
    q: city,
    limit: 2,
    appid: keyOpenWeather,
  }).toString();
  geoURL.search = params;

  // Call OpenWeather Geocoding API
  const response = await fetch(geoURL);

  // if bad response - throw error and console log in calling function catch
  // else - convert response to JSON
  if (!response.ok) {
    throw response.json();
  }
  const data = await response.json();

  // if no data returned - indicate no results found
  // else - return lat & long for city
  if (!data.length) {
    const alertMsg = `No results found for ${city}`;
    displayAlert(alertMsg, "warning");
    throw alertMsg;
  }

  const cityFound = data[0];
  saveCityName(cityFound.name);
  return cityFound;
};

// Perform openweather API call
async function getWeatherData(latlon){
  // Create request url
  const weatherURL = new URL("https://api.openweathermap.org/data/2.5/onecall");
  const params = new URLSearchParams({
    lat: latlon.lat,
    lon: latlon.lon,
    exclude: ["minutely", "hourly", "alerts"],
    units: units,
    appid: "0b4bc08b18d9058d6e168427316c86b4",
  }).toString();
  weatherURL.search = params;

  // Call OpenWeather one call API
  const response = await fetch(weatherURL);

  // if bad response - throw error and console log in calling function catch
  // else - convert response to JSON and return
  if (!response.ok) {
    throw response.json();
  }
  return await response.json();
};

// Update current weather forecast card
function displayForecastCurrent(place, weather,timeStamp){
  const wthrUnits = unitName.imperial;

  // Create current weather forecast card
  const wthrCurCard = document.createElement("div");
  wthrCurCard.classList.add("card");

  // Epopulate UV Index color based on value
  let uvWarning;
  if (weather.uvi <= 4) {
    uvWarning = "bg-success text-white";
  } else if (weather.uvi <= 7) {
    uvWarning = "bg-warning text-white";
  } else {
    uvWarning = "bg-danger text-white";
  }


  wthrCurCard.innerHTML = `
    <header class="card-header bg-info p-0 text-light">
      <div class="d-flex">
        <img src="http://openweathermap.org/img/wn/${
          weather.weather[0].icon
        }@2x.png" alt="weather condition icon">
        <div class="d-flex flex-column justify-content-center">
          <h4>${place}</h4>
          <p>${moment().format("MM/DD/YYYY")}</p>
        </div>
      </div>
    </header>
    <div class="card-body">
      <div class="d-table">
      <div>
      <p>Temprature: </p>
      <p>${weather.temp.toFixed(0)}&deg;${wthrUnits.temp}</P>
      </div>
        <div>
          <p>Wind Speed:</p>
          <p>${weather.wind_speed.toFixed(1)} ${wthrUnits.windSpeed}</p>
        </div>
        <div>
          <p>Humidity:</p>
          <p>${weather.humidity}%</p>
        </div>
        <div>
          <p>UV Index:</p>
          <p id="uv-index" class="btn-${uvWarning} rounded">${weather.uvi.toFixed(
    1
  )}</p>
        </div>
      </div>
    </div>`;
  forecastCurrentCardEl.innerHTML = "";
  forecastCurrentCardEl.appendChild(wthrCurCard);
  forecastCurrentEl.hidden = false;
};

console.log();
function convertTime(timeStamp){
    var date = new Date(timeStamp*1000);
    var year = date.getFullYear();
    var month = date.getMonth();
    var day = date.getDate();
    return (month+1).toString() + "/" + day.toString() + "/" + year.toString();
}
var currDate = moment().format("MM/DD/YYYY")
// Update future weather forecast cards
function displayForecast5Day(weather){
  const wthrUnits = unitName.imperial;

  // Loop over first five entries daily weather forecast and create weather forecast card
  forecast5DayCardsEl.innerHTML = "";
  for (let day = 0; day < 5; day++) {
    const dayWthr = weather[day];

    let createdDate = moment(new Date()).utc().format();
    let newDate = moment(createdDate).add(1, 'd').format("MM/DD/YYYY");


    const wthrFtrCard = document.createElement("div");
    wthrFtrCard.classList.add("card", "text-light", "bg-info");

    wthrFtrCard.innerHTML = `
      <header class="card-header p-0">
        <img src="http://openweathermap.org/img/wn/${
          dayWthr.weather[0].icon
        }.png" alt="weather condition icon">
        ${day === 0 ? newDate :moment().add(day+1,"days").format("MM/DD/YYYY")}
      </header>
      <div class="card-body">
        <div class="d-table">
          <div>
            <p>Temperature:</p>
            <p>${dayWthr.temp.day.toFixed(0)} &deg;${wthrUnits.temp}</p>
          </div>
          <div>
            <p>Wind Speed:</p>
            <p>${dayWthr.wind_speed.toFixed(1)} ${wthrUnits.windSpeed}</p>
          </div>
          <div>
            <p>Humidity:</p>
            <p>${dayWthr.humidity}%</p>
          </div>
        </div>
      </div>`;

    forecast5DayCardsEl.appendChild(wthrFtrCard);
  }

  forecast5DayEl.hidden = false;
};

// Render list of city names
const displayCityNames = () => {
  searchedCities = getCity();

  // Render each city name to searched-cities list
  for (const city of searchedCities) {
    displayCityName(city);
  }
};

// Add city to list of searched cities
function displayCityName (city){
  // Show searched cities history
  if (searchHistoryEl.hidden) searchHistoryEl.hidden = false;

  // Create list item and append to list
  const cityListItem = document.createElement("li");
  cityListItem.classList.add("list-group-item", "list-group-item-action");
  cityListItem.textContent = city;
  searchedCitiesEl.appendChild(cityListItem);
};

// Load city names from storage
function getCity(){
  // load searched cities from local storage
  const searchedCities = localStorage.getItem("searchedCities");
  if (!searchedCities) {
    return [];
  }
  return JSON.parse(searchedCities);
};

// Save city name to local storage
function saveCityName (city){
  searchedCities = getCity();
  if (searchedCities.includes(city)) return;
  searchedCities.push(city);
  displayCityName(city);

  // Save updated searched cities list to local storage
  localStorage.setItem("searchedCities", JSON.stringify(searchedCities));
};


// Show alert
function displayAlert(message, alertType){
  // Create alert div
  const alert = document.createElement("div");
  alert.className = `alert alert-${alertType} text-center mt-4`;
  alert.innerHTML = `<p>${message}</p>`;

  // Insert div
  const forecastEl = document.querySelector("#forecast");
  forecastEl.insertBefore(alert, forecastCurrentEl);
  setTimeout(() => {
    document.querySelector(".alert").remove();
  }, 2000);
};


const handleCitySearch = () => {
  // Get input city name
  const inputCity = inputCityEl.value.toLowerCase();
  if (inputCity) {
    inputCityEl.value = "";
    getCityWeather(inputCity);
  } else {
    displayAlert("Enter a city name to get weather", "warning");
  }
};

//handle searched cites
const handleSavedCitySearch = (event) => {
  //console.log(event.target.textContent);
  const selectCity = event.target.textContent
    .toLowerCase();
    //console.log(selectCity);
  // Get city weather
  getCityWeather(selectCity);
};

// Text entry search
btnSearch.addEventListener("click", handleCitySearch);
inputCityEl.addEventListener("keyup", (event) => {
  if (event.key === "Enter") handleCitySearch();
});

// Saved city search
searchedCitiesEl.addEventListener("click", handleSavedCitySearch);

displayCityNames();
