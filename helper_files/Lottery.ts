import { ethers } from "hardhat";
import * as readline from "readline";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Lottery, LotteryToken } from "../typechain-types";

let contract: Lottery;
let token: LotteryToken;
let accounts: SignerWithAddress[];

const BET_PRICE = 1;
const BET_FEE = 0.2;
const TOKEN_RATIO = 1;

const tokenAddress = "0xE0c49Ec0824AAe133132cb5fdF0F37D39897D94b";

//TODO: Implementation of wallet address connection instead of random wallet
async function main() {
  await initContracts();
  await initAccounts();
  const rl = readline.createInterface({  //set up block first
    input: process.stdin,
    output: process.stdout,
  });
  mainMenu(rl); 
}

//TODO: remove
export async function initContracts() {

  const contractFactory = await ethers.getContractFactory("Lottery");
  contract = await contractFactory.deploy(
    "LotteryToken", // for token.sol deploy
    "LT0", // for token.sol deploy
    TOKEN_RATIO,
    ethers.utils.parseEther(BET_PRICE.toFixed(18)), // uso il cast perchè se no ho problema di underflow
    ethers.utils.parseEther(BET_FEE.toFixed(18))
  );
  await contract.deployed();
  //const tokenAddress = await contract.paymentToken(); //Get the token address from the lottery -> ce l'abbiamo xchè il contratto del Lottery lo contiene e viene deployato assieme
  const tokenFactory = await ethers.getContractFactory("LotteryToken"); //from ABI
  token = tokenFactory.attach(tokenAddress); // attach sulla factory del token contract address
}

async function initAccounts() {  // in the project frontend create a form
  accounts = await ethers.getSigners();
}

async function mainMenu(rl: readline.Interface) {
  menuOptions(rl);
}

//TODO: remove
function menuOptions(rl: readline.Interface) {
  rl.question( // in base a scelta dell'user attivo delle funzioni
    "Select operation: \n Options: \n [0]: Exit \n [1]: Check state \n [2]: Open bets \n [3]: Top up account tokens \n [4]: Bet with account \n [5]: Close bets \n [6]: Check player prize \n [7]: Withdraw \n [8]: Burn tokens \n",
    async (answer: string) => {
      console.log(`Selected: ${answer}\n`);
      const option = Number(answer);
      switch (option) {
        case 0:
          rl.close();
          return;
        case 1:
          await checkState();  // se user sceglie 1 succede questa funz qui ecc
          mainMenu(rl);
          break;
        case 2:
          rl.question("Input duration (in seconds)\n", async (duration) => {
            try {
              await openBets(duration);
            } catch (error) {
              console.log("error\n");
              console.log({ error });
            }
            mainMenu(rl);
          });
          break;
        case 3:
          rl.question("What account (index) to use?\n", async (index) => {
            await displayBalance(index);
            rl.question("Buy how many tokens?\n", async (amount) => {
              try {
                await buyTokens(index, amount);
                await displayBalance(index);
                await displayTokenBalance(index);
              } catch (error) {
                console.log("error\n");
                console.log({ error });
              }
              mainMenu(rl);
            });
          });
          break;
        case 4:
          rl.question("What account (index) to use?\n", async (index) => {
            await displayTokenBalance(index);
            rl.question("Bet how many times?\n", async (amount) => {
              try {
                await bet(index, amount);
                await displayTokenBalance(index);
              } catch (error) {
                console.log("error\n");
                console.log({ error });
              }
              mainMenu(rl);
            });
          });
          break;
        case 5:
          try {
            await closeLottery();
          } catch (error) {
            console.log("error\n");
            console.log({ error });
          }
          mainMenu(rl);
          break;
        case 6:
          rl.question("What account (index) to use?\n", async (index) => {
            const prize = await displayPrize(index);
            if (Number(prize) > 0) {
              rl.question(
                "Do you want to claim your prize? [Y/N]\n",
                async (answer) => {
                  if (answer.toLowerCase() === "y") {
                    try {
                      await claimPrize(index, prize);
                    } catch (error) {
                      console.log("error\n");
                      console.log({ error });
                    }
                  }
                  mainMenu(rl);
                }
              );
            } else {
              mainMenu(rl);
            }
          });
          break;
        case 7:
          await displayTokenBalance("0");
          await displayOwnerPool();
          rl.question("Withdraw how many tokens?\n", async (amount) => {
            try {
              await withdrawTokens(amount);
            } catch (error) {
              console.log("error\n");
              console.log({ error });
            }
            mainMenu(rl);
          });
          break;
        case 8:
          rl.question("What account (index) to use?\n", async (index) => {
            await displayTokenBalance(index);
            rl.question("Burn how many tokens?\n", async (amount) => {
              try {
                await burnTokens(index, amount);
              } catch (error) {
                console.log("error\n");
                console.log({ error });
              }
              mainMenu(rl);
            });
          });
          break;
        default:
          throw new Error("Invalid option");
      }
    }
  );
}

