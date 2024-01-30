// Creates an empty array for history, retrieve history from local storage if possible and parse into JSON.
let history
if (history = localStorage.getItem('history')) history = JSON.parse(history)
else history = []


$(function() {
    // Current Day Selectors
    const currentDate = $('#current-date')
    const currentTemp = $('#current-temp')
    const currentWind = $('#current-wind')
    const currentHumidity = $('#current-humidity')
    const currentIcon = $('#current-icon')
    const currentLocation = $('#current-location')
  
    // Search History
    const historyResults = $('#search-history-results ul')
  
    // User Input
    const input = $('#search-input')
    const submit = $('#search-button')
  
    // Date
    const today = dayjs()
  
    // API
    const API = '48b07bd68d0080693bbfa55aee600e2b'
  
    // Run initial functions to establish dynamic DOM elements
    displaySearch(input)                                // Establish listeners to display search results
    displaySearchHistory(historyResults, input, submit) // Display search history
  
    // Begin process of fetching API
    submit.on('click', function(e) {
      e.preventDefault()
    
      // Basic input validation
      const userInput = input.val()
      if (userInput.length < 1) {
        alert('Please enter your location before pressing submit')
        return
      }

      