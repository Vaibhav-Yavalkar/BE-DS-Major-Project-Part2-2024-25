'use client';
import { client } from "@/app/client";
import { TierCard } from "@/components/TierCard";
import { useParams } from "next/navigation";
import { useState } from "react";
import { getContract, prepareContractCall, ThirdwebContract } from "thirdweb";
import { baseSepolia } from "thirdweb/chains";
import { lightTheme, TransactionButton, useActiveAccount, useReadContract } from "thirdweb/react";
import { Bar, Line, Doughnut, Radar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, ArcElement, RadialLinearScale } from 'chart.js';

// Register necessary components from Chart.js
ChartJS.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  LineElement, 
  PointElement, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement, 
  RadialLinearScale // Required for Radar chart
);
import html2pdf from 'html2pdf.js';


export default function CampaignPage() {
    const account = useActiveAccount();
    const { campaignAddress } = useParams();
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    const contract = getContract({
        client: client,
        chain: baseSepolia,
        address: campaignAddress as string,
    });

    // Name of the campaign
    const { data: name, isLoading: isLoadingName } = useReadContract({
        contract: contract,
        method: "function name() view returns (string)",
        params: [],
    });

    // Description of the campaign
    const { data: description } = useReadContract({ 
        contract, 
        method: "function description() view returns (string)", 
        params: [] 
      });

    // Campaign deadline
    const { data: deadline, isLoading: isLoadingDeadline } = useReadContract({
        contract: contract,
        method: "function deadline() view returns (uint256)",
        params: [],
    });
    // Convert deadline to a date
    const deadlineDate = new Date(parseInt(deadline?.toString() as string) * 1000);
    // Check if deadline has passed
    const hasDeadlinePassed = deadlineDate < new Date();

    // Goal amount of the campaign
    const { data: goal, isLoading: isLoadingGoal } = useReadContract({
        contract: contract,
        method: "function goal() view returns (uint256)",
        params: [],
    });
    
    // Total funded balance of the campaign
    const { data: balance, isLoading: isLoadingBalance } = useReadContract({
        contract: contract,
        method: "function getContractBalance() view returns (uint256)",
        params: [],
    });

    // Calulate the total funded balance percentage
    const totalBalance = balance?.toString();
    const totalGoal = goal?.toString();
    let balancePercentage = (parseInt(totalBalance as string) / parseInt(totalGoal as string)) * 100;

    // If balance is greater than or equal to goal, percentage should be 100
    if (balancePercentage >= 100) {
        balancePercentage = 100;
    }

    // Get tiers for the campaign
    const { data: tiers, isLoading: isLoadingTiers } = useReadContract({
        contract: contract,
        method: "function getTiers() view returns ((string name, uint256 amount, uint256 backers)[])",
        params: [],
    });

    // Get owner of the campaign
    const { data: owner, isLoading: isLoadingOwner } = useReadContract({
        contract: contract,
        method: "function owner() view returns (address)",
        params: [],
    });

    // Get status of the campaign
    const { data: status } = useReadContract({ 
        contract, 
        method: "function state() view returns (uint8)", 
        params: [] 
      });

    const downloadPageAsPDF = () => {
    const element = document.getElementById('analysis-content'); // Wrap your analysis content in this ID
    const button = document.getElementById('download-button'); 
    if (button) button.style.display = 'none';

    const opt = {
        margin: 0.5,
        filename: 'Campaign_Page_Analysis.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, scrollY: 0 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
    };

    html2pdf()
        .set(opt)
        .from(element)
        .save()
        .then(() => {
            if (button) button.style.display = 'block';
        })
        .catch((err) => {
            console.error('Error generating PDF:', err);
            if (button) button.style.display = 'block';
        });
};


    return (
        <div className="mx-auto max-w-7xl px-2 mt-4 sm:px-6 lg:px-8">
            <div className="flex flex-row justify-between items-center">
                {!isLoadingName && (
                    <p className="text-4xl font-semibold">{name}</p>
                )}
                {owner === account?.address && (
                    <div className="flex flex-row">
                        {isEditing && (
                            <p className="px-4 py-2 bg-gray-500 text-white rounded-md mr-2">
                                Status:  
                                {status === 0 ? " Active" : 
                                status === 1 ? " Successful" :
                                status === 2 ? " Failed" : "Unknown"}
                            </p>
                        )}
                        <button
                            className="px-4 py-2 bg-blue-500 text-white rounded-md"
                            onClick={() => setIsEditing(!isEditing)}
                        >{isEditing ? "Done" : "Edit"}</button>
                    </div>
                )}
            </div>
            <div className="my-4">
                <p className="text-lg font-semibold">Description:</p>
                <p>{description}</p>
            </div>
            <div className="mb-4">
                <p className="text-lg font-semibold">Deadline</p>
                {!isLoadingDeadline && (
                    <p>{deadlineDate.toDateString()}</p>
                )}
            </div>
            {!isLoadingBalance && (
                <div className="mb-4">
                    <p className="text-lg font-semibold">Campaign Goal: ₿{goal?.toString()}</p>
                    <div className="relative w-full h-6 bg-gray-200 rounded-full dark:bg-gray-700">
                        <div className="h-6 bg-blue-600 rounded-full dark:bg-blue-500 text-right" style={{ width: `${balancePercentage?.toString()}%`}}>
                            <p className="text-white dark:text-white text-xs p-1">₿{balance?.toString()}</p>
                        </div>
                        <p className="absolute top-0 right-0 text-white dark:text-white text-xs p-1">
                            {balancePercentage >= 100 ? "" : `${balancePercentage?.toString()}%`}
                        </p>
                    </div>
                </div>
                
            )}
            <div>
                <p className="text-lg font-semibold">Tiers:</p>
                <div className="grid grid-cols-3 gap-4">
                    {isLoadingTiers ? (
                        <p >Loading...</p>
                    ) : (
                        tiers && tiers.length > 0 ? (
                            tiers.map((tier, index) => (
                                <TierCard
                                    key={index}
                                    tier={tier}
                                    index={index}
                                    contract={contract}
                                    isEditing={isEditing}
                                />
                            ))
                        ) : (
                            !isEditing && (
                                <p>No tiers available</p>
                            )
                        )
                    )}
                    {isEditing && (
                        // Add a button card with text centered in the middle
                        <button
                            className="max-w-sm flex flex-col text-center justify-center items-center font-semibold p-6 bg-blue-500 text-white border border-slate-100 rounded-lg shadow"
                            onClick={() => setIsModalOpen(true)}
                        >+ Add Tier</button>
                    )}
                </div>
            </div>
            
            {isModalOpen && (
                <CreateCampaignModal
                    setIsModalOpen={setIsModalOpen}
                    contract={contract}
                />
            )}
            <div className="mt-6">
            <p className="text-lg font-semibold">Analysis: Tiers and Goal Amount</p>
            {!isLoadingTiers && tiers && tiers.length > 0 ? (
                <div className="flex flex-col space-y-2">
                   {tiers.map((tier, index) => (
                    <div key={index} className="flex justify-between">
                        <p>{tier.name}</p>
                        <p>₿{tier.amount.toString()}</p>
                    </div>
                ))}
                <div className="flex justify-between font-bold mt-4">
                    <p>Total Goal:</p>
                    <p>₿{goal?.toString()}</p>
                </div>
                </div>
                ) : (
                    <p>No tiers available for analysis.</p>
                )}
            </div>
            <div className="mt-6">
                <p className="text-lg font-semibold">Analysis: User and Tiers with Amount</p>
                {tiers && tiers.length > 0 && owner && account ? (
                    <div className="flex flex-col space-y-4">
                    {tiers.map((tier, index) => (
                        <div key={index} className="border border-gray-300 p-4 rounded-lg">
                            <p className="font-semibold">Tier Name: {tier.name}</p>
                            <p>Amount: ₿{tier.amount.toString()}</p>
                            <p>Donator's: {tier.backers.toString()}</p>
                        </div>
                ))}
                <div className="border border-gray-300 p-4 rounded-lg mt-4">
                    <p className="font-semibold">Campaign Owner</p>
                    <p>Address: {owner}</p>
                </div>
                <div className="border border-gray-300 p-4 rounded-lg">
                    <p className="font-semibold">Current User</p>
                    <p>Address: {account.address}</p>
                </div>
            </div>
            ) : (
            <p>Loading user and tiers data for analysis...</p>
            )}
            </div>

{/* visualAnalysis */}
<div className="flex items-center justify-center min-h-screen bg-gray-50 mt-6">
  <div className="grid grid-cols-2 gap-6 p-4 mt-6">
    {/* Line Chart */}
   {/* Line Chart: Goal Amount and Backers Over Tiers */}
<div className="bg-white shadow-md p-4 rounded-lg">
  <p className="text-lg font-semibold">Analysis: Goal Amount and Donator Over Tiers (Line Chart)</p>
  {!isLoadingTiers && tiers && tiers.length > 0 ? (
    <Line
      data={{
        labels: tiers.map((tier) => tier.name), // Labels for each tier
        datasets: [
          {
            label: 'Goal Amount',
            data: tiers.map((tier) => Number(tier.amount)), // Goal amount data
            fill: false,
            borderColor: 'rgba(75, 192, 192, 1)', // Line color
            tension: 0.1,
          },
          {
            label: 'Donator',
            data: tiers.map((tier) => Number(tier.backers)), // Backers data
            fill: false,
            borderColor: 'rgba(255, 99, 132, 1)', // Line color for backers
            tension: 0.1,
          },
        ],
      }}
      options={{
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Goal Amount and Donator Over Tiers',
          },
        },
        scales: {
          y: {
            beginAtZero: true, // Ensure y-axis starts from zero
          },
        },
      }}
    />
  ) : (
    <p>No tiers available for analysis.</p>
  )}
