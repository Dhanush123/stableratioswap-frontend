require('dotenv').config()
import { ethers } from 'ethers';
import { TxBuilderV2, Network, Market } from '@aave/protocol-js';
import Web3 from 'web3';
class Utils {

  constructor(stableRatioSwap, provider, address) {
    this.stableRatioSwap = stableRatioSwap;
    this.provider = provider;
    this.address = address;
    this.httpProvider = new Web3.providers.HttpProvider(`https://kovan.infura.io/v3/${process.env.REACT_APP_KOVAN_INFURA_KEY}`);
    console.log('httpProvider',this.httpProvider);
    this.txBuilder = new TxBuilderV2(Network.kovan, this.httpProvider);
    console.log('txBuilder',this.txBuilder);
    this.lendingPool = this.txBuilder.getLendingPool(Market.Proto); // get all lending pool methods
    console.log('lendingPool',this.lendingPool);
  }
  
  async createUser() {
    try {
      let tx = await this.stableRatioSwap.createUser();
      let txwait = await tx.wait();
      console.log('createUser response!', txwait);   

      let filterValues = await this.stableRatioSwap.queryFilter(this.stableRatioSwap.filters.CreateUser());
      let createUserStatus = (filterValues === undefined || filterValues.length == 0) ? false :
        ethers.utils.defaultAbiCoder.decode(['bool'], filterValues[filterValues.length - 1].data);
      console.log('createUserStatus from chain',createUserStatus);
      return createUserStatus;   
    } catch(e) {
      console.log('createUser exception', e);
      return 'Error';
    }
  }

  // async deposit() {
  //   try {
  //     let tx = await this.stableRatioSwap.deposit(DEPOSIT_AMOUNT,'TUSD',this.address);
  //     let txwait = await tx.wait();
  //     console.log('deposit response!',txwait);
  //     let filterValues = await this.stableRatioSwap.queryFilter(this.stableRatioSwap.filters.Deposit());
  //     let depositStatus = (filterValues === undefined || filterValues.length == 0) ? false :
  //       ethers.utils.defaultAbiCoder.decode(['bool'], filterValues[filterValues.length - 1].data);
  //     console.log('depositStatus from chain',depositStatus);
  //     return depositStatus;      
  //   } catch(e) {
  //     console.log('deposit exception', e);
  //     return 'Error';
  //   }
  // }

  async getAllStablecoinDeposits() {
    try {
      let tx = await this.stableRatioSwap.getAllStablecoinDeposits();
      let txwait = await tx.wait();
      console.log('getAllStablecoinDeposits response!',txwait); 
      console.log('getAllStablecoinDeposits events',txwait.events);  
      let filterValues = await this.stableRatioSwap.queryFilter(this.stableRatioSwap.filters.AllDeposits());
      console.log('filterValues',filterValues);
      let depositValues = ethers.utils.defaultAbiCoder.decode(
        ['uint', 'uint', 'uint', 'uint','uint','uint', 'uint', 'uint', 'uint','uint'],
        filterValues[filterValues.length - 1].data);
      console.log('depositValues',depositValues);
      let depositMap = {};

      depositMap['TUSD'] = depositValues[0].div(ethers.BigNumber.from('10').pow(depositValues[1])).toString();
      depositMap['USDC'] = depositValues[2].div(ethers.BigNumber.from('10').pow(depositValues[3])).toString();
      depositMap['USDT'] = depositValues[4].div(ethers.BigNumber.from('10').pow(depositValues[5])).toString();
      depositMap['DAI'] = depositValues[6].div(ethers.BigNumber.from('10').pow(depositValues[7])).toString();
      depositMap['BUSD'] = depositValues[8].div(ethers.BigNumber.from('10').pow(depositValues[9])).toString();

      console.log('depositMap',depositMap);
      return depositMap;   
    } catch(e) {
      console.log('getAllStablecoinDeposits exception', e);
      return {};
    }
  }

