import { GoogleGenerativeAI } from '@google/generative-ai'

const apiKey = process.env.GEMINI_API_KEY || ''
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null

export interface AISummaryResult {
  summary: string
  actionItems: {
    title: string
    description: string
    assigneeEmail?: string | null
  }[]
}

export async function generateMeetingSummary(minutesText: string): Promise<AISummaryResult> {
  if (!genAI) {
    return {
      summary: "AI summarization unavailable. GEMINI_API_KEY environment variable is not set.",
      actionItems: []
    }
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    const prompt = `
      You are the AI Scribe Assistant for GovernMINT, a committee and meeting management system.
      Given the following raw meeting minutes, generate a structured, professional summary and parse any action items.

      Raw Meeting Minutes:
      """
      ${minutesText}
      """

      Format your response strictly as a JSON object matching this structure:
      {
        "summary": "Detailed executive summary paragraph...",
        "actionItems": [
          {
            "title": "Short title of the task",
            "description": "Details about what needs to be done",
            "assigneeEmail": "email@example.com (if specific attendee email is mentioned in the text, otherwise omit or null)"
          }
        ]
      }
      Do not wrap the JSON in markdown blocks. Return only raw JSON string.
    `

    const response = await model.generateContent(prompt)
    const text = response.response.text().trim()
    
    // Quick sanitization if LLM wrapped in markdown
    const jsonStr = text.replace(/^```json\s*/i, '').replace(/```$/, '').trim()
    return JSON.parse(jsonStr) as AISummaryResult
  } catch (error) {
    console.error("Gemini AI API Call failed:", error)
    return {
      summary: "Error occurred during AI summary generation.",
      actionItems: []
    }
  }
}
