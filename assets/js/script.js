// Declare global variables
apiKey = "64af714a02193243ce10430d0259b40a";

// Declare page elements
cityInputEl = document.querySelector("#city-input");
cityListEl = document.querySelector("#cities");
searchCityButtonEl = document.querySelector(".btn-primary");

/**
 * !Function to update city selection from local storage
 */
function loadStoredCities(singleCity) {
    // Initialize cityList
    let cityList = [];

    // Add an incremental city or load the entire list from local storage
    if (singleCity) {
        cityList = [{ name: singleCity }];
    } else {
        // Get list of cities from local storage
        cityList = JSON.parse(localStorage.getItem("cityList"));
        if (!cityList) {
            console.log("No cities are stored in local storage");
            cityList = [];
        }
    }

    // Loop over each city and add to city list and get the latest weather
    cityList.forEach((element) => {
        // Create a new list item
        const cityEl = document.createElement("li");
        cityEl.textContent = element.name;
        cityEl.classList = "list-group-item city-list";
        cityEl.id = element.name;
        cityEl.attributes = "city";
        cityListEl.appendChild(cityEl);

        // Make each element clickable
        cityEl.addEventListener("click", function (event) {
            // Isolate the button that is active and toggle off the property
            const activeEl = document.querySelector(".active");
            if (activeEl) {
                const classes = activeEl.classList;
                classes.remove("active");
            }

            // Then toggle on the button that was just clicked
            cityEl.classList = "list-group-item city-list active";

            // Fetch weather forecast
            // Reach into localstorage and populate cityCoordinates
            cityList = JSON.parse(localStorage.getItem("cityList"));

            let cityCoordinates = {
                name: "",
                longitude: "",
                latitude: "",
            };
            cityList.forEach((element) => {
                if (element.name === cityEl.id) {
                    cityCoordinates = {
                        name: element.name,
                        longitude: element.longitude,
                        latitude: element.latitude,
                    };
                }
            });

            // Get the weather for the selected city
            let x = getCityWeather(cityCoordinates);
            console.log(x);
        });
    });
}

/**
 * !Function to get weather data for an individual city
 */
function getCityCoordinates(city) {
    // Generate URL to get city coordinates
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${apiKey}`;

    // Fetch data city coordinates
    fetch(apiUrl).then(function (response) {
        if (response.ok) {
            response.json().then(function (data) {
                let cityCoordinates = {
                    name: city,
                    longitude: data.coord.lat,
                    latitude: data.coord.lon,
                };
                console.log(`Latitude and longitude for ${city} retrieved`);

                // Save city to local storage
                saveCity(cityCoordinates);
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
                data.daily.forEach((element) => {
                    cityWeather.temperature.push(element.temp.day);
                    cityWeather.windSpeed.push(element.wind_speed);
                    cityWeather.humidity.push(element.humidity);
                });

                console.log(
                    "Current and forecast conditions successfully retrieved"
                );
                console.log(cityWeather);
            });
        } else {
            console.log("Weather is not currently available");
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
function saveCity(cityCoordinates) {
    // Fetch existing cities and store in a local object
    cityList = JSON.parse(localStorage.getItem("cityList"));

    // If cityList is empty then initialize
    if (!cityList) {
        cityList = [];
    }

    // Check to see if the city is already stored. If not, add the city to the list.
    cityExists = false;
    cityList.forEach((element) => {
        if (element.name === cityCoordinates.name) {
            // City exists in local storage
            cityExists = true;
        }
    });

    // If the city does not exist then push on to the array
    if (!cityExists) {
        cityList.push(cityCoordinates);
    }

    // Stringify and write data to local storage
    localStorage.setItem("cityList", JSON.stringify(cityList));
}

/**
 * ! Search for a city
 */
var cityInputHandler = function () {
    var city = cityInputEl.value.trim();

    // TODO - If city is not valid, then surface that to the user
    if (city) {
        getCityCoordinates(city);
        loadStoredCities(city);
        cityInputEl.value = "";
    }
};

/**
 * ! Init function
 */
function init() {
    // Load cities from local storage
    loadStoredCities();
}

init();

/**
 * ! Event listener to search for new cities that are input
 * TODO - enable the search to respond to an enter key
 */
// searchCityButtonEl.addEventListener("click", function () {
//     // Override default HTML form behavior
//     //event.preventDefault();
//     cityInputHandler();
// });

searchCityButtonEl.addEventListener("click", cityInputHandler);
