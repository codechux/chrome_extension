document.addEventListener("DOMContentLoaded", () => {
  // Get elements
  const startVideo = document.getElementById("start_video");
  const stopVideo = document.getElementById("stop_video");
  const cameraToggle = document.getElementById("cameraToggle");
  const audioToggle = document.getElementById("audioToggle");
  const labelCameraToggle = document.getElementById("labelcamera");
  const labelAudioToggle = document.getElementById("labelaudio");

  // Functions
  const startRecording = () => {
    chrome.runtime.sendMessage({ name: "request_recording" });
  };

  const stopRecording = () => {
    const port = chrome.runtime.connect({ name: "content-script" });
    port.postMessage({ name: "stopall" });
  };

  const toggleCamera = () => {
    cameraToggle.checked = !cameraToggle.checked;
  };

  const toggleAudio = () => {
    audioToggle.checked = !audioToggle.checked;
  };

  // Event listeners
  startVideo.addEventListener("click", startRecording);
  stopVideo.addEventListener("click", stopRecording);
  labelCameraToggle.addEventListener("click", toggleCamera);
  labelAudioToggle.addEventListener("click", toggleAudio);
});
