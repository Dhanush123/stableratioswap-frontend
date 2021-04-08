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
      let waiting = await this.stableRatioSwap.createUser();
      waiting.wait().then(async (response) => {
        console.log("createUser response!",response);   
        let logs = await this.provider.getLogs({
          fromBlock: 'latest',
          from: this.address,
          topic: this.stableRatioSwap.interface.events.CreateUser  
        });
        console.log('optInToggle logs',logs);
        //TODO: check if 0 or depositValues.length is latest log
        if(!((logs === undefined || logs.length == 0))) {
          console.log("logs[0].data",logs[0].data)
        }
        let createUserStatus = (logs === undefined || logs.length == 0) ? false : 
        ethers.utils.defaultAbiCoder.decode(
            ['bool'],
            ethers.utils.hexDataSlice(logs[0].data, 4)
        );
        return createUserStatus;   
      });
    } catch(e) {
        console.log("createUser exception", e);
    }
  }

  async deposit() {
    try {
      let waiting = await this.stableRatioSwap.deposit(DEPOSIT_AMOUNT,"TUSD",this.address);
      waiting.wait().then(async (response) => {
        console.log("deposit response!",response);
        let logs = await this.provider.getLogs({
          fromBlock: 'latest',
          from: this.address,
          topic: this.stableRatioSwap.interface.events.Deposit  
        });
        console.log('deposit logs',logs);
        //TODO: check if 0 or depositValues.length is latest log
        if(!((logs === undefined || logs.length == 0))) {
          console.log("logs[0].data",logs[0].data)
        }
        let depositStatus = (logs === undefined || logs.length == 0) ? false : 
        ethers.utils.defaultAbiCoder.decode(
            ['bool'],
            logs[0].data
        );
        return depositStatus;      
      });
    } catch(e) {
        console.log("deposit exception", e);
    }
  }

  async getAllStablecoinDeposits() {
    let tx = await this.stableRatioSwap.getAllStablecoinDeposits();
    let txwait = await tx.wait();
      console.log("getAllStablecoinDeposits response!",txwait); 
      console.log("getAllStablecoinDeposits events",txwait.events);  
      let filterValues = await this.stableRatioSwap.queryFilter(this.stableRatioSwap.filters.AllDeposits());
      //  await this.stableRatioSwap.queryFilter({
      //   address: this.address,
      //   topics: [this.stableRatioSwap.interface.events.AllDeposits.topic]
      // })[depositValues.length - 1];
        //this.address,this.stableRatioSwap.filters.AllDeposits(null),'latest');
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
  }

  async swapStablecoinDeposit(shouldForce) {
    try {
      console.log("swapStablecoinDeposit shouldForce:",shouldForce);
      let waiting = await this.stableRatioSwap.swapStablecoinDeposit(shouldForce);
      waiting.wait().then(async (response) => {
        console.log("swapStablecoinDeposit response!",response); 
        let logs = await this.provider.getLogs({
          fromBlock: 'latest',
          from: this.address,
          topic: this.stableRatioSwap.interface.events.SwapStablecoinDeposit  
        });
        console.log('swapStablecoinDeposit logs',logs);
        //TODO: check if 0 or depositValues.length is latest log
        if(!((logs === undefined || logs.length == 0))) {
          console.log("logs[0].data",logs[0].data)
        }
        let swapStablecoinDepositStatusAndRatio = (logs === undefined || logs.length == 0) ? false : 
        ethers.utils.defaultAbiCoder.decode(
            ['bool, uint'],
            logs[0].data
        );
        console.log('swapStablecoinDeposit swapStablecoinDepositStatusAndRatio', swapStablecoinDepositStatusAndRatio);
        return swapStablecoinDepositStatusAndRatio;     
      });
    } catch(e) {
        console.log("swapStablecoinDeposit exception", e);
    }
  }

  async optInToggle() {
    try {
      let waiting = await this.stableRatioSwap.optInToggle();
      waiting.wait().then(async (response) => {
        console.log("optInToggle response!",response);      
        let logs = await this.provider.getLogs({
          fromBlock: 'latest',
          from: this.address,
          topic: this.stableRatioSwap.interface.events.OptInStatus  
        });
        console.log('optInToggle logs',logs);
        //TODO: check if 0 or depositValues.length is latest log
        if(!((logs === undefined || logs.length == 0))) {
          console.log("logs[0].data",logs[0].data)
        }
        let toggleValue = (logs === undefined || logs.length == 0) ? false : 
        ethers.utils.defaultAbiCoder.decode(
            ['bool'],
            logs[0].data
        );
        return toggleValue;
      });
    } catch(e) {
        console.log("optInToggle exception", e);
    }
  }
}

export default Utils;