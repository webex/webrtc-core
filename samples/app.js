const kindOfDevices = {
  AUDIO_INPUT: 'audioinput',
  AUDIO_OUTPUT: 'audiooutput',
  VIDEO_INPUT: 'videoinput',
};
const {
  getMicrophones,
  getCameras,
  getSpeakers,
  createCameraTrack,
  createMicrophoneTrack,
  createDisplayTrack,
  staticVideoEncoderConfig,
  staticAudioEncoderConfig,
} = webrtcCore;
const videoElement = document.querySelector('video#localVideo');
const screenshareElement = document.querySelector('video#localScreenshare');
const audioInputSelect = document.querySelector('select#audioSource');
const audioOutputSelect = document.querySelector('select#audioOutput');
const videoInputSelect = document.querySelector('select#videoSource');
const selectors = [audioInputSelect, audioOutputSelect, videoInputSelect];
let localAudioTrack;
let cameraTrack;
let audioTrack;

// This function is for handling error if promises getting failed
/**
 * @param error
 */
function handleError(error) {
  // eslint-disable-next-line no-console
  console.log('webrtcCore Media error: ', error.message, error.name);
}

// This function will create option for selectbox and return that option to caller
/**
 * @param device
 */
function buildSelectOption(device) {
  const childOption = document.createElement('option');

  childOption.value = device.deviceId;

  return childOption;
}

// This function is for building dropdowns of Microphones
/**
 * @param audioInputDevices
 */
function buildAudioInputSelection(audioInputDevices) {
  audioInputDevices.forEach((audioInputDevice) => {
    const childOption = buildSelectOption(audioInputDevice);

    childOption.text = audioInputDevice.label || `Microphone ${audioInputSelect.length + 1}`;
    audioInputSelect.appendChild(childOption);
  });
}

// This function is for building dropdowns of Speakers
/**
 * @param audioOutputDevices
 */
function buildAudioOutputSelection(audioOutputDevices) {
  audioOutputDevices.forEach((audioOutputDevice) => {
    const childOption = buildSelectOption(audioOutputDevice);

    childOption.text = audioOutputDevice.label || `Speaker ${audioInputSelect.length + 1}`;
    audioOutputSelect.appendChild(childOption);
  });
}

// This function is for building dropdowns of Cameras
/**
 * @param videoInputDevices
 */
function buildVideoInputSelection(videoInputDevices) {
  videoInputDevices.forEach((videoInputDevice) => {
    const childOption = buildSelectOption(videoInputDevice);

    childOption.text = videoInputDevice.label || `Camera ${audioInputSelect.length + 1}`;
    videoInputSelect.appendChild(childOption);
  });
}

// This function is running screenshare video stream in box of local screen share
/**
 * @param contentTrack
 */
function buildLocalScreenshare(contentTrack) {
  screenshareElement.srcObject = new MediaStream([contentTrack.getMediaStreamTrack()]);
}

// This functions is for building dropdowns of all selectboxes and preserve the previously selected value.
/**
 * @param devices
 */
function gotDevices(devices) {
  // Handles being called several times to update labels. Preserve values.

  const values = selectors.map((selector) => selector.value);

  selectors.forEach((selector) => {
    while (selector.firstChild) {
      selector.removeChild(selector.firstChild);
    }
  });

  buildAudioInputSelection(devices[0]);
  buildVideoInputSelection(devices[1]);
  buildAudioOutputSelection(devices[2]);

  selectors.forEach((selector, selectorIndex) => {
    if (
      Array.prototype.slice.call(selector.childNodes).some((n) => n.value === values[selectorIndex])
    ) {
      // eslint-disable-next-line no-param-reassign
      selector.value = values[selectorIndex];
    }
  });
}

// This functions is for running video streams in boxes and return the promise of getting all devices.
/**
 * @param root0
 * @param root0."0"
 * @param root0."1"
 * @param root0."2"
 */
function gotTracks([localVideo, localAudio, localContent]) {
  buildLocalVideo(localVideo);
  buildLocalScreenshare(localContent);
  localAudioTrack = localAudio;

  const devicePromises = [getMicrophones(), getCameras(), getSpeakers()];

  return Promise.all(devicePromises);
}

/**
 *
 */
async function gatherDevices() {
  const devicePromises = [getMicrophones(), getCameras(), getSpeakers()];

  const devices = await Promise.all(devicePromises);

  gotDevices(devices);
}

// This function is starting point of app. it will will get all tracks and then run next operation.
/**
 * @param root0
 * @param root0.audioPayload
 * @param root0.videoPayload
 * @param root0.contentPayload
 */
function start({ audioPayload = '', videoPayload = '', contentPayload = '' }) {
  const trackPromises = [
    createCameraTrack(videoPayload),
    createMicrophoneTrack(audioPayload),
    createDisplayTrack(contentPayload),
  ];

  Promise.all(trackPromises).catch(handleError);
}