</div>

    {/* Bar Chart */}
    <div className="bg-white shadow-md p-4 rounded-lg">
      <p className="text-xl font-semibold text-center">Analysis: Donator per Tier (Bar Chart)</p>
      {!isLoadingTiers && tiers && tiers.length > 0 ? (
        <Bar
          data={{
            labels: tiers.map((tier) => tier.name),
            datasets: [
              {
                label: 'Donator',
                data: tiers.map((tier) => Number(tier.backers)), // Convert BigInt to number
                backgroundColor: 'rgba(153, 102, 255, 0.2)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1,
              },
            ],
          }}
          options={{
            responsive: true,
            plugins: {
              title: {
                display: true,
                text: 'Donator per Tier',
              },
            },
          }}
          width={400}
          height={300}
        />
      ) : (
        <p className="text-center">No tiers available for analysis.</p>
      )}
    </div>

    {/* Donut Chart */}
    <div className="bg-white shadow-md p-4 rounded-lg">
      <p className="text-xl font-semibold text-center">Analysis: Amount Distribution Across Tiers (Donut Chart)</p>
      {!isLoadingTiers && tiers && tiers.length > 0 ? (
        <Doughnut
          data={{
            labels: tiers.map((tier) => tier.name),
            datasets: [
              {
                label: 'Tier Amounts',
                data: tiers.map((tier) => Number(tier.amount)), // Convert BigInt to number
                backgroundColor: ['rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)', 'rgba(255, 206, 86, 0.2)', 'rgba(75, 192, 192, 0.2)'],
                borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)', 'rgba(75, 192, 192, 1)'],
                borderWidth: 1,
              },
            ],
          }}
          options={{
            responsive: true,
            plugins: {
              title: {
                display: true,
                text: 'Amount Distribution Across Tiers',
              },
            },
          }}
          width={400}
          height={300}
        />
      ) : (
        <p className="text-center">No tiers available for analysis.</p>
      )}
    </div>

    {/* Radar Chart */}
