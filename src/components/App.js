import React, { Component } from "react";
import "./App.css";
import Web3 from "web3";
import NavBar from "./Navbar";
import Main from "./Main";
import EthSwap from "../abis/EthSwap.json";
import Token from "../abis/Token.json";

class App extends Component {
  async componentWillMount() {
    await this.loadWeb3();
    await this.loadBlockChainData();
    //console.log(window.web3)
  }

  async loadBlockChainData() {
    const web3 = window.web3;

    const accounts = await web3.eth.getAccounts();
    this.setState({ account: accounts[0] });
    const ethBalance = await web3.eth.getBalance(this.state.account);
    this.setState({ ethBalance });
    //console.log(this.state.ethBalance)

    //Load Token
    const networkId = await web3.eth.net.getId();
    const tokenData = Token.networks[networkId];
    if (tokenData) {
      const token = new web3.eth.Contract(Token.abi, tokenData.address);
      this.setState({ token });
      //console.log(token)
      let tokenBalance = await token.methods
        .balanceOf(this.state.account)
        .call();
      console.log(
        "tokenbalance",
        tokenBalance === null ? 0 : tokenBalance.toString()
      );
      this.setState({
        tokenBalance: tokenBalance === null ? 0 : tokenBalance.toString(),
      });
    } else {
      window.alert("Token contract not deployed to detected network");
    }

    //Load EthSwap
    const ethSwapData = EthSwap.networks[networkId];
    if (tokenData) {
      const ethSwap = new web3.eth.Contract(EthSwap.abi, ethSwapData.address);
      this.setState({ ethSwap });
      //console.log(token)
    } else {
      window.alert("EthSwap contract not deployed to detected network");
    }
    this.setState({ loading: false });
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    } else {
      window.alert(
        "Non-Ethereum browser detected. You Should consider trying metamask"
      );
    }
  }

  buyTokens = (etherAmount) => {
    this.setState({ loading: true });
    this.state.ethSwap.methods
      .buytokens()
      .send({ value: etherAmount, from: this.state.account })
      .on("transactionHash", (hash) => {
        this.setState({ loading: false });
      });
  };


  sellTokens = (tokenAmount)=>{
    this.setState({ loading: true });
    this.state.token.methods.approve(this.state.ethSwap.address , tokenAmount).send({ from: this.state.account }).on("transactionHash", (hash) => {
      this.state.ethSwap.methods.selltokens(tokenAmount).send({ from: this.state.account }).on("transactionHash", (hash) => {
        this.setState({ loading: false })
      })
    })
  }

  constructor(props) {
    super(props);
    this.state = {
      account: "",
      token: {},
      ethSwap: {},
      ethBalance: "0",
      tokenBalance: "0",
      loading: true,
    };
  }

  render() {
    let content;
    if (this.state.loading) {
      content = (
        <p id="loader" className="text-center">
          Loading...
        </p>
      );
    } else {
      content = (
        <Main
          ethBalance={this.state.ethBalance}
          tokenBalance={this.state.tokenBalance}
          buyTokens={this.buyTokens}
          sellTokens={this.sellTokens}
        />
      );
    }

    return (
      <div>
        <NavBar account={this.state.account} />
        <div className="container-fluid mt-5">
          <div className="row">
            <main
              role="main"
              className="col-lg-12 ml-auto mr-auto text-center"
              style={{ maxWidth: "600px" }}
            >
              <div className="content mr-auto ml-auto">
                <a
                  href="http://www.dappuniversity.com/bootcamp"
                  target="_blank"
                  rel="noopener noreferrer"
                ></a>
                {content}
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
