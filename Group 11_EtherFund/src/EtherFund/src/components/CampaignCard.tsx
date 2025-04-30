import { client } from "@/app/client";
import { getContract } from "thirdweb";
import { baseSepolia } from "thirdweb/chains";
import { useReadContract } from "thirdweb/react";
import React, { useState } from "react";
import Link from "next/link";
import { FaFacebook, FaTwitter, FaWhatsapp, FaInstagram, FaLinkedin, FaSnapchat } from "react-icons/fa";

type CampaignCardProps = {
  campaignAddress: string;
};

export const CampaignCard: React.FC<CampaignCardProps> = ({ campaignAddress }) => {
  const contract = getContract({
    client: client,
    chain: baseSepolia,
    address: campaignAddress,
  });

  const { data: campaignName } = useReadContract({
    contract: contract,
    method: "function name() view returns (string)",
    params: [],
  });

  const { data: campaignDescription } = useReadContract({
    contract: contract,
    method: "function description() view returns (string)",
    params: [],
  });

  const { data: goal } = useReadContract({
    contract: contract,
    method: "function goal() view returns (uint256)",
    params: [],
  });

  const { data: balance } = useReadContract({
    contract: contract,
    method: "function getContractBalance() view returns (uint256)",
    params: [],
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const toggleModal = () => setIsModalOpen(!isModalOpen);

  const totalBalance = balance?.toString();
  const totalGoal = goal?.toString();
  let balancePercentage = (parseInt(totalBalance as string) / parseInt(totalGoal as string)) * 100;

  if (balancePercentage >= 100) {
    balancePercentage = 100;
  }

  return (
    <>
      <div className="flex flex-col justify-between max-w-sm p-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 border border-gray-400 rounded-2xl shadow-2xl transition-transform duration-300 hover:scale-105 hover:shadow-3xl relative text-white">
        <div>
          <div className="mb-4">
            <div className="relative w-full h-6 bg-gray-300 rounded-full overflow-hidden shadow-inner">
              <div
                className="h-6 bg-gradient-to-r from-green-400 to-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${balancePercentage?.toString()}%` }}
              ></div>
              <p className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-black">
                {balancePercentage >= 100 ? "Goal Reached" : `${balancePercentage?.toFixed(2)}%`}
              </p>
            </div>
          </div>
          <h5 className="mb-2 text-2xl font-extrabold tracking-tight text-white drop-shadow-lg">
            {campaignName}
          </h5>
          <p className="mb-3 text-gray-300 text-sm leading-relaxed">
            {campaignDescription}
          </p>
        </div>
        <div className="flex justify-between">
          <Link href={`/campaign/${campaignAddress}`} passHref>
            <button className="rounded-md px-4 py-2 text-sm font-medium text-white hover:bg-white hover:text-purple-700 transition duration-300 border border-white">
              View Campaign
            </button>
          </Link>
          <button
            onClick={toggleModal}
            className="rounded-md px-4 py-2 text-sm font-medium text-white hover:bg-white hover:text-purple-700 transition duration-300 border border-white"
          >
            Share
          </button>
        </div>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50 p-4">
          <div className="bg-white p-6 rounded-xl shadow-2xl w-96 relative text-black">
            <h2 className="text-lg font-bold mb-4">Share Campaign</h2>
            <div className="flex flex-col space-y-4">
              <a href={`https://www.facebook.com/sharer/sharer.php?u=https://yourdomain.com/campaign/${campaignAddress}`} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all hover:shadow-md">
                <FaFacebook /> <span>Share on Facebook</span>
              </a>
              <a href={`https://twitter.com/intent/tweet?url=https://yourdomain.com/campaign/${campaignAddress}&text=Check out this campaign!`} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-white bg-blue-400 rounded-lg hover:bg-blue-500 transition-all hover:shadow-md">
                <FaTwitter /> <span>Share on Twitter</span>
              </a>
              <a href={`https://api.whatsapp.com/send?text=Check out this campaign! https://yourdomain.com/campaign/${campaignAddress}`} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-white bg-green-500 rounded-lg hover:bg-green-600 transition-all hover:shadow-md">
                <FaWhatsapp /> <span>Share on WhatsApp</span>
              </a>
              <a href={`https://www.instagram.com/`} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-white bg-pink-600 rounded-lg hover:bg-pink-700 transition-all hover:shadow-md">
                <FaInstagram /> <span>Share on Instagram</span>
              </a>
              <a href={`https://www.linkedin.com/shareArticle?url=https://yourdomain.com/campaign/${campaignAddress}`} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-white bg-blue-800 rounded-lg hover:bg-blue-900 transition-all hover:shadow-md">
                <FaLinkedin /> <span>Share on LinkedIn</span>
              </a>
              <a href={`https://www.snapchat.com`} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-white bg-yellow-500 rounded-lg hover:bg-yellow-600 transition-all hover:shadow-md">
                <FaSnapchat /> <span>Share on Snapchat</span>
              </a>
            </div>
            <button onClick={toggleModal} className="mt-4 px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-all hover:shadow-md w-full">
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};
