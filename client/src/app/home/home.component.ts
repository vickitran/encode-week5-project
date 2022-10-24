import { Component, OnInit } from '@angular/core';
import Onboard from '@web3-onboard/core';
import injectedModule from '@web3-onboard/injected-wallets';
import { ethers } from 'ethers';

import Lottery from './assets/Lottery.json';
import LotteryToken from './assets/LotteryToken.json';

const unknown = 'Unknown';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  onboard: any;
  wallet: ethers.Wallet | undefined;
  ethersProvider: ethers.providers.Web3Provider | undefined;
  buttonMsg: string;
  lotteryContract: ethers.Contract;
  tokenContract: ethers.Contract;
  signer: ethers.Signer | undefined;
  lotteryImg: string;
  lotteryState: string;
  displayBalanceImg: string;
  displayBalanceState: string;
  TokenBalanceImg: string;
  TokenBalanceState: string;

  constructor() {
    this.buttonMsg = 'Buttons disabled! Please connect you wallet!';
    this.lotteryState = unknown;
    this.lotteryImg = 'assets/imgs/file.png';

    this.displayBalanceImg = 'assets/imgs/18817626051639135550.svg';
    this.displayBalanceState = unknown;

    this.TokenBalanceImg = 'assets/imgs/12087699321639817695-128.png';
    this.TokenBalanceState = unknown;

    const provider = ethers.getDefaultProvider('goerli');
    this.lotteryContract = new ethers.Contract(
      '0xE0c49Ec0824AAe133132cb5fdF0F37D39897D94b',
      Lottery.abi,
      provider
    );
  }

  ngOnInit(): void {
    const appMetadata = {
      name: 'Lottery App',
      icon: 'assets/imgs/11207480621637902539.svg',
      logo: 'assets/imgs/11207480621637902539.svg',
      description: 'Encode Week 5 Project',
      recommendedInjectedWallets: [
        { name: 'MetaMask', url: 'https://metamask.io' },
      ],
    };
    const TESTNET_RPC_URL =
      'https://eth-goerli.g.alchemy.com/v2/mk1IsvVSi55p3cIhLzEtBfjRTvK5kuDQ';

    const injected = injectedModule();

    this.onboard = Onboard({
      wallets: [injected],
      chains: [
        {
          id: '0x5',
          token: 'ETH',
          label: 'Goerli',
          rpcUrl: TESTNET_RPC_URL,
        },
      ],
      appMetadata,
    });
  }

  async connectWallet() {
    const wallets = await this.onboard.connectWallet();
    this.wallet = wallets[0];
    if (this.wallet) {
      this.ethersProvider = new ethers.providers.Web3Provider(
        wallets[0].provider,
        'any'
      );

      this.signer = this.ethersProvider.getSigner();
      this.buttonMsg = 'Wallet connected! Buttons enabled';
    }
  }

  checkConnected() {
    if (this.wallet) {
      return false;
    } else {
      return true;
    }
  }
  async checkState() {
    const state = await this.lotteryContract['betsOpen']();
    this.lotteryState = state ? 'open' : 'closed';
    this.lotteryImg = state ? 'assets/imgs/open.png' : 'assets/imgs/closed.png';
  }

  async displayBalance() {
    if (this.ethersProvider && this.signer) {
      const balanceBN = await this.ethersProvider.getBalance(
        this.signer.getAddress()
      );
      const balance = ethers.utils.formatEther(balanceBN);
      this.displayBalanceState = balance;
    }
  }

  async displayTokenBalance() {//todo}
}