<div className="bg-white shadow-md p-4 rounded-lg">
  <p className="text-xl font-semibold text-center">Analysis: Donator Distribution Across Tiers (Radar Chart)</p>
  {!isLoadingTiers && tiers && tiers.length > 0 ? (
    <Radar
      data={{
        labels: tiers.map((tier) => tier.name),
        datasets: [
          {
            label: 'Donator Distribution',
            data: tiers.map((tier) => Number(tier.backers)), // Convert BigInt to number
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
            pointBackgroundColor: 'rgba(54, 162, 235, 1)',
          },
        ],
      }}
      options={{
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Donator Distribution Across Tiers',
          },
        },
        scales: {
          r: {
            suggestedMin: 0,
            suggestedMax: Math.max(...tiers.map((tier) => Number(tier.backers))) + 5,
          },
        },
      }}
      width={400}
      height={300}
    />
  ) : (
    <p className="text-center">No tiers available for analysis.</p>
  )}
</div>
  </div>
</div>

{/*download receipt*/}
{owner === account?.address && (
    <div>
    <div>
        <p className="text-lg font-semibold mt-4 mb-4">View and Download EtherFund Receipt</p>
    </div>
    <div id="analysis-content">
    {/* The two analysis sections here */}
    <div className="mt-4 bg-white shadow-md p-4 rounded-lg p mb-4">
    <p className="text-3xl font-bold text-center underline">EtherFund Receipt</p>
    <p className="text-lg text-center">Built with NextJS | Web3 | Solidity</p>
    <p className="text-lg font-semibold">Campaign Name</p><p>{name}</p>
    <p className="text-lg font-semibold">Description</p><p>{description}</p>
    <div className="mb-4">
        <p className="text-lg font-semibold">Deadline</p> {!isLoadingDeadline && ( <p>{deadlineDate.toDateString()}</p> )}
    </div>
    <p className="absolute top-0 right-0 text-white dark:text-white text-xs p-1"> {balancePercentage >= 100 ? "" : `${balancePercentage?.toString()}%`} </p>
    <p className="text-lg font-semibold">Tiers and Goal Amount</p>
        {!isLoadingTiers && tiers && tiers.length > 0 ? (
            <div className="flex flex-col space-y-2">
                {tiers.map((tier, index) => (
                    <div key={index} className="flex justify-between">
                        <p>{tier.name}</p>
                        <p>₿{tier.amount.toString()}</p>
                    </div>
                ))}
                <div className="flex justify-between font-bold mt-4">
                    <p>Total Goal:</p>
                    <p>₿{goal?.toString()}</p>
                </div>
            </div>
        ) : (
            <p>No tiers available for analysis.</p>
        )}

    <div className="mt-6">
        <p className="text-lg font-semibold">User and Tiers with Amount</p>
        {tiers && tiers.length > 0 && owner && account ? (
            <div className="flex flex-col space-y-4 mt-2">
                {tiers.map((tier, index) => (
                    <div key={index} className="border border-gray-300 p-4 rounded-lg">
                        <p className="font-semibold">Tier Name: {tier.name}</p>
                        <p>Amount: ${tier.amount.toString()}</p>
                        <p>Donator's: {tier.backers.toString()}</p>
                    </div>
                ))}
                <div className="border border-gray-300 p-4 rounded-lg mt-4">
                    <p className="font-semibold">Campaign Owner</p>
                    <p>Address: {owner}</p>
                </div>
                {/*<div className="border border-gray-300 p-4 rounded-lg">
                    <p className="font-semibold">Current User</p>
                    <p>Address: {account.address}</p>
                </div>*/}
            </div>
        ) : (
            <p>Loading user and tiers data for analysis...</p>
        )}
    </div>

    <p className="text-lg font-semibold mt-4">Designed & Developed by Group 11 </p><p>Saaras Gaikwad</p><p>Sanskruti Chavan</p><p>Harshad Raurale</p>
        <div className="mx-auto max-w-7xl px-2 mt-4 sm:px-6 lg:px-8 items-center text-center">
            {/* Button to download the page as PDF */}
            <div className="flex justify-end mt-6 items-center text-center">
                <button
                    id="download-button"
                    className="text-center items-center px-4 py-2 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600"
                    onClick={downloadPageAsPDF}
                >
                Download Receipt
                </button>
                </div>
                {/* Rest of the content */}
        </div>
    
    </div>
    </div>
    </div>
)} 

    </div>
    );
}


