import { EventEmitter, EventMap } from './event-emitter';
import { logger } from './util/logger';

export enum OverallConnectionState {
  New = 'New',
  Connecting = 'Connecting',
  Connected = 'Connected',
  Disconnected = 'Disconnected',
  Failed = 'Failed',
  Closed = 'Closed',
}

export enum ConnectionState {
  New = 'New', // connection attempt has not been started
  Closed = 'Closed', // connection closed, there is no way to move out of this state
  Connected = 'Connected', // both ICE and DTLS connections are established, media is flowing
  Connecting = 'Connecting', // initial connection attempt in progress
  Disconnected = 'Disconnected', // connection lost temporarily, the browser is trying to re-establish it automatically
  Failed = 'Failed', // connection failed, an ICE restart is required
}

export enum IceConnectionState {
  New = 'New',
  Checking = 'Checking',
  Connected = 'Connected',
  Completed = 'Completed',
  Failed = 'Failed',
  Disconnected = 'Disconnected',
  Closed = 'Closed',
}

enum ConnectionStateEvents {
  ConnectionStateChanged = 'ConnectionStateChanged',
  IceConnectionStateChanged = 'IceConnectionStateChanged',
}

interface ConnectionStateEventHandlers extends EventMap {
  [ConnectionStateEvents.ConnectionStateChanged]: (state: ConnectionState) => void;
  [ConnectionStateEvents.IceConnectionStateChanged]: (state: IceConnectionState) => void;
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
  public onConnectionStateChange(): void {
    const state = this.getConnectionState();

    this.emit(ConnectionStateEvents.ConnectionStateChanged, state);
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
  private evaluateMediaConnectionState(): OverallConnectionState {
    const { connectionState, iceState } = this.getCurrentStatesCallback();

    const connectionStates = [connectionState, iceState];

    let mediaConnectionState: OverallConnectionState;

    if (connectionStates.every((value) => value === 'new')) {
      mediaConnectionState = OverallConnectionState.New;
    } else if (connectionStates.some((value) => value === 'closed')) {
      mediaConnectionState = OverallConnectionState.Closed;
    } else if (connectionStates.some((value) => value === 'failed')) {
      mediaConnectionState = OverallConnectionState.Failed;
    } else if (connectionStates.some((value) => value === 'disconnected')) {
      mediaConnectionState = OverallConnectionState.Disconnected;
    } else if (connectionStates.every((value) => value === 'connected' || value === 'completed')) {
      mediaConnectionState = OverallConnectionState.Connected;
    } else {
      mediaConnectionState = OverallConnectionState.Connecting;
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
  public getConnectionState(): ConnectionState {
    const { connectionState } = this.getCurrentStatesCallback();

    const state = connectionState[0].toUpperCase() + connectionState.slice(1);

    return state as ConnectionState;
  }

  /**
   * Gets current ice connection state.
   *
   * @returns Current ice connection state.
   */
  public getIceConnectionState(): IceConnectionState {
    const { iceState } = this.getCurrentStatesCallback();

    const state = iceState[0].toUpperCase() + iceState.slice(1);

    return state as IceConnectionState;
  }

  /**
   * Gets current overall connection state.
   *
   * @returns Current overall connection state.
   */
  public getOverallConnectionState(): OverallConnectionState {
    return this.evaluateMediaConnectionState();
  }
}
