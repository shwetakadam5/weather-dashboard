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

    // let fetchedWeatherRecords = {
               
    //     currentcity: "",
    //     currentdate: "",
    //     currenttemp: "",
    //     currentwindspeed: "",
    //     currenthumidity: "",
    //     currentlongitude: "",
    //     currentlatitude: "",
    //     dailyforecast :[],

    // };
    //  Read user input from the form
    if (cityNameInputEl.val().trim() != "") {

        cityName = cityNameInputEl.val().trim();
        console.log(cityName);

    } else {
          //  Read city name from search button created from search history
        console.log(this);
        cityName = $(this).attr('value');
        console.log("Extracting city name from search history button")
        console.log(cityName);
    }    

    const params = new URLSearchParams(); 
    
    //Building query parameters as : ?q={cityName}&appid={API_KEY}'&units=imperial;

    params.append(`q`, `${cityName}`);
     // Units : In Metric -> Temp : celcius ,speed : meter per second And In Imperial -> Temp : Fahrenheit , Speed : miles per hour MPH
    params.append(`units`, `imperial`);   
    params.append(`appid`, `${API_KEY}`);

   

    const requestUrl = new URL('https://api.openweathermap.org/data/2.5/weather');
    requestUrl.search = params.toString();
    console.log(requestUrl);

    fetch(requestUrl)
        .then(function (response) {

            //If response is 404 redirecting to the error page.
            if (!response.ok) {                
                alert(`Error Msg: ${response.statusText}. Redirecting to error page.`);
                location.href = (redirectUrl);
            } else {
                return response.json();
            }

        })
        .then(function (data) {

            console.log(data);
            console.log(data.coord);
            console.log(data.coord.lon);
            console.log(data.coord.lat);
            console.log(data.dt);

            const unixFormat = dayjs.unix(data.dt).format('M/DD/YYYY');            
            console.log(unixFormat);
            console.log(data.name);
            console.log(data.main.temp);
            console.log(data.wind.speed);
            console.log(data.main.humidity);

            let fetchedWeatherRecords = {
               
                currentcity: data.name,
                currentdate: unixFormat,
                currenttemp: data.main.temp,
                currentwindspeed: data.wind.speed,
                currenthumidity: data.main.humidity,
                currentlongitude: data.coord.lon,
                currentlatitude: data.coord.lat,
                dailyforecast :[],

            };

            console.log(fetchedWeatherRecords);
            // Start of the fetch request for 5 day weather forecast.
            //  Read needed data from the response
            const locationLongitude = data.coord.lon;
            const locationLatitude = data.coord.lat;

            console.log(locationLongitude);
            console.log(locationLatitude);

            const params = new URLSearchParams();
             //Building query parameters as : ?lat=-37.8547&lon=145.1853&appid=6afdca3269d40e485ee98de1af3ed1db
            params.append(`lat`, `${locationLatitude}`);
            params.append(`lon`, `${locationLongitude}`);
            params.append(`units`, `imperial`);
            params.append(`appid`, `${API_KEY}`);
           

            const dailyRequestUrl = new URL('http://api.openweathermap.org/data/2.5/forecast');
            dailyRequestUrl.search = params.toString();
            console.log(dailyRequestUrl);

            fetch(dailyRequestUrl)
                .then(function (response) {
                    return response.json();
                })
                .then(function (data) {

                    console.log(data.list);


                   

                    
                    //loop thru the entire record and extract the first unique date record.
                    const dailyWeatherRecords = data.list;
                    const uniqueDates = [];
                    const uniqueDateDailyRecords = [];

                    for (const dailyrecord of dailyWeatherRecords) {
                        console.log(dailyrecord.dt);
                        const uniquedate = dayjs.unix(dailyrecord.dt).format('M/DD/YYYY');
                        console.log(uniquedate);
                        const dayWeatherRecords ={
                        
                            forecastdate: "",
                            forecasttemp: "",
                            forecastwindspeed: "",
                            forecasthumidity: "",                      
    
                        }

                        if (!uniqueDates.includes(uniquedate) && fetchedWeatherRecords.currentdate != uniquedate) {
                            console.log("************************************************************");
                            uniqueDates.push(uniquedate);
                             //start
                          
                            dayWeatherRecords.forecastdate = dailyrecord.dt;
                            dayWeatherRecords.forecasthumidity = dailyrecord.main.humidity;
                            dayWeatherRecords.forecasttemp =dailyrecord.main.temp;
                            dayWeatherRecords.forecastwindspeed =dailyrecord.wind.speed;
                            //end
                            console.log(dayWeatherRecords);
                            uniqueDateDailyRecords.push(dayWeatherRecords);
                            console.log(uniqueDateDailyRecords);
                        }

                        if (uniqueDateDailyRecords.length === 5) {
                            console.log("HI I AM HERRE")
                            break; // Stop once we have 5 unique records
                        }

                        console.log("HI I NEVER ENTERED")

                    }

                    // console.log("Display 5 unique date records")
                    // console.log(uniqueDates);
                     
                    fetchedWeatherRecords.dailyforecast = uniqueDateDailyRecords;
                    console.log(fetchedWeatherRecords);
                    console.log(fetchedWeatherRecords.dailyforecast[0]);

                    console.log("************************************************************");

                    // Loop logic end
                    const cityNames = readSearchHistoryFromStorage();

                    //logic to ensure that duplicate city names are not in the search history
                    if (!cityNames.map(item => item.cityname).includes(fetchedWeatherRecords.currentcity)) {
                        console.log(`City Value NOT present in the storage`);
                        const searchHistoryDetails = {
                            id: crypto.randomUUID(),
                            cityname: fetchedWeatherRecords.currentcity,
                        };
                        cityNames.push(searchHistoryDetails);
                        saveSearchHistoryToStorage(cityNames);
                    }
        
                    printWeatherData(fetchedWeatherRecords);


                });

            // End of new fetch request           


           
            cityNameInputEl.val('');
        });

}

