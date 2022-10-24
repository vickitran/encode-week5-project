import { Component, OnInit } from '@angular/core';
import { ethers } from 'ethers';
import { FormBuilder } from '@angular/forms';
import * as importLotteryScript from "Backend/scripts/Lottery";
import { Lottery, LotteryToken } from 'Backend/typechain-types';

let contract: Lottery;
let token: LotteryToken;
//let accounts: SignerWithAddress[];


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})

export class DashboardComponent implements OnInit { //Dashboard component should do code just inside of it and work around this component
  walletAddress: string;
  wallet: ethers.Wallet | undefined;  //before being loaded its type could be undefined --> why undefined? Cause from the constructor to the ngOnInit function it could take a while and remain typeless
  provider: ethers.providers.BaseProvider | undefined;
  balance: string;
  tokenContractAddress: string;

  openBetsForm = this.fb.group({ //Body of the post method created with FormBuilder -> available through constructor
    duration: ['']
  });

  indexForm = this.fb.group({ //Body of the post method created with FormBuilder -> available through constructor
    index: ['']
  });

  indexAmountForm = this.fb.group({ //Body of the post method created with FormBuilder -> available through constructor
    index: [''],
    amount: [''],
  });

  constructor() { 
    this.walletAddress = "Loading...";
    this.balance = "Loading...";
    this.tokenContractAddress = "";
  }
  
  //This function only run when it's loaded --> on initialization
  ngOnInit(): void {
    /*this.apiService.getContractAddress().subscribe((response) => {
      this.tokenContractAddress = response.result; 
    });
    this.provider = ethers.getDefaultProvider("goerli");
    this.wallet = ethers.Wallet.createRandom();
    this.walletAddress = this.wallet.address;*/

    // Balance è sia di un ERC20 token sia di ETH di un wallet --> per ils econdo ci serve un provider
    /*this.provider.getBalance(this.walletAddress).then( //perchè then? il balance è una promise ma in questo caso non await perchè essendo uno script c'è esecuzione sequenziale --> hey applicazione, appena hai balance esegui la funzione nel then
      (balanceBN) => { // if success: balanceBN, if failure: error
      this.balance = ethers.utils.formatEther(balanceBN);
    },
    (error) => {
      console.error(error);
    });
    */
  }

  /*claimTokens(){ 
    const body = {
      name: this.claimForm.value.name, 
      id: this.claimForm.value.id
    };
    console.log(this.claimForm.value);
    this.apiService.claimVoteTokens(body).subscribe((result) => { 
      console.log(result);
    });
  }*/

  /**
   * PPPPPPPPPPPPPPPPPROVA
   */

  checkStateApp(){
    alert(importLotteryScript.checkState());
  }

  openBetsApp(){
    const body = {
      duration: this.openBetsForm.value.duration
    };
    alert(importLotteryScript.openBets(body));
  }

  displayBalanceApp(){
    const body = {
      index: this.indexForm.value.duration
    };
    alert(importLotteryScript.displayBalance(body));
  }

  buyTokensApp(){
    const body = {
      index: this.indexAmountForm.value.index,
      amount: this.indexAmountForm.value.amount,
    };
    alert(importLotteryScript.buyTokens(body));
  }

  displayTokenBalanceApp(){
    const body = {
      index: this.indexForm.value.index
    };
    alert(importLotteryScript.displayTokenBalance(body));
  }

  betApp(){
    const body = {
      index: this.indexAmountForm.value.index,
      amount: this.indexAmountForm.value.amount,
    };
    alert(importLotteryScript.bet(body));
  }

  closeLotteryApp(){
    alert(importLotteryScript.closeLottery());
  }

  displayPrizeApp(){
    const body = {
      index: this.indexForm.value.index
    };
    alert(importLotteryScript.displayPrize(body));
  }










}
