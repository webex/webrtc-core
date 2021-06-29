// import {EventEmitter} from "events";
import { PeerConnectionConfig } from "./peerconnection";

export interface PeerConnectionManagerConfig extends PeerConnectionConfig {
  /** setting log level for peerconnection */
  logLevel: number;

  /** ice server configuration */
  iceServer: Array<string>;

  /** support simulcast */
  simulcast: any;

  /** no of tracks received  */
  noOfTracksReceived: number;
}

export default class PeerConnectionManager{
  constructor(config: PeerConnectionManagerConfig) {
  }
}