type CreateTierModalProps = {
    setIsModalOpen: (value: boolean) => void
    contract: ThirdwebContract
}

const CreateCampaignModal = (
    { setIsModalOpen, contract }: CreateTierModalProps
) => {
    const [tierName, setTierName] = useState<string>("");
    const [tierAmount, setTierAmount] = useState<bigint>(1n);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center backdrop-blur-md">
            <div className="w-1/2 bg-slate-100 p-6 rounded-md">
                <div className="flex justify-between items-center mb-4">
                    <p className="text-lg font-semibold">Create a Funding Tier</p>
                    <button
                        className="text-sm px-4 py-2 bg-slate-600 text-white rounded-md"
                        onClick={() => setIsModalOpen(false)}
                    >Close</button>
                </div>
                <div className="flex flex-col">
                    <label>Tier Name:</label>
                    <input 
                        type="text" 
                        value={tierName}
                        onChange={(e) => setTierName(e.target.value)}
                        placeholder="Tier Name"
                        className="mb-4 px-4 py-2 bg-slate-200 rounded-md"
                    />
                    <label>Tier Cost:</label>
                    <input 
                        type="number"
                        value={parseInt(tierAmount.toString())}
                        onChange={(e) => setTierAmount(BigInt(e.target.value))}
                        className="mb-4 px-4 py-2 bg-slate-200 rounded-md"
                    />
                    <TransactionButton
                        transaction={() => prepareContractCall({
                            contract: contract,
                            method: "function addTier(string _name, uint256 _amount)",
                            params: [tierName, tierAmount]
                        })}
                        onTransactionConfirmed={async () => {
                            alert("Tier added successfully!")
                            setIsModalOpen(false)
                        }}
                        onError={(error) => alert(`Error: ${error.message}`)}
                        theme={lightTheme()}
                    >Add Tier</TransactionButton>
                </div>
            </div>
        </div>
    )
}