// Function to render/display the current weather details along with the search history buttons
function printWeatherData(fetchedWeatherRecords) {

    console.log(fetchedWeatherRecords);
    const searchHistory = readSearchHistoryFromStorage();

    for (let historyObj of searchHistory) {
        $("#" + historyObj.id).remove();
    }

    $('#current-weather').empty();    
    $('#daily-weather').empty();    

    // ? Loop through search histpry and create search history buttons for each city
    for (let historyObj of searchHistory) {

        // <li class="list-group-item">
        // <button id="primary-submit" type="submit" class="btn btn-primary form-control">Search</button>                        
        // </li>    

        const historyEl = document.createElement('li');

        historyEl.classList = 'list-group-item';
        historyEl.setAttribute('id', historyObj.id);

        const historyBtnEl = document.createElement('button');
        historyBtnEl.setAttribute('id', 'search-history-submit');
        historyBtnEl.setAttribute('type', 'click');
        historyBtnEl.classList = 'btn btn-primary form-control';
        historyBtnEl.textContent = "Search by " + historyObj.cityname;
        historyBtnEl.setAttribute('value', historyObj.cityname);
        historyEl.appendChild(historyBtnEl);

        searchContainerEl.appendChild(historyEl);

    }
    console.log(fetchedWeatherRecords);
    createWeatherCard(fetchedWeatherRecords);
}

