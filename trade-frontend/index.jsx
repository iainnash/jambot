// index.js
import "regenerator-runtime/runtime";

import React, { useCallback, useState, useEffect } from "react";
import ReactDOM from "react-dom";
import * as swap from "./uniswapv2/swap";
import jam from "./assets/jam.jpg";

if (module.hot) {
  module.hot.accept();
}

const VoteActionList = ({}) => {
  const [voteActionState, setVoteActionState] = useState();
  useEffect(() => {
    fetch("https://9pc9lrygrl.execute-api.us-east-2.amazonaws.com/dev/votes")
      .then((r) => r.json())
      .then((data) => {
        setVoteActionState(data.tokenHoldings.Items[0]);
      });
  }, []);

  if (!voteActionState) {
    return <h2>Loading...</h2>;
  }

  return voteActionState.votes.options
    .filter((vote) => vote.voter_count > 1)
    .map((item) => (
      <PurchaseLineList contractAddress={item.contractAddress}>
        {item.text}
      </PurchaseLineList>
    ));
};

function getReturnPercentage(data) {
  return data[1].now / data[1].boughtAt;
}

const PositionsList = ({}) => {
  const [positions, setPositions] = useState();
  useEffect(() => {
    fetch("https://9pc9lrygrl.execute-api.us-east-2.amazonaws.com/dev/balances")
      .then((r) => r.json())
      .then((data) => {
        setPositions(
          Object.entries(data.coinDeltas).sort(
            (b, a) => getReturnPercentage(a) > getReturnPercentage(b)
          )
        );
      });
  }, []);

  if (!positions) {
    return <h2>Loading...</h2>;
  }

  const positionList = positions
    .filter(() => true)
    .map((item) => <PositionItem {...item} />);

  return (
    <div>
      <h2 className="mg-small">Positions</h2>
      {positionList}
    </div>
  );
};

const ExecuteButton = ({ children, contractAddress }) => {
  const [isActive, setIsActive] = useState(false);
  const update = useCallback(async () => {
      setIsActive(true);
      const provider = await swap.getProvider();
      const signer = provider.getSigner()
      // todo use contractAddress when on mainnet
      await swap.getTokenFromETH(signer, '0xad6d458402f60fd3bd25163575031acdce07538d');
  });
  return (
    <button disabled={isActive} onClick={update} class="button is-danger">
      {isActive ? "working..." : children}
    </button>
  );
};

const PurchaseLineList = ({ children, contractAddress }) => (
  <div className="box mg-medium">
    <div className="level">
      <div className="level-left">
        <b>Action:&nbsp;</b> {children}
      </div>
      <div className="level-right">
        <ExecuteButton contractAddress={contractAddress}>Execute</ExecuteButton>
      </div>
    </div>
  </div>
);

const RenderPercentage = ({ percentage }) => {
  if (percentage === 0) {
    return <span />;
  }
  if (percentage == Infinity) {
    return <span />;
  }
  if (percentage.toString() === "NaN") {
    return <span />;
  }
  if (percentage == 10000) {
    return <span />;
  }
  return <span>{percentage}% return</span>;
};

const PositionItem = (data) => (
  <div className="box mg-medium">
    <div className="level">
      <div className="level-left">
        <b>{data[0]}&nbsp;</b> {data[1].value.slice(0, 12)}
      </div>
      <div className="level-right">
        <RenderPercentage percentage={getReturnPercentage(data)} />
      </div>
    </div>
  </div>
);

const Logo = () => (
  <div>
    <img src={jam} alt="jam finance" />
  </div>
);

window.swap = swap;

ReactDOM.render(
  <div className="container">
    <Logo />
    <VoteActionList />
    <PositionsList />
  </div>,
  document.getElementById("root")
);
