import 'package:flutter/material.dart';
import 'package:cropsync/login_screen.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  // ignore: library_private_types_in_public_api
  _SplashScreenState createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    // Navigate to LoginScreen after 4 seconds
    Future.delayed(const Duration(seconds: 4), () {
      Navigator.pushReplacement(
        // ignore: use_build_context_synchronously
        context,
        MaterialPageRoute(builder: (context) => LoginScreen()),
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // Add your logo here
            Image.asset(
              'assets/images/cropsync_logo.png', // Ensure this path is correct and the image is in your assets folder
              height: 150, // You can adjust the size of the logo as needed
            ),
            const SizedBox(height: 20), // Space between logo and text
            const Text(
              "Welcome to CropSync!!!",
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
          ],
        ),
      ),
    );
  }
}
