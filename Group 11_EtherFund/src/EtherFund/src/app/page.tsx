'use client';
import { useReadContract } from "thirdweb/react";
import { client } from "./client";
import { baseSepolia } from "thirdweb/chains";
import { getContract } from "thirdweb";
import { CampaignCard } from "@/components/CampaignCard";
import { CROWDFUNDING_FACTORY } from "./constants/contracts";
import { Loader2 } from "lucide-react";

export default function Home() {
  // Get CrowdfundingFactory contract
  const contract = getContract({
    client: client,
    chain: baseSepolia,
    address: CROWDFUNDING_FACTORY,
  });

  // Get all campaigns deployed with CrowdfundingFactory
  const { data: campaigns, isLoading: isLoadingCampaigns, refetch: refetchCampaigns } = useReadContract({
    contract: contract,
    method: "function getAllCampaigns() view returns ((address campaignAddress, address owner, string name)[])",
    params: []
  });

  return (
    <div>
    <div>
    <main className="mx-auto max-w-7xl px-6 mt-4 sm:px-8 lg:px-12 mb-6">
      <div className="py-12 text-center">
        <h1 className="text-5xl font-extrabold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-transparent bg-clip-text">
          Explore EtherFund Campaigns
        </h1>
        <p className="mt-4 text-lg font-extrabold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-transparent bg-clip-text">Support or start your journey with decentralized fundraising.</p>
      </div>

      {/* Campaigns Section */}
      <div className="mt-4">
        {/* Loading State */}
        {isLoadingCampaigns ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {campaigns && campaigns.length > 0 ? (
              campaigns.map((campaign) => (
                <CampaignCard
                  key={campaign.campaignAddress}
                  campaignAddress={campaign.campaignAddress}
                />
              ))
            ) : (
              <p className="col-span-full text-center text-gray-400 text-lg">
                No active campaigns at the moment. Start one today!
              </p>
            )}
          </div>
        )}
      </div>
    </main>
    </div>
    </div>
  );
}
