// Declare global variables
apiKey = "64af714a02193243ce10430d0259b40a";

// Declare page elements
cityInputEl = document.querySelector("#city-input");
cityListEl = document.querySelector("#cities");
searchCityButtonEl = document.querySelector(".btn-primary");
cityFocusEl = document.querySelector("#focus-city");

day1DateEl = document.querySelector("#day1");
day2DateEl = document.querySelector("#day2");
day3DateEl = document.querySelector("#day3");
day4DateEl = document.querySelector("#day4");
day5DateEl = document.querySelector("#day5");

currentConditionsEl = document.querySelector("#current-conditions");

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
            //let cityWeather = getCityWeather(cityCoordinates);
            getCityWeather(cityCoordinates);

            // Refresh page elements
            //refreshWeatherDisplayElements(cityWeather);  // need to push this into the getCityWeather
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
                    longitude: data.coord.lon,
                    latitude: data.coord.lat,
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
    // Generate URL to get city weather by the coordinates
    const apiUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${cityCoordinates.latitude}&lon=${cityCoordinates.longitude}&units=imperial&exclude=minutely,hourly,alerts&appid=${apiKey}`;

    console.log(apiUrl);

    // Fetch data city coordinates
    fetch(apiUrl).then(function (response) {
        if (response.ok) {
            response.json().then(function (data) {
                // Set the current conditions
                let currDate = new Date(
                    data.current.dt * 1000
                ).toLocaleDateString("en-US");
                currentConditionsEl.children[0].children[0].textContent = `${cityCoordinates.name} (${currDate})`;
                currentConditionsEl.children[0].children[1].setAttribute(
                    "src",
                    `http://openweathermap.org/img/wn/${data.current.weather[0].icon}@2x.png`
                );
                currentConditionsEl.children[0].children[1].setAttribute(
                    "alt",
                    `Icon of ${data.current.weather[0].description}`
                );
                currentConditionsEl.children[0].children[2].textContent = `${data.current.weather[0].description}`;
                currentConditionsEl.children[1].children[0].textContent = `Temperature: ${data.current.temp} F`;
                currentConditionsEl.children[1].children[1].textContent = `Wind Speed: ${data.current.wind_speed} mph`;
                currentConditionsEl.children[1].children[2].textContent = `Humidity: ${data.current.humidity}%`;
                currentConditionsEl.children[1].children[3].textContent = `UV Index: ${data.current.uvi}`;

                // Color code the UV Index
                let uvIndexStyle = "uv-clear";
                if (0 < data.current.uvi && data.current.uvi < 3) {
                    uvIndexStyle = "uv-green";
                } else if (3 <= data.current.uvi && data.current.uvi < 6) {
                    uvIndexStyle = "uv-yellow";
                } else if (6 <= data.current.uvi && data.current.uvi < 8) {
                    uvIndexStyle = "uv-orange";
                } else if (8 <= data.current.uvi && data.current.uvi < 11) {
                    uvIndexStyle = "uv-red";
                } else if (11 <= data.current.uvi) {
                    uvIndexStyle = "uv-purple";
                }
                currentConditionsEl.children[1].children[3].classList = `list-group-item ${uvIndexStyle}`;

                // Set the daily forecast
                // data.daily.forEach((element) => {
                //     cityWeather.temperature.push(element.temp.day);
                //     cityWeather.windSpeed.push(element.wind_speed);
                //     cityWeather.humidity.push(element.humidity);
                // });

                console.log(
                    "Current and forecast conditions successfully retrieved"
                );

            });
        } else {
            console.log("Weather is not currently available");
            // Update elements on page
            cityFocusEl.textContent = `${cityWeather.city}'s weather is not available`;
        }
    });
}

/**
 * ! Function to update the date elements
 */
function setDateElements() {
    // Set date elements
    // TODO is this displaying the correct timezone?
    day1DateEl.textContent = moment().format("M/D");
    day2DateEl.textContent = moment().add(1, "d").format("M/D");
    day3DateEl.textContent = moment().add(2, "d").format("M/D");
    day4DateEl.textContent = moment().add(3, "d").format("M/D");
    day5DateEl.textContent = moment().add(4, "d").format("M/D");
    // console.log(new Date(1648900800 * 1000).toLocaleDateString("en-US").slice(0,-5));
}

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
    setDateElements();
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
