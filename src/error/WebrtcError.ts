export enum ErrorTypes {
  DEVICE_PERMISSION_DENIED = 'DEVICE_PERMISSION_DENIED',
  CREATE_CAMERA_TRACK_FAILED = 'CREATE_CAMERA_TRACK_FAILED',
  CREATE_MICROPHONE_TRACK_FAILED = 'CREATE_MICROPHONE_TRACK_FAILED',
}

/**
 * Represents a webrtc core error, which contains error type and error message.
 */
export class WebrtcError {
  type: string;

  message: string;

  /**
   * Creates new error.
   *
   * @param type - Error type.
   * @param message - Error message.
   */
  constructor(type: ErrorTypes, message = '') {
    this.type = type;
    this.message = message;
  }
}
