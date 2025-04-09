import { useEffect, useState } from "react"
import { Storage } from "@plasmohq/storage"
import "./css.css"
import type { MLCEngine } from "~node_modules/@mlc-ai/web-llm/lib";

const storage = new Storage()

function IndexSidePanel() {
  const [result, setResult] = useState<any>([]);
  const [modelLoadingProgress, setModelLoadingProgress] = useState<any>(null);

  useEffect(() => {
    const initialize = async () => {
      return new Promise((resolve, reject) => {
        const tryGetEngine = async () => {
          try {
            const response = await chrome.runtime.sendMessage({ action: "getEngine" });
            if (response.engine) {
              console.log("Engine received in sidepanel");
              resolve(response.engine);
            } else {
              console.error("Error getting engine:", response.error);
              setTimeout(tryGetEngine, 1000);
            }
          } catch (error) {
            console.error("Failed to send message:", error);
            setTimeout(tryGetEngine, 1000);
          }
        };
  
        tryGetEngine();
      });
    }

    initialize().then((llmInference: MLCEngine) => {
      storage.watch({
        PAGE_TEXT: async (pageText) => {
          console.log(pageText);
          const messages = [
            { role: "system", content: "You are a helpful AI assistant." },
            { role: "user", content: `
              Given the following webpage article, your task is to evaluate it for bias. 
              
              The article is as follows:
              --------------------

              ${pageText.newValue}

              --------------------

              Having read the article, respond back with whether or not it conatins any biases and an explanation of why they are biases.
          ` },
          ];
          const reply = await llmInference.chat.completions.create({//@ts-ignore
            messages,
          });
          
          setResult(reply.choices[0].message)
        }
      })
    })
  }, [])

  return (
    <div>
      <h1>Sentiment Analysis</h1>
      <div>Model Loading Progress: {modelLoadingProgress}</div>
      {result.length ? (
        <pre>{JSON.stringify(result, null, 2)}</pre>
      ) : (
        <p>No sentiment data available.</p>
      )}
    </div>
  )
}

export default IndexSidePanel
