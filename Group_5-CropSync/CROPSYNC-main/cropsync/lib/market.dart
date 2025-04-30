import 'package:flutter/material.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;

class Market extends StatefulWidget {
  const Market({super.key});

  @override
  State<Market> createState() => _MarketState();
}

class _MarketState extends State<Market> {
  List<dynamic> marketPrices = [];
  List<String> commodities = [];
  List<dynamic> filteredMarketPrices = [];
  bool isLoading = true;
  String errorMessage = '';
  String selectedCommodity = '';

  @override
  void initState() {
    super.initState();
    fetchMarketPrices();
  }

  Future<void> fetchMarketPrices() async {
    const String apiKey = '579b464db66ec23bdd000001e5fdfcdec422426a45a0fd0c72305da2';
    const int limit = 5000; // Increase the limit to fetch more diverse commodities
    const String apiUrl =
        'https://api.data.gov.in/resource/35985678-0d79-46b4-9ed6-6f13308a1d24?api-key=$apiKey&format=json&limit=$limit';

    try {
      final response = await http.get(Uri.parse(apiUrl));

      if (response.statusCode == 200) {
        final data = json.decode(response.body);

        if (data['status'] == 'error' || data['records'].isEmpty) {
          throw Exception('No data found. The API resource ID might be invalid.');
        }

        setState(() {
          marketPrices = data['records'];
          commodities = getUniqueCommodities(marketPrices);
          filteredMarketPrices = marketPrices;
          isLoading = false;
        });

        debugPrint("✅ Total Records Fetched: ${marketPrices.length}");
        debugPrint("✅ Total Unique Commodities: ${commodities.length}");
        debugPrint("✅ Commodities: $commodities");
      } else {
        throw Exception('Failed to load data. Status Code: ${response.statusCode}');
      }
    } catch (e) {
      setState(() {
        errorMessage = 'Error: ${e.toString()}';
        isLoading = false;
      });
    }
  }

  List<String> getUniqueCommodities(List<dynamic> data) {
    Set<String> commoditySet = {};
    for (var item in data) {
      String? commodity = item["Commodity"];
      if (commodity != null && commodity.isNotEmpty) {
        commoditySet.add(commodity.trim());
      }
    }
    return commoditySet.toList()..sort();
  }

  void filterByCommodity(String commodity) {
    setState(() {
      selectedCommodity = commodity;
      filteredMarketPrices = commodity.isEmpty
          ? marketPrices
          : marketPrices.where((item) => item["Commodity"] == commodity).toList();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Market Prices"),
        backgroundColor: Colors.green,
      ),
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : errorMessage.isNotEmpty
              ? Center(
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Text(
                      errorMessage,
                      style: const TextStyle(color: Colors.red, fontSize: 16),
                    ),
                  ),
                )
              : Column(
                  children: [
                    Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: DropdownButton<String>(
                        value: selectedCommodity.isEmpty ? null : selectedCommodity,
                        hint: const Text('Select Commodity'),
                        isExpanded: true,
                        onChanged: (String? newValue) {
                          if (newValue != null) {
                            filterByCommodity(newValue);
                          }
                        },
                        items: [
                          const DropdownMenuItem<String>(
                            value: '',
                            child: Text('All Commodities'),
                          ),
                          ...commodities.map((commodity) {
                            return DropdownMenuItem<String>(
                              value: commodity,
                              child: Text(commodity),
                            );
                          }).toList(),
                        ],
                      ),
                    ),
                    Expanded(
                      child: ListView.builder(
                        itemCount: filteredMarketPrices.length,
                        itemBuilder: (context, index) {
                          final item = filteredMarketPrices[index];
                          return Card(
                            margin: const EdgeInsets.all(8.0),
                            elevation: 4,
                            child: ListTile(
                              title: Text(
                                "${item["Commodity"] ?? "N/A"} (${item["Variety"] ?? "N/A"})",
                                style: const TextStyle(fontWeight: FontWeight.bold),
                              ),
                              subtitle: Text(
                                "Market: ${item["Market"] ?? "Unknown"}\n"
                                "State: ${item["State"] ?? "Unknown"}\n"
                                "Date: ${item["Arrival_Date"] ?? "Unknown"}\n"
                                "Min Price: ₹${item["Min_Price"] ?? "N/A"} | Max Price: ₹${item["Max_Price"] ?? "N/A"}\n"
                                "Modal Price: ₹${item["Modal_Price"] ?? "N/A"}",
                              ),
                              leading: const Icon(Icons.shopping_cart, color: Colors.green),
                            ),
                          );
                        },
                      ),
                    ),
                  ],
                ),
    );
  }
}
