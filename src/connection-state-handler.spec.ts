import { ConnectionState, ConnectionStateHandler } from './connection-state-handler';

describe('ConnectionStateHandler', () => {
  let fakeIceState: RTCIceConnectionState;
  let fakeConnectionState: RTCPeerConnectionState;

  // eslint-disable-next-line jsdoc/require-jsdoc
  const fakeCallback = () => {
    return {
      connectionState: fakeConnectionState,
      iceState: fakeIceState,
    };
  };

  beforeEach(() => {
    fakeIceState = 'new';
    fakeConnectionState = 'new';
  });

  it('reads initial connection state', () => {
    expect.assertions(1);
    const connStateHandler = new ConnectionStateHandler(fakeCallback);

    expect(connStateHandler.getConnectionState()).toStrictEqual(ConnectionState.New);
  });

  it('updates connection state on ice connection state change and emits the event', () => {
    expect.assertions(2);
    const connStateHandler = new ConnectionStateHandler(fakeCallback);

    connStateHandler.on(ConnectionStateHandler.Events.ConnectionStateChanged, (state) => {
      expect(state).toStrictEqual(ConnectionState.ConnectingIce);
    });

    fakeIceState = 'checking';
    connStateHandler.onIceConnectionStateChange();

    expect(connStateHandler.getConnectionState()).toStrictEqual(ConnectionState.ConnectingIce);
  });

  it("updates connection state on RTCPeerConnection's connection state change", () => {
    expect.assertions(2);
    const connStateHandler = new ConnectionStateHandler(fakeCallback);

    connStateHandler.on(ConnectionStateHandler.Events.ConnectionStateChanged, (state) => {
      expect(state).toStrictEqual(ConnectionState.ConnectingIce);
    });

    fakeConnectionState = 'connecting';
    connStateHandler.onConnectionStateChange();

    expect(connStateHandler.getConnectionState()).toStrictEqual(ConnectionState.ConnectingIce);
  });

  // test matrix for all possible combinations of iceConnectionState and connectionState
  // some of these cases theoretically should never happen (like iceState: 'closed', connState: 'connected' )
  // but we test them anyway for completeness
  const testCases: Array<{
    iceState: RTCIceConnectionState;
    connState: RTCPeerConnectionState;
    expected: ConnectionState;
  }> = [
    { iceState: 'new', connState: 'new', expected: ConnectionState.New },
    { iceState: 'new', connState: 'connecting', expected: ConnectionState.ConnectingIce },
    { iceState: 'new', connState: 'connected', expected: ConnectionState.ConnectingIce },
    { iceState: 'new', connState: 'disconnected', expected: ConnectionState.Disconnected },
    { iceState: 'new', connState: 'failed', expected: ConnectionState.Failed },
    { iceState: 'new', connState: 'closed', expected: ConnectionState.Closed },

    { iceState: 'checking', connState: 'new', expected: ConnectionState.ConnectingIce },
    { iceState: 'checking', connState: 'connecting', expected: ConnectionState.ConnectingIce },
    { iceState: 'checking', connState: 'connected', expected: ConnectionState.ConnectingIce },
    { iceState: 'checking', connState: 'disconnected', expected: ConnectionState.Disconnected },
    { iceState: 'checking', connState: 'failed', expected: ConnectionState.Failed },
    { iceState: 'checking', connState: 'closed', expected: ConnectionState.Closed },

    { iceState: 'connected', connState: 'new', expected: ConnectionState.ConnectingIce },
    { iceState: 'connected', connState: 'connecting', expected: ConnectionState.ConnectingDtls },
    { iceState: 'connected', connState: 'connected', expected: ConnectionState.Connected },
    { iceState: 'connected', connState: 'disconnected', expected: ConnectionState.Disconnected },
    { iceState: 'connected', connState: 'failed', expected: ConnectionState.Failed },
    { iceState: 'connected', connState: 'closed', expected: ConnectionState.Closed },

    { iceState: 'completed', connState: 'new', expected: ConnectionState.ConnectingIce },
    { iceState: 'completed', connState: 'connecting', expected: ConnectionState.ConnectingDtls },
    { iceState: 'completed', connState: 'connected', expected: ConnectionState.Connected },
    { iceState: 'completed', connState: 'disconnected', expected: ConnectionState.Disconnected },
    { iceState: 'completed', connState: 'failed', expected: ConnectionState.Failed },
    { iceState: 'completed', connState: 'closed', expected: ConnectionState.Closed },

    { iceState: 'failed', connState: 'new', expected: ConnectionState.Failed },
    { iceState: 'failed', connState: 'connecting', expected: ConnectionState.Failed },
    { iceState: 'failed', connState: 'connected', expected: ConnectionState.Failed },
    { iceState: 'failed', connState: 'disconnected', expected: ConnectionState.Failed },
    { iceState: 'failed', connState: 'failed', expected: ConnectionState.Failed },
    { iceState: 'failed', connState: 'closed', expected: ConnectionState.Closed },

    { iceState: 'disconnected', connState: 'new', expected: ConnectionState.Disconnected },
    { iceState: 'disconnected', connState: 'connecting', expected: ConnectionState.Disconnected },
    { iceState: 'disconnected', connState: 'connected', expected: ConnectionState.Disconnected },
    { iceState: 'disconnected', connState: 'disconnected', expected: ConnectionState.Disconnected },
    { iceState: 'disconnected', connState: 'failed', expected: ConnectionState.Failed },
    { iceState: 'disconnected', connState: 'closed', expected: ConnectionState.Closed },

    { iceState: 'closed', connState: 'new', expected: ConnectionState.Closed },
    { iceState: 'closed', connState: 'connecting', expected: ConnectionState.Closed },
    { iceState: 'closed', connState: 'connected', expected: ConnectionState.Closed },
    { iceState: 'closed', connState: 'disconnected', expected: ConnectionState.Closed },
    { iceState: 'closed', connState: 'failed', expected: ConnectionState.Closed },
    { iceState: 'closed', connState: 'closed', expected: ConnectionState.Closed },
  ];

  testCases.forEach(({ iceState, connState, expected }) =>
    it(`evaluates overall state to ${expected} when iceConnectionState=${iceState} and connectionState=${connState}`, () => {
      expect.assertions(1);
      const connStateHandler = new ConnectionStateHandler(fakeCallback);

      fakeConnectionState = connState;
      fakeIceState = iceState;

      // it's sufficient to trigger just one of the callbacks
      connStateHandler.onConnectionStateChange();

      expect(connStateHandler.getConnectionState()).toStrictEqual(expected);
    })
  );
});
