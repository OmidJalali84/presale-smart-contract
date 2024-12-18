// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

// Import OpenZeppelin libraries for ERC20 token, math operations, and ERC20 interfaces
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract Presale {
    // Token details
    ERC20 public token;

    //Owner Details
    address payable public owner;

    // USDT token details
    IERC20 public usdtToken;

    // Presale parameters

    uint256 public tokenPrice; // *1e-3
    uint256 public tokensForSale;
    uint256 public tokensSold;
    uint256 public openingTime;
    uint256 public closingTime;

    //Aggregator parameters
    AggregatorV3Interface public priceFeed;

    mapping(address => uint256) public tokensBought;
    mapping(uint256 => uint256) public giftCodeSales;

    // Events
    event TokensPurchased(address indexed purchaser, uint256 amount);
    event PresaleEnded(uint256 tokensSold);
    event Withdrawal(address indexed owner, uint256 amount);

    constructor(
        uint256 _tokenPrice,
        uint256 _tokensForSale,
        uint256 _openingTime,
        uint256 _closingTime,
        address _priceFeedAddress,
        address _token,
        address _usdtToken,
        address payable _owner
    ) {
        token = ERC20(_token);
        usdtToken = IERC20(_usdtToken);
        owner = _owner;
        tokenPrice = _tokenPrice;
        tokensForSale = _tokensForSale;
        openingTime = _openingTime;
        closingTime = _closingTime;
        priceFeed = AggregatorV3Interface(_priceFeedAddress);
    }

    modifier onlyWhileOpen() {
        require(
            block.timestamp >= openingTime && block.timestamp <= closingTime,
            "Presale: not open"
        );
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Presale: caller is not the token owner");
        _;
    }

    function getPrice() internal view returns (uint256) {
        (, int256 answer, , , ) = priceFeed.latestRoundData();
        // ETH/USD rate in 18 digit
        return uint256(answer);
    }

    function getTokensToBuy(uint256 ethAmount) internal view returns (uint256) {
        uint256 ethPrice = getPrice();
        uint256 ethAmountInUsd = (ethPrice * ethAmount) / 1e8;
        uint256 tokensToBuy = (ethAmountInUsd / tokenPrice) * 1e3;
        // the actual ETH/USD conversation rate, after adjusting the extra 0s.
        return tokensToBuy;
    }

    // Function to buy tokens using Ether
    function buyTokensWithEther(uint256 giftCode) external payable onlyWhileOpen nonReentrant {
        uint256 weiAmount = msg.value;
        require(weiAmount > 0, "Presale: amount must be greater than zero");

        uint256 tokensToBuy = getTokensToBuy(weiAmount);

        require(
            tokensToBuy <= tokensForSale - tokensSold,
            "Presale: not enough tokens left for sale"
        );

        tokensSold = tokensSold + tokensToBuy;

        // Attempt to transfer tokens to the buyer
        bool transferSuccess = token.transfer(msg.sender, tokensToBuy);
        require(transferSuccess, "Token transfer failed");

        tokensBought[msg.sender] += tokensToBuy;
        giftCodeSales[giftCode] += tokensToBuy;

        emit TokensPurchased(msg.sender, tokensToBuy);
    }

    // Function to buy tokens using USDT
    function buyTokensWithUSDT(uint256 _amount, uint256 giftCode) external onlyWhileOpen nonReentrant {
        require(_amount > 0, "Presale: amount must be greater than zero");
        require(
            _amount <= (tokensForSale - tokensSold),
            "Presale: not enough tokens left for sale"
        );

        uint256 usdtAmount = _amount * tokenPrice * 1e15;

        require(usdtToken.transferFrom(msg.sender, owner, usdtAmount), "USDT transfer failed");

        tokensSold = tokensSold + _amount;

        bool transferSuccess = token.transfer(msg.sender, _amount * 1e18);
        require(transferSuccess, "Token transfer failed");

        tokensBought[msg.sender] += _amount;
        giftCodeSales[giftCode] += _amount;

        emit TokensPurchased(msg.sender, _amount);
    }

    function changePrice(uint256 newPrice) external onlyOwner {
        tokenPrice = newPrice;
    }

    function changeOwner(address payable newOwner) external onlyOwner {
        owner = newOwner;
    }

    // Function to withdraw accumulated Ether
    function withdrawEther() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "Presale: no Ether to withdraw");

        owner.transfer(balance);
        emit Withdrawal(owner, balance);
    }

    function withdrawToken(uint256 amount) external onlyOwner {
        uint256 balance = amount * 1e18;
        require(balance > 0, "Presale: no Token to withdraw");

        bool transferSuccess = token.transfer(msg.sender, balance);
        require(transferSuccess, "Token transfer failed");
    }

    function endPresale() external onlyOwner {
        require(block.timestamp > closingTime, "Presale: Presale is still ongoing");

        uint256 remainingTokens = token.balanceOf(address(this));
        if (remainingTokens > 0) {
            token.transfer(owner, remainingTokens);
        }

        emit PresaleEnded(tokensSold);
    }

    function getRemainingTokens() public view returns (uint256) {
        return tokensForSale - tokensSold;
    }
}
