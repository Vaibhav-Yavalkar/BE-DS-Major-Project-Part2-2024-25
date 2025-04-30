import 'package:flutter/material.dart';
import 'package:cropsync/Homescreen.dart';

class SignInScreen extends StatelessWidget {
  const SignInScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Sign Up"),
        leading: BackButton(
          onPressed: () {
            Navigator.pop(context);
          },
        ),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const TextField(
              decoration: InputDecoration(
                labelText: "Name",
              ),
            ),
            const TextField(
              decoration: InputDecoration(
                labelText: "Email",
              ),
            ),
            const TextField(
              obscureText: true,
              decoration: InputDecoration(
                labelText: "Password",
              ),
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: () {
                // Navigate to HomeScreen after successful sign up
                Navigator.pushReplacement(
                  context,
                  MaterialPageRoute(builder: (context) => const HomeScreen()),
                );
              },
              child: const Text("Sign Up"),
            ),
          ],
        ),
      ),
    );
  }
}
