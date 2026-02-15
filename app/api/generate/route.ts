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
1. Extract the recipient email address (if present)
2. Understand the intent and purpose of the email from the user input
3. Generate a clear, professional email subject
4. Write a well-structured plain text email body based on the intent
5. Design a modern, clean EMAIL using ONLY HTML with INLINE CSS
6. The EMAIL DESIGN must visually match the written body content
7. The SAME HTML must be usable:
   - for website preview
   - for sending the actual email

DESIGN RULES:
- Use ONLY plain HTML with INLINE CSS
- NO Tailwind CSS
- NO <style> tags
- Use table-based layout (email-client safe)
- No JavaScript
- No external fonts, images, or assets
- Professional and minimal UI
- Use sections like header, content block, divider, footer
- Optional visual elements: dividers or simple progress/skill bars using divs

CONTENT RULES:
- Subject must match the email intent
- Body must be human, natural, and professional
- Do NOT hardcode job-related content unless required by the input

OUTPUT RULES:
- Return ONLY valid JSON
- No explanations
- No markdown

Return JSON in EXACTLY this format:
{
  "email": "",
  "subject": "",
  "body": "",
  "email_html": ""
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
      let out = jsonish.replace(/(^|[\s,{])(email|subject|body)\s*:/g, (m) => {
        return m.replace(/(email|subject|body)\s*:/, '"$1":');
      });
      out = out.replace(/\"(email|subject|body)\"\s*:\s*'([^']*)'/g, '"$1":"$2"');
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

    const result = parsed as { email?: string; subject?: string; body?: string };
    if (!result || typeof result.email !== "string" || typeof result.subject !== "string" || typeof result.body !== "string") {
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