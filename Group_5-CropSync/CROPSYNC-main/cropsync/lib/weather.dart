import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

class WeatherScreen extends StatefulWidget {
  const WeatherScreen({super.key});

  @override
  _WeatherScreenState createState() => _WeatherScreenState();
}

class _WeatherScreenState extends State<WeatherScreen> {
  String apiKey = "0e20134c48946d0514348793120b1d46"; // Replace with your API key
  String? selectedCity;
  Map<String, dynamic>? weatherData;
  String errorMessage = '';
  bool isLoading = false;

  // List of farming cities
  final List<String> cities = [
    "Pune", "Nagpur", "Indore", "Ahmedabad", "Ludhiana",
    "Coimbatore", "Faridabad", "Jaipur", "Bhopal",
    "Kochi", "Agra", "Srinagar"
  ];

  @override
  void initState() {
    super.initState();
    // Set default city
    selectedCity = cities.first;
    fetchWeather();
  }

  // Get weather icon based on condition code
  String getWeatherIcon(String condition) {
    switch (condition.toLowerCase()) {
      case 'clear sky':
        return '☀️';
      case 'few clouds':
      case 'scattered clouds':
      case 'broken clouds':
        return '🌤️';
      case 'shower rain':
      case 'rain':
      case 'light rain':
      case 'moderate rain':
        return '🌧️';
      case 'thunderstorm':
        return '⛈️';
      case 'snow':
        return '❄️';
      case 'mist':
      case 'fog':
      case 'haze':
        return '🌫️';
      default:
        return '🌡️';
    }
  }

  Future<void> fetchWeather() async {
    if (selectedCity == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Please select a city")),
      );
      return;
    }

    setState(() {
      isLoading = true;
      weatherData = null;
      errorMessage = '';
    });

    final String apiUrl =
        "https://api.openweathermap.org/data/2.5/weather?q=$selectedCity&appid=$apiKey&units=metric";

