const FarmerRegistration = artifacts.require("FarmerRegistration");

module.exports = function (deployer) {
    deployer.deploy(FarmerRegistration);
};
