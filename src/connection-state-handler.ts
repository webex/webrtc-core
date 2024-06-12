import { EventEmitter, EventMap } from './event-emitter';
import { logger } from './util/logger';

// Overall connection state (based on the ICE and DTLS connection states)
export enum ConnectionState {
  New = 'New', // connection attempt has not been started
  Closed = 'Closed', // connection closed, there is no way to move out of this state
  Connected = 'Connected', // both ICE and DTLS connections are established, media is flowing
  Connecting = 'Connecting', // initial connection attempt in progress
  Disconnected = 'Disconnected', // connection lost temporarily, the browser is trying to re-establish it automatically
  Failed = 'Failed', // connection failed, an ICE restart is required
}

enum ConnectionStateEvents {
  PeerConnectionStateChanged = 'PeerConnectionStateChanged',
  IceConnectionStateChanged = 'IceConnectionStateChanged',
}

interface ConnectionStateEventHandlers extends EventMap {
  [ConnectionStateEvents.PeerConnectionStateChanged]: (state: RTCPeerConnectionState) => void;
  [ConnectionStateEvents.IceConnectionStateChanged]: (state: RTCIceConnectionState) => void;
}

type GetCurrentStatesCallback = () => {
  connectionState: RTCPeerConnectionState;
  iceState: RTCIceConnectionState;
};

/**
 * Listens on the connection's ICE and DTLS state changes and emits a single
 * event that summarizes all the internal states into a single overall connection state.
 */
export class ConnectionStateHandler extends EventEmitter<ConnectionStateEventHandlers> {
  static Events = ConnectionStateEvents;

  private getCurrentStatesCallback: GetCurrentStatesCallback;

  /**
   * Creates an instance of ConnectionStateHandler.
   *
   * @param getCurrentStatesCallback - Callback for getting the connection state information
   *                                   from the peer connection.
   */
  constructor(getCurrentStatesCallback: GetCurrentStatesCallback) {
    super();
    this.getCurrentStatesCallback = getCurrentStatesCallback;
  }

  /**
   * Handler for connection state change.
   */
  public onPeerConnectionStateChange(): void {
    const state = this.getPeerConnectionState();

    this.emit(ConnectionStateEvents.PeerConnectionStateChanged, state);
  }

  /**
   * Handler for ice connection state change.
   */
  public onIceConnectionStateChange(): void {
    const state = this.getIceConnectionState();

    this.emit(ConnectionStateEvents.IceConnectionStateChanged, state);
  }

  /**
   * Evaluates the overall connection state based on peer connection's
   * connectionState and iceConnectionState.
   *
   * @returns Current overall connection state.
   */
  private evaluateMediaConnectionState(): ConnectionState {
    const { connectionState, iceState } = this.getCurrentStatesCallback();

    const connectionStates = [connectionState, iceState];

    let mediaConnectionState: ConnectionState;

    if (connectionStates.every((value) => value === 'new')) {
      mediaConnectionState = ConnectionState.New;
    } else if (connectionStates.some((value) => value === 'closed')) {
      mediaConnectionState = ConnectionState.Closed;
    } else if (connectionStates.some((value) => value === 'failed')) {
      mediaConnectionState = ConnectionState.Failed;
    } else if (connectionStates.some((value) => value === 'disconnected')) {
      mediaConnectionState = ConnectionState.Disconnected;
    } else if (connectionStates.every((value) => value === 'connected' || value === 'completed')) {
      mediaConnectionState = ConnectionState.Connected;
    } else {
      mediaConnectionState = ConnectionState.Connecting;
    }

    logger.log(
      `iceConnectionState=${iceState} connectionState=${connectionState} => ${mediaConnectionState}`
    );

    return mediaConnectionState;
  }

  /**
   * Gets current connection state.
   *
   * @returns Current connection state.
   */
  public getPeerConnectionState(): RTCPeerConnectionState {
    const { connectionState } = this.getCurrentStatesCallback();

    return connectionState;
  }

  /**
   * Gets current ice connection state.
   *
   * @returns Current ice connection state.
   */
  public getIceConnectionState(): RTCIceConnectionState {
    const { iceState } = this.getCurrentStatesCallback();

    return iceState;
  }

  /**
   * Gets current overall connection state.
   *
   * @returns Current overall connection state.
   */
  public getConnectionState(): ConnectionState {
    return this.evaluateMediaConnectionState();
  }
}
