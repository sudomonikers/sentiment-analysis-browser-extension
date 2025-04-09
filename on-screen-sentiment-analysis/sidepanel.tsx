import { useEffect, useState } from "react"

import { Storage } from "@plasmohq/storage"

import "./css.css"

import { CreateMLCEngine, CreateWebWorkerMLCEngine } from "~node_modules/@mlc-ai/web-llm/lib"

const storage = new Storage()

function IndexSidePanel() {
  let llmEngine
  const llmModel = {
    model: "https://huggingface.co/mlc-ai/gemma-3-4b-it-q0bf16-MLC",
    model_id: 'mlc-ai/gemma-3-4b-it-q0bf16-MLC',
    model_lib: ''
  }
  const [result, setResult] = useState<any>([])
  const [modelLoadingProgress, setModelLoadingProgress] = useState<string>(null)

  const createWebLLMEngine = async () => {
    const engine = await CreateMLCEngine(
      llmModel.model_id,
      { 
        initProgressCallback: (p) => {
          setModelLoadingProgress(p.text)
        }, 
        appConfig: {
          model_list: [llmModel],
        } 
      },
    );

    return engine;
  };

  useEffect(() => {
    // Listen for tab activation events
    chrome.tabs.onActivated.addListener(async () => {
      //when tab changes, we need to reset the content
      setResult([]);
    });
    const run = async () => {
      llmEngine = await createWebLLMEngine();
      storage.watch({
        PAGE_TEXT: async (pageText) => {
          console.log(pageText)
          const messages = [
            { role: "system", content: "You are a helpful AI assistant." },
            {
              role: "user",
              content: `
                Given the following webpage article, your task is to evaluate it for bias. 
                
                The article is as follows:
                --------------------
      
                ${pageText.newValue}
      
                --------------------
      
                Having read the article, respond back with whether or not it conatins any biases and an explanation of why they are biases.
            `
            }
          ]
      
          try {
            console.log("trying message") //@ts-ignore
            const reply = await llmEngine.chat.completions.create({ messages })
            console.log(reply)
            setResult(reply.choices[0].message.content)
          } catch (err) {
            console.error(err)
          }
        }
      });
    }

    run()
  }, []);

  return (
    <div>
      <h1>Sentiment Analysis</h1>
      <div>Model Loading Progress: {modelLoadingProgress}</div>
      {result ? (
        <p className="content-box">{result}</p>
      ) : (
        <p>No sentiment data available.</p>
      )}
    </div>
  )
}

export default IndexSidePanel
