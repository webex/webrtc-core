


function handleSuccess(videoTrack) {
  const video = document.querySelector('video');
  console.log(`Using video device: ${videoTrack.label}`);
  let stream = new MediaStream([videoTrack]);
  window.stream = stream; // make variable available to browser console
  video.srcObject = stream;
}



function errorMsg(msg, error) {
  const errorElement = document.querySelector('#errorMsg');
  errorElement.innerHTML += `<p>${msg}</p>`;
  if (typeof error !== 'undefined') {
    console.error(error);
  }
}

async function init(e) {
  try {
  
    const videoStream = await WebRtcCore.media.createVideoTrack();
    handleSuccess(videoStream.getVideoTracks()[0]);
    e.target.disabled = true;
  } catch (e) {
    console.log(e);
  }
}

document.querySelector('#showVideo').addEventListener('click', e => init(e));