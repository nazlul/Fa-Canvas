// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract CastCanvas is Ownable, ReentrancyGuard {
    // Events
    event PixelPurchased(address indexed user, uint256 amount, uint256 pixels);
    event PixelsAdded(address indexed user, uint256 pixels);
    event DailyLimitReset(address indexed user, uint256 newLimit);
    
    // Constants
    uint256 public constant PIXELS_PER_PURCHASE = 10;
    uint256 public constant PRICE_PER_PURCHASE = 0.001 ether;
    uint256 public constant DAILY_PIXEL_LIMIT = 5;
    
    // State variables
    mapping(address => uint256) public userPurchasedPixels;
    mapping(address => uint256) public userDailyPixels;
    mapping(address => uint256) public userLastResetDay;
    
    // Purchase pixels with ETH
    function purchasePixels() external payable nonReentrant {
        require(msg.value == PRICE_PER_PURCHASE, "Incorrect payment amount");
        require(msg.sender != address(0), "Invalid sender");
        
        // Add pixels to user's account
        userPurchasedPixels[msg.sender] += PIXELS_PER_PURCHASE;
        
        // Emit event
        emit PixelPurchased(msg.sender, msg.value, PIXELS_PER_PURCHASE);
    }
    
    // Add pixels to user (for admin use)
    function addPixelsToUser(address user, uint256 pixels) external onlyOwner {
        require(user != address(0), "Invalid user address");
        userPurchasedPixels[user] += pixels;
        emit PixelsAdded(user, pixels);
    }
    
    // Get user's available pixels (purchased + daily)
    function getAvailablePixels(address user) external view returns (uint256) {
        uint256 purchased = userPurchasedPixels[user];
        uint256 daily = getDailyPixels(user);
        return purchased + daily;
    }
    
    // Get user's daily pixels
    function getDailyPixels(address user) public view returns (uint256) {
        uint256 today = block.timestamp / 1 days;
        uint256 lastReset = userLastResetDay[user];
        
        if (lastReset < today) {
            return DAILY_PIXEL_LIMIT;
        }
        
        return userDailyPixels[user];
    }
    
    // Use a pixel (called by the API)
    function usePixel(address user) external onlyOwner returns (bool) {
        uint256 dailyPixels = getDailyPixels(user);
        
        if (dailyPixels > 0) {
            // Use daily pixel
            userDailyPixels[user] = dailyPixels - 1;
            uint256 today = block.timestamp / 1 days;
            userLastResetDay[user] = today;
            return true;
        } else if (userPurchasedPixels[user] > 0) {
            // Use purchased pixel
            userPurchasedPixels[user] -= 1;
            return true;
        }
        
        return false;
    }
    
    // Reset daily pixels (called by the API)
    function resetDailyPixels(address user) external onlyOwner {
        uint256 today = block.timestamp / 1 days;
        uint256 lastReset = userLastResetDay[user];
        
        if (lastReset < today) {
            userDailyPixels[user] = DAILY_PIXEL_LIMIT;
            userLastResetDay[user] = today;
            emit DailyLimitReset(user, DAILY_PIXEL_LIMIT);
        }
    }
    
    // Withdraw ETH to owner
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No ETH to withdraw");
        
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
    }
    
    // Emergency withdraw to specific address
    function emergencyWithdraw(address payable recipient) external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No ETH to withdraw");
        require(recipient != address(0), "Invalid recipient");
        
        (bool success, ) = recipient.call{value: balance}("");
        require(success, "Withdrawal failed");
    }
    
    // Get contract balance
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    // Receive function to accept ETH
    receive() external payable {}
} 