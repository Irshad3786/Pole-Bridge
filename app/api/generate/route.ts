import { NextResponse } from "next/server";
import Groq from "groq-sdk";




const apiKey = process.env.googleSec;
const groq = new Groq({
  apiKey: apiKey ?? "",
});

export async function POST(req: Request) {
  try {
    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing GROQ API key (googleSec)" },
        { status: 500 }
      );
    }

    let input: unknown;
    try {
      const body = await req.json();
      input = (body as { input?: unknown })?.input;
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    if (typeof input !== "string" || input.trim().length === 0) {
      return NextResponse.json(
        { error: "'input' must be a non-empty string" },
        { status: 400 }
      );
    }

   const prompt = `
User input:
"${input}"

TASK:
1. Understand the topic or subject the user wants to create a poll/survey about
2. Generate exactly 1 relevant and meaningful poll question based on the topic
3. Provide 4 multiple choice options for that question
4. Make the question clear, unbiased, and easy to understand
5. Ensure options are diverse and cover different perspectives

QUESTION RULES:
- Generate exactly 1 question related to the topic
- The question should be clear and specific
- The question should be neutral and unbiased
- Avoid yes/no questions when possible - provide nuanced options

OPTION RULES:
- Each question must have exactly 4 options
- Options should be mutually exclusive
- Options should cover a good range of possible answers
- Keep options concise (2-8 words each)
- Order options logically (e.g., scale from low to high, or alphabetically)

OUTPUT RULES:
- Return ONLY valid JSON
- No explanations
- No markdown
- No code blocks

Return JSON in EXACTLY this format:
{
  "title": "Brief poll title (3-6 words)",
  "description": "Short description of the poll purpose (1-2 sentences)",
  "questions": [
    {
      "question": "Question text here?",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"]
    }
  ]
}
`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      response_format: { type: "json_object" } as any,
    });

    const raw = completion.choices?.[0]?.message?.content ?? "";
    if (!raw || typeof raw !== "string") {
      return NextResponse.json(
        { error: "Empty response from model" },
        { status: 502 }
      );
    }

    const extractCandidate = (text: string): string => {
      let cleaned = text.replace(/```[\s\S]*?```/g, (block) => {
        const s = block.indexOf("{");
        const e = block.lastIndexOf("}");
        return s !== -1 && e !== -1 ? block.slice(s, e + 1) : "";
      });
      const start = cleaned.indexOf("{");
      const end = cleaned.lastIndexOf("}");
      return start !== -1 && end !== -1 ? cleaned.slice(start, end + 1) : cleaned;
    };

    const sanitizeKeys = (jsonish: string): string => {
      let out = jsonish.replace(/(^|[\s,{])(title|description|questions|question|options)\s*:/g, (m) => {
        return m.replace(/(title|description|questions|question|options)\s*:/, '"$1":');
      });
      out = out.replace(/\"(title|description|questions|question|options)\"\s*:\s*'([^']*)'/g, '"$1":"$2"');
      out = out.replace(/,(\s*[}\]])/g, '$1');
      return out;
    };

    const candidate = sanitizeKeys(extractCandidate(raw));

    let parsed: unknown;
    try {
      parsed = JSON.parse(candidate);
    } catch (e) {
      return NextResponse.json(
        { error: "Model returned invalid JSON", raw, candidate, details: (e as Error).message },
        { status: 502 }
      );
    }

    const result = parsed as { 
      title?: string; 
      description?: string; 
      questions?: Array<{ question: string; options: string[] }> 
    };
    if (
      !result || 
      typeof result.title !== "string" || 
      typeof result.description !== "string" || 
      !Array.isArray(result.questions) ||
      result.questions.length === 0
    ) {
      return NextResponse.json(
        { error: "Parsed JSON missing required fields", raw, candidate },
        { status: 502 }
      );
    }

    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "Unexpected server error", details: (err as Error).message },
      { status: 500 }
    );
  }
}