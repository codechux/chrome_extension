chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.name === "request_recording") {
    // Function to handle tab creation and navigation
    const createAndNavigateTab = () => {
      const htmlLink = chrome.runtime.getURL("index.html");
      chrome.tabs.create(
        { url: htmlLink, pinned: true, active: true },
        (newTab) => {
          console.log("New tab created and navigated to the HTML file");

          const handleTabUpdate = (tabId, changeInfo) => {
            if (tabId === newTab.id && changeInfo.status === "complete") {
              console.log("New tab has completed loading");

              chrome.tabs.sendMessage(tabId, {
                name: "startRecordingOnBackground",
              });

              chrome.tabs.onUpdated.removeListener(handleTabUpdate);

              sendResponse({ message: "Starting video..." });
            }
          };

          chrome.tabs.onUpdated.addListener(handleTabUpdate);
        }
      );
    };

    createAndNavigateTab();
  }
});
