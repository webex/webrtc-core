/**
 *
 */
class MediaDeviceInfoStub {
  deviceId = 'devcieID';

  groupId = 'groundID';

  kind: MediaDeviceKind;

  label = 'label';

  /**
   
   * @param kind
   */
  constructor(kind: any) {
    this.kind = kind;
  }
}

export default MediaDeviceInfoStub;
