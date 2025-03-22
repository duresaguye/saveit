// app/api/summarize/route.ts
import { NextResponse } from "next/server";
import axios from "axios";
import * as cheerio from "cheerio";

export async function POST(req: Request) {
  const { url } = await req.json();

  if (!url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  try {
   
    const { data: webpageData } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 10000
    });

    const $ = cheerio.load(webpageData as string);
    const pageText = $('body').text()
      .replace(/\s+/g, ' ')
      .substring(0, 30000);

 
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
            systemInstruction: {
              parts: [{
                text: "You are a professional content analyst. Provide direct factual summaries and relevant tags without speculative language."
              }]
            },
            contents: [{
              parts: [{
                text: `Describe this content's actual content in 3-5 direct sentences, followed by 5 comma-separated tags. Format:
                Summary: [Direct description of content]
                Tags: [tag1, tag2, tag3, tag4, tag5]
                
                Content: ${pageText}`
              }]
            }]
          }),
      }
    );

    if (!geminiResponse.ok) {
      const errorData = await geminiResponse.json();
      throw new Error(`Gemini API Error: ${errorData.error?.message}`);
    }

    const data = await geminiResponse.json();
    const resultText = data.candidates[0].content.parts[0].text;
    const [summarySection, tagsSection] = resultText.split(/(Tags?:)/i);
    const summary = summarySection.replace(/^\d+\.?\s*/gm, '').trim();
    interface GeminiResponse {
        candidates: {
            content: {
                parts: {
                    text: string;
                }[];
            };
        }[];
    }

    const tags: string[] = tagsSection 
        ? tagsSection.replace(/(Tags?:)/i, '') 
            .split(',')
            .map((t: string): string => t.trim().replace(/[^a-zA-Z0-9 ]/g, ''))
            .filter((t: string): boolean => t.length > 0)
            .slice(0, 5)
        : [];
    
    return NextResponse.json({ summary, tags });

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to generate summary" },
      { status: 500 }
    );
  }
}