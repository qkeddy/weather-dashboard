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

        // Isolate the button that is active and toggle off the property and make the new city active
        if (singleCity) {
            const activeEl = document.querySelector(".active");
            if (activeEl) {
                activeEl.classList.remove("active");
            }
            // Then toggle on the button that was just clicked
            cityEl.classList = "list-group-item city-list active";
        }

        // Make each element clickable
        cityEl.addEventListener("click", function (event) {
            // Isolate the button that is active and toggle off the property
            const activeEl = document.querySelector(".active");
            if (activeEl) {
                activeEl.classList.remove("active");
            }

            // Then toggle on the button that was just clicked
            cityEl.classList = "list-group-item city-list active";

            // Reach into local storage and populate cityCoordinates for the selected city
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
                    // Create new object in cities array
                    let cityCoordinates = {
                        name: data.name,
                        longitude: data.coord.lon,
                        latitude: data.coord.lat,
                    };

                    // Add city to the cityList
                    cityList.push(cityCoordinates);

                    // Stringify and write data to local storage
                    localStorage.setItem("cityList", JSON.stringify(cityList));

                    // Add city to side bar
                    loadStoredCities(cityCoordinates.name);

                    // Set newly added city to focus
                    getCityWeather(cityCoordinates);

                    console.log(`Latitude and longitude for ${city} retrieved and added to side bar`);
                });
            } else {
                // Find element for invalid city
                let invalidCityEl = document.querySelector("#invalid-city");

                // Set color to red to notify the user
                invalidCityEl.setAttribute("style", "text-align: center; color: red;");
                invalidCityEl.textContent = `"${city}" is not a valid city name`;

                // Display invalid city for 2 seconds
                setTimeout(function () {
                    invalidCityEl.setAttribute("style", "text-align: center; color: white;");
                    invalidCityEl.textContent = "-";
                }, 2000);

                console.log(`"${city}" is not a valid city name`);
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

                console.log("Current and forecast conditions successfully retrieved");
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
    currentConditionsEl.children[0].children[1].setAttribute("src", `http://openweathermap.org/img/wn/${data.current.weather[0].icon}@2x.png`);
    currentConditionsEl.children[0].children[1].setAttribute("alt", `Icon of ${data.current.weather[0].description}`);
    currentConditionsEl.children[0].children[2].textContent = `${data.current.weather[0].description}`;
    currentConditionsEl.children[1].children[0].textContent = `Temperature: ${parseInt(data.current.temp)} F`;
    currentConditionsEl.children[1].children[1].textContent = `Wind Speed: ${parseInt(data.current.wind_speed)} mph`;
    currentConditionsEl.children[1].children[2].textContent = `Humidity: ${parseInt(data.current.humidity)}%`;
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
    for (let i = 0; i < 5; i++) {
        let element = data.daily[i];

        // initialize a page element with an incremented counter to account for the ID names
        let forecastEl = document.querySelector(`#day${i + 1}`);

        //console.log(forecastEl.children[0]);
        let forecastDate = new Date(element.dt * 1000).toLocaleDateString("en-US").slice(0, -5);
        forecastEl.children[0].children[0].textContent = forecastDate;
        forecastEl.children[0].children[1].setAttribute("src", `http://openweathermap.org/img/wn/${element.weather[0].icon}@2x.png`);
        forecastEl.children[1].children[0].textContent = `Temp: ${parseInt(element.temp.day)} F`;
        forecastEl.children[1].children[1].textContent = `Wind: ${parseInt(element.wind_speed)} mph`;
        forecastEl.children[1].children[2].textContent = `Hum: ${parseInt(element.humidity)}%`;
    }
}

/**
 * ! Init function
 */
function init() {
    // Load cities from local storage
    loadStoredCities();

    //Automatically refresh weather every 60 minutes
    setInterval(function () {
        activeCityEl = document.querySelector(".active");
        if (activeCityEl) {
            // Get list of cities from local storage
            cityList = JSON.parse(localStorage.getItem("cityList"));

            // initialize cityCoordinate
            let cityCoordinates = {
                name: "",
                longitude: "",
                latitude: "",
            };

            // Isolate the selected city
            cityList.forEach((element) => {
                if (element.name === activeCityEl.id) {
                    cityCoordinates = {
                        name: element.name,
                        longitude: element.longitude,
                        latitude: element.latitude,
                    };

                    // Refresh the matching city
                    getCityWeather(cityCoordinates);

                    console.log(`${element.name}'s weather has been updated`);
                }
            });
        }
    }, 3600000);
}

init();

/**
 * ! Event listener to search for new cities that are input
 */
searchCityFormEl.addEventListener("submit", function (event) {
    // Prevent default behavior
    event.preventDefault();

    var city = cityInputEl.value.trim();

    // If text was entered, the attempt to get the city coordinates
    if (city) {
        // Get the city coordinates and check to see if the city is valid
        getCityCoordinates(city);

        // Clear out input box
        cityInputEl.value = "";
    }
});
