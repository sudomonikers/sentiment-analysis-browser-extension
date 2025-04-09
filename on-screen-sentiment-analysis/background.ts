export {}

import { CreateMLCEngine } from "@mlc-ai/web-llm"

const selectedModel = "Qwen2.5-0.5B-Instruct-q4f16_1-MLC"
let engine
async function initializeEngine() {
  try {
    engine = await CreateMLCEngine(
      selectedModel,
      {
        initProgressCallback: (initProgress) => {
          console.log(initProgress)
        }
      }
    )
    console.log("Engine initialized in background script")
  } catch (err) {
    console.error(err)
  }
}

initializeEngine()

chrome.runtime.onMessage.addListener(
  (request, sender, sendResponse) => {
    if (request.action === "getEngine") {
      if (engine) {
        console.log("Sending engine to sidepanel");
        sendResponse({ engine: engine }); // Or just send the methods you need
      } else {
        sendResponse({ error: "Engine not yet initialized" });
      }
      return true; // Indicate that you wish to send a response asynchronously
    }
    return false;
  }
);