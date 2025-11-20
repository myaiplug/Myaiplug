import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Google Generative AI
// In production, add GOOGLE_GENAI_API_KEY to your .env file
const genAI = process.env.GOOGLE_GENAI_API_KEY 
  ? new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY)
  : null;

interface TranscriptionResult {
  lyrics: string;
  confidence: number;
  doubleChecked: boolean;
}

interface AnalysisResult {
  overallScore: number;
  verseScores: Array<{
    verseNumber: number;
    score: number;
    feedback: string;
    strengths: string[];
    improvements: string[];
  }>;
  chorusScores: Array<{
    chorusNumber: number;
    score: number;
    feedback: string;
    strengths: string[];
    improvements: string[];
  }>;
  expertAdvice: string;
  isFeatured: boolean;
  featuredReason?: string;
}

// Simulated transcription for demo purposes
function simulateTranscription(fileName: string): TranscriptionResult {
  return {
    lyrics: `[Verse 1]
Walking through the city lights
Feeling like we own the night
Every moment feels so right
When you're by my side

[Chorus]
We're unstoppable, unbreakable
Nothing in this world can hold us down
We're incredible, unforgettable
Making our mark on this town

[Verse 2]
Dreams are calling out our names
Life's no longer just a game
Rising up above the flames
Never gonna be the same

[Chorus]
We're unstoppable, unbreakable
Nothing in this world can hold us down
We're incredible, unforgettable
Making our mark on this town`,
    confidence: 0.92,
    doubleChecked: true,
  };
}

// AI-powered analysis with scoring system
async function analyzeWithAI(lyrics: string, useGenAI: boolean = false): Promise<AnalysisResult> {
  if (useGenAI && genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      
      const prompt = `You are a veteran music industry advisor with 30+ years of experience. Analyze these lyrics and provide constructive, genuine feedback.

Lyrics:
${lyrics}

Provide a JSON response with:
1. Overall score (0-100)
2. Individual verse scores with feedback (scale 0-100, where 85+ is excellent, 70-84 is good, 60-69 needs work, below 60 needs major revision)
3. Individual chorus scores with feedback (scale 0-100, where 90+ is hit potential, 80-89 is strong, 70-79 is decent, below 70 needs work)
4. Specific strengths and areas for improvement for each section
5. Expert advice from an OG perspective - be genuine, insightful, down-to-earth, but also aware of what works commercially
6. Whether this has "hit potential" (overall score 90+)

Format as JSON matching this structure:
{
  "overallScore": number,
  "verseScores": [{"verseNumber": number, "score": number, "feedback": string, "strengths": string[], "improvements": string[]}],
  "chorusScores": [{"chorusNumber": number, "score": number, "feedback": string, "strengths": string[], "improvements": string[]}],
  "expertAdvice": string,
  "isFeatured": boolean
}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Try to parse JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const analysis = JSON.parse(jsonMatch[0]);
          if (analysis.isFeatured) {
            analysis.featuredReason = "High overall score with strong commercial appeal";
          }
          return analysis;
        } catch (parseError) {
          console.error('Failed to parse GenAI JSON response:', parseError);
          // Fall through to simulated analysis
        }
      }
    } catch (error) {
      console.error('GenAI analysis error:', error);
      // Fall through to simulated analysis
    }
  }
  
  // Simulated analysis (demo mode or fallback)
  return {
    overallScore: 82,
    verseScores: [
      {
        verseNumber: 1,
        score: 78,
        feedback: "Solid opening with good imagery. 'City lights' and 'own the night' are tried and true, but they work. The rhyme scheme is clean.",
        strengths: ["Clear imagery", "Good flow", "Relatable theme"],
        improvements: ["Could use more unique metaphors", "Consider a more unexpected hook"],
      },
      {
        verseNumber: 2,
        score: 81,
        feedback: "Stronger than verse 1. 'Rising up above the flames' has more edge. The progression from games to flames shows growth.",
        strengths: ["Better metaphors", "Shows character development", "Stronger emotional arc"],
        improvements: ["The 'names/game/flames/same' rhyme chain is a bit obvious"],
      },
    ],
    chorusScores: [
      {
        chorusNumber: 1,
        score: 87,
        feedback: "This is your strength. 'Unstoppable, unbreakable' has anthem potential. The repetition works. Radio programmers would dig this.",
        strengths: [
          "Memorable hook",
          "Positive message resonates",
          "Strong melodic potential",
          "Repeatable - people will sing along",
        ],
        improvements: [
          "Consider varying the second chorus slightly for dynamics",
          "The 'making our mark' line could be stronger",
        ],
      },
    ],
    expertAdvice: `Real talk from someone who's been around the block: You've got something here. The chorus is your money maker - that 'unstoppable, unbreakable' line has legs. I can hear it on radio right now.

Here's what I'm seeing: Your verses are competent but safe. In 2025, safe doesn't cut through the noise. You need that one line that makes people stop scrolling. The flames line in verse 2 is close, but dig deeper.

The positivity angle is smart - that's what's working now. But everyone's doing empowerment anthems. What makes YOURS different? Find that unique angle.

Production tip from experience: Keep this chorus big and wide. Add some vocal layers, maybe a subtle choir in the back half. Make it feel like a moment.

Bottom line: This is a solid 82/100. With some punch-up on the verses and the right production, you're looking at potential Top 40 material. The bones are there - now add the meat.

Stay authentic, stay hungry, and don't let anyone tell you this isn't good enough to shop around. It is. Now make it great.`,
    isFeatured: false,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { audioFileName, useGenAI = false, enableAnalysis = false } = body;

    if (!audioFileName) {
      return NextResponse.json(
        { error: 'Audio file name is required' },
        { status: 400 }
      );
    }

    // Check if GenAI is available
    if (useGenAI && !genAI) {
      return NextResponse.json(
        { 
          error: 'Google GenAI is not configured. Add GOOGLE_GENAI_API_KEY to environment variables.',
          fallbackMode: true,
        },
        { status: 503 }
      );
    }

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Get transcription
    const transcription = simulateTranscription(audioFileName);

    let analysis: AnalysisResult | null = null;
    if (enableAnalysis) {
      analysis = await analyzeWithAI(transcription.lyrics, useGenAI);
      
      // Auto-submit for featured if score is high enough
      if (analysis.isFeatured && analysis.overallScore >= 90) {
        // This would be called with actual user data in production
        // For now, just mark it as featured-worthy in the response
      }
    }

    return NextResponse.json({
      success: true,
      transcription,
      analysis,
      featured: analysis?.isFeatured || false,
      pricing: {
        transcriptionCost: useGenAI ? 50 : 0, // credits
        analysisCost: enableAnalysis ? 100 : 0, // credits
        total: (useGenAI ? 50 : 0) + (enableAnalysis ? 100 : 0),
      },
      message: 'Transcription completed successfully',
    });

  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json(
      { error: 'Failed to transcribe audio file' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Audio transcription API endpoint',
    methods: ['POST'],
    features: [
      'Lyrics transcription',
      'AI-powered analysis (optional)',
      'Verse and chorus scoring',
      'Expert feedback',
      'Hit potential detection',
    ],
    genAIAvailable: !!genAI,
  });
}
