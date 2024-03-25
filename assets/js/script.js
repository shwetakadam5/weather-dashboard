// Get the references of DOM Elements

const searchFormEl = $('#search-form');
const cityNameInputEl = $('#city-name-input');
const API_KEY ="6afdca3269d40e485ee98de1af3ed1db";

//  Adds a weather details to local storage and prints the weather data
function handleSearchFormSubmit(event) {
    event.preventDefault();     
    // TO be used URLS
    // https://api.openweathermap.org/data/2.5/weather?q=Melbourne,AU&appid=6afdca3269d40e485ee98de1af3ed1db
    // http://api.openweathermap.org/data/2.5/forecast?lat=-37.8547&lon=145.1853&appid=6afdca3269d40e485ee98de1af3ed1db

    //api.openweathermap.org/data/2.5/forecast/daily?lat=-37.8547&lon=145.1853&cnt=5&appid=6afdca3269d40e485ee98de1af3ed1db

  //  Read user input from the form
  const cityName = cityNameInputEl.val().trim();
  console.log(cityName);
  console.log(API_KEY);

  const params = new URLSearchParams();
  params.append(`q`, `${cityName}`);
  params.append(`units`, `imperial`);
//metric Temp is celcius and speed is meter per second
//imperial Temp is Fahrenheit and speed is miles per hour MPH
  params.append(`appid`, `${API_KEY}`);
//   ?q={cityName}&appid={API_KEY}'&units=imperial;



const requestUrl = new URL('https://api.openweathermap.org/data/2.5/weather');
requestUrl.search = params.toString();


console.log(requestUrl);

fetch(requestUrl)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      console.log(data);
      console.log(data.coord);
      console.log(data.coord.lon);
      console.log(data.coord.lat);
      console.log(data.dt);

      const unixFormat = dayjs.unix(data.dt).format('MMM D, YYYY, hh:mm:ss a');
      console.log(unixFormat);

      console.log(data.name);
      console.log(data.main.temp);
      console.log(data.wind.speed);
      console.log(data.main.humidity);

      fetchDailyForecast(data.coord);


    });

}


function fetchDailyForecast(locationCoords) {

    //  Read user input from the form
  const locationLongitude = locationCoords.lon;
  const locationLatitude = locationCoords.lat;
  console.log(locationLongitude);
  console.log(locationLatitude);

  const params = new URLSearchParams();
  params.append(`lat`, `${locationLatitude}`);
  params.append(`lon`, `${locationLongitude}`);
  params.append(`units`, `imperial`);

//metric Temp is celcius and speed is meter per second
//imperial Temp is Fahrenheit and speed is miles per hour MPH

  params.append(`appid`, `${API_KEY}`);
//   ?lat=-37.8547&lon=145.1853&appid=6afdca3269d40e485ee98de1af3ed1db



const dailyRequestUrl = new URL('http://api.openweathermap.org/data/2.5/forecast');
dailyRequestUrl.search = params.toString();


console.log(dailyRequestUrl);

fetch(dailyRequestUrl)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      console.log(data);
     


    });

}


//  Add event listener to the form element, listen for a submit event, and call the `handleSearchFormSubmit` function.
searchFormEl.on('submit', handleSearchFormSubmit);

//  When the document is ready, print the weather data to the screen 
$(document).ready(function () {

    // Define the method to fetch info from local storage and display
    // printWeatherData();

});
