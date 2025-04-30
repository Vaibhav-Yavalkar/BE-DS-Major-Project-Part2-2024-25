import 'package:flutter/material.dart';
import 'package:cropsync/splashscreen.dart';
// Import SmartConnect here

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'CropSync',
      theme: ThemeData(
        primarySwatch: Colors.green,
      ),
      home: const SplashScreen(),
    );
  }
}