  async swapCollateralForUser(shouldForce,ratio,swapToTokenAddress,amountToSwap) {
    console.log('swapCollateralForUser params',shouldForce,ratio,swapToTokenAddress,amountToSwap);
    if (ratio > 1 || shouldForce) {
      let userAddress =  this.address;
      let swapAllValue = true;
      let flashValue = true;
      let fromAssetValue = '0x016750AC630F711882812f24Dba6c95b9D35856d'; //TUSD Kovan
      let fromATokenValue = '0x39914AdBe5fDbC2b9ADeedE8Bcd444b20B039204'; //TUSD atoken address
      let toAssetValue = swapToTokenAddress;
      let fromAmountValue = amountToSwap;
      let toAmountValue = amountToSwap;
      let maxSlippageValue = 5;
      let permitSignatureValue = undefined;
      let onBehalfOfValue = userAddress;
      let referralCodeValue = undefined;
      let useEthPathValue = undefined;

      let objectPassIn = {
        user:userAddress, // string;
        flash:flashValue, // ? boolean;
        fromAsset:fromAssetValue, // string;
        fromAToken:fromATokenValue, // string;
        toAsset:toAssetValue, // string;
        fromAmount:fromAmountValue, // string;
        toAmount:toAmountValue, // string;
        maxSlippage:maxSlippageValue, // string;
        permitSignature:permitSignatureValue, // ? PermitSignature;
        swapAll:swapAllValue, // boolean;
        onBehalfOf:onBehalfOfValue, // ? string;
        referralCode:referralCodeValue, // ? string;
        useEthPath:useEthPathValue, // ? boolean;
      };
      console.log('swapCollateral objectPassIn',objectPassIn);
      try {
        let swapCollateralResponse = await this.lendingPool.swapCollateral(objectPassIn);
        console.log('swapCollateralResponse success scenario',swapCollateralResponse);
        return true;
      } catch (e) {
        console.log('swapCollateralResponse EXCEPTION',e);
        return false;
      }
    } else {
      return false;
    }
  }

  async swapStablecoinDeposit(shouldForce) {
    try {
      let decoder = ['bool', 'uint', 'uint', 'uint', 'address', 'string'];
      console.log('swapStablecoinDeposit shouldForce:',shouldForce);
      let tx = await this.stableRatioSwap.swapStablecoinDeposit(shouldForce);
      let txwait = await tx.wait();
      console.log('swapStablecoinDeposit response!',txwait); 
      console.log('swapStablecoinDeposit response! events',txwait.events); 
      let filterValues = await this.stableRatioSwap.queryFilter(this.stableRatioSwap.filters.SwapStablecoinDeposit());
      console.log('filterValues',filterValues);
      console.log('print ALL events decoded');
      for (var i=0; i < filterValues.length; i++) {
        console.log(`event ${i}`,ethers.utils.defaultAbiCoder.decode(decoder, filterValues[i].data));
      }
      let latest = filterValues[filterValues.length - 1].data;
      console.log('latest event raw',latest);
      let swapStablecoinDepositEvent = ethers.utils.defaultAbiCoder.decode(decoder, latest);
      let swapToTokenAddress = swapStablecoinDepositEvent[4];
      let userTUSDDepositAmount = swapStablecoinDepositEvent[2];
      let userTUSDDepositDecimals = swapStablecoinDepositEvent[3];
      console.log('latest swapStablecoinDepositEvent',swapStablecoinDepositEvent);
      let ratio = swapStablecoinDepositEvent[1]/10**4;
      let swappable = swapStablecoinDepositEvent[0];
      let amountToSwap = Math.round(userTUSDDepositAmount.div(ethers.BigNumber.from('10').pow(userTUSDDepositDecimals)).toNumber());
      console.log('swapCollateralForUser params',shouldForce,swappable,ratio,swapToTokenAddress,userTUSDDepositAmount,userTUSDDepositDecimals);
      let swapResponse = await this.swapCollateralForUser(shouldForce,ratio,swapToTokenAddress,amountToSwap);
      console.log('swapCollateralForUser response',swapResponse);
      return {'status': swapResponse, 'ratio': ratio, 'swapToTokenName': swapStablecoinDepositEvent[5], 'amountToSwap':amountToSwap};     
    } catch(e) {
        console.log('swapStablecoinDeposit exception', e);
        return {'status': 'Error', 'ratio': 'Error',};  
    }
  }

  async optInToggle() {
    try {
      let tx = await this.stableRatioSwap.optInToggle();
      let txwait = await tx.wait();
      console.log('optInToggle response!',txwait);      
      
      let filterValues = await this.stableRatioSwap.queryFilter(this.stableRatioSwap.filters.OptInToggle());
      console.log('filterValues',filterValues);
      console.log('filterValues.events',filterValues.events);
      let toggleValue = ethers.utils.defaultAbiCoder.decode(
        ['bool'],
        filterValues[filterValues.length - 1].data);
      console.log('toggleValue',toggleValue);
      return toggleValue;
    } catch(e) {
      console.log('optInToggle exception', e);
      return 'Error';
    }
  }
}

export default Utils;