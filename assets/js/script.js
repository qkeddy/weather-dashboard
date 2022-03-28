// Declare global variables


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
        cityEl.addEventListener("click", funtion() {

        })
    });

    // Load weather for the previously selected city
    getCityWeather(element);
}


/**
 * !Function to get weather data for an individual city
 */
function getCityWeather(city) {

}


/**
 * !Refresh weather display elements with weather data for a selected city
 */
function refreshWeatherDisplayElements() {

}

/**
 * !Save selected city to local storage
 */
function saveAsSelected() {

}

/**
 * !Input event to search for a city
 */
searchCityButtonEl.on("click", function (event) {
    event.preventDefault();
})