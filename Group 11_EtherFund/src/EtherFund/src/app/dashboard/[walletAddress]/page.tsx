'use client';
import { client } from "@/app/client";
import { CROWDFUNDING_FACTORY } from "@/app/constants/contracts";
import { MyCampaignCard } from "@/components/MyCampaignCard";
import { useState } from "react";
import { getContract } from "thirdweb";
import { baseSepolia } from "thirdweb/chains";
import { deployPublishedContract } from "thirdweb/deploys";
import { useActiveAccount, useReadContract } from "thirdweb/react";

export default function DashboardPage() {
    const account = useActiveAccount();
    
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    const contract = getContract({
        client: client,
        chain: baseSepolia,
        address: CROWDFUNDING_FACTORY,
    });

    // Get Campaigns
    const { data: myCampaigns, isLoading: isLoadingMyCampaigns, refetch } = useReadContract({
        contract: contract,
        method: "function getUserCampaigns(address _user) view returns ((address campaignAddress, address owner, string name, uint256 creationTime)[])",
        params: [account?.address as string]
    });
    
    return (
        <div className="mx-auto max-w-7xl px-6 mt-16 sm:px-8 lg:px-10 text-gray-800">
            <div className="flex flex-row justify-between items-center mb-8">
                <p className="text-4xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-transparent bg-clip-text">Dashboard</p>
                <button
                    className="rounded-md px-5 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:scale-105 transition-transform border border-white"
                    onClick={() => setIsModalOpen(true)}
                >Create Campaign</button>
            </div>
            <p className="text-2xl font-semibold mb-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-transparent bg-clip-text">My Campaigns:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {!isLoadingMyCampaigns && (
                    myCampaigns && myCampaigns.length > 0 ? (
                        myCampaigns.map((campaign, index) => (
                            <MyCampaignCard
                                key={index}
                                contractAddress={campaign.campaignAddress}
                            />
                        ))
                    ) : (
                        <p className="text-gray-500 text-lg">No campaigns found.</p>
                    )
                )}
            </div>
            
            {isModalOpen && (
                <CreateCampaignModal
                    setIsModalOpen={setIsModalOpen}
                    refetch={refetch}
                />
            )}
        </div>
    );
}

const CreateCampaignModal = ({ setIsModalOpen, refetch }) => {
    const account = useActiveAccount();
    const [isDeployingContract, setIsDeployingContract] = useState(false);
    const [campaignName, setCampaignName] = useState("");
    const [campaignDescription, setCampaignDescription] = useState("");
    const [campaignGoal, setCampaignGoal] = useState(1);
    const [campaignDeadline, setCampaignDeadline] = useState(1);
    
    const handleDeployContract = async () => {
        setIsDeployingContract(true);
        try {
            console.log("Deploying contract...");
            await deployPublishedContract({
                client: client,
                chain: baseSepolia,
                account: account!,
                contractId: "Crowdfunding",
                contractParams: [campaignName, campaignDescription, campaignGoal, campaignDeadline],
                publisher: "0x57e5f74c4E413B3ccB5B27dd90740D95d7da2616",
                version: "1.0.4",
            });
            alert("Contract deployed successfully!");
        } catch (error) {
            console.error(error);
        } finally {
            setIsDeployingContract(false);
            setIsModalOpen(false);
            refetch();
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-md p-4">
            <div className="w-full max-w-lg bg-white p-6 rounded-lg shadow-xl">
                <div className="flex justify-between items-center mb-4">
                    <p className="text-lg font-semibold text-gray-800">Create a Campaign</p>
                    <button
                        className="rounded-md px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-all border border-white"
                        onClick={() => setIsModalOpen(false)}
                    >Close</button>
                </div>
                <div className="flex flex-col space-y-4">
                    Campaign Name<input 
                        type="text" 
                        value={campaignName}
                        onChange={(e) => setCampaignName(e.target.value)}
                        placeholder="Campaign Name"
                        className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    Campaign Description<textarea
                        value={campaignDescription}
                        onChange={(e) => setCampaignDescription(e.target.value)}
                        placeholder="Campaign Description"
                        className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    ></textarea>
                    Campaign Goal<input 
                        type="number"
                        value={campaignGoal}
                        onChange={(e) => setCampaignGoal(Math.max(1, parseInt(e.target.value)))}
                        className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    Number of Day's<input 
                        type="number"
                        value={campaignDeadline}
                        onChange={(e) => setCampaignDeadline(Math.max(1, parseInt(e.target.value)))}
                        className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        className="rounded-md px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:scale-105 transition-transform border border-white"
                        onClick={handleDeployContract}
                    >{isDeployingContract ? "Creating..." : "Create Campaign"}</button>
                </div>
            </div>
        </div>
    );
};