let recorder = null;
let userMediaStream = null;
let displayMediaStream = null;

function startRecording(stream) {
  recorder = new MediaRecorder(stream);

  recorder.ondataavailable = function (event) {
    let recordedBlob = event.data;
    let url = URL.createObjectURL(recordedBlob);
    sendVideoToServer(recordedBlob);
    saveAndDownloadRecording(url);
  };

  recorder.onstop = function () {
    stopTracks(stream);
  };

  recorder.start();
}

function sendVideoToServer(blob) {
  const formData = new FormData();
  formData.append("video", blob, "chux_screen-recording.webm");

  fetch("https://google-chrome-extensionapi.onrender.com/api/upload", {
    method: "POST",
    body: formData,
  })
    .then((response) => {
      if (response.ok) {
        console.log("Video uploaded successfully");
      } else {
        console.error("Failed to upload video");
      }
    })
    .catch((error) => {
      console.error("Error uploading video:", error);
    });
}

function saveAndDownloadRecording(url) {
  let a = document.createElement("a");
  a.style.display = "none";
  a.href = url;
  a.download = "chux_screen-recording.webm";

  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  URL.revokeObjectURL(url);

  window.close();
}

function stopTracks(stream) {
  stream.getTracks().forEach(function (track) {
    if (track.readyState === "live") {
      track.stop();
    }
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.name !== "startRecordingOnBackground") {
    return;
  }

  console.log("Requesting recording");
  sendResponse(`processed: ${message.name}`);

  Promise.all([
    navigator.mediaDevices.getUserMedia({ video: false, audio: true }),
    navigator.mediaDevices.getDisplayMedia({
      audio: true,
      video: {
        width: 9999999999,
        height: 9999999999,
      },
    }),
  ]).then((streams) => {
    const [camera, screen] = streams;
    userMediaStream = camera;
    displayMediaStream = screen;

    displayMediaStream.oninactive = function () {
      console.log("Display media stream stopped");
      if (userMediaStream) {
        stopTracks(userMediaStream);
      }
    };

    const mergeStream = new MediaStream([
      ...camera.getTracks(),
      ...screen.getTracks(),
    ]);
    startRecording(mergeStream);
  });
});
