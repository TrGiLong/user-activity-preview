export interface Activity {
  id: string;
  accountAddress: AccountAddress;
  start: Date;
  end: Date;
  debankHistoryItems: DebankHistoryItem[];
}

export type AccountAddress = string;

export interface DebankHistoryItem {
  id: string;
  accountAddress: AccountAddress;
  category: null | string;
  ethGasFee: number | null;
  usdGasFee: number | null;
  fromAddr: string;
  name: string;
  params: string[];
  status: number;
  toAddr: string;
  timeAt: Date;
  value: number;
  cexId: null | string;
  debankProjectId: null | string;
  activityId: string;
  cex: Cex | null;
  debankProject: DebankProject | null;
  debankTokenSends: DebankSendToken[];
  debankTokenReceives: DebankReceiveToken[];
  debankTokenApproves: DebankTokenApprove[];
}

export interface Cex {
  id: string;
  isVault: boolean;
  logoUrl: string;
  name: string;
}

export interface DebankProject {
  id: string;
  chain: string;
  logoUrl: string;
  name: string;
  siteUrl: string;
}

export interface DebankTokenApprove {
  id: string;
  spender: string;
  value: number;
  tokenId: string;
  historyItemId: string;
  token: Token;
}

export interface DebankSendToken {
  id: string;
  amount: number;
  tokenId: string;
  historyItemId: string;
  toAddr: string;
  token: Token;
}

export interface DebankReceiveToken {
  id: string;
  amount: number;
  fromAddress: string;
  tokenId: string;
  historyItemId: string;
  token: Token;
}

export interface Token {
  id: string;
  decimals: number | null;
  displaySymbol: null;
  isCore: boolean | null;
  isVerified: boolean | null;
  isWallet: boolean | null;
  logoUrl: null | string;
  name: null | string;
  optimizedSymbol: null | string;
  price: number | null;
  symbol: null | string;
  timeAt: number | null;
  protocolId: null | string;

}
