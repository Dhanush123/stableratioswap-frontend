import React from 'react';

// We'll use ethers to interact with the Ethereum network and our contract
import { ethers } from 'ethers';

// We import the contract's artifacts and address here, as we are going to be
// using them with ethers
import StableRatioSwapArtifact from "../contracts/StableRatioSwap.json";
import contractAddress from "../contracts/contract-address.json";

import MockStableRatioSwapArtifact from "../contracts/MockStableRatioSwap.json";
import mockContractAddress from "../contracts/mock-contract-address.json";

// All the logic of this dapp is contained in the Dapp component.
// These other components are just presentational ones: they don't have any
// logic. They just render HTML.
import { NoWalletDetected } from './NoWalletDetected';
import { ConnectWallet } from './ConnectWallet';

import Grid from '@material-ui/core/Grid';

// import {initializeLendingPool} from '../Aave';
import GenericButton from './GenericButton';
import DepositsGrid from './DepositsGrid';
import Utils from '../Utils';

// This is the Hardhat Network id, you might change it in the hardhat.config.js
// Here's a list of network ids https://docs.metamask.io/guide/ethereum-provider.html#properties
// to use when deploying to other networks.
const HARDHAT_NETWORK_ID = '31337';
const MAINNET_ID = '1';
const KOVAN_ID = '42';
const NETWORK_ERR_MSG = 'Please connect Metamask to Localhost:8545, mainnet, or Kovan';
const DEPOSIT_AMOUNT = 100;//ethers.utils.parseEther('0.1');

class App extends React.Component {
  constructor(props) {
    super(props);

    // We store multiple things in Dapp's state.
    // You don't need to follow this pattern, but it's an useful example.
    this.initialState = {
      // The info of the token (i.e. It's Name and symbol)
      tokenData: undefined,
      // The user's address and balance
      selectedAddress: undefined,
      transactionError: undefined,
      networkError: undefined,
      utils: undefined,
      deposits: {
        'TUSD': {'value':0,'decimals':2},
        'USDC': {'value':0,'decimals':2},
        'USDT': {'value':0,'decimals':2},
        'DAI': {'value':0,'decimals':2},
        'BUSD': {'value':0,'decimals':2}
      },
      optInStatus: false
    };

    this.state = this.initialState;
    this.updateDepositState = this.updateDepositState.bind(this);
  }

  async intializeEthers() {
    // We first initialize ethers by creating a provider using window.ethereum
    this.provider = new ethers.providers.Web3Provider(window.ethereum);

    // When, we initialize the contract using that provider and the token's
    // artifact. You can do this same thing with your contracts.
    if (window.ethereum.networkVersion === HARDHAT_NETWORK_ID || window.ethereum.networkVersion === KOVAN_ID) {
      this.stableRatioSwap = new ethers.Contract(
        mockContractAddress.MockStableRatioSwap,
        MockStableRatioSwapArtifact.abi,
        this.provider.getSigner(0)
      );
    }
    else if (window.ethereum.networkVersion === MAINNET_ID) {
      this.stableRatioSwap = new ethers.Contract(
        contractAddress.StableRatioSwap,
        StableRatioSwapArtifact.abi,
        this.provider.getSigner(0)
      );
    }

    this.setState({utils: new Utils(this.stableRatioSwap, this.provider, this.state.selectedAddress)});
  }

  // This method just clears part of the state.
  dismissNetworkError() {
    this.setState({ networkError: undefined });
  }

  async initialize(userAddress) {
    // This method initializes the dapp

    // We first store the user's address in the component's state
    this.setState({
      selectedAddress: userAddress
    });

    // Then, we initialize ethers
    await this.intializeEthers();
  }

  async connectWallet() {
    // This method is run when the user clicks the Connect. It connects the
    // dapp to the user's wallet, and initializes it.

    // To connect to the user's wallet, we have to run this method.
    // It returns a promise that will resolve to the user's address.
    const [selectedAddress] = await window.ethereum.enable();
    console.log('selectedAddress',selectedAddress);
    // Once we have the address, we can initialize the application.

    // First we check the network
    if (!this.checkNetwork()) {
      return;
    }

    this.initialize(selectedAddress);

    // We reinitialize it whenever the user changes their account.
    window.ethereum.on('accountsChanged', ([newAddress]) => {
      // `accountsChanged` event can be triggered with an undefined newAddress.
      // This happens when the user removes the Dapp from the "Connected
      // list of sites allowed access to your addresses" (Metamask > Settings > Connections)
      // To avoid errors, we reset the dapp state
      if (newAddress === undefined) {
        return this.resetState();
      }

      this.initialize(newAddress);
    });

    // We reset the dapp state if the network is changed
    window.ethereum.on('networkChanged', () => {
      this.resetState();
    });
  }

  // This method resets the state
  resetState() {
    this.setState(this.initialState);
  }

  // This method checks if Metamask selected network is Localhost:8545, mainnet, or Kovan
  checkNetwork() {
    if (window.ethereum.networkVersion === HARDHAT_NETWORK_ID || window.ethereum.networkVersion === MAINNET_ID || window.ethereum.networkVersion === KOVAN_ID) {
      return true;
    }

    this.setState({
      networkError: NETWORK_ERR_MSG,
    });

    return false;
  }

  updateDepositState() {
    this.state.utils.getAllStablecoinDeposits().then(newDeposits =>
      this.setState({deposits: newDeposits}, () => {
      console.log("deposits updateDepositState",this.state.deposits)
    }));
  }

  updateOptInToggle() {
    this.state.utils.optInToggle().then(newOptInStatus =>
      this.setState({optInStatus: newOptInStatus}, () => {
      console.log("optInToggle updateOptInToggle",this.state.optInStatus)
    }));
  }

  render() {
    // Ethereum wallets inject the window.ethereum object. If it hasn't been
    // injected, we instruct the user to install MetaMask.
    if (window.ethereum === undefined) {
      return <NoWalletDetected />;
    }

    if (!this.state.selectedAddress) {
      return (
        <ConnectWallet
          connectWallet={() => this.connectWallet()}
          networkError={this.state.networkError}
          dismiss={() => this.dismissNetworkError()}
        />
      );
    }

    let optInStatusLabel = this.state.optInStatus ? 'Out of' : 'In to';

    return (
      <div
        style={{
            position: 'absolute', left: '50%', top: '50%',
            transform: 'translate(-50%, -50%)',
            display: 'inline-block'
        }}
      >
      <Grid
        container
        direction="row"
        justify="center"
        alignItems="center"
      >
        <GenericButton onClick={() => this.state.utils.createUser()} label="Register Account" />
        <GenericButton onClick={() => this.state.utils.deposit(DEPOSIT_AMOUNT)} label={`Deposit ${DEPOSIT_AMOUNT} TUSD`} />
        <GenericButton onClick={() => this.updateDepositState()} label="Refresh Deposits" />
        <GenericButton onClick={() => this.state.utils.swapStablecoinDeposit()} label="Swap TUSD -> Highest APY Stablecoin" />
        <GenericButton onClick={() => this.updateOptInToggle()} label={`Opt ${optInStatusLabel} automatic swapping`} />
      </Grid>
      <Grid
        container
        direction="row"
        justify="center"
        alignItems="center"
      >
        <DepositsGrid deposits={this.state.deposits} /> 
      </Grid>
      </div>
    );
  }
}

export default App;
