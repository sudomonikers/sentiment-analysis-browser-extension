import { useEffect, useState } from "react"

import { Storage } from "@plasmohq/storage"

import "./css.css"

import { CreateMLCEngine } from "~node_modules/@mlc-ai/web-llm/lib"

const storage = new Storage()

function IndexSidePanel() {
  const [result, setResult] = useState<any>([])
  const [modelLoadingProgress, setModelLoadingProgress] = useState<
    string | null
  >(null)

  useEffect(() => {
    const run = async () => {
      const engine = await CreateMLCEngine(
        "Qwen2.5-0.5B-Instruct-q4f16_1-MLC",
        {
          initProgressCallback: (p) =>
            setModelLoadingProgress(`${p.progress}% - ${p.text}`)
        }
      )

      storage.watch({
        PAGE_TEXT: async (pageText) => {
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
          ];
          //@ts-ignore
          const reply = await engine.chat.completions.create({ messages })
          setResult(reply.choices[0].message)
        }
      })
    }

    run()
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
