// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Crowdfunding {
    address public owner;
    string public name;
    string public description;
    uint256 public goal;
    uint256 public deadline;
    uint256 public fundsRaised;
    bool public completed;

    mapping(address => uint256) public donations;
    address[] private donors;

    event DonationReceived(address indexed donor, uint256 amount);
    event CampaignCompleted(address indexed campaign, uint256 totalFunds);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner.");
        _;
    }

    modifier campaignActive() {
        require(block.timestamp < deadline && !completed, "Campaign ended.");
        _;
    }

    constructor(
        address _owner,
        string memory _name,
        string memory _description,
        uint256 _goal,
        uint256 _durationInDays
    ) {
        owner = _owner;
        name = _name;
        description = _description;
        goal = _goal;
        deadline = block.timestamp + (_durationInDays * 1 days);
        completed = false;
    }

    function donate() external payable campaignActive {
        require(msg.value > 0, "Donation must be greater than zero.");

        if (donations[msg.sender] == 0) {
            donors.push(msg.sender);
        }

        donations[msg.sender] += msg.value;
        fundsRaised += msg.value;

        emit DonationReceived(msg.sender, msg.value);

        if (fundsRaised >= goal) {
            completed = true;
            emit CampaignCompleted(address(this), fundsRaised);
        }
    }

    function getDonors() external view returns (address[] memory) {
        return donors;
    }

    function withdrawFunds() external onlyOwner {
        require(completed, "Campaign not completed yet.");
        payable(owner).transfer(address(this).balance);
    }
}
