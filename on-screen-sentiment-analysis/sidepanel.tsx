import { useEffect, useState } from "react"

import { Storage } from "@plasmohq/storage"

import "./css.css"

const storage = new Storage()

type SentimentResult = {
  label: string
  match: boolean | null
}[]

function IndexSidePanel() {
  const [result, setResult] = useState<any>([])

  useEffect(() => {
    storage.watch({
      PAGE_TEXT: (sentiment) => {
        setResult(sentiment.newValue)
      }
    })
  }, [])

  return (
    <div>
      <h1>Sentiment Analysis</h1>
      {result.length ? (
        <pre>{JSON.stringify(result, null, 2)}</pre>
      ) : (
        <p>No sentiment data available.</p>
      )}
    </div>
  )
}

export default IndexSidePanel
