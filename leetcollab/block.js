chrome.webRequest.onBeforeRequest.addListener(
    function() { return {cancel: true}; },
    {
      urls: ["https://assets.leetcode.com/static_assets/public/webpack_bundles/new-apps/desktop.*"],
      types: ["script"]
    },
    ["blocking"]
  );

  // Make it so it blocks anything in the new apps directory that has desktop in the file name.