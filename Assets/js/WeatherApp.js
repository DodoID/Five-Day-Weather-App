// Creates an empty array for history, retrieve history from local storage if possible and parse into JSON.
let history
if (history = localStorage.getItem('history')) history = JSON.parse(history)
else history = []


$(function() {
    // Current Day Selectors for the current day
    const currentDate = $('#current-date')
    const currentTemp = $('#current-temp')
    const currentWind = $('#current-wind')
    const currentHumidity = $('#current-humidity')
    const currentIcon = $('#current-icon')
    const currentLocation = $('#current-location')
  
    // Search History and User Input Selectors for the search history
    const historyResults = $('#search-history-results ul')
  
    // User Input
    const input = $('#search-input')
    const submit = $('#search-button')
  
    // Date
    const today = dayjs()
  
    // API
    const API = '48b07bd68d0080693bbfa55aee600e2b'
  
    // Run initial functions to establish dynamic DOM elements 
    displaySearch(input)                                // Establish listeners to display search results for the current day
    displaySearchHistory(historyResults, input, submit) // Display search history for the current day
  
    // Begin process of fetching API from the current day
    submit.on('click', function(e) {
      e.preventDefault()
    
      // Basic input validation
      const userInput = input.val()
      if (userInput.length < 1) {
        alert('Please enter your location before pressing submit')
        return
      }

      
    // Build geocoding URL for the current day and retrieve longitude and latitude
    const geocodingURL = `https://api.openweathermap.org/geo/1.0/direct?q=${userInput},GB&appid=${API}`

    // Fetch longitude and latitude
    fetch(geocodingURL)
    .then(function (response) {
      return response.json()
    })
    .then(function (data) {
      // Validate if a location was found in the API response
      if (data.length == 0) {
        alert('No location was found. Please do better next time ;).')
        return
      }

      // Retrieve longitude and latitude from data array
      const lon = data[0].lon
      const lat = data[0].lat
      const location = data[0].name
      
      // Build current day forecast URL from longitude and latitude
      const currentURL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API}`

      // Fetch current weather conditions from the current day
      fetch(currentURL)
      .then(function(response) {
        return response.json()
      })
      .then(function(data) {

        // Retrieve temp, wind, humidity and icon code from API response
        let temp = (data.main.temp - 273.15).toFixed(2) + '°'
        let wind = data.wind.speed + 'KPH'
        let humidity = data.main.humidity + '%'
        let icon = data.weather[0].icon
        
        // Add to DOM for current day and display
        currentLocation.text(location)
        currentDate.text(today.format('DD/MM/YY'))
        currentTemp.text(temp)
        currentWind.text(wind)
        currentHumidity.text(humidity)
        currentIcon.attr('src', iconURL(icon))

        // Store location in history and display in search results and local storage
        storeSearchHistory(location)
        displaySearchHistory(historyResults, input, submit)

        // Build 5 day forecast URL for the current day and retrieve longitude and latitude
        const forecastURL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API}`

        
        // Fetch 5 day forecast
        fetch(forecastURL)
          .then(function(response) {
            return response.json()
          })
          .then(function(data) {
            // List of all times
            const list = data.list
            
            // Get relevant data from Forecast Object and store in forecastSnapshots array
            const forecastSnapshots = []
            for (let i = 1; i < 6; i++) {
              let snapshot;
              // Try to get noon data
              if (snapshot = data.list.find((time) => time.dt == getUnixCode(i, 12))) {
                forecastSnapshots.push(snapshot)
                continue
              }
              // If noon data isnt available, get earliest possible time
              if (snapshot = data.list.find((time) => time.dt == getUnixCode(i, 0))) {
                forecastSnapshots.push(snapshot)
                continue
              }
              throw new Error(`Could not retrieve raw date element for ${i}th element of snapshot list`);
            }

            // Record 5 day forecast to DOM
            for (let i = 1; i < 6; i++) {
              // Dynamically get DOM elements
              let dateEl = $('#day'+i+'-date')
              let tempEl = $('#day'+i+'-temp')
              let windEl = $('#day'+i+'-wind')
              let humidityEl = $('#day'+i+'-humidity')
              let iconEl = $('#day'+i+'-icon')

              // Retrieve data from forecastSnapshots
              temp = (forecastSnapshots[i - 1].main.temp - 273.15).toFixed(2) +'°'
              wind = forecastSnapshots[i - 1].wind.speed +'KPH'
              humidity = forecastSnapshots[i - 1].main.humidity + '%'
              icon = forecastSnapshots[i - 1].weather[0].icon

              // Record to DOM
              dateEl.text(today.add(i, 'd').format('DD/MM/YY'))
              tempEl.text(temp)
              windEl.text(wind)
              humidityEl.text(humidity)
              iconEl.attr('src', iconURL(icon))
            }
          })
        })
      })
  })
})

// Function to build icon source URL
function iconURL(iconCode) {
  return `https://openweathermap.org/img/wn/${iconCode}@2x.png`
}

// Return unix code for given day / hour
function getUnixCode(day, hour) {
  let unix = dayjs()
    .add(day, 'd')
    .hour(hour)
    .startOf('hour')
    .unix()
  return unix;
}

// Create list elements and append to history search results
function displaySearchHistory(resultsEl, input, submit) {
  resultsEl.empty()
  let results = history.map(item => `
    <li data-result="${item}">
      <i class="fa-solid fa-location-dot"></i>
      ${item}
    </li>
  `)
  resultsEl.html(results.join(""))

  // Add event listener to list items
  $('#search-history-container li').on('click',{input, submit}, loadHistoryResult)
}

// Stringify history array and store in local storage
function storeSearchHistory(location) {
  const index = history.indexOf(location);
  if (index != -1) history.splice(index, 1)
  history.unshift(location)
  localStorage.setItem('history', JSON.stringify(history))
}

// Set up event listeners to display and hide search results
function displaySearch(input) {
  // Display search results
  const results = $('#search-history-results')
  input.focus(() => {
    results.removeClass('hidden')
  })
  
  // Hide search results - add timeout to allow results event listener priority
  input.blur(() => {
    setTimeout(() => results.addClass('hidden'), 100)
  })
}

// Load history result into search bar and initiate search
function loadHistoryResult(event) {
  let result = $(this).data('result')
  event.data.input.val(result)
  event.data.submit.trigger('click')
}

//  The End, Thank you for reading my magical code, you are great!!!