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