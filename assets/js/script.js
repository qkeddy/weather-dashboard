// Declare global variables
apiKey = "64af714a02193243ce10430d0259b40a";

// Declare page elements
let cityInputEl = document.querySelector("#city-input");
let cityListEl = document.querySelector("#cities");
let searchCityFormEl = document.querySelector("form");
let cityFocusEl = document.querySelector("#focus-city");

let currentConditionsEl = document.querySelector("#current-conditions");

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
            getCityWeather(cityCoordinates);
        });
    });
}

/**
 * !Function to get weather data for an individual city
 */
function getCityCoordinates(city) {
    // Fetch existing cities and store in a local object
    cityList = JSON.parse(localStorage.getItem("cityList"));

    // If cityList is empty then initialize
    if (!cityList) {
        cityList = [];
    }

    // Check to see if the city is already stored. If not, add the city to the list.
    cityExists = false;
    cityList.forEach((element) => {
        if (element.name.toUpperCase() === city.toUpperCase()) {
            // City exists in local storage
            cityExists = true;
        }
    });

    // If city does not exist, then fetch city coordinates and add to local storage
    if (!cityExists) {
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

                    // Add city to the cityList
                    cityList.push(cityCoordinates);

                    // Stringify and write data to local storage
                    localStorage.setItem("cityList", JSON.stringify(cityList));

                    // Add city to side bar
                    loadStoredCities(city);

                    // Set newly added city to focus
                    getCityWeather(cityCoordinates);

                    console.log(
                        `Latitude and longitude for ${city} retrieved and added to side bar`
                    );
                });
            } else {
                console.log(`${city} is not a valid city name`);
            }
        });
    }
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
                updatePage(data, cityCoordinates);

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
 * ! Refresh the page with the weather data for the selected city
 * @param {*} data
 * @param {*} cityCoordinates
 */
function updatePage(data, cityCoordinates) {
    // Set the current conditions
    let currDate = new Date(data.current.dt * 1000).toLocaleDateString("en-US");
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
    data.daily.forEach((element, i) => {
        let forecastEl = document.querySelector(`#day${i + 1}`);
        //console.log(forecastEl);
        //console.log(forecastEl.children[0]);
        // TODO - why does this not work?
        //console.log(document.querySelector(`#day${i}`).children[0]);

        // forecastEl.children[0].children[0].textContent = element.dt;
        // forecastEl.children[1].children[0].textContent =
        //     element.temp.day;
        // forecastEl.children[1].children[1].textContent =
        //     element.temp.wind_speed;
        // forecastEl.children[1].children[2].textContent =
        //     element.temp.humidity;
    });
}

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
 */
searchCityFormEl.addEventListener("submit", function (event) {
    // Prevent default behavior
    event.preventDefault();

    var city = cityInputEl.value.trim();

    // TODO - If city is not valid or is a duplicate, then surface that to the user
    if (city) {
        // Get the city coordinates and check to see if the city is valid
        getCityCoordinates(city);

        // Clear out input box
        cityInputEl.value = "";
    }
});
