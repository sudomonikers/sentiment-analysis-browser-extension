export {}

import { Readability } from '@mozilla/readability'
import { Storage } from "@plasmohq/storage"
const storage = new Storage()

function extractMainContent(): string {
  const documentClone = document.cloneNode(true) as Document
  const article = new Readability(documentClone).parse()
  return article?.textContent ?? ''
}

async function sendMessage() {
  await storage.set("PAGE_TEXT", extractMainContent())
}

const observer = new MutationObserver((mutations) => {
  sendMessage()
})

// Start observing the document body for changes
observer.observe(document.body, {
  childList: true, // monitor for direct children
  subtree: true, // monitor all descendants
  characterData: true, // monitor for changes in text
  attributes: true // monitor attribute changes
});