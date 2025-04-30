import 'package:flutter/material.dart';
import 'package:cropsync/weather.dart';
import 'package:cropsync/dashboard.dart'; // Make sure to create this screen
import 'package:cropsync/home.dart'; // Make sure to create this screen
import 'package:cropsync/finance.dart'; // Make sure to create this screen
import 'package:cropsync/market.dart'; // Make sure to create this screen

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  // ignore: library_private_types_in_public_api
  _HomeScreenState createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _selectedIndex = 0;

  final List<Widget> _widgetOptions = <Widget>[
    const WeatherScreen(),
    Climate(),
    Home(),
    Finance(),
    Market(),
  ];

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Home"),
      ),
      body: Center(
        child: _widgetOptions[_selectedIndex],
      ),
      bottomNavigationBar: BottomNavigationBar(
        items: const <BottomNavigationBarItem>[
          BottomNavigationBarItem(
            icon: Icon(Icons.wb_cloudy),
            label: 'Weather',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.dashboard_customize_rounded),
            label: 'Dashboard',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.home),
            label: 'Home',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.monetization_on),
            label: 'Finance',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.shopping_basket),
            label: 'Market',
          ),
        ],
        currentIndex: _selectedIndex,
        selectedItemColor: Colors.blue,
        unselectedItemColor: Colors.grey, // Color for unselected items
        backgroundColor: const Color.fromARGB(255, 6, 6, 6), // Set background color here
        onTap: _onItemTapped,
      ),
    );
  }
}
