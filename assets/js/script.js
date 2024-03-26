// Get the references of DOM Elements
const searchFormEl = $('#search-form');
const cityNameInputEl = $('#city-name-input');
const API_KEY = "6afdca3269d40e485ee98de1af3ed1db";
const redirectUrl = './404.html';

const searchContainerEl = document.querySelector('#search-container');


// Accepts array of city names as search history, stringifys them, and saves them in localStorage.
function saveSearchHistoryToStorage(cities) {
    localStorage.setItem('cities', JSON.stringify(cities));
}


function readSearchHistoryFromStorage() {

    let cityNames = JSON.parse(localStorage.getItem('cities'));

    // ? If no citynames were retrieved from localStorage, assign projects to a new empty array to push to later.
    if (!cityNames) {
        cityNames = [];
    }

    // ? Return the city names array either empty or with data in it whichever it was determined to be by the logic right above.
    return cityNames;
}



// Accepts array of city names as search history, stringifys them, and saves them in localStorage.
function saveSearchHistoryToStorage(cities) {
    localStorage.setItem('cities', JSON.stringify(cities));
}

//  Adds a weather details to local storage and prints the weather data
function handleSearchFormSubmit(event) {

    event.preventDefault();
    let cityName;
    //  Read user input from the form
    if(cityNameInputEl.val().trim() != ""){
    cityName = cityNameInputEl.val().trim();
    console.log(cityName);
    }else {
    console.log(this);
        cityName = $(this).attr('value');
        console.log("Extracting city name from search history button")
        console.log(cityName);

    }
    console.log(API_KEY);

    const params = new URLSearchParams();
    params.append(`q`, `${cityName}`);
    params.append(`units`, `imperial`);
    // Units : In Metric -> Temp : celcius ,speed : meter per second And In Imperial -> Temp : Fahrenheit , Speed : miles per hour MPH
    params.append(`appid`, `${API_KEY}`);

    //   ?q={cityName}&appid={API_KEY}'&units=imperial;

    const requestUrl = new URL('https://api.openweathermap.org/data/2.5/weather');
    requestUrl.search = params.toString();
    console.log(requestUrl);

    fetch(requestUrl)
        .then(function (response) {
            if(response.status == 404){
                // location.replace(redirectUrl);
                alert(`Error Msg: ${response.statusText}. Redirecting to error page.`);
                location.href=(redirectUrl);
              }else{
            return response.json();
              }
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



            // Start of new fetch request 
            //  Read needed data from the response
            const locationLongitude = data.coord.lon;
            const locationLatitude = data.coord.lat;
            console.log(locationLongitude);
            console.log(locationLatitude);

            const params = new URLSearchParams();
            params.append(`lat`, `${locationLatitude}`);
            params.append(`lon`, `${locationLongitude}`);
            params.append(`units`, `imperial`);

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

                    console.log(data.list);
                    //loop thru the entire record and extract the first unique date record.
                    const dailyWeatherRecords = data.list;
                    const uniqueDates = [];
                    const uniqueDateDailyRecords = [];

                    for (const dailyrecord of dailyWeatherRecords) {
                        console.log(dailyrecord.dt);
                        const uniquedate = dayjs.unix(dailyrecord.dt).format('MMM D, YYYY');
                        console.log(uniquedate);

                        if (!uniqueDates.includes(uniquedate)) {
                            console.log("TRUE");
                            uniqueDates.push(uniquedate);
                            uniqueDateDailyRecords.push(dailyrecord);
                        }

                        if (uniqueDateDailyRecords.length === 5) {
                            break; // Stop once we have 5 unique records
                        }

                    }

                    console.log("Display 5 unique date records")
                    console.log(uniqueDates);
                    console.log(uniqueDateDailyRecords.length);
                    console.log(uniqueDateDailyRecords);

                    // Loop logic end
                });

            // End of new fetch request           


            const cityNames = readSearchHistoryFromStorage();

            //logic to ensure that duplicate city names are not in the search history
            if(!cityNames.map(item => item.cityname).includes(data.name)){
                console.log(`City Value NOT present in the storage`);
                const searchHistoryDetails = {
                    id: crypto.randomUUID(),
                    cityname: data.name,
                };
                cityNames.push(searchHistoryDetails);
                saveSearchHistoryToStorage(cityNames);
            }    

            printWeatherData();
            cityNameInputEl.val('');            
        });
        

}


function printWeatherData() {
    const searchHistory = readSearchHistoryFromStorage();
    
    
    for (let historyObj of searchHistory) {
        $("#" + historyObj.id).remove(); 

    }
      
    // ? Loop through projects and create project cards for each status
    for (let historyObj of searchHistory) {
      
        // <li class="list-group-item">
        // <button id="primary-submit" type="submit" class="btn btn-primary form-control">Search</button>                        
        // </li>    
    

        const historyEl = document.createElement('li');

        historyEl.classList = 'list-group-item';
        historyEl.setAttribute('id', historyObj.id);

        const historyBtnEl = document.createElement('button');
        historyBtnEl.setAttribute('id', historyObj.id);
        historyBtnEl.setAttribute('type', 'click');
        historyBtnEl.classList = 'btn btn-primary form-control';
        historyBtnEl.textContent = "Search by " + historyObj.cityname;
        historyBtnEl.setAttribute('value', historyObj.cityname);
        historyEl.appendChild(historyBtnEl);
    
        searchContainerEl.appendChild(historyEl);
    

    }
  
    
  }

//  Add event listener to the form element, listen for a submit event, and call the `handleSearchFormSubmit` function.
searchFormEl.on('submit', handleSearchFormSubmit);


searchFormEl.on('click', '.btn', handleSearchFormSubmit);

//  When the document is ready, print the weather data to the screen 
$(document).ready(function () {

    // Define the method to fetch info from local storage and display
    printWeatherData();

});


// TO be used URLS
// https://api.openweathermap.org/data/2.5/weather?q=Melbourne,AU&appid=6afdca3269d40e485ee98de1af3ed1db
// http://api.openweathermap.org/data/2.5/forecast?lat=-37.8547&lon=145.1853&appid=6afdca3269d40e485ee98de1af3ed1db
//api.openweathermap.org/data/2.5/forecast/daily?lat=-37.8547&lon=145.1853&cnt=5&appid=6afdca3269d40e485ee98de1af3ed1db