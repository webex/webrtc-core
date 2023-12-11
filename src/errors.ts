export enum WebrtcCoreErrorTypes {
  DEVICE_PERMISSION_DENIED = 'DEVICE_PERMISSION_DENIED',
  CREATE_STREAM_FAILED = 'CREATE_STREAM_FAILED',
}

/**
 * Represents a WebRTC core error, which contains error type and error message.
 */
export class WebrtcCoreError {
  type: string;

  message: string;

  /**
   * Creates new error.
   *
   * @param type - Error type.
   * @param message - Error message.
   */
  constructor(type: WebrtcCoreErrorTypes, message = '') {
    this.type = type;
    this.message = message;
  }
}
