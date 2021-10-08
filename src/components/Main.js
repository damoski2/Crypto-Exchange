import React, { Component } from "react";
import BuyForm from './BuyForm'
import SellForm from './SellForm';



export default class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentForm: 'buy'
    };
  }

  render() {
    const { ethBalance, tokenBalance, buyTokens, sellTokens } = this.props;
    let content;
    content = this.state.currentForm === "buy"? <BuyForm ethBalance={ethBalance} tokenBalance={tokenBalance} buyTokens={buyTokens} /> : <SellForm ethBalance={ethBalance} tokenBalance={tokenBalance} sellTokens={sellTokens} />
    return (
      <div id="content" className="mt-3" >

       <div className="d-flex justify-content-between mb-3">
          <button className="btn btn-light" onClick={(e)=> { 
            this.setState({ currentForm: 'buy' })
           }} >
              Buy
          </button>
          <span className="text-muted" >&lt; &nbsp; &gt;</span>
          <button className="btn btn-light" onClick={(e)=> { 
            this.setState({ currentForm: 'sell' })
           }} >Sell</button>
       </div>

        <div className="card mb-4">
          <div className="card-body">
            {content}
          </div>
        </div>
      </div>
    );
  }
}
