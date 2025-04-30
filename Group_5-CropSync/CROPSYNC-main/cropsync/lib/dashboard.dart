import 'package:flutter/material.dart';

class Climate extends StatelessWidget {
  const Climate({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("DashBoard"),
      ),
      body: const Center(
        child: Text("Data Analysis Dashboard."),
      ),
    );
  }
}
