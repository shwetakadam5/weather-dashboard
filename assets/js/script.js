// Setting the API key for the server side api calls and the error page
const API_KEY = "6afdca3269d40e485ee98de1af3ed1db";
const redirectUrl = './servererrorpage.html';

// Get the references of DOM Elements
const searchFormEl = $('#search-form');
const cityNameInputEl = $('#city-name-input');
const searchContainerEl = document.querySelector('#search-container');
const currentWeatherContainerEl = document.querySelector('#current-weather');
const dailyWeatherContainerEl = document.querySelector('#daily-weather');

//  Function that saves the list/array of city names for search history to the local storage 
function saveSearchHistoryToStorage(cities) {

    localStorage.setItem('cities', JSON.stringify(cities));

}

// Function that retrieves the cities from local storage and returns city list. If no cities in local storage then returns empty list.
function readSearchHistoryFromStorage() {

    let cityNames = JSON.parse(localStorage.getItem('cities'));

    if (!cityNames) {
        cityNames = [];
    }

    return cityNames;

}


// Function to handle search weather details based on the input city name. This function identifies if there is a new search or search from the history.
// Once the weather details are retrieved , the weather information is displayed on the screen.
// This function has two api calls 
// https://api.openweathermap.org/data/2.5/weather?q=Melbourne,AU&appid=6afdca3269d40e485ee98de1af3ed1db
// http://api.openweathermap.org/data/2.5/forecast?lat=-37.8547&lon=145.1853&appid=6afdca3269d40e485ee98de1af3ed1db

function handleSearchFormSubmit(event) {

    event.preventDefault();

    let cityName;

    //  Read user input from the form
    if (cityNameInputEl.val().trim() != "") {
        cityName = cityNameInputEl.val().trim();
    } else {
        //  Read city name from search button created from search history       
        cityName = $(this).attr('value');
    }

    //Building query parameters as : ?q={cityName}&appid={API_KEY}'&units=imperial;
    const params = new URLSearchParams();
    params.append(`q`, `${cityName}`);
    // Units : In Metric -> Temp : celcius ,speed : meter per second And In Imperial -> Temp : Fahrenheit , Speed : miles per hour MPH
    params.append(`units`, `imperial`);
    params.append(`appid`, `${API_KEY}`);

    const requestUrl = new URL('https://api.openweathermap.org/data/2.5/weather');
    requestUrl.search = params.toString();
    console.log(`First API call url : ${requestUrl}`);


    fetch(requestUrl)
        .then(function (response) {

            //If response is error redirecting to the error page.
            if (!response.ok) {
                alert(`Error Msg: ${response.statusText}. Redirecting to error page.`);
                location.href = (redirectUrl);
            } else {
                return response.json();
            }

        })
        .then(function (data) {

            //converting date to the specific format and setting the date and rest values in the local object.
            const unixFormat = dayjs.unix(data.dt).format('M/DD/YYYY');         
            
            let fetchedWeatherRecords = {

                currentcity: data.name,
                currentdate: unixFormat,
                currenttemp: data.main.temp,
                currentwindspeed: data.wind.speed,
                currenthumidity: data.main.humidity,
                currentlongitude: data.coord.lon,
                currentlatitude: data.coord.lat,
                currentweathercond: data.weather[0].main,
                dailyforecast: [],

            };


            // Start of the fetch request for 5 day weather forecast.
            //  Read needed data from the response
            const locationLongitude = data.coord.lon;
            const locationLatitude = data.coord.lat;

            //Building query parameters as : ?lat=-37.8547&lon=145.1853&appid=6afdca3269d40e485ee98de1af3ed1db
            const params = new URLSearchParams();
            params.append(`lat`, `${locationLatitude}`);
            params.append(`lon`, `${locationLongitude}`);
            params.append(`units`, `imperial`);
            params.append(`appid`, `${API_KEY}`);


            const dailyRequestUrl = new URL('http://api.openweathermap.org/data/2.5/forecast');
            dailyRequestUrl.search = params.toString();

            console.log(`Second API call url : ${dailyRequestUrl}`);

            fetch(dailyRequestUrl)
                .then(function (response) {
                    return response.json();
                })
                .then(function (data) {                    

                    //Logic to loop through the entire return data list of 5day-3hr forecast and extract the first unique date record and date records other than current date
                    const dailyWeatherRecords = data.list;
                    const uniqueDates = [];
                    const uniqueDateDailyRecords = [];

                    for (const dailyrecord of dailyWeatherRecords) {                        

                        const uniquedate = dayjs.unix(dailyrecord.dt).format('M/DD/YYYY');

                        const dayWeatherRecords = {
                            forecastdate: "",
                            forecasttemp: "",
                            forecastwindspeed: "",
                            forecasthumidity: "",
                            forecastweathercond: "",

                        }

                        if (!uniqueDates.includes(uniquedate) && fetchedWeatherRecords.currentdate != uniquedate) {
                            uniqueDates.push(uniquedate);
                            //Setting values in the local object
                            dayWeatherRecords.forecastdate = dailyrecord.dt;
                            dayWeatherRecords.forecasthumidity = dailyrecord.main.humidity;
                            dayWeatherRecords.forecasttemp = dailyrecord.main.temp;
                            dayWeatherRecords.forecastwindspeed = dailyrecord.wind.speed;
                            dayWeatherRecords.forecastweathercond = dailyrecord.weather[0].main;
                            uniqueDateDailyRecords.push(dayWeatherRecords);
                        }

                        if (uniqueDateDailyRecords.length === 5) {
                            break; // Stop once we have 5 unique records
                        }

                    }

                    fetchedWeatherRecords.dailyforecast = uniqueDateDailyRecords;

                    //logic to ensure that duplicate city names are not in the search history
                    const cityNames = readSearchHistoryFromStorage();

                    if (!cityNames.map(item => item.cityname).includes(fetchedWeatherRecords.currentcity)) {
                        
                        const searchHistoryDetails = {
                            id: crypto.randomUUID(),
                            cityname: fetchedWeatherRecords.currentcity,
                        };
                        cityNames.push(searchHistoryDetails);
                        saveSearchHistoryToStorage(cityNames);
                    }

                    printWeatherData(fetchedWeatherRecords);

                });

            cityNameInputEl.val('');

        });
}

