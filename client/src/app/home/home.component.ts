import { Component, OnInit } from '@angular/core';
import Onboard from '@web3-onboard/core';
import injectedModule from '@web3-onboard/injected-wallets';
import { ethers } from 'ethers';

import Lottery from './assets/Lottery.json';

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
  lotteryState: string;
  lotteryContract: ethers.Contract;
  signer: ethers.Signer | undefined;
  lotteryImg: string;

  constructor() {
    this.buttonMsg = 'Buttons disabled! Please connect you wallet!';
    this.lotteryState = 'Unknown';
    this.lotteryImg = 'assets/imgs/file.png';

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
    const TESTNET_RPC_URL = '';

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
}
