import './App.css';
import { useQuery } from 'react-query';
import { Activity, DebankHistoryItem, DebankReceiveToken, DebankSendToken, DebankTokenApprove } from './model.ts';
import { useState } from 'react';
import moment from 'moment/moment';
import BigNumber from 'bignumber.js';
import { capitalize } from 'lodash';
import { ArrowDownCircleIcon, ArrowUpCircleIcon, FunnelIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import { noCase } from 'change-case';

function App() {
  const size = 200;

  const [page] = useState(0);

  const { isLoading, error, data } = useQuery<Activity[]>('repoData', () =>
    fetch(`${import.meta.env.VITE_BACKEND}/activity?offset=${page * size}&limit=${size}`).then(res =>
      res.json(),
    ),
  );

  return (
    <div className="bg-gray-100">
      {isLoading ? (<div>Loading...</div>) : null}
      {error ? (<div>An error has occurred</div>) : null}
      {
        data ? (
          <div className="flex flex-col gap-y-4 px-4 max-w-xl">
            {data.map(activity => (
              <ActivityView key={activity.id} activity={activity} />
            ))}
          </div>
        ) : null
      }
    </div>
  );
}

interface ItemGroup {
  [key: string]: DebankHistoryItem[];
}

const ActivityView = (props: { activity: Activity }) => {
  const { activity } = props;

  const duration = moment.duration(moment(activity.end).diff(moment(activity.start)));

  const gas = activity.debankHistoryItems.reduce((acc, item) => {
    return acc + (item.ethGasFee ?? 0);
  }, 0);

  const usdGas = activity.debankHistoryItems.reduce((acc, item) => {
    return acc + (item.usdGasFee ?? 0);
  }, 0);

  // Group items by project
  const groupedItems = activity.debankHistoryItems.reduce((acc, item) => {
    const project = item.debankProject?.id ?? 'others';

    if (!acc[project]) {
      acc[project] = [];
    }
    acc[project].push(item);
    return acc;
  }, {} as ItemGroup);

  return (
    <div className="bg-white border p-2 rounded-xl flex flex-col gap-y-2">
      {/* Header */}
      <div className="flex gap-x-2 pb-1 border-b text-gray-500 text-xs">
        {/* Start time */}
        <p>{moment(activity.start).format('LLL')}</p>

        {/* Duration */}

        {duration.as('minutes') > 1 &&
          <p>({duration.humanize()})</p>
        }
      </div>

      <div className="flex flex-col gap-y-4">
        {/*{*/}
        {/*  activity.debankHistoryItems.map(item => {*/}
        {/*    if (item.debankProject) {*/}
        {/*      return (*/}
        {/*        <ProjectActivityItemView item={item} key={item.id} />*/}
        {/*      );*/}
        {/*    } else {*/}
        {/*      return (*/}
        {/*        <RegularActivityItemView item={item} key={item.id} />*/}
        {/*      );*/}
        {/*    }*/}
        {/*  })*/}
        {/*}*/}

        {
          Object.keys(groupedItems).map(key => {
            const items = groupedItems[key];
            return (<ActivityItemGroupView key={key} items={items} />);
          })}
      </div>

      {gas === 0 &&
        <div className="pt-1 border-t mt-0 text-gray-500">
          <div className="flex items-center gap-1 text-xs">
            <FunnelIcon className="w-4 h-4" />
            <p>Total gas: {BigNumber(gas).toString(10)} ETH (${usdGas.toPrecision(2)})</p>
          </div>
          {/*<div className="flex items-center gap-1">*/}
          {/*  <EyeIcon className="w-4 h-4" />*/}
          {/*  <p>Tracked by EarnApp</p>*/}
          {/*</div>*/}

        </div>
      }
    </div>
  );
};

const ActivityItemGroupView = (props: { items: DebankHistoryItem[] }) => {
  const { items } = props;

  if (items.length === 0) {
    return <div>Nothing</div>;
  }

  return (
    <div>
      {items[0].debankProject ?
        <>
          <div className="flex items-center gap-x-2">
            <img className="w-8 h-8 rounded-full"
                 src={items[0].debankProject?.logoUrl}
                 alt={items[0].debankProject?.name}
            />
            <p>{items[0].debankProject?.name} on {items[0].debankProject?.chain} network</p>
          </div>

          <div>
            {items.map(item => (<ProjectActivityItemView key={item.id} item={item} />))}
          </div>
        </> : <>
          <div>
            <div className="flex items-center gap-x-2">
              <div className="bg-gray-200 p-1 rounded-full">
                <GlobeAltIcon className="w-6 h-6 stroke-gray-500" />
              </div>
              <p>General operation:</p>
            </div>
            {items.map(item => (<ProjectActivityItemView key={item.id} item={item} />))}
          </div>
        </>
      }
    </div>
  );
};

function SendView(props: { send: DebankSendToken }) {
  return <div className="flex items-center gap-x-1">
    {props.send.token.logoUrl ?
      <img className="w-4 h-4 rounded-full" src={props.send.token.logoUrl ?? ''} alt={props.send.tokenId} /> :
      <ArrowUpCircleIcon className="w-5 h-5 stroke-red-600" />
    }
    <div className="flex items-baseline gap-2">
      <div className="text-red-500">
        -{props.send.amount.toPrecision(4)} {props.send.token.optimizedSymbol}
      </div>

      {
        (props.send.token.name?.length ?? 0) > 5 &&
        <div className="text-gray-300 italic text-xs line-clamp-4 text-clip ...">
          {props.send.token.name?.slice(0, 50)}
        </div>
      }
    </div>
  </div>;
}

function ReceiveView(props: { receive: DebankReceiveToken }) {
  return <div className="flex items-center gap-x-1">
    {props.receive.token.logoUrl ?
      <img className="w-4 h-4 rounded-full" src={props.receive.token.logoUrl ?? ''} alt={props.receive.tokenId} /> :
      <ArrowDownCircleIcon className="w-5 h-5 stroke-green-600" />
    }

    <div className="flex items-baseline gap-2">
      <div className="text-green-500">
        +{props.receive.amount.toPrecision(4)} {props.receive.token.optimizedSymbol ?? props.receive.token.symbol}
      </div>

      {
        (props.receive.token.name?.length ?? 0) > 5 &&
        <div className="text-gray-300 italic text-xs line-clamp-4 text-clip ...">
          {props.receive.token.name?.slice(0, 50)}
        </div>
      }
    </div>
  </div>;
}

function ApproveView(props: { approve: DebankTokenApprove }) {
  return <div className="flex items-center gap-x-1">
    {props.approve.token.logoUrl ?
      <img className="w-4 h-4 rounded-full" src={props.approve.token.logoUrl ?? ''} alt={props.approve.tokenId} /> :
      <ArrowDownCircleIcon className="w-5 h-5 stroke-green-600" />
    }

    <div className="flex items-baseline gap-2">
      <div className="">
        {props.approve.token.optimizedSymbol ?? props.approve.token.symbol}
      </div>

      {
        (props.approve.token.name?.length ?? 0) > 5 &&
        <div className="text-gray-300 italic text-xs line-clamp-4 text-clip ...">
          {props.approve.token.name?.slice(0, 50)}
        </div>
      }
    </div>
  </div>;
}


// const RegularActivityItemView = (props: { item: DebankHistoryItem }) => {
//   const { item } = props;
//
//   return (
//     <div className="">
//       {capitalize(item.name.split(/(?=[A-Z])/).join(' '))}
//       {item.debankTokenSends.map(send => <SendView key={send.id} send={send} />)}
//       {item.debankTokenReceives.map(receive => (<ReceiveView key={receive.id} receive={receive} />))}
//       {item.debankTokenApproves.map(approve => (<div>{approve.token.optimizedSymbol}</div>))}
//     </div>
//   );
// };

const ProjectActivityItemView = (props: { item: DebankHistoryItem }) => {
  const { item } = props;

  const trxHash = item.id.split(':')[2];
  const trxAddress = `${trxHash.slice(0, 6)}...${trxHash.slice(-4)}`;

  return (
    <div className="">
      {/*<div className="flex items-center gap-x-2">*/}
      {/*  <img className="w-8 h-8 rounded-full"*/}
      {/*       src={item.debankProject?.logoUrl}*/}
      {/*       alt={item.debankProject?.name ?? 'Unknown'}*/}
      {/*  />*/}
      {/*  <div className="flex flex-col">*/}
      {/*    <p>{item.debankProject?.name} on {item.debankProject?.chain} network</p>*/}
      {/*    <p>{item.name}</p>*/}
      {/*  </div>*/}
      {/*</div>*/}

      <div className="border-l ml-4 mt-2 pl-2">
        <div className="flex">
          {item.name ?
            <>
              <p className="text-sm text-gray-500">{capitalize(noCase(item.name))}</p>
              {item.cex && <p className="text-sm text-gray-500 flex">
                <img className="w-5 h-5" src={item.cex.logoUrl} />
                ({item.cex.name} CEX)
              </p>}
            </> :
            <p className="text-sm text-gray-500">Transfer</p>
          }
          <div className="grow" />
          <p className="text-sm italic text-gray-400">{trxAddress}</p>
        </div>

        {
          item.debankTokenSends.map(send => (
            <SendView key={send.id} send={send} />
          ))
        }

        {
          item.debankTokenReceives.map(receive => (
            <ReceiveView key={receive.id} receive={receive} />
          ))
        }

        {item.debankTokenApproves.map(approve => <ApproveView key={approve.id} approve={approve} />)}
      </div>
    </div>
  );
};

export default App;
