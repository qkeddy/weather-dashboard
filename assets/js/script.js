// Declare global variables
apiKey = "64af714a02193243ce10430d0259b40a";

// Declare page elements
cityListEl = document.getElementsByClassName("list-group");
searchCityButtonEl = document.querySelector("button");

/**
 * !Function to update city selection from local storage
 */
function loadStoredCities() {
    // Get list of cities from local storage
    cities = JSON.parse(localStorage.getItem("cities"));

    // Loop over each city and add to city list and get the latest weather
    cities.forEach((element) => {
        // Create a new list item
        const cityEl = document.createElement("li");
        cityEl.textContent = element;
        cityListEl.appendChild(cityEl);

        // Make each element clickable
        cityEl.addEventListener("click", function () {

        })
    });
}


/**
 * !Function to get weather data for an individual city
 */
function getCityCoordinates(city) {
    // Initialize and object to hold the city coordinates
    let cityCoordinates = {
        longitude: 0,
        latitude: 0,
    };

    // Generate URL to get city coordinates
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${apiKey}`;

    // Fetch data city coordinates
    fetch(apiUrl).then(function (response) {
        if (response.ok) {
            response.json().then(function (data) {
                cityCoordinates.latitude = data.coord.lat;
                cityCoordinates.longitude = data.coord.lon;
                console.log(`Latitude and longitude for ${city} retrieved`);

                // Fetch weather forecast
                getCityWeather(cityCoordinates);
            });
        } else {
            console.log(`${city} is not a valid city name`);
        }
    });
}

/**
 * !Function to get current and forecast weather conditions based upon longitude and latitude
 */
function getCityWeather(cityCoordinates) {
    // Initialize and object to hold the city data
    let cityWeather = {
        currTemp: 0,
        currWind: 0,
        currHumidity: 0,
        currUvi: 0,
        temperature: [],
        windSpeed: [],
        humidity: [],
    };

    // Generate URL to get city weather by the coordinates
    const apiUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${cityCoordinates.latitude}&lon=${cityCoordinates.longitude}&units=imperial&exclude=minutely,hourly,alerts&appid=${apiKey}`;


    // Fetch data city coordinates
    fetch(apiUrl).then(function (response) {
        if (response.ok) {
            response.json().then(function (data) {

                // Set the current conditions
                cityWeather.currTemp = data.current.temp;
                cityWeather.currWind = data.current.wind_speed;
                cityWeather.currHumidity = data.current.humidity;
                cityWeather.currUvi = data.current.uvi;

                // Set the forecast
                data.daily.forEach(element => {
                    cityWeather.temperature.push(element.temp.day);
                    cityWeather.windSpeed.push(element.wind_speed);
                    cityWeather.humidity.push(element.humidity);
                });

                console.log("Current and forecast conditions successfully retrieved");
            });
        } else {
            console.log(`Weather is not currently`);
        }
    });
}

/**
 * !Refresh weather display elements with weather data for a selected city
 */
function refreshWeatherDisplayElements() {}

/**
 * !Save selected city to local storage
 */
function saveAsSelected() {}

/**
 * !Input event to search for a city
 */
// searchCityButtonEl.on("click", function (event) {
//     event.preventDefault();
// })

/**
 * !Init function
 */
function init() {

    // TODO - move this function out of init
    getCityCoordinates("New York City");


}

init();