// This function is for changing audio input device on dropdown change and clicking the button updateAudio.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
/**
 *
 */
async function setAudioInputDevice() {
  const deviceId = audioInputSelect.value;

  const audioPayload = {
    ID: deviceId,
    kind: kindOfDevices.AUDIO_INPUT,
  };
  const quality = document.getElementById('audioQuality').value;
  const echoCancellation = document.getElementById('echoCancellation').checked;
  audioTrack = await createMicrophoneTrack({ microphoneDeviceId: audioPayload.ID, encoderConfig: {...staticAudioEncoderConfig[quality], echoCancellation: echoCancellation}});
  audioTrack.play();
}

// This function is for changing video input device on dropdown change and clicking the button updateVideo.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
/**
 *
 */
async function setVideoInputDevice() {
  const deviceId = videoInputSelect.value;

  const videoPayload = {
    ID: deviceId,
    kind: kindOfDevices.VIDEO_INPUT,
  };
  const resolution = document.getElementById('resolution').value;
  const constraint = staticVideoEncoderConfig[resolution];
  cameraTrack = await createCameraTrack({ cameraDeviceId: videoPayload.ID ,encoderConfig: constraint });
  cameraTrack.play(videoElement);

  // cameraTrack.getMediaStreamTrack().getSettings()
}

async function applyResolution() {
  const resolution = document.getElementById('resolution').value;
  const constraint = staticVideoEncoderConfig[resolution];
  cameraTrack.setEncoderConfig(constraint);
}

async function applyQuality() {
  const quality = document.getElementById('audioQuality').value;
  let constraint = staticAudioEncoderConfig[quality];
  constraint.echoCancellation = document.getElementById('echoCancellation').checked
  audioTrack.stop();
  audioTrack = await createMicrophoneTrack({ microphoneDeviceId: audioTrack.getMediaStreamTrack().getSettings().deviceId, encoderConfig: constraint});
  audioTrack.play();
}

//For troubleshooting
window.audioTrackInfo = function () {
  console.log('audio constraint: ', audioTrack.getMediaStreamTrack().getConstraints())
  console.log('audio settings: ', audioTrack.getMediaStreamTrack().getSettings())
  console.log('sampleRate: ', audioTrack.getMediaStreamTrack().getSettings().sampleRate)
  console.log('echoCancellation: ', audioTrack.getMediaStreamTrack().getSettings().echoCancellation)
}

/*
  Background Noise Reduction (BNR) methods starts
*/

const listenToAudioBtn = document.getElementById('listenToAudio');
const enableBnrBtn = document.getElementById('enableBnrBtn');
const disableBnrBtn = document.getElementById('disableBnrBtn');

const bnrAudioOutput = document.getElementById('bnr-audio');

let rawAudioStream;
let isListening = false;

/**
 * Method to toggle audio listening for BNR effect
 * called as part of clicking #listenToAudio button.
 */
const toggleAudioListen = async () => {
  if (!isListening) {
    listenToAudioBtn.setAttribute('disabled', true);

    rawAudioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    bnrAudioOutput.srcObject = rawAudioStream;

    listenToAudioBtn.innerText = 'Stop listening to Audio';
    listenToAudioBtn.removeAttribute('disabled');

    enableBnrBtn.removeAttribute('disabled');

    isListening = true;
  } else {
    listenToAudioBtn.innerText = 'Start listening to Audio';

    enableBnrBtn.setAttribute('disabled', true);
    disableBnrBtn.setAttribute('disabled', true);
    bnrAudioOutput.srcObject = null;

    isListening = false;
  }
};

/**
 * Method to enableBNR
 * called as part of clicking #enableBnrBtn button.
 */
const enableBNR = async () => {
  const audiotrack = rawAudioStream.getAudioTracks()[0];

  const bnrAudioTrack = await mediaMethods.Effects.BNR.enableBNR(audiotrack);

  const bnrAudioStream = new MediaStream();

  bnrAudioStream.addTrack(bnrAudioTrack);

  bnrAudioOutput.srcObject = bnrAudioStream;

  enableBnrBtn.setAttribute('disabled', true);
  disableBnrBtn.removeAttribute('disabled');
};

/**
 * Method to disableBNR
 * called as part of clicking #disableBnrBtn button.
 */
const disableBNR = () => {
  const bnrDisabledAudioTrack = mediaMethods.Effects.BNR.disableBNR();

  const bnrDisabledAudioStream = new MediaStream();

  bnrDisabledAudioStream.addTrack(bnrDisabledAudioTrack);

  bnrAudioOutput.srcObject = bnrDisabledAudioStream;

  disableBnrBtn.setAttribute('disabled', true);
  enableBnrBtn.removeAttribute('disabled');
};