// ? Creates a weather card from the information passed in `weather` parameter and returns it.
function createWeatherCard(fetchedWeatherRecords) {

    console.log(fetchedWeatherRecords);   

/* <div class="card weather-card my-3 text-black">
    <div class ="card-header h4">City name
        <p class="card-text">Date details</p>
    </div>
    
    <div class="card-body">
        <p class="card-text">Temperature</p>
        <p class="card-text">Humidity</p>
        <p class="card-text">Speed</p>
    </div>

</div>      */     

 
if(fetchedWeatherRecords!=null){
          const weatherCardEl = document.createElement('div');
          weatherCardEl.classList = 'card weather-card m-3 text-black';
         
          const weatherCardHeaderEl = document.createElement('div');
          weatherCardHeaderEl.classList = 'card-header h4';
         
          weatherCardHeaderEl.textContent = fetchedWeatherRecords.currentcity;
           
          const weatherCardHeaderParaEl = document.createElement('p');
          weatherCardHeaderParaEl.classList ='card-text';
          weatherCardHeaderParaEl.textContent = fetchedWeatherRecords.currentdate;

          const weatherCardBodyEl = document.createElement('div');
          weatherCardBodyEl.classList ='card-body';

          const weatherCardBodyTempEl = document.createElement('p');
          weatherCardBodyTempEl.classList ='card-text';
          weatherCardBodyTempEl.textContent =fetchedWeatherRecords.currenttemp;
          const weatherCardBodyHumidityEl = document.createElement('p');
          weatherCardBodyHumidityEl.classList ='card-text';
          weatherCardBodyHumidityEl.textContent =fetchedWeatherRecords.currenthumidity;
          const weatherCardBodyWindEl = document.createElement('p');
          weatherCardBodyWindEl.classList ='card-text';
          weatherCardBodyWindEl.textContent =fetchedWeatherRecords.currentwindspeed;


          weatherCardHeaderEl.appendChild(weatherCardHeaderParaEl);
          weatherCardBodyEl.appendChild(weatherCardBodyTempEl);
          weatherCardBodyEl.appendChild(weatherCardBodyHumidityEl);
          weatherCardBodyEl.appendChild(weatherCardBodyWindEl);

          weatherCardEl.appendChild(weatherCardHeaderEl);
          weatherCardEl.appendChild(weatherCardBodyEl);
          currentWeatherContainerEl.appendChild(weatherCardEl);
console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%")
console.log(fetchedWeatherRecords);
console.log(fetchedWeatherRecords.dailyforecast);

          const dailyWeatherRecords =fetchedWeatherRecords.dailyforecast;

          console.log(dailyWeatherRecords.length);
         

          for (let index = 0; index < dailyWeatherRecords.length; index++) {
            const dayRecord = dailyWeatherRecords[index];
            console.log(dayRecord);
            console.log(dayRecord.forecastdate);
            console.log(dayRecord.forecasthumidity);
            console.log(dayRecord.forecasttemp);
            console.log(dayRecord.forecastwindspeed);

            const dailyweatherCardEl = document.createElement('div');
            dailyweatherCardEl.classList = 'card weather-card m-3 text-black';
           
            const dailyweatherCardHeaderEl = document.createElement('div');
            dailyweatherCardHeaderEl.classList = 'card-header h4';
           
            dailyweatherCardHeaderEl.textContent = '';
             
            const dailyweatherCardHeaderParaEl = document.createElement('p');
            dailyweatherCardHeaderParaEl.classList ='card-text';
            dailyweatherCardHeaderParaEl.textContent = dayjs.unix(dayRecord.forecastdate).format('M/DD/YYYY');
            
            const dailyweatherCardBodyEl = document.createElement('div');
            dailyweatherCardBodyEl.classList ='card-body';
  
            const dailyweatherCardBodyTempEl = document.createElement('p');
            dailyweatherCardBodyTempEl.classList ='card-text';
            dailyweatherCardBodyTempEl.textContent =dayRecord.forecasttemp;
            const dailyweatherCardBodyHumidityEl = document.createElement('p');
            dailyweatherCardBodyHumidityEl.classList ='card-text';
            dailyweatherCardBodyHumidityEl.textContent =dayRecord.forecasthumidity;
            const dailyweatherCardBodyWindEl = document.createElement('p');
            dailyweatherCardBodyWindEl.classList ='card-text';
            dailyweatherCardBodyWindEl.textContent =dayRecord.forecastwindspeed;
  
  
            dailyweatherCardHeaderEl.appendChild(dailyweatherCardHeaderParaEl);
            dailyweatherCardBodyEl.appendChild(dailyweatherCardBodyTempEl);
            dailyweatherCardBodyEl.appendChild(dailyweatherCardBodyHumidityEl);
            dailyweatherCardBodyEl.appendChild(dailyweatherCardBodyWindEl);
  
            dailyweatherCardEl.appendChild(dailyweatherCardHeaderEl);
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

