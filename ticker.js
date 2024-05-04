let count = 200;

function updateTicker() {
  const dayOfWeek = new Date().getDay();

  switch (dayOfWeek) {
    case 0: // Sunday
      count += 1;
      break;
    case 1: // Monday
      count += 2;
      break;
    case 2: // Tuesday
      count += 1;
      break;
    case 3: // Wednesday
      count += 4;
      break;
    case 4: // Thursday
      count += 3;
      break;
    case 5: // Friday
      count += 0;
      break;
    case 6: // Saturday
      count += 4;
      break;
  }

  // Update the HTML element with id "ticker" to display the new count
  document.getElementById("ticker").innerText = count;

  // Stop the ticker if count reaches 100,000
  if (count >= 100000) {
    clearInterval(tickerInterval);
  }
}

// Call updateTicker() initially
updateTicker();

// Set an interval to call updateTicker() every day at midnight
const tickerInterval = setInterval(updateTicker, 24 * 60 * 60 * 1000);
