const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting CastCanvas deployment to Base network...");

  // Get the contract factory
  const CastCanvas = await ethers.getContractFactory("CastCanvas");

  console.log("📦 Deploying CastCanvas contract...");

  // Deploy the contract
  const castCanvas = await CastCanvas.deploy();

  // Wait for deployment to finish
  await castCanvas.waitForDeployment();

  const address = await castCanvas.getAddress();
  console.log("✅ CastCanvas deployed to:", address);

  // Verify the deployment
  console.log("\n📋 Contract Details:");
  console.log("Contract address:", address);
  console.log("Network: Base Mainnet");
  console.log("Owner:", await castCanvas.owner());
  console.log("Price per purchase:", ethers.formatEther(await castCanvas.PRICE_PER_PURCHASE()), "ETH");
  console.log("Pixels per purchase:", await castCanvas.PIXELS_PER_PURCHASE());
  console.log("Daily limit:", await castCanvas.DAILY_PIXEL_LIMIT());

  // Update the frontend with the contract address
  console.log("\n🔄 Updating frontend with contract address...");
  
  // Update the HomeTab component
  const homeTabPath = path.join(__dirname, "../src/components/ui/tabs/HomeTab.tsx");
  let homeTabContent = fs.readFileSync(homeTabPath, "utf8");
  
  // Replace the placeholder contract address
  homeTabContent = homeTabContent.replace(
    /const CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000"; \/\/ TODO: Update with deployed address/,
    `const CONTRACT_ADDRESS = "${address}"; // Deployed contract address`
  );
  
  fs.writeFileSync(homeTabPath, homeTabContent);
  console.log("✅ Updated HomeTab.tsx with contract address");

  // Update the canvas API
  const canvasApiPath = path.join(__dirname, "../src/app/api/canvas/route.ts");
  let canvasApiContent = fs.readFileSync(canvasApiPath, "utf8");
  
  canvasApiContent = canvasApiContent.replace(
    /const CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000"; \/\/ TODO: Update with deployed address/,
    `const CONTRACT_ADDRESS = "${address}"; // Deployed contract address`
  );
  
  fs.writeFileSync(canvasApiPath, canvasApiContent);
  console.log("✅ Updated canvas API with contract address");

  // Create a deployment info file
  const deploymentInfo = {
    contractAddress: address,
    network: "Base Mainnet",
    chainId: 8453,
    deploymentTime: new Date().toISOString(),
    owner: await castCanvas.owner(),
    pricePerPurchase: ethers.formatEther(await castCanvas.PRICE_PER_PURCHASE()),
    pixelsPerPurchase: (await castCanvas.PIXELS_PER_PURCHASE()).toString(),
    dailyLimit: (await castCanvas.DAILY_PIXEL_LIMIT()).toString()
  };

  fs.writeFileSync(
    path.join(__dirname, "../deployment-info.json"),
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("✅ Created deployment-info.json");

  console.log("\n🎉 Deployment completed successfully!");
  console.log("📝 Contract address:", address);
  console.log("🌐 View on BaseScan: https://basescan.org/address/" + address);
  console.log("💡 Don't forget to verify the contract on BaseScan!");

  return address;
}

main()
  .then((address) => {
    console.log("\n✅ All done! Contract deployed at:", address);
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }); 