// Queste funz sono services inside the frontend
export async function checkState() {

  const state = await contract.betsOpen(); //verifico lo stato della bet
  console.log(`The lottery is ${state ? "open" : "closed"}\n`); 
  if (!state) return;
  
  //Dobbiamo verificare che non siamo nello stato in cui la bet è chiusa (closing time verpasst) ma nessuno ha chiamato la closeBet() function
  // Stampiamo a video il closing time effettivo prendendolo dal contratto
  const currentBlock = await ethers.provider.getBlock("latest");
  const currentBlockDate = new Date(currentBlock.timestamp * 1000);
  const closingTime = await contract.betsClosingTime();
  const closingTimeDate = new Date(closingTime.toNumber() * 1000);
  console.log(
    `The last block was mined at ${currentBlockDate.toLocaleDateString()} : ${currentBlockDate.toLocaleTimeString()}\n`
  );
  console.log(
    `lottery should close at  ${closingTimeDate.toLocaleDateString()} : ${closingTimeDate.toLocaleTimeString()}\n`
  );

  const resultString = `The last block was mined at ${currentBlockDate.toLocaleDateString()} : ${currentBlockDate.toLocaleTimeString()}, lottery should close at  ${closingTimeDate.toLocaleDateString()} : ${closingTimeDate.toLocaleTimeString()}\n`;
  
  return resultString;
}

export async function openBets(duration: string) { //call a transaction to open the bet -> solo l'owner/deployer può invocare questa funzione
  const currentBlock = await ethers.provider.getBlock("latest");
  const tx = await contract.openBets(currentBlock.timestamp + Number(duration)); //openBets prende in input un closing time (calcolato come timestamp + duration?)
  const receipt = await tx.wait();
  const resultString = `Bets opened (${receipt.transactionHash})`;
  console.log(`Bets opened (${receipt.transactionHash})`);

  return resultString;
}

export async function displayBalance(index: string) {
  const balanceBN = await ethers.provider.getBalance( //potremmo anche scrivere await accounts[Number(index)].getBalance(); -> qui need to pass the address, nel nostro caso no ma è uguale
    accounts[Number(index)].address
  );
  const balance = ethers.utils.formatEther(balanceBN);
  console.log(
    `The account of address ${
      accounts[Number(index)].address
    } has ${balance} ETH\n`
  );

  const resultString = `The account of address ${
    accounts[Number(index)].address
  } has ${balance} ETH\n`;

  return resultString;
}

export async function buyTokens(index: string, amount: string) { //qui a differenza dell'openBets, possiamo connetterci a diversi account per comprare i token
  const tx = await contract.connect(accounts[Number(index)]).purchaseTokens({
    value: ethers.utils.parseEther(amount), // Passiamo un argument (value) anche se non è richiesto perchè è il value all'interno dell'override
  });
  const receipt = await tx.wait();
  console.log(`Tokens bought (${receipt.transactionHash})\n`);

  const resultString = `Tokens bought (${receipt.transactionHash})\n`;

  return resultString;
}

export async function displayTokenBalance(index: string) {
  const balanceBN = await token.balanceOf(accounts[Number(index)].address);  // balance da token contract non da lottery
  const balance = ethers.utils.formatEther(balanceBN);
  console.log(
    `The account of address ${
      accounts[Number(index)].address
    } has ${balance} Tokens\n`
  );

  const resultString = `The account of address ${
    accounts[Number(index)].address
  } has ${balance} Tokens\n`;

  return resultString;
}

export async function bet(index: string, amount: string) {
  const allowTx = await token
    .connect(accounts[Number(index)])
    .approve(contract.address, ethers.constants.MaxUint256); //allow transaction
  await allowTx.wait();
  const tx = await contract.connect(accounts[Number(index)]).betMany(amount);
  const receipt = await tx.wait();
  console.log(`Bets placed (${receipt.transactionHash})\n`);

  const resultString = `Bets placed (${receipt.transactionHash})\n`;

  return resultString;
}

export async function closeLottery() {
  const tx = await contract.closeLottery();
  const receipt = await tx.wait();
  console.log(`Bets closed (${receipt.transactionHash})\n`);

  const resultString = `Bets closed (${receipt.transactionHash})\n`;

  return resultString;
}

export async function displayPrize(index: string): Promise<string> {
  const prizeBN = await contract.prize(accounts[Number(index)].address);
  const prize = ethers.utils.formatEther(prizeBN);
  console.log(
    `The account of address ${
      accounts[Number(index)].address
    } has earned a prize of ${prize} Tokens\n`
  );
  return prize;
}

async function claimPrize(index: string, amount: string) {
  const tx = await contract
    .connect(accounts[Number(index)])
    .prizeWithdraw(ethers.utils.parseEther(amount));
  const receipt = await tx.wait();
  console.log(`Prize claimed (${receipt.transactionHash})\n`);
}

async function displayOwnerPool() {
  const balanceBN = await contract.ownerPool();
  const balance = ethers.utils.formatEther(balanceBN);
  console.log(`The owner pool has (${balance}) Tokens \n`);
}

async function withdrawTokens(amount: string) {
  const tx = await contract.ownerWithdraw(ethers.utils.parseEther(amount));
  const receipt = await tx.wait();
  console.log(`Withdraw confirmed (${receipt.transactionHash})\n`);
}

async function burnTokens(index: string, amount: string) {
  const allowTx = await token
    .connect(accounts[Number(index)])
    .approve(contract.address, ethers.constants.MaxUint256);
  const receiptAllow = await allowTx.wait();
  console.log(`Allowance confirmed (${receiptAllow.transactionHash})\n`);
  const tx = await contract
    .connect(accounts[Number(index)])
    .returnTokens(ethers.utils.parseEther(amount));
  const receipt = await tx.wait();
  console.log(`Burn confirmed (${receipt.transactionHash})\n`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});


