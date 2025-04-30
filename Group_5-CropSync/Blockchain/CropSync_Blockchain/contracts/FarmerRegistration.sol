// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract FarmerRegistration {
    struct Farmer {
        string name;
        string location;
        uint256 landSize;
        bool registered;
    }

    struct CropJourney {
        string cropName;
        string sowingDate;
        string monitoringNotes;
        string pesticideUsed;
        string pesticideDate;
        bool inspected;
        bool approved;
        string yieldDate;
        bool badgeGenerated;
    }

    mapping(address => Farmer) public farmers;
    mapping(address => CropJourney) public journeys;

    address public inspector;

    constructor() {
        inspector = msg.sender; // Contract deployer is the inspector
    }

    modifier onlyInspector() {
        require(msg.sender == inspector, "Only inspector allowed");
        _;
    }

    modifier onlyRegisteredFarmer() {
        require(farmers[msg.sender].registered, "Farmer not registered");
        _;
    }

    // 📝 Step 1: Register Farmer
    function registerFarmer(string memory _name, string memory _location, uint256 _landSize) public {
        require(!farmers[msg.sender].registered, "Farmer already registered");
        farmers[msg.sender] = Farmer(_name, _location, _landSize, true);
    }

    // 🌱 Step 2: Add Crop Sowing Data
    function addSowingData(string memory _cropName, string memory _sowingDate) public onlyRegisteredFarmer {
        journeys[msg.sender].cropName = _cropName;
        journeys[msg.sender].sowingDate = _sowingDate;
    }

    // 🧪 Step 3: Add Monitoring Notes
    function addMonitoringNotes(string memory _notes) public onlyRegisteredFarmer {
        journeys[msg.sender].monitoringNotes = _notes;
    }

    // 🧴 Step 4: Add Pesticide Info
    function addPesticideData(string memory _pesticideUsed, string memory _date) public onlyRegisteredFarmer {
        journeys[msg.sender].pesticideUsed = _pesticideUsed;
        journeys[msg.sender].pesticideDate = _date;
    }

    // 🕵️ Step 5: Inspector Approves/Rejects Crop
    function inspectCrop(address farmerAddress, bool _approved) public onlyInspector {
        journeys[farmerAddress].inspected = true;
        journeys[farmerAddress].approved = _approved;
    }

    // 🌾 Step 6: Add Yield Data
    function addYieldData(string memory _yieldDate) public onlyRegisteredFarmer {
        require(journeys[msg.sender].approved, "Crop not approved by inspector");
        journeys[msg.sender].yieldDate = _yieldDate;
    }

    // 🏅 Step 7: Generate Badge
    function generateBadge() public onlyRegisteredFarmer {
        require(journeys[msg.sender].approved, "Crop not approved");
        require(bytes(journeys[msg.sender].yieldDate).length > 0, "Yield data missing");
        require(!journeys[msg.sender].badgeGenerated, "Badge already generated");
        journeys[msg.sender].badgeGenerated = true;
    }

    // 📖 View Full Crop Journey
    function getCropJourney(address farmerAddress) public view returns (
        string memory, string memory, string memory,
        string memory, string memory, bool,
        bool, string memory, bool
    ) {
        CropJourney memory j = journeys[farmerAddress];
        return (
            j.cropName,
            j.sowingDate,
            j.monitoringNotes,
            j.pesticideUsed,
            j.pesticideDate,
            j.inspected,
            j.approved,
            j.yieldDate,
            j.badgeGenerated
        );
    }

    // 📇 View Farmer Info
    function getFarmer(address _farmerAddress) public view returns (string memory, string memory, uint256, bool) {
        Farmer memory farmer = farmers[_farmerAddress];
        return (farmer.name, farmer.location, farmer.landSize, farmer.registered);
    }
}
