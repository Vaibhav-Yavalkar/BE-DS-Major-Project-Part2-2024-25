function downloadPDF() {
  const element = document.body; // Or use a specific element like document.getElementById('your-element-id')

  const opt = {
    margin: 0,
    filename: "downloaded-page.pdf",
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: {
      scale: 3, // Increase scale for better quality (higher value = better quality)
      useCORS: true, // Ensures cross-origin images are rendered properly
      logging: true, // Logs progress in the console
    },
    jsPDF: {
      unit: "px",
      format: [element.scrollWidth, element.scrollHeight],
      orientation: "portrait",
    },
  };

  html2pdf().from(element).set(opt).save();
}

document.addEventListener("DOMContentLoaded", function () {
  const ctx = document.getElementById("floodPredictionChart").getContext("2d");

  // Retrieve the predictions from the hidden input field
  const floodPredictions = JSON.parse(
    document.getElementById("floodPredictions").value
  );

  console.log("FloodPredictions: ", floodPredictions);

  const labels = Array.from({ length: 7 }, (_, i) => {
    let date = new Date();
    date.setDate(date.getDate() + i);
    return date.toISOString().split("T")[0]; // Format YYYY-MM-DD
  });

  new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Flood Probability (%)",
          data: floodPredictions,
          borderColor: "rgba(30, 144, 255, 1)", // Dodger Blue
          backgroundColor: "rgba(30, 144, 255, 0.2)", // Light blue
          borderWidth: 2,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: {
          left: 20, // Space on the left
          right: 20, // Space on the right
          top: 20, // Space on top
          bottom: 20, // Space on the bottom
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          title: {
            display: true,
            text: "Probability (%)",
            color: "#fff", // White for visibility on dark background
          },
          grid: {
            color: "#444", // Light gray grid for contrast
          },
        },
        x: {
          title: {
            display: true,
            text: "Date",
            color: "#fff", // White for visibility on dark background
          },
          grid: {
            color: "#444", // Light gray grid for contrast
          },
        },
      },
    },
  });
});

document.addEventListener("DOMContentLoaded", function () {
  // Get the hidden input values
  let predictions = document.getElementById("landslidePredictions").value;
  let dates = document.getElementById("landslideDates").value;

  // Log the data to verify it's already in the correct format
  console.log("Predictions: ", predictions);
  console.log("Dates: ", dates);

  // Convert string to array using eval (since data is already in array format)
  let predictionData = eval(predictions);
  let dateLabels = eval(dates);

  // Get the canvas element
  let ctx = document.getElementById("LandslideChart").getContext("2d");

  // Find the maximum value in the prediction data and increase it slightly for better appearance
  let maxPrediction = Math.max(...predictionData);
  let yMax = Math.ceil(maxPrediction * 1.2); // Increase by 20% for some breathing space

  // Create the chart using Chart.js
  new Chart(ctx, {
    type: "line",
    data: {
      labels: dateLabels, // Show the time (dates) on the x-axis
      datasets: [
        {
          label: "", // No label for the dataset
          data: predictionData, // Data for the graph
          borderColor: "#211f20", // Dark color for the line
          backgroundColor: "rgba(33, 31, 32, 0.2)", // Light shadow effect
          borderWidth: 2,
          fill: false, // No fill under the line
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: {
          left: 20,
          right: 20,
          top: 25,
          bottom: 20,
        },
      },
      scales: {
        x: {
          title: {
            display: false, // Hide the label for the x-axis
          },
          ticks: {
            font: {
              size: 8, // Reduced font size for the x-axis ticks
            },
            maxRotation: 0, // Ensure the x-axis labels are straight (no rotation)
            minRotation: 0, // No rotation of labels
          },
        },
        y: {
          title: {
            display: false,
            text: "Prediction Level", // Keep the y-axis label
            font: {
              size: 10, // Reduced font size for the y-axis label
            },
          },
          beginAtZero: true,
          max: yMax, // Set the maximum value to a bit higher than the max prediction value
        },
      },
      plugins: {
        legend: {
          display: false, // Hide the legend
        },
      },
    },
  });
});

// Fetch data from the hidden input fields
const floodPredictions = JSON.parse(
  document.getElementById("floodPredictions").value
);
const landslidePredictions = JSON.parse(
  document.getElementById("landslidePredictions").value
);
const landslideDates = document
  .getElementById("landslideDates")
  .value.split(","); // Assuming the dates are comma-separated strings

// Create the daily labels for Flood Predictions
const floodLabels = [];
const currentDate = new Date();
for (let i = 0; i < 7; i++) {
  let date = new Date(currentDate);
  date.setDate(date.getDate() + i);
  floodLabels.push(date.toISOString().split("T")[0]); // Format to YYYY-MM-DD
}

// Create the hourly labels for Landslide Predictions
const landslideLabels = [];
for (let i = 0; i < landslideDates.length; i++) {
  landslideLabels.push(`${landslideDates[i]} ${i % 24}:00`); // Adding hour markers
}

// Prepare chart data
const chartData = {
  labels: floodLabels, // Use the flood dates for the X axis (7 days)
  datasets: [
    {
      label: "Flood Predictions",
      data: floodPredictions, // Flood data for the Y axis
      borderColor: "#0736fe", // Blue color for the flood line
      backgroundColor: "rgba(7, 54, 254, 0.4)", // Darker blue for flood area fill
      fill: true, // Fill the area below the line
      tension: 0.4, // Slight curve for the line
      borderWidth: 3, // Thicker border for better visibility
    },
    {
      label: "Landslide Predictions",
      data: landslidePredictions, // Landslide data for the Y axis
      borderColor: "#ff6347", // Tomato red for the landslide line
      backgroundColor: "rgba(255, 99, 71, 0.4)", // Light red for landslide area fill
      fill: true, // Fill the area below the line
      tension: 0.4, // Slight curve for the line
      borderWidth: 3, // Thicker border for better visibility
    },
  ],
};

// Chart configuration
const config = {
  type: "line", // Use a line chart (which will have area filled)
  data: chartData,
  options: {
    responsive: true, // Make the chart responsive
    maintainAspectRatio: false, // Allow the chart to fill the div
    layout: {
      padding: {
        top: 20, // Add space at the top
        left: 30, // Add space on the left
        right: 30, // Add space on the right
        bottom: 20, // Add space at the bottom
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Dates / Hours",
        },
        ticks: {
          autoSkip: true, // Automatically skip some labels if needed
        },
      },
      y: {
        title: {
          display: true,
          text: "Predictions",
        },
      },
    },
    plugins: {
      legend: {
        position: "top",
      },
    },
  },
};

