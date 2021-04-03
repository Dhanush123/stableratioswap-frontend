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
      gridData.push({id: i, coin: key, depositAmount: rawData[key]})
    })
    console.log("gridData",gridData);
    return gridData;
  }

  async createUser() {
    try {
      let response = await this.stableRatioSwap.createUser(this.address);
      console.log("createUser response!", response);    
    } catch(e) {
      console.log("createUser exception", e);
    }
  }

  async deposit() {
    try {
      console.log("deposit address",this.address,DEPOSIT_AMOUNT);
      (await this.stableRatioSwap.deposit(this.address,DEPOSIT_AMOUNT)).wait().then((response) => {
        console.log("deposit response!",response);      
      });
    } catch(e) {
      console.log("deposit exception", e);
    }
  }

  async getAllStablecoinDeposits() {
    (await this.stableRatioSwap.getAllStablecoinDeposits()).wait().then((response) => {
      console.log("getAllStablecoinDeposits response!",response);      
    });
    let logs = await this.provider.getLogs({
      from: this.address,
      topic: this.stableRatioSwap.interface.events.Deposit  
    });
    console.log('getAllStablecoinDeposits logs',logs);
    //TODO: check if 0 or depositValues.length is latest log
    let depositValues = (logs === undefined || logs.length == 0) ? [0.0,0.0,0.0,0.0,0.0] : 
    ethers.utils.defaultAbiCoder.decode(
        [ 'uint', 'uint', 'uint', 'uint','uint' ],
        logs[0].data
    ).map(bigNum => bigNum.toNumber());
    let depositMap = {};
    depositMap['TUSD'] = depositValues[0];
    depositMap['USDC'] = depositValues[1];
    depositMap['USDT'] = depositValues[2];
    depositMap['DAI'] = depositValues[3];
    depositMap['BUSD'] = depositValues[4];
    console.log('depositMap',depositMap);
    return depositMap;
  }

  async swapStablecoinDeposit() {
    try {
      let response = await this.stableRatioSwap.swapStablecoinDeposit();
      console.log("swapStablecoinDeposit response!", response);    
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