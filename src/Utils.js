import { ethers } from 'ethers';

const DEPOSIT_AMOUNT = 100;//ethers.utils.parseEther('0.1');

class Utils {

  constructor(stableRatioSwap, provider, address) {
    this.stableRatioSwap = stableRatioSwap;
    this.provider = provider;
    this.address = address;
  }

  convertRawToGridData(rawData) {
    let gridData = []
    Object.keys(rawData).map((key, i) => {
      gridData.push({id: i, coin: key, depositAmount: rawData[key]['value']/(10**rawData[key]['decimals'])})
    })
    console.log("gridData",gridData);
    return gridData;
  }

  async createUser() {
    try {
      (await this.stableRatioSwap.createUser()).wait().then((response) => {
        console.log("createUser response!",response);      
      });
      let logs = await this.provider.getLogs({
        fromBlock: 'latest',
        from: this.address,
        topic: this.stableRatioSwap.interface.events.CreateUser  
      });
      console.log('optInToggle logs',logs);
      //TODO: check if 0 or depositValues.length is latest log
      let createUserStatus = (logs === undefined || logs.length == 0) ? false : 
      ethers.utils.defaultAbiCoder.decode(
          ['bool'],
          logs[0].data
      );
      return createUserStatus;
    } catch(e) {
        console.log("createUser exception", e);
    }
  }

  async deposit() {
    try {
      (await this.stableRatioSwap.deposit(DEPOSIT_AMOUNT,"TUSD",this.address)).wait().then((response) => {
        console.log("deposit response!",response);      
      });
      let logs = await this.provider.getLogs({
        fromBlock: 'latest',
        from: this.address,
        topic: this.stableRatioSwap.interface.events.Deposit  
      });
      console.log('deposit logs',logs);
      //TODO: check if 0 or depositValues.length is latest log
      let depositStatus = (logs === undefined || logs.length == 0) ? false : 
      ethers.utils.defaultAbiCoder.decode(
          ['bool'],
          logs[0].data
      );
      return depositStatus;
    } catch(e) {
        console.log("deposit exception", e);
    }
  }

  async getAllStablecoinDeposits() {
    (await this.stableRatioSwap.getAllStablecoinDeposits()).wait().then((response) => {
      console.log("getAllStablecoinDeposits response!",response);      
    });
    let logs = await this.provider.getLogs({
      fromBlock: 'latest',
      from: this.address,
      topic: this.stableRatioSwap.interface.events.AllDeposits  
    });
    console.log('getAllStablecoinDeposits logs',logs);
    //TODO: check if 0 or depositValues.length is latest log
    let depositValues = (logs === undefined || logs.length == 0) ? [0,0,0,0,0,0,0,0,0,0] : 
    ethers.utils.defaultAbiCoder.decode(
        ['uint', 'uint', 'uint', 'uint','uint','uint', 'uint', 'uint', 'uint','uint'],
        logs[0].data
    ).map(bigNum => bigNum.toNumber());
    let depositMap = {};

    depositMap['TUSD'] = {'value':depositValues[0],'decimals':depositValues[1]};
    depositMap['USDC'] = {'value':depositValues[2],'decimals':depositValues[3]};
    depositMap['USDT'] = {'value':depositValues[4],'decimals':depositValues[5]};
    depositMap['DAI'] = {'value':depositValues[6],'decimals':depositValues[7]};
    depositMap['BUSD'] = {'value':depositValues[8],'decimals':depositValues[9]};

    console.log('depositMap',depositMap);
    return depositMap;
  }

  async swapStablecoinDeposit() {
    try {
      (await this.stableRatioSwap.swapStablecoinDeposit()).wait().then((response) => {
        console.log("swapStablecoinDeposit response!",response);      
      });
      let logs = await this.provider.getLogs({
        fromBlock: 'latest',
        from: this.address,
        topic: this.stableRatioSwap.interface.events.SwapStablecoinDeposit  
      });
      console.log('swapStablecoinDeposit logs',logs);
      //TODO: check if 0 or depositValues.length is latest log
      let swapStablecoinDepositStatus = (logs === undefined || logs.length == 0) ? false : 
      ethers.utils.defaultAbiCoder.decode(
          ['bool'],
          logs[0].data
      );
      return swapStablecoinDepositStatus;
    } catch(e) {
        console.log("swapStablecoinDeposit exception", e);
    }
  }

  async optInToggle() {
    try {
      (await this.stableRatioSwap.optInToggle()).wait().then((response) => {
        console.log("optInToggle response!",response);      
      });
      let logs = await this.provider.getLogs({
        fromBlock: 'latest',
        from: this.address,
        topic: this.stableRatioSwap.interface.events.OptInStatus  
      });
      console.log('optInToggle logs',logs);
      //TODO: check if 0 or depositValues.length is latest log
      let toggleValue = (logs === undefined || logs.length == 0) ? false : 
      ethers.utils.defaultAbiCoder.decode(
          ['bool'],
          logs[0].data
      );
      return toggleValue;
    } catch(e) {
        console.log("optInToggle exception", e);
    }
  }
}

export default Utils;