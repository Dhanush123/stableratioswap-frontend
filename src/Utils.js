import { ethers } from 'ethers';

const DEPOSIT_AMOUNT = ethers.utils.parseEther('0.1');

class Utils {

  constructor(stableRatioSwap, provider) {
    this.stableRatioSwap = stableRatioSwap;
    this.provider = provider;
  }

  convertRawToGridData(rawData) {
    let gridData = []
    Object.keys(rawData).map((key, i) => {
      gridData.push({id: i, coin: key, depositAmount: rawData[key]})
    })
    console.log("gridData",gridData);
    return gridData;
  }

  async createUser(selectedAddress) {
    try {
      let response = await this.stableRatioSwap.createUser(selectedAddress);
      console.log("createUser response!", response);    
    } catch(e) {
        console.log(e);
    }
  }

  async deposit() {
    try {
      (await this.stableRatioSwap.deposit(this.state.selectedAddress,DEPOSIT_AMOUNT)).wait().then((response) => {
        console.log("deposit response!",response);      
      });
    } catch(e) {
        console.log(e);
    }
  }

  async getAllStablecoinDeposits(selectedAddress) {
    let logs = await this.provider.getLogs({
      from: selectedAddress,
      topic: this.stableRatioSwap.interface.events.Deposit  
    });
    console.log('getAllStablecoinDeposits logs',logs);
    //TODO: check if 0 or depositValues.length is latest log
    let depositValues = (logs === undefined || logs.length == 0) ? [0.1,0.1,0.1,0.1,0.1] : 
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
  }
}

export default Utils;