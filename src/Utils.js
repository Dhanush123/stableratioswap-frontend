import { ethers } from 'ethers';
// import StableRatioSwapArtifact from "./contracts/StableRatioSwap.json";

// const DEPOSIT_AMOUNT = 100;//ethers.utils.parseEther('0.1');

class Utils {

  constructor(stableRatioSwap, provider, address) {
    this.stableRatioSwap = stableRatioSwap;
    this.provider = provider;
    this.address = address;
    // this.interface = new ethers.utils.Interface(StableRatioSwapArtifact);
  }

  convertRawToGridData(rawData) {
    let gridData = []
    Object.keys(rawData).map((key, i) => {
      gridData.push({id: i, coin: key, depositAmount: rawData[key]})
    })
    console.log("gridData",gridData);
    return gridData;
  }

  async createUser() {
    try {
      let tx = await this.stableRatioSwap.createUser();
      let txwait = await tx.wait();
      console.log("createUser response!", txwait);   

      let filterValues = await this.stableRatioSwap.queryFilter(this.stableRatioSwap.filters.CreateUser());
      let createUserStatus = (filterValues === undefined || filterValues.length == 0) ? false :
        ethers.utils.defaultAbiCoder.decode(['bool'], filterValues[filterValues.length - 1].data);
      console.log("createUserStatus from chain",createUserStatus);
      return createUserStatus;   
    } catch(e) {
      console.log("createUser exception", e);
      return "Error";
    }
  }

  // async deposit() {
  //   try {
  //     let tx = await this.stableRatioSwap.deposit(DEPOSIT_AMOUNT,"TUSD",this.address);
  //     let txwait = await tx.wait();
  //     console.log("deposit response!",txwait);
  //     let filterValues = await this.stableRatioSwap.queryFilter(this.stableRatioSwap.filters.Deposit());
  //     let depositStatus = (filterValues === undefined || filterValues.length == 0) ? false :
  //       ethers.utils.defaultAbiCoder.decode(['bool'], filterValues[filterValues.length - 1].data);
  //     console.log("depositStatus from chain",depositStatus);
  //     return depositStatus;      
  //   } catch(e) {
  //     console.log("deposit exception", e);
  //     return "Error";
  //   }
  // }

  async getAllStablecoinDeposits() {
    try {
      let tx = await this.stableRatioSwap.getAllStablecoinDeposits();
      let txwait = await tx.wait();
      console.log("getAllStablecoinDeposits response!",txwait); 
      console.log("getAllStablecoinDeposits events",txwait.events);  
      let filterValues = await this.stableRatioSwap.queryFilter(this.stableRatioSwap.filters.AllDeposits());
      console.log("filterValues",filterValues);
      let depositValues = ethers.utils.defaultAbiCoder.decode(
        ['uint', 'uint', 'uint', 'uint','uint','uint', 'uint', 'uint', 'uint','uint'],
        filterValues[filterValues.length - 1].data);
      console.log("depositValues",depositValues);
      let depositMap = {};

      depositMap['TUSD'] = depositValues[0].div(ethers.BigNumber.from("10").pow(depositValues[1])).toString();
      depositMap['USDC'] = depositValues[2].div(ethers.BigNumber.from("10").pow(depositValues[3])).toString();
      depositMap['USDT'] = depositValues[4].div(ethers.BigNumber.from("10").pow(depositValues[5])).toString();
      depositMap['DAI'] = depositValues[6].div(ethers.BigNumber.from("10").pow(depositValues[7])).toString();
      depositMap['BUSD'] = depositValues[8].div(ethers.BigNumber.from("10").pow(depositValues[9])).toString();

      console.log('depositMap',depositMap);
      return depositMap;   
    } catch(e) {
      console.log("getAllStablecoinDeposits exception", e);
      return {};
    }
  }

  async swapStablecoinDeposit(shouldForce) {
    try {
      console.log("swapStablecoinDeposit shouldForce:",shouldForce);
      let tx = await this.stableRatioSwap.swapStablecoinDeposit(shouldForce);
      let txwait = await tx.wait();
      console.log("swapStablecoinDeposit response!",txwait); 
      console.log("swapStablecoinDeposit response! events",txwait.events); 
      let filterValues = await this.stableRatioSwap.queryFilter(this.stableRatioSwap.filters.SwapStablecoinDeposit());
      console.log("filterValues",filterValues);
      let latest = filterValues[filterValues.length - 1].data;
      console.log("latest",latest);
      let swapStablecoinDepositStatusAndRatio = ethers.utils.defaultAbiCoder.decode(['bool', 'uint'], latest);
      console.log("swapStablecoinDepositStatusAndRatio",swapStablecoinDepositStatusAndRatio);
      return {"status":swapStablecoinDepositStatusAndRatio[0],
              "ratio":swapStablecoinDepositStatusAndRatio[1]/10**4};     
    } catch(e) {
        console.log("swapStablecoinDeposit exception", e);
        return {"status": "Error", "ratio": "Error"};  
    }
  }

  async optInToggle() {
    try {
      let tx = await this.stableRatioSwap.optInToggle();
      let txwait = await tx.wait();
      console.log("optInToggle response!",txwait);      
      
      let filterValues = await this.stableRatioSwap.queryFilter(this.stableRatioSwap.filters.OptInToggle());
      console.log("filterValues",filterValues);
      console.log("filterValues.events",filterValues.events);
      let toggleValue = ethers.utils.defaultAbiCoder.decode(
        ['bool'],
        filterValues[filterValues.length - 1].data);
      console.log("toggleValue",toggleValue);
      return toggleValue;
    } catch(e) {
      console.log("optInToggle exception", e);
      return "Error";
    }
  }
}

export default Utils;