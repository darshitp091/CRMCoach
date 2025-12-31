import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || '');

// Use Gemini 1.5 Flash (FREE and fast)
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

export interface SessionSummaryInput {
  sessionTitle: string;
  clientName: string;
  sessionDate: string;
  sessionNotes?: string;
  sessionDuration?: number;
  sessionType?: string;
}

export interface SessionSummaryOutput {
  summary: string;
  keyPoints: string[];
  actionItems: string[];
  breakthroughs: string[];
  sentiment: 'positive' | 'neutral' | 'challenging';
  tags: string[];
}

/**
 * Generate AI-powered session summary using Gemini (FREE!)
 */
export async function generateSessionSummary(
  input: SessionSummaryInput
): Promise<SessionSummaryOutput> {
  try {
    const prompt = `You are an expert coaching assistant. Analyze this coaching session and provide a structured summary.

**Session Details:**
- Title: ${input.sessionTitle}
- Client: ${input.clientName}
- Date: ${input.sessionDate}
- Duration: ${input.sessionDuration ? `${input.sessionDuration} minutes` : 'Not specified'}
- Type: ${input.sessionType || 'General coaching'}

**Session Notes:**
${input.sessionNotes || 'No notes provided'}

**Instructions:**
Please provide a comprehensive analysis in the following JSON format (return ONLY valid JSON, no markdown):

{
  "summary": "A concise 2-3 sentence summary of the session",
  "keyPoints": ["List of 3-5 key discussion points or topics covered"],
  "actionItems": ["List of specific action items or commitments the client made"],
  "breakthroughs": ["Any significant insights, realizations, or breakthroughs"],
  "sentiment": "positive|neutral|challenging",
  "tags": ["Relevant tags like 'goal-setting', 'mindset', 'career', 'relationships', etc."]
}

Focus on being concise, actionable, and identifying patterns that would help track client progress over time.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract JSON from response (remove markdown code blocks if present)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not extract JSON from Gemini response');
    }

    const summary = JSON.parse(jsonMatch[0]) as SessionSummaryOutput;

    return summary;
  } catch (error: any) {
    console.error('Error generating session summary:', error);
    throw new Error(`Failed to generate session summary: ${error.message}`);
  }
}

export interface ChurnPredictionInput {
  clientId: string;
  clientName: string;
  sessionHistory: {
    date: string;
    attended: boolean;
    cancelled?: boolean;
    noShow?: boolean;
  }[];
  lastSessionDate: string;
  totalSessions: number;
  completedSessions: number;
  cancelledSessions: number;
  noShowSessions: number;
  emailEngagement?: {
    sent: number;
    opened: number;
    clicked: number;
  };
  programEnrollments?: number;
  paymentHistory?: {
    onTime: number;
    late: number;
    failed: number;
  };
}

export interface ChurnPredictionOutput {
  riskScore: number; // 0-100 (0 = low risk, 100 = high risk)
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  confidence: number; // 0-100
  reasons: string[];
  recommendations: string[];
  warningSignals: string[];
}

/**
 * Predict client churn risk using Gemini AI (FREE!)
 */
export async function predictChurnRisk(
  input: ChurnPredictionInput
): Promise<ChurnPredictionOutput> {
  try {
    const attendanceRate = input.totalSessions > 0
      ? (input.completedSessions / input.totalSessions) * 100
      : 0;

    const cancellationRate = input.totalSessions > 0
      ? (input.cancelledSessions / input.totalSessions) * 100
      : 0;

    const emailEngagementRate = input.emailEngagement && input.emailEngagement.sent > 0
      ? (input.emailEngagement.opened / input.emailEngagement.sent) * 100
      : null;

    const prompt = `You are an expert data analyst specializing in client retention for coaching businesses. Analyze this client's engagement data and predict their churn risk.

**Client Profile:**
- Name: ${input.clientName}
- Total Sessions: ${input.totalSessions}
- Completed Sessions: ${input.completedSessions}
- Cancelled Sessions: ${input.cancelledSessions}
- No-Show Sessions: ${input.noShowSessions}
- Attendance Rate: ${attendanceRate.toFixed(1)}%
- Cancellation Rate: ${cancellationRate.toFixed(1)}%
- Last Session: ${input.lastSessionDate}
${emailEngagementRate !== null ? `- Email Open Rate: ${emailEngagementRate.toFixed(1)}%` : ''}

**Recent Session History (last 10):**
${input.sessionHistory.slice(-10).map(s =>
  `- ${s.date}: ${s.attended ? 'Attended' : s.cancelled ? 'Cancelled' : s.noShow ? 'No-Show' : 'Scheduled'}`
).join('\n')}

**Instructions:**
Analyze the patterns and provide a churn risk assessment in the following JSON format (return ONLY valid JSON, no markdown):

{
  "riskScore": 0-100,
  "riskLevel": "low|medium|high|critical",
  "confidence": 0-100,
  "reasons": ["List of 2-4 specific reasons for this risk level"],
  "recommendations": ["List of 3-5 actionable recommendations to reduce churn"],
  "warningSignals": ["List of specific warning signals you identified"]
}

**Risk Level Guidelines:**
- Low (0-25): Highly engaged, consistent attendance
- Medium (26-50): Some concerning patterns but overall engaged
- High (51-75): Multiple red flags, intervention needed
- Critical (76-100): Imminent churn risk, immediate action required

Focus on actionable insights and specific patterns in the data.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not extract JSON from Gemini response');
    }

    const prediction = JSON.parse(jsonMatch[0]) as ChurnPredictionOutput;

    return prediction;
  } catch (error: any) {
    console.error('Error predicting churn risk:', error);
    throw new Error(`Failed to predict churn risk: ${error.message}`);
  }
}

