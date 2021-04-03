import React from 'react';

// We'll use ethers to interact with the Ethereum network and our contract
import { ethers } from 'ethers';

// We import the contract's artifacts and address here, as we are going to be
// using them with ethers
import TokenArtifact from "../contracts/StableRatioSwap.json";
import contractAddress from "../contracts/contract-address.json";

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
        'TUSD': 0.0,
        'USDC': 0.0,
        'USDT': 0.0,
        'DAI': 0.0,
        'BUSD': 0.0
      }
    };

    this.state = this.initialState;
    this.updateDepositState = this.updateDepositState.bind(this);
  }

  async intializeEthers() {
    // We first initialize ethers by creating a provider using window.ethereum
    this.provider = new ethers.providers.Web3Provider(window.ethereum);

    // When, we initialize the contract using that provider and the token's
    // artifact. You can do this same thing with your contracts.
    this.stableRatioSwap = new ethers.Contract(
      contractAddress.StableRatioSwap,
      TokenArtifact.abi,
      this.provider.getSigner(0)
    );

    this.setState({utils: new Utils(this.stableRatioSwap, this.provider)});
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

  // This method checks if Metamask selected network is Localhost:8545
  checkNetwork() {
    if (window.ethereum.networkVersion === HARDHAT_NETWORK_ID) {
      return true;
    }

    this.setState({
      networkError: 'Please connect Metamask to Localhost:8545',
    });

    return false;
  }

  updateDepositState() {
    this.state.utils.getAllStablecoinDeposits().then(result =>
      this.setState({deposits: result}, () => {
      console.log("deposits updateDepositState",this.state.deposits)
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
        <GenericButton onClick={() => this.state.utils.createUser(this.state.selectedAddress)} label="Register Account" />
        <GenericButton onClick={() => this.state.utils.deposit(this.state.selectedAddress)} label="Get 100 TUSD Loan" />
        <GenericButton onClick={() => this.updateDepositState()} label="Refresh Deposits" />
        <GenericButton onClick={() => this.state.utils.swapStablecoinDeposit()} label="Swap TUSD -> Highest APY Stablecoin" />
      </Grid>
      <Grid
        container
        direction="row"
        justify="center"
        alignItems="center"
      >
        <DepositsGrid key={Object.values(this.state.deposits).reduce((a, b) => a + b)} deposits={this.state.deposits} /> 
      </Grid>
      </div>
    );
  }
}

export default App;
