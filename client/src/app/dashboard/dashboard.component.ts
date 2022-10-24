import { Component, OnInit } from '@angular/core';
import { ethers } from 'ethers';
import { FormBuilder } from '@angular/forms';
import * as importLotteryScript from "./Backend/scripts/Lottery";
import Lottery from './home/assets/Lottery.json';

let contract: Lottery;
let token: LotteryToken;
//let accounts: SignerWithAddress[];


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})

export class DashboardComponent implements OnInit { 
  walletAddress: string;
  wallet: ethers.Wallet | undefined; 
  provider: ethers.providers.BaseProvider | undefined;
  balance: string;
  lotteryContract: ethers.Contract;

  openBetsForm = this.fb.group({ 
    duration: ['']
  });

  amountForm = this.fb.group({ 
    amount: ['']
  });


  // TODO: setup connection
  constructor() { 
    this.walletAddress = "Loading...";
    this.balance = "Loading...";

    const provider = ethers.getDefaultProvider('goerli');
    this.lotteryContract = new ethers.Contract(
      '0xE0c49Ec0824AAe133132cb5fdF0F37D39897D94b',
      Lottery.abi,
      provider
    );
  }
  
  //TODO: setup connection
  ngOnInit(): void {
    /*this.apiService.getContractAddress().subscribe((response) => {
      this.tokenContractAddress = response.result; 
    });
    this.provider = ethers.getDefaultProvider("goerli");
    this.wallet = ethers.Wallet.createRandom();
    this.walletAddress = this.wallet.address;*/

    
    /*this.provider.getBalance(this.walletAddress).then( 
      (balanceBN) => { // if success: balanceBN, if failure: error
      this.balance = ethers.utils.formatEther(balanceBN);
    },
    (error) => {
      console.error(error);
    });
    */
  }


  async openBetsApp(){
    const body = {
      duration: this.openBetsForm.value.duration
    };
    const currentBlock = await this.lotteryContract.getBlock("latest");
    const tx = await this.lotteryContract.openBets(currentBlock.timestamp + Number(body));
    const receipt = await tx.wait();
    const resultString = `Bets opened (${receipt.transactionHash})`;

    alert(resultString);
  }


  async displayBalanceApp(){
    const balanceBN = await this.lotteryContract.getBalance(/*insert wallett user address*/ );
    const balance = ethers.utils.formatEther(balanceBN);
    const resultString =  `The account of address ${/* insert wallet ref */} has ${balance} ETH`;

    alert(resultString);
  }


  async buyTokensApp(){
    const body = {
      amount: this.amountForm.value.amount
    };
    const tx = await this.lotteryContract.purchaseTokens({
      value: ethers.utils.parseEther(body),
    });
    const receipt = await tx.wait();
    const resultString = `Tokens bought (${receipt.transactionHash})\n`;

    alert(resultString);
  }

  //TODO: create instance of token contract (with .attach() ?) and get token balance from lottery contract
  displayTokenBalanceApp(){
    /* Token is the instance of token contract
    const tokenAddress = await contract.paymentToken(); 
    const tokenFactory = await ethers.getContractFactory("LotteryToken"); 
    token = tokenFactory.attach(tokenAddress); 
  */
    //const balanceBN = await token.balanceOf(accounts[Number(index)].address);  // balance da token contract non da lottery
    const balance = ethers.utils.formatEther(balanceBN);
    const resultString = `The account of address ${/*inser wallet ref*/ } has ${balance} Tokens\n`;

    alert(resultString);
  }


  async betApp(){
    const body = {
      amount: this.amountForm.value.amount,
    };
    const allowTx = await token
      .connect(/* insert wallet ref */)
      .approve(this.lotteryContract.address, ethers.constants.MaxUint256);
    await allowTx.wait();
    const tx = await this.lotteryContract.betMany(body);
    const receipt = await tx.wait();
    const resultString = `Bets placed (${receipt.transactionHash})`;

    alert(resultString);
  }


  async closeLotteryApp(){
    const tx = await this.lotteryContract.closeLottery();
    const receipt = await tx.wait();
    const resultString = `Bets closed (${receipt.transactionHash})`;

    alert(resultString);
  }


  async displayPrizeApp(){
    const prizeBN = await this.lotteryContract.prize(/* insert wallet ref */);
    const prize = ethers.utils.formatEther(prizeBN);
    const resultString = `The account of address ${/* insert wallet ref */} has earned a prize of ${prize} Tokens`;

    alert(resultString);
  }

  async claimPrizeApp(){
    const body = {
      amount: this.amountForm.value.amount,
    };
    const tx = await this.lotteryContract.prizeWithdraw(ethers.utils.parseEther(body));
    const receipt = await tx.wait();
    const resultString = `Prize claimed (${receipt.transactionHash})`;

    alert(resultString);
  }

  async displayOwnerPoolApp(){
    const balanceBN = await this.lotteryContract.ownerPool();
    const balance = ethers.utils.formatEther(balanceBN);
    const resultString = `The owner pool has (${balance}) Tokens`;

    alert(resultString);
  }

  async withdrawTokensApp(){
    const body = {
      amount: this.amountForm.value.amount,
    };
    const tx = await this.lotteryContract.ownerWithdraw(ethers.utils.parseEther(body));
    const receipt = await tx.wait();
    const resultString = `Withdraw confirmed (${receipt.transactionHash})`;

    alert(resultString);
  }

  async burnTokensApp(){
    const body = {
      amount: this.amountForm.value.amount,
    };
    const allowTx = await token
      .connect(/* insert wallet ref */)
      .approve(this.lotteryContract.address, ethers.constants.MaxUint256);
    const receiptAllow = await allowTx.wait();
    alert(`Allowance confirmed (${receiptAllow.transactionHash})`);
    const tx = await this.lotteryContract.returnTokens(ethers.utils.parseEther(body));
    const receipt = await tx.wait();
    const resultString = `Burn confirmed (${receipt.transactionHash})`;

    alert(resultString);
  }

 









}