export interface ClientInsightInput {
  clientName: string;
  clientGoals?: string[];
  sessionSummaries: string[];
  totalSessions: number;
  enrolledPrograms?: string[];
  recentActivity?: string;
}

export interface ClientInsightOutput {
  progressSummary: string;
  strengths: string[];
  challenges: string[];
  patterns: string[];
  nextSteps: string[];
  coachingRecommendations: string[];
}

/**
 * Generate AI insights about client progress and patterns (FREE!)
 */
export async function generateClientInsights(
  input: ClientInsightInput
): Promise<ClientInsightOutput> {
  try {
    const prompt = `You are an expert coaching analyst. Analyze this client's journey and provide actionable insights.

**Client Profile:**
- Name: ${input.clientName}
- Total Sessions: ${input.totalSessions}
${input.clientGoals ? `- Goals: ${input.clientGoals.join(', ')}` : ''}
${input.enrolledPrograms ? `- Programs: ${input.enrolledPrograms.join(', ')}` : ''}

**Recent Session Summaries:**
${input.sessionSummaries.slice(-5).map((s, i) => `${i + 1}. ${s}`).join('\n')}

**Instructions:**
Analyze the client's journey and identify patterns, progress, and opportunities. Provide insights in JSON format (return ONLY valid JSON, no markdown):

{
  "progressSummary": "2-3 sentence overview of client's overall progress",
  "strengths": ["3-4 key strengths or positive patterns"],
  "challenges": ["2-3 recurring challenges or obstacles"],
  "patterns": ["2-3 behavioral or thinking patterns you've identified"],
  "nextSteps": ["3-4 suggested next steps for the client"],
  "coachingRecommendations": ["2-3 recommendations for the coach's approach"]
}

Focus on identifying meaningful patterns across sessions and providing forward-looking guidance.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not extract JSON from Gemini response');
    }

    const insights = JSON.parse(jsonMatch[0]) as ClientInsightOutput;

    return insights;
  } catch (error: any) {
    console.error('Error generating client insights:', error);
    throw new Error(`Failed to generate client insights: ${error.message}`);
  }
}

/**
 * Check if Gemini API is configured
 */
export function isGeminiConfigured(): boolean {
  return !!process.env.GOOGLE_GEMINI_API_KEY;
}

/**
 * Estimate cost for AI operations
 * Gemini 1.5 Flash: FREE up to 15 requests/minute, 1500 requests/day
 * After free tier: $0.075 per 1M input tokens, $0.30 per 1M output tokens
 */
export function estimateAICost(operation: 'session_summary' | 'churn_prediction' | 'client_insights'): number {
  // FREE tier - no cost!
  // If you exceed free tier (unlikely for most users):
  const costs = {
    session_summary: 0, // FREE (was ₹0.50 with Claude)
    churn_prediction: 0, // FREE (was ₹0.42 with Claude)
    client_insights: 0, // FREE (was ₹0.58 with Claude)
  };

  return costs[operation];
}

/**
 * Get Gemini model info
 */
export function getModelInfo() {
  return {
    name: 'Gemini 1.5 Flash',
    provider: 'Google',
    pricing: 'FREE (up to 15 req/min, 1500 req/day)',
    features: [
      'Fast generation',
      'Long context window',
      'Multimodal support',
      'JSON mode',
    ],
    limits: {
      requestsPerMinute: 15,
      requestsPerDay: 1500,
      tokensPerRequest: 1000000, // 1M tokens context
    },
  };
}
