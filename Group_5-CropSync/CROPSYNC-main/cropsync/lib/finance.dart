import 'package:flutter/material.dart';
import 'dart:async'; // Simulate online fetch

class Finance extends StatelessWidget {
  const Finance({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Finance"),
        backgroundColor: Colors.blue,
      ),
      body: Column(
        children: [
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16.0),
            color: Colors.blue.shade50,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  "Financial Tools & Services",
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                        color: Colors.blue.shade800,
                        fontWeight: FontWeight.bold,
                      ),
                ),
                const SizedBox(height: 8),
                Text(
                  "Access loans, insurance, and budgeting tools to manage your farm finances",
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: Colors.blue.shade700,
                      ),
                ),
              ],
            ),
          ),
          Expanded(
            child: GridView.count(
              crossAxisCount: 2,
              padding: const EdgeInsets.all(16.0),
              mainAxisSpacing: 16.0,
              crossAxisSpacing: 16.0,
              children: [
                _buildFinancialTool(
                  context,
                  "Loans",
                  "Apply for agricultural loans",
                  Icons.account_balance,
                  Colors.blue,
                  () async {
                    final data = await _fetchData(_getLoanOptions());
                    _showToolDetails(context, "Farm Loans", data);
                  },
                ),
                _buildFinancialTool(
                  context,
                  "Insurance",
                  "Protect your crops and livestock",
                  Icons.security,
                  Colors.green,
                  () async {
                    final data = await _fetchData(_getInsuranceOptions());
                    _showToolDetails(context, "Farm Insurance", data);
                  },
                ),
                _buildFinancialTool(
                  context,
                  "Subsidies",
                  "Government support & schemes",
                  Icons.card_giftcard,
                  Colors.purple,
                  () async {
                    final data = await _fetchData(_getSubsidyOptions());
                    _showToolDetails(context, "Subsidies & Schemes", data);
                  },
                ),
                _buildFinancialTool(
                  context,
                  "Budgeting",
                  "Track income & plan expenses",
                  Icons.attach_money,
                  Colors.orange,
                  () async {
                    final data = await _fetchData(_getBudgetOptions());
                    _showToolDetails(context, "Farm Budget Tools", data);
                  },
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFinancialTool(BuildContext context, String title, String description,
      IconData icon, Color color, VoidCallback onTap) {
    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon, size: 48, color: color),
              const SizedBox(height: 12),
              Text(title,
                  style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                  textAlign: TextAlign.center),
              const SizedBox(height: 8),
              Text(description,
                  style: const TextStyle(fontSize: 12, color: Colors.grey),
                  textAlign: TextAlign.center,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis),
            ],
          ),
        ),
      ),
    );
  }

  Future<List<Map<String, dynamic>>> _fetchData(List<Map<String, dynamic>> data) async {
    await Future.delayed(const Duration(milliseconds: 800));
    return data;
  }

  void _showToolDetails(BuildContext context, String title, List<Map<String, dynamic>> options) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return AnimatedContainer(
          duration: const Duration(milliseconds: 500),
          curve: Curves.easeOut,
          padding: const EdgeInsets.all(16.0),
          height: MediaQuery.of(context).size.height * 0.7,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                Text(title, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                IconButton(icon: const Icon(Icons.close), onPressed: () => Navigator.pop(context))
              ]),
              const Divider(),
              Expanded(
                child: ListView.builder(
                  itemCount: options.length,
                  itemBuilder: (context, index) {
                    final option = options[index];
                    return Card(
                      margin: const EdgeInsets.symmetric(vertical: 8),
                      child: ListTile(
                        title: Text(
  option['name'],
  style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
  overflow: TextOverflow.ellipsis,
  maxLines: 1,
),
                        subtitle: Text(option['description']),
                        trailing: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            if (option['action'] != null)
                              ElevatedButton(
                                onPressed: () {
                                  if (option['name'] == 'Farm Budget Calculator') {
                                    _showFarmBudgetCalculator(context);
                                  } else if (option['name'] == 'Crop Cost Estimator') {
                                    _showCropCostEstimator(context);
                                  }
                                },
                                child: Text(option['action']),
                              ),
                            if (option['details'] != null)
                              TextButton(
                                onPressed: () {
                                  _showLoanDetailPopup(context, option['name'], option['details']);
                                },
                                child: const Text("More Info"),
                              ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  void _showLoanDetailPopup(BuildContext context, String title, String details) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Row(
          children: [
            const Icon(Icons.info_outline, color: Colors.blue),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                title,
                style: const TextStyle(fontWeight: FontWeight.bold),
                overflow: TextOverflow.ellipsis,
                maxLines: 2,
              ),
            ),
          ],
        ),
        content: Text(details),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text("Close"),
          ),
        ],
      ),
    );
  }

  List<Map<String, dynamic>> _getLoanOptions() {
    return [
      {
        'name': 'Kisan Credit Card',
        'description': 'Short-term credit for cultivation and other farming needs',
        'details': 'The Kisan Credit Card (KCC) provides flexible, revolving credit to farmers for crop production and personal needs. No collateral is required for loans up to ₹1.6 lakh. Interest subsidies of 2-4% are available for timely repayment. Funds can be withdrawn via ATM or PoS terminals. Valid for 5 years with annual renewals.'
      },
      {
        'name': 'Equipment Finance',
        'description': 'Loans for purchase of tractors, harvesters and other machinery',
        'details': 'Equipment finance is designed for the purchase of new/used tractors, harvesters, rotavators, and irrigation pumps. Up to 85% of the cost is financed, with interest rates starting from 7.5%. Repayment terms range from 3 to 7 years. Insurance for machinery is often bundled.'
      },
      {
        'name': 'NABARD Loans',
        'description': 'Long-term loans for land development and irrigation projects',
        'details': 'NABARD provides refinancing to banks for long-term rural infrastructure like farm ponds, fencing, and land leveling. Interest rates vary from 7% to 9%, and repayment periods go up to 15 years. Available through cooperative and rural banks with project-based approvals.'
      },
      {
        'name': 'Warehouse Receipt Financing',
        'description': 'Get loans against stored agricultural produce',
        'details': 'Loans are offered by banks and NBFCs based on warehouse receipts issued by accredited godowns. Loan amounts are 60–75% of the value of stored produce. Tenure is usually 3 to 9 months. Helps farmers avoid distress sale after harvest by offering liquidity until market prices improve.'
      },
    ];
  }

  List<Map<String, dynamic>> _getInsuranceOptions() {
    return [
      {
        'name': 'Pradhan Mantri Fasal Bima Yojana',
        'description': 'Crop insurance scheme covering all food crops, oilseeds and annual commercial/horticultural crops',
        'details': 'PMFBY provides financial protection to farmers against yield losses due to natural calamities, pests or diseases. Premiums are only 2% (Kharif), 1.5% (Rabi), and 5% (commercial crops). 100% coverage for notified crops in notified areas. Claims settled directly to bank accounts.'
      },
      {
        'name': 'Weather Based Crop Insurance',
        'description': 'Protection against risks of adverse weather conditions',
        'details': 'WBCIS insures crops based on pre-defined weather parameters such as rainfall, temperature, humidity. Quick claim settlements without field-level assessment. Helps cover losses due to delayed rains, drought, excessive rainfall or frost.'
      },
      {
        'name': 'Livestock Insurance',
        'description': 'Coverage for cattle, poultry and other farm animals',
        'details': 'Covers mortality due to disease or accident for cows, buffaloes, sheep, goats, poultry and more. Premium subsidies up to 50% are offered by government. Sum insured equals market value of the animal. Annual premium ranges between 2% to 6% of the value.'
      },
      {
        'name': 'Farm Assets Insurance',
        'description': 'Protect farm buildings, equipment and machinery',
        'details': 'Comprehensive cover for farm houses, sheds, irrigation systems, tools, and tractors. Policies cover loss due to fire, theft, floods, and natural calamities. Optional coverage for third-party liabilities and equipment breakdown available.'
      },
    ];
  }

  List<Map<String, dynamic>> _getSubsidyOptions() {
    return [
      {
        'name': 'PM Kisan Samman Nidhi',
        'description': 'Income support of ₹6,000 per year for eligible farmer families',
        'details': 'Provides ₹2,000 every 4 months to small/marginal farmers owning up to 2 hectares. Amount is directly credited to Aadhaar-linked bank accounts. More than 11 crore farmers have benefitted since launch. Must complete e-KYC to stay eligible.'
      },
      {
        'name': 'Soil Health Card Scheme',
        'description': 'Get soil tested and receive crop-wise recommendations',
        'details': 'The scheme promotes balanced use of fertilizers based on actual soil nutrients. Farmers get a free soil test every 2 years and tailored advice for fertilizer usage. Available at Krishi Vigyan Kendras and soil testing labs across districts.'
      },
      {
        'name': 'Micro Irrigation Fund',
        'description': 'Subsidies for drip and sprinkler irrigation systems',
        'details': 'Farmers can receive 55–60% subsidy on micro-irrigation systems under PMKSY. Focus is on water-use efficiency, especially in water-scarce regions. Drip/sprinkler systems reduce input cost and increase crop yield sustainably.'
      },
      {
        'name': 'Agricultural Mechanization Scheme',
        'description': 'Financial assistance for purchase of agricultural machinery',
        'details': 'Subsidies up to 40-50% on farm machinery like seeders, transplanters, rotavators, etc. Special provision for SC/ST, women and small/marginal farmers. State-specific portals allow farmers to apply online with Aadhaar and land details.'
      },
    ];
  }

  List<Map<String, dynamic>> _getBudgetOptions() {
    return [
      {
        'name': 'Farm Budget Calculator',
        'description': 'Plan your seasonal expenses and income',
        'action': 'Open Tool',
      },
      {
        'name': 'Crop Cost Estimator',
        'description': 'Calculate the cost of production for different crops',
        'action': 'Calculate',
      },
      
    ];
  }
  void _showFarmBudgetCalculator(BuildContext context) {
    final incomeController = TextEditingController();
    final fixedController = TextEditingController();
    final variableController = TextEditingController();
    final areaController = TextEditingController();
    final yieldController = TextEditingController();

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text("Farm Budget Calculator"),
        content: SingleChildScrollView(
          child: Column(
            children: [
              TextField(
                controller: incomeController,
                decoration: const InputDecoration(labelText: 'Expected Selling Price (₹/kg)'),
                keyboardType: TextInputType.number,
              ),
              TextField(
                controller: areaController,
                decoration: const InputDecoration(labelText: 'Land Area (acres)'),
                keyboardType: TextInputType.number,
              ),
              TextField(
                controller: yieldController,
                decoration: const InputDecoration(labelText: 'Expected Yield (kg/acre)'),
                keyboardType: TextInputType.number,
              ),
              TextField(
                controller: fixedController,
                decoration: const InputDecoration(labelText: 'Fixed Costs (₹)'),
                keyboardType: TextInputType.number,
              ),
              TextField(
                controller: variableController,
                decoration: const InputDecoration(labelText: 'Variable Costs (₹)'),
                keyboardType: TextInputType.number,
              ),
              const SizedBox(height: 12),
              ElevatedButton(
                onPressed: () {
                  final price = double.tryParse(incomeController.text) ?? 0.0;
                  final area = double.tryParse(areaController.text) ?? 0.0;
                  final yield = double.tryParse(yieldController.text) ?? 0.0;
                  final fixed = double.tryParse(fixedController.text) ?? 0.0;
                  final variable = double.tryParse(variableController.text) ?? 0.0;

                  final totalYield = area * yield;
                  final expectedIncome = totalYield * price;
                  final totalCost = fixed + variable;
                  final profit = expectedIncome - totalCost;
                  final margin = expectedIncome > 0 ? (profit / expectedIncome) * 100 : 0;

                  Navigator.pop(context);
                  showDialog(
                    context: context,
                    builder: (_) => AlertDialog(
                      title: const Text("Farm Budget Result"),
                      content: Text(
                        'Total Expected Income: ₹${expectedIncome.toStringAsFixed(2)}\n'
                        'Total Cost: ₹${totalCost.toStringAsFixed(2)}\n'
                        'Net Profit: ₹${profit.toStringAsFixed(2)}\n'
                        'Profit Margin: ${margin.toStringAsFixed(2)}%'
                      ),
                      actions: [
                        TextButton(
                          onPressed: () => Navigator.pop(context),
                          child: const Text("Close"),
                        )
                      ],
                    ),
                  );
                },
                child: const Text("Calculate Budget"),
              )
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text("Close"),
          )
        ],
      ),
    );
  }

  void _showCropCostEstimator(BuildContext context) {
    final landController = TextEditingController();
    final seedCostController = TextEditingController();
    final fertCostController = TextEditingController();
    final laborCostController = TextEditingController();
    final yieldController = TextEditingController();
    final marketPriceController = TextEditingController();

    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text("Crop Cost Estimator"),
        content: SingleChildScrollView(
          child: Column(
            children: [
              TextField(
                controller: landController,
                decoration: const InputDecoration(labelText: 'Land Area (acres)'),
                keyboardType: TextInputType.number,
              ),
              TextField(
                controller: yieldController,
                decoration: const InputDecoration(labelText: 'Expected Yield (kg/acre)'),
                keyboardType: TextInputType.number,
              ),
              TextField(
                controller: marketPriceController,
                decoration: const InputDecoration(labelText: 'Selling Price (₹/kg)'),
                keyboardType: TextInputType.number,
              ),
              TextField(
                controller: seedCostController,
                decoration: const InputDecoration(labelText: 'Seeds Cost (₹)'),
                keyboardType: TextInputType.number,
              ),
              TextField(
                controller: fertCostController,
                decoration: const InputDecoration(labelText: 'Fertilizer Cost (₹)'),
                keyboardType: TextInputType.number,
              ),
              TextField(
                controller: laborCostController,
                decoration: const InputDecoration(labelText: 'Labor & Misc (₹)'),
                keyboardType: TextInputType.number,
              ),
              const SizedBox(height: 12),
              ElevatedButton(
                onPressed: () {
                  final area = double.tryParse(landController.text) ?? 0.0;
                  final yield = double.tryParse(yieldController.text) ?? 0.0;
                  final price = double.tryParse(marketPriceController.text) ?? 0.0;
                  final seeds = double.tryParse(seedCostController.text) ?? 0.0;
                  final fert = double.tryParse(fertCostController.text) ?? 0.0;
                  final labor = double.tryParse(laborCostController.text) ?? 0.0;

                  final totalProduction = area * yield;
                  final revenue = totalProduction * price;
                  final totalCost = seeds + fert + labor;
                  final profit = revenue - totalCost;
                  final profitPerKg = totalProduction > 0 ? profit / totalProduction : 0;

                  Navigator.pop(context);
                  showDialog(
                    context: context,
                    builder: (_) => AlertDialog(
                      title: const Text("Estimation Result"),
                      content: Text(
                        'Estimated Revenue: ₹${revenue.toStringAsFixed(2)}\n'
                        'Total Cost: ₹${totalCost.toStringAsFixed(2)}\n'
                        'Net Profit: ₹${profit.toStringAsFixed(2)}\n'
                        'Profit per Kg: ₹${profitPerKg.toStringAsFixed(2)}'
                      ),
                      actions: [
                        TextButton(
                          onPressed: () => Navigator.pop(context),
                          child: const Text("Close"),
                        )
                      ],
                    ),
                  );
                },
                child: const Text("Estimate"),
              )
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text("Close"),
          )
        ],
      ),
    );
  }

}