    try {
      final response = await http.get(Uri.parse(apiUrl));

      if (response.statusCode == 200) {
        setState(() {
          weatherData = json.decode(response.body);
        });
      } else {
        setState(() {
          errorMessage = "City not found or API error";
        });
      }
    } catch (error) {
      setState(() {
        errorMessage = "Failed to fetch data. Check your internet connection.";
      });
    } finally {
      setState(() {
        isLoading = false;
      });
    }
  }

  String getCurrentDate() {
    // Format date without intl package
    final now = DateTime.now();
    
    // Get day name
    List<String> weekdays = [
      'Monday', 'Tuesday', 'Wednesday', 'Thursday', 
      'Friday', 'Saturday', 'Sunday'
    ];
    String dayName = weekdays[now.weekday - 1]; // weekday is 1-7
    
    // Get month name
    List<String> months = [
      'January', 'February', 'March', 'April', 'May', 'June', 'July',
      'August', 'September', 'October', 'November', 'December'
    ];
    String monthName = months[now.month - 1]; // month is 1-12
    
    return '$dayName, ${now.day} $monthName';
  }

  Widget buildInfoTile(IconData icon, String title, String value) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(10),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            spreadRadius: 1,
            blurRadius: 4,
            offset: const Offset(0, 1),
          ),
        ],
      ),
      child: Row(
        children: [
          Icon(icon, color: Colors.blue[700], size: 22),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  title,
                  style: TextStyle(
                    color: Colors.grey[600],
                    fontSize: 12,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  value,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: AppBar(
        elevation: 0,
        title: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.location_on, size: 18, color: Colors.blue[700]),
            const SizedBox(width: 4),
            DropdownButton<String>(
              value: selectedCity,
              underline: const SizedBox(),
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w500,
                color: Colors.black87,
              ),
              onChanged: (value) {
                setState(() {
                  selectedCity = value;
                });
                fetchWeather();
              },
              items: cities.map((city) {
                return DropdownMenuItem(
                  value: city,
                  child: Text(city),
                );
              }).toList(),
            ),
          ],
        ),
        centerTitle: true,
        backgroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: Colors.black87),
            onPressed: fetchWeather,
          ),
        ],
      ),
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : weatherData == null
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.cloud_off, size: 64, color: Colors.grey),
                      const SizedBox(height: 16),
                      Text(
                        errorMessage.isEmpty
                            ? "Select a city to get weather data"
                            : errorMessage,
                        style: const TextStyle(fontSize: 16),
                      ),
                    ],
                  ),
                )
              : SingleChildScrollView(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Date display
                      Text(
                        getCurrentDate(),
                        style: TextStyle(
                          fontSize: 14,
                          color: Colors.grey[600],
                        ),
                      ),
                      const SizedBox(height: 20),
                      
                      // Main weather card
                      Container(
                        padding: const EdgeInsets.all(20),
                        width: double.infinity,
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                            colors: [Colors.blue[400]!, Colors.blue[700]!],
                          ),
                          borderRadius: BorderRadius.circular(15),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.blue.withOpacity(0.3),
                              blurRadius: 10,
                              offset: const Offset(0, 4),
                            ),
                          ],
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      '${weatherData!['main']['temp'].round()}°',
                                      style: const TextStyle(
                                        fontSize: 64,
                                        fontWeight: FontWeight.bold,
                                        color: Colors.white,
                                      ),
                                    ),
                                    Text(
                                      'Feels like ${weatherData!['main']['feels_like'].round()}°',
                                      style: const TextStyle(
                                        fontSize: 16,
                                        color: Colors.white70,
                                      ),
                                    ),
                                  ],
                                ),
                                Text(
                                  getWeatherIcon(weatherData!['weather'][0]['description']),
                                  style: const TextStyle(fontSize: 70),
                                ),
                              ],
                            ),
                            const SizedBox(height: 20),
                            Text(
                              weatherData!['weather'][0]['description']
                                  .toString()
                                  .toUpperCase(),
                              style: const TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.w500,
                                color: Colors.white,
                              ),
                            ),
                            Text(
                              'H: ${weatherData!['main']['temp_max'].round()}° L: ${weatherData!['main']['temp_min'].round()}°',
                              style: const TextStyle(
                                fontSize: 16,
                                color: Colors.white,
                              ),
                            ),
                          ],
                        ),
                      ),
                      
                      const SizedBox(height: 20),
                      
                      const Text(
                        "Weather Details",
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 12),
                      
                      // Weather details using Wrap instead of GridView
                      Wrap(
                        spacing: 10,
                        runSpacing: 10,
                        children: [
                          SizedBox(
                            width: MediaQuery.of(context).size.width * 0.44,
                            child: buildInfoTile(
                              Icons.water_drop,
                              "Humidity",
                              "${weatherData!['main']['humidity']}%",
                            ),
                          ),
                          SizedBox(
                            width: MediaQuery.of(context).size.width * 0.44,
                            child: buildInfoTile(
                              Icons.air,
                              "Wind",
                              "${weatherData!['wind']['speed']} m/s",
                            ),
                          ),
                          SizedBox(
                            width: MediaQuery.of(context).size.width * 0.44,
                            child: buildInfoTile(
                              Icons.compress,
                              "Pressure", 
                              "${weatherData!['main']['pressure']} hPa",
                            ),
                          ),
                          SizedBox(
                            width: MediaQuery.of(context).size.width * 0.44,
                            child: buildInfoTile(
                              Icons.visibility,
                              "Visibility",
                              "${(weatherData!['visibility'] / 1000).toStringAsFixed(1)} km",
                            ),
                          ),
                        ],
                      ),
                      
                      const SizedBox(height: 20),
                      
                      // Farming advice section
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: Colors.green[50],
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: Colors.green[200]!),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Icon(Icons.eco, color: Colors.green[700]),
                                const SizedBox(width: 8),
                                const Text(
                                  "Farming Advisory",
                                  style: TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 12),
                            // Generate a simple farming advice based on temperature and conditions
                            Text(
                              _generateFarmingAdvice(
                                weatherData!['main']['temp'],
                                weatherData!['weather'][0]['description'],
                                weatherData!['main']['humidity'],
                              ),
                              style: const TextStyle(fontSize: 14),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
    );
  }
  
  String _generateFarmingAdvice(double temp, String condition, int humidity) {
    if (temp > 30) {
      return "High temperature alert: Ensure adequate irrigation for crops. Consider shade for sensitive plants. Best to water early morning or evening.";
    } else if (temp < 10) {
      return "Low temperature alert: Protect frost-sensitive crops. Consider using covers for overnight protection if temperatures drop further.";
    } else if (condition.contains('rain')) {
      return "Rainy conditions: Hold off on spraying pesticides. Watch for fungal diseases in this humid weather. Ensure proper drainage in fields.";
    } else if (humidity > 80) {
      return "High humidity: Monitor for fungal diseases. Ensure good air circulation between plants. Consider preventative fungicide applications for sensitive crops.";
    } else if (condition.contains('clear')) {
      return "Clear weather: Good day for field operations, spraying, or harvesting. UV index may be high, so take precautions for outdoor work.";
    } else {
      return "Moderate conditions: Good for most farming activities. Check soil moisture before irrigation.";
    }
  }
}