// Function to render/display the current weather details along with the search history buttons
function printWeatherData(fetchedWeatherRecords) {

    const searchHistory = readSearchHistoryFromStorage();

    for (let historyObj of searchHistory) {
        $("#" + historyObj.id).remove();
    }

    $('#current-weather').empty();
    $('#daily-weather').empty();

    $('#daily-forecast-title').css('display', 'none');


    // Loop through search histpry and create search history buttons for each city
    for (let historyObj of searchHistory) {

        const historyEl = document.createElement('li');
        historyEl.classList = 'list-group-item';
        historyEl.setAttribute('id', historyObj.id);

        const historyBtnEl = document.createElement('button');
        historyBtnEl.setAttribute('id', 'search-history-submit');
        historyBtnEl.setAttribute('type', 'click');
        historyBtnEl.classList = 'btn btn-secondary btn-custom form-control';
        historyBtnEl.textContent = historyObj.cityname;
        historyBtnEl.setAttribute('value', historyObj.cityname);

        historyEl.appendChild(historyBtnEl);

        searchContainerEl.appendChild(historyEl);

    }
    //invoke method to create weather cards.
    createWeatherCard(fetchedWeatherRecords);
}

// Function to create the weather cards from the information passed in `weather` parameter 
function createWeatherCard(fetchedWeatherRecords) {

    if (fetchedWeatherRecords != null) {

        $('#daily-forecast-title').css('display', 'block');
        //Create the current weather card
        const weatherCardEl = document.createElement('div');
        weatherCardEl.classList = 'card weather-card m-3 text-black';

        const weatherCardBodyEl = document.createElement('div');
        weatherCardBodyEl.classList = 'card-body';


        const weatherCardHeaderBodySpanEl = document.createElement('span');

        //logic for weather icon assignment
        const weatherCardHeaderBodyIconEl = document.createElement('i');
        if (fetchedWeatherRecords.currentweathercond == "Clouds") {
            weatherCardHeaderBodyIconEl.classList = 'fas fa-cloud-sun';
        } else if (fetchedWeatherRecords.currentweathercond == "Rain") {
            weatherCardHeaderBodyIconEl.classList = 'fas fa-cloud-rain';
        } else if (fetchedWeatherRecords.currentweathercond == "Clear") {
            weatherCardHeaderBodyIconEl.classList = 'fas fa-sun';
        }else if (fetchedWeatherRecords.currentweathercond == "Snow") {
            weatherCardHeaderBodyIconEl.classList = 'far fa-snowflake';
        }  else {
            weatherCardHeaderBodyIconEl.classList = 'far fa-sun';
        }

        const weatherCardHeaderBodyEl = document.createElement('p');
        weatherCardHeaderBodyEl.classList = 'h2 fw-bold';
        weatherCardHeaderBodyEl.textContent = fetchedWeatherRecords.currentcity + " (" + fetchedWeatherRecords.currentdate + ") ";

        const weatherCardBodyTempEl = document.createElement('p');
        weatherCardBodyTempEl.classList = 'card-text';
        weatherCardBodyTempEl.textContent = "Temp: " + fetchedWeatherRecords.currenttemp + " °" + "F";

        const weatherCardBodyWindEl = document.createElement('p');
        weatherCardBodyWindEl.classList = 'card-text';
        weatherCardBodyWindEl.textContent = "Wind: " + fetchedWeatherRecords.currentwindspeed + " MPH";

        const weatherCardBodyHumidityEl = document.createElement('p');
        weatherCardBodyHumidityEl.classList = 'card-text';
        weatherCardBodyHumidityEl.textContent = "Humidity: " + fetchedWeatherRecords.currenthumidity + " %";

        weatherCardHeaderBodySpanEl.appendChild(weatherCardHeaderBodyIconEl);
        weatherCardHeaderBodyEl.appendChild(weatherCardHeaderBodySpanEl);
        weatherCardBodyEl.appendChild(weatherCardHeaderBodyEl);
        weatherCardBodyEl.appendChild(weatherCardBodyTempEl);
        weatherCardBodyEl.appendChild(weatherCardBodyWindEl);
        weatherCardBodyEl.appendChild(weatherCardBodyHumidityEl);

        weatherCardEl.appendChild(weatherCardBodyEl);
        currentWeatherContainerEl.appendChild(weatherCardEl);

        //Create the 5 day weather cards
        const dailyWeatherRecords = fetchedWeatherRecords.dailyforecast;

        for (let index = 0; index < dailyWeatherRecords.length; index++) {

            const dayRecord = dailyWeatherRecords[index];

            const dailyweatherCardEl = document.createElement('div');
            dailyweatherCardEl.classList = 'card weather-card m-2 bg-custom text-custom';

            const dailyweatherCardBodyEl = document.createElement('div');
            dailyweatherCardBodyEl.classList = 'card-body';

            const dailyweatherCardHeaderBodySpanEl = document.createElement('span');

            //logic for weather icon assignment
            const dailyweatherCardHeaderBodyIconEl = document.createElement('i');

            if (dayRecord.forecastweathercond == "Clouds") {
                dailyweatherCardHeaderBodyIconEl.classList = 'fas fa-cloud-sun';
            } else if (dayRecord.forecastweathercond == "Rain") {
                dailyweatherCardHeaderBodyIconEl.classList = 'fas fa-cloud-rain';
            } else if (dayRecord.forecastweathercond == "Clear") {
                dailyweatherCardHeaderBodyIconEl.classList = 'fas fa-sun';
            }else if (dayRecord.forecastweathercond == "Snow") {
                dailyweatherCardHeaderBodyIconEl.classList = 'far fa-snowflake';
            } else {
                dailyweatherCardHeaderBodyIconEl.classList = 'far fa-sun';
            }

            const dailyweatherCardHeaderBodyEl = document.createElement('p');
            dailyweatherCardHeaderBodyEl.classList = 'h5 fw-bold';
            dailyweatherCardHeaderBodyEl.textContent = dayjs.unix(dayRecord.forecastdate).format('M/DD/YYYY') + " ";

            const dailyweatherCardBodyTempEl = document.createElement('p');
            dailyweatherCardBodyTempEl.classList = 'card-text';
            dailyweatherCardBodyTempEl.textContent = "Temp: " + dayRecord.forecasttemp + " °" + "F";

            const dailyweatherCardBodyWindEl = document.createElement('p');
            dailyweatherCardBodyWindEl.classList = 'card-text';
            dailyweatherCardBodyWindEl.textContent = "Wind: " + dayRecord.forecastwindspeed + " MPH";

            const dailyweatherCardBodyHumidityEl = document.createElement('p');
            dailyweatherCardBodyHumidityEl.classList = 'card-text';
            dailyweatherCardBodyHumidityEl.textContent = "Humidity: " + dayRecord.forecasthumidity + " %";

            dailyweatherCardHeaderBodySpanEl.appendChild(dailyweatherCardHeaderBodyIconEl);
            dailyweatherCardHeaderBodyEl.appendChild(dailyweatherCardHeaderBodySpanEl);
            dailyweatherCardBodyEl.appendChild(dailyweatherCardHeaderBodyEl);
            dailyweatherCardBodyEl.appendChild(dailyweatherCardBodyTempEl);
            dailyweatherCardBodyEl.appendChild(dailyweatherCardBodyWindEl);
            dailyweatherCardBodyEl.appendChild(dailyweatherCardBodyHumidityEl);

            dailyweatherCardEl.appendChild(dailyweatherCardBodyEl);
            dailyWeatherContainerEl.appendChild(dailyweatherCardEl);
        }
    }
}

//  Add event listener to the form element, listen for a submit event, and call the `handleSearchFormSubmit` function.
searchFormEl.on('submit', handleSearchFormSubmit);

//  Add event listener to the dynamically created button element, listen for a click event, and call the `handleSearchFormSubmit` function.
searchFormEl.on('click', '.btn', handleSearchFormSubmit);
//  $("#search-history-submit").on('click', '.btn', handleSearchFormSubmit);

//  When the document is ready, print the weather data to the screen 
$(document).ready(function () {
    // Define the method to fetch weather information from local storage and display
    printWeatherData();
});