// Render the chart
const ctx = document.getElementById("LandslideFloodChart").getContext("2d");
new Chart(ctx, config);

function updateLandslideStatus() {
    const rawDates = document.getElementById("landslideDates").value;
    const rawPredictions = document.getElementById("landslidePredictions").value;

    const landslideDates = rawDates
        .replace(/[\[\]']/g, "") // Remove brackets and single quotes
        .split(',').map(d => d.trim());

    const landslidePredictions = rawPredictions
        .replace(/[\[\]']/g, "") // Remove brackets and single quotes
        .split(',').map(p => parseFloat(p.trim()));

    const currentDate = new Date().toISOString().split('T')[0];
    const currentHour = new Date().getHours(); // Current hour (0-23)

    console.log("🌟 Current Date:", currentDate);
    console.log("🕒 Current Hour:", currentHour);
    console.log("📅 Cleaned Landslide Dates:", landslideDates);
    console.log("📈 Cleaned Landslide Predictions:", landslidePredictions);

    if (landslideDates.length !== landslidePredictions.length) {
        console.error("❌ Mismatch between number of dates and predictions.");
        return;
    }

    let predictionForCurrentHour = null;
    let predictionForNextHour = null;
    let predictionForNextToNextHour = null;

    // Iterate through the dates and predictions
    for (let i = 0; i < landslideDates.length; i++) {
        const dateToCompare = landslideDates[i];
        const prediction = landslidePredictions[i];

        if (dateToCompare === currentDate) {
            // Check current, next, and next-to-next hour
            if (i === currentHour) { 
                predictionForCurrentHour = prediction * 100; // Convert to percentage
                console.log(`✅ Prediction for Current Hour (${currentHour}): ${predictionForCurrentHour}%`);
            }
            if (i === currentHour + 1 && currentHour + 1 < 24) { // Ensure we don't go past 23 hours
                predictionForNextHour = prediction * 100;
                console.log(`✅ Prediction for Next Hour (${currentHour + 1}): ${predictionForNextHour}%`);
            }
            if (i === currentHour + 2 && currentHour + 2 < 24) { // Ensure we don't go past 23 hours
                predictionForNextToNextHour = prediction * 100;
                console.log(`✅ Prediction for Next to Next Hour (${currentHour + 2}): ${predictionForNextToNextHour}%`);
            }
        }
    }

    const landslideStatus = document.getElementById("LandslideStatus");
    const peopleAffectedDescription1 = document.getElementById("people-affected-description-1");
    const peopleAffectedTime1 = document.getElementById("people-affected-time-1");

    const peopleAffectedDescription2 = document.getElementById("people-affected-description-2");
    const peopleAffectedTime2 = document.getElementById("people-affected-time-2");

    const peopleAffectedDescription3 = document.getElementById("people-affected-description-3");
    const peopleAffectedTime3 = document.getElementById("people-affected-time-3");

    const peopleAffectedDescription4 = document.getElementById("people-affected-description-4");

    // Handle the current hour prediction
    if (predictionForCurrentHour !== null && predictionForCurrentHour > 95) {
        landslideStatus.textContent = "Landslide is currently occurring in your region.";
        peopleAffectedDescription1.textContent = `${predictionForCurrentHour.toFixed(2)}% Landslide Chance`;
        peopleAffectedDescription4.textContent = "People or infrastructure are affected in your region.";
    } else {
        landslideStatus.textContent = "No Landslides are currently occurring in your region.";
        peopleAffectedDescription1.textContent = `0% Landslide Chance`;
        peopleAffectedDescription4.textContent = "No people or infrastructure are affected in your region.";
    }

    // Update the time for current hour
    const formattedTime1 = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    peopleAffectedTime1.textContent = formattedTime1;

    // Handle next hour prediction
    const formattedTime2 = new Date();
    formattedTime2.setHours(currentHour + 1);
    const nextHourTime = formattedTime2.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (predictionForNextHour !== null) {
        peopleAffectedDescription2.textContent = `${predictionForNextHour.toFixed(2)}% Landslide Chance`;
    } else {
        peopleAffectedDescription2.textContent = `0% Landslide Chance`;
    }

    peopleAffectedTime2.textContent = nextHourTime;

    // Handle next-to-next hour prediction
    const formattedTime3 = new Date();
    formattedTime3.setHours(currentHour + 2);
    const nextToNextHourTime = formattedTime3.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (predictionForNextToNextHour !== null) {
        peopleAffectedDescription3.textContent = `${predictionForNextToNextHour.toFixed(2)}% Landslide Chance`;
    } else {
        peopleAffectedDescription3.textContent = `0% Landslide Chance`;
    }

    peopleAffectedTime3.textContent = nextToNextHourTime;
}

// Call the function when the page loads
document.addEventListener('DOMContentLoaded', updateLandslideStatus);



// Function to get the user's weather information
function updateWeather() {
    // Get the user's current location using the Geolocation API
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(fetchWeatherData, handleError);
    } else {
        console.error("Geolocation is not supported by this browser.");
    }
}

// Function to fetch weather data using `wttr.in`
function fetchWeatherData(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    // Fetch weather info from wttr.in using the user's coordinates
    const apiUrl = `https://wttr.in/${lat},${lon}?format=%C`; // %C gives a brief weather description

    fetch(apiUrl)
        .then(response => response.text())
        .then(weatherDescription => {
            const weatherElement = document.getElementById("weather-description");

            // Modify the paragraph content with the weather description
            weatherElement.textContent = `Your weather currently is ${weatherDescription}.`;
        })
        .catch(error => {
            console.error("Error fetching weather data:", error);
        });
}

// Function to handle geolocation errors
function handleError(error) {
    console.error("Error getting geolocation:", error);
    const weatherElement = document.getElementById("weather-description");
    weatherElement.textContent = "Unable to determine your location for weather data.";
}

// Call the function to get and update the weather
updateWeather();

document.addEventListener('DOMContentLoaded', () => {
  const rainfallGraphDiv = document.querySelector('.rainfall-graph');

  if (!rainfallGraphDiv) return;

  if (!navigator.geolocation) {
      rainfallGraphDiv.innerText = 'Geolocation is not supported by your browser.';
      return;
  }

  navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      try {
          const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=precipitation_sum&timezone=auto`);
          const weatherData = await response.json();

          const rainfallData = weatherData.daily.time.map((time, index) => ({
              date: new Date(time).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
              rainfall: weatherData.daily.precipitation_sum[index]
          }));

          renderGraph(rainfallData);
      } catch (error) {
          rainfallGraphDiv.innerText = 'Failed to fetch rainfall data.';
      }
  });

  function renderGraph(data) {
      const labels = data.map(item => item.date);
      const rainfallValues = data.map(item => item.rainfall);

      const canvas = document.createElement('canvas');
      rainfallGraphDiv.innerHTML = '';
      rainfallGraphDiv.appendChild(canvas);

      canvas.style.width = '100%';
      canvas.style.height = '100%';

      new Chart(canvas, {
          type: 'bar',
          data: {
              labels,
              datasets: [{
                  label: 'Rainfall (mm)',
                  data: rainfallValues,
                  backgroundColor: '#211f20',
                  borderColor: '#211f20',
                  borderWidth: 1
              }]
          },
          options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                  legend: {
                      display: true,
                      labels: {
                          color: '#211f20'
                      }
                  }
              },
              scales: {
                  x: {
                      ticks: {
                          color: '#211f20',
                          font: {
                              size: 12
                          },
                          autoSkip: false,
                          maxRotation: 90,
                          minRotation: 90
                      }
                  },
                  y: {
                      ticks: {
                          color: '#211f20',
                          font: {
                              size: 12
                          }
                      }
                  }
              }
          }
      });
  }
});
