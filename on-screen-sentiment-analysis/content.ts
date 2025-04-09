export {}

import { Readability } from '@mozilla/readability'
import { Storage } from "@plasmohq/storage"
const storage = new Storage()
let timeoutId;

function extractMainContent(): string {
  try {
    const documentClone = document.cloneNode(true) as Document;
    const article = new Readability(documentClone).parse();
    return article?.textContent ?? ''
  } catch (err) {
    console.info(err)
  }
}

const sendMessage = async () => {
  console.log(extractMainContent());
  await storage.set("PAGE_TEXT", extractMainContent());
};

const debouncedSendMessage = () => {
  if (timeoutId !== null) {
    clearTimeout(timeoutId);
  }

  timeoutId = setTimeout(() => {
    sendMessage();
    timeoutId = null;
  }, 200);
};

const observer = new MutationObserver((mutations) => {
  debouncedSendMessage();
});

// Start observing the document body for changes
observer.observe(document.body, {
  childList: true, // monitor for direct children
  subtree: true, // monitor all descendants
  characterData: true, // monitor for changes in text
  attributes: true // monitor attribute changes
});

function keepServiceWorkerAlive() {
  chrome.runtime.sendMessage({ type: "keepalive" });
  setTimeout(keepServiceWorkerAlive, 1 * 60 * 1000);
}

keepServiceWorkerAlive();