const { assert } = require("chai");

const Token = artifacts.require("Token");
const EthSwap = artifacts.require("EthSwap");

require("chai")
  .use(require("chai-as-promised"))
  .should();

  const tokens = (n)=>{
    return web3.utils.toWei(n, 'ether');
  }

contract("EthSwap", ([deployer, investor]) => {
    let token, ethSwap;
    before(async()=>{
        token = await Token.new()
        ethSwap = await EthSwap.new(token.address)
        //Transfer all tokens to EthSwap (1 million) "1000000" => "1000000000000000000000000"
        await token.transfer(ethSwap.address, tokens('1000000'));
    })

  describe("Token deployement", async () => {
    it("contract has a name", async () => {
      let token = await Token.new();
      const name = await token.name();
      assert.equal(name, "DApp Token");
    });
  });

  describe("EthSwap deployement", async () => {
    it("contract has a name", async () => {
      const name = await ethSwap.name();
      assert.equal(name, "EthSwap Instant Exchange");
    });

    it("contract has tokens", async () => {
     try{
        let balance = await token.balanceOf(ethSwap.address);
        assert.equal(balance.toString(), tokens('1000000'));
     }catch(e){
         console.log(e)
     }
    });
  });

  describe("Buy Tokens", async()=>{
    let result
    before(async()=>{
        //Purchase token before each example
        result = await ethSwap.buytokens({ from: investor, value: web3.utils.toWei('1', 'ether') })
    })

      it('Allows user to instantly purchase tokens from ethSwap for a fixed price', async()=>{
          //Check investor recieve token after tokens
          let investorBalance = await token.balanceOf(investor)
          assert.equal(investorBalance.toString(),tokens('100'))

          let ethSwapBalance = await token.balanceOf(ethSwap.address)
          assert.equal(ethSwapBalance.toString(),tokens('999900'))
          ethSwapBalance = await web3.eth.getBalance(ethSwap.address)
          assert.equal(ethSwapBalance.toString(),web3.utils.toWei('1','ether'))

          //console.log(result.logs[0].args)
          const event = result.logs[0].args
          assert.equal(event.account, investor)
          assert.equal(event.token, token.address)
          assert.equal(event.amount.toString(), tokens('100').toString())
          assert.equal(event.rate.toString(),'100')
      })
  })


  describe("Sell Tokens", async()=>{
    let result
    before(async()=>{
        //Investor must approve token before purchase
        await token.approve(ethSwap.address, tokens('100'), { from: investor })
        result = await ethSwap.selltokens(tokens('100'), {from: investor})
    })

      it('Allows user to instantly sell tokens to ethSwap for a fixed price', async()=>{
         //Check investor recieve token after tokens
         let investorBalance = await token.balanceOf(investor)
         assert.equal(investorBalance.toString(),tokens('0'))


         let ethSwapBalance = await token.balanceOf(ethSwap.address)
         assert.equal(ethSwapBalance.toString(),tokens('1000000'))
         ethSwapBalance = await web3.eth.getBalance(ethSwap.address)
         assert.equal(ethSwapBalance.toString(),web3.utils.toWei('0','ether'))


         //Check Logs to ensure the event was emitted with the correct data
         const event = result.logs[0].args
         assert.equal(event.account, investor)
         assert.equal(event.token, token.address)
         assert.equal(event.amount.toString(), tokens('100').toString())
         assert.equal(event.rate.toString(),'100') 

         //FAILURE: Investor cant sell more token than they have
         await ethSwap.selltokens(tokens('500'),{ from: investor }).should.be.rejected;
      })
  })

});






















