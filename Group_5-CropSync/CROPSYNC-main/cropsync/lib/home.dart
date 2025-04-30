import 'package:flutter/material.dart';
import 'weather.dart';

class Home extends StatelessWidget {
  const Home({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Home Page",style: TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 24, // Adjust font size here
                color: Color.fromARGB(255, 1, 8, 14), // Adjust text color here
              ),),
              centerTitle: true,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16.0),
        children: <Widget>[
          // Weather Section
          ListTile(
            leading: const Icon(Icons.wb_cloudy, color: Colors.blue),
            title: const Text(
              "Weather",
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
            ),
            subtitle: const Text(
              "Get real-time weather updates and forecast for your region to help you plan your farming activities efficiently.",
            ),
            onTap: () {
              // Add navigation to Weather screen here if needed
             Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => const WeatherScreen()),
             );
            },
          ),
          const Divider(),

          // Dashboard Section
          ListTile(
            leading: const Icon(Icons.dashboard_customize, color: Colors.green),
            title: const Text(
              "Dashboard",
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
            ),
            subtitle: const Text(
              "View in-depth climate trends and farming analytics to make informed decisions about crop management.",
            ),
            onTap: () {
              // Add navigation to Dashboard screen here if needed
            },
          ),
          const Divider(),

          // Finance Section
          ListTile(
            leading: const Icon(Icons.monetization_on, color: Colors.orange),
            title: const Text(
              "Finance",
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
            ),
            subtitle: const Text(
              "Access financial tools like loans, insurance, and budgeting assistance to manage your farm's finances effectively.",
            ),
            onTap: () {
              // Add navigation to Finance screen here if needed
            },
          ),
          const Divider(),

          // Market Section
          ListTile(
            leading: const Icon(Icons.shopping_basket, color: Colors.purple),
            title: const Text(
              "Market",
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
            ),
            subtitle: const Text(
              "Stay updated with the latest market prices and trends for agricultural products to maximize your profits.",
            ),
            onTap: () {
              // Add navigation to Market screen here if needed
            },
          ),
        ],
      ),
    );
  }
}

