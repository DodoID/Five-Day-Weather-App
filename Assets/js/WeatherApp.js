// Creates an empty array for history, retrieve history from local storage if possible and parse into JSON.
let history
if (history = localStorage.getItem('history')) history = JSON.parse(history)
else history = []

