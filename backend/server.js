const express = require('express')
const cors = require('cors')
const Groq = require('groq-sdk')
const multer = require('multer')
const pdfParse = require('pdf-parse')
const mammoth = require('mammoth')
require('dotenv').config()

const app = express()
app.use(cors())
app.use(express.json())

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
const upload = multer({ storage: multer.memoryStorage() })

async function analyzeWithAI(text) {
  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: 'You are an educational content analysis system. You must always respond with ONLY a raw JSON object. No markdown, no backticks, no explanation. Just the JSON object.'
      },
      {
        role: 'user',
        content: `Analyze this educational text and return ONLY a JSON object with these exact keys:

{
  "domain": "one of: STEM, Humanities, Social Sciences",
  "subject": "specific subject name like Physics, Biology, History, Math, etc",
  "difficulty": "one of: Beginner, Intermediate, Advanced",
  "suitableFor": "one of: Elementary School, Middle School, High School, University",
  "summary": "write 2-3 sentences summarizing the content",
  "recommendations": "write 2-3 sentences on how educators can use this material"
}

Text to analyze:
${text.slice(0, 2000)}`
      }
    ],
    max_tokens: 1024,
    temperature: 0.1
  })

  const raw = completion.choices[0].message.content.trim()
  console.log('AI raw response:', raw)

  const match = raw.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('No JSON found in response')

  const parsed = JSON.parse(match[0])

  return {
    domain: parsed.domain || 'Unknown',
    subject: parsed.subject || 'Unknown',
    difficulty: parsed.difficulty || 'Unknown',
    suitableFor: parsed.suitableFor || 'Unknown',
    summary: parsed.summary || 'No summary available',
    recommendations: parsed.recommendations || 'No recommendations available'
  }
}

app.post('/analyze', async (req, res) => {
  const { text } = req.body
  if (!text) return res.status(400).json({ error: 'No text provided' })
  try {
    const result = await analyzeWithAI(text)
    res.json(result)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Analysis failed', details: e.message })
  }
})

app.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' })

  try {
    let text = ''
    const originalname = req.file.originalname.toLowerCase()

    if (originalname.endsWith('.pdf')) {
      const data = await pdfParse(req.file.buffer)
      text = data.text
      console.log('PDF content:', text.slice(0, 200))
    } else if (originalname.endsWith('.docx')) {
      const data = await mammoth.extractRawText({ buffer: req.file.buffer })
      text = data.value
      console.log('DOCX content:', text.slice(0, 200))
    } else if (originalname.endsWith('.txt')) {
      text = req.file.buffer.toString('utf-8').trim()
      console.log('TXT content:', text.slice(0, 200))
    } else {
      return res.status(400).json({ error: 'Unsupported file type. Use PDF, DOCX, or TXT' })
    }

    if (!text.trim()) return res.status(400).json({ error: 'Could not extract text from file' })

    const result = await analyzeWithAI(text)
    res.json(result)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'File analysis failed', details: e.message })
  }
})

app.listen(3001, () => console.log('✅ EduCAS backend running on port 3001'))