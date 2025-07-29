const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying CastCanvas contract to Base network...");

  // Get the contract factory
  const CastCanvas = await ethers.getContractFactory("CastCanvas");

  // Deploy the contract
  const castCanvas = await CastCanvas.deploy();

  // Wait for deployment to finish
  await castCanvas.waitForDeployment();

  const address = await castCanvas.getAddress();
  console.log("CastCanvas deployed to:", address);

  // Verify the deployment
  console.log("Contract deployed successfully!");
  console.log("Contract address:", address);
  console.log("Network: Base Mainnet");
  console.log("Owner:", await castCanvas.owner());
  console.log("Price per purchase:", ethers.formatEther(await castCanvas.PRICE_PER_PURCHASE()), "ETH");
  console.log("Pixels per purchase:", await castCanvas.PIXELS_PER_PURCHASE());
  console.log("Daily limit:", await castCanvas.DAILY_PIXEL_LIMIT());

  return address;
}

main()
  .then((address) => {
    console.log("Deployment completed successfully!");
    console.log("Contract address:", address);
    process.exit(0);
  })
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  }); 