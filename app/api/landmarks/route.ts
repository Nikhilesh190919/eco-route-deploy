import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Get famous landmarks for a U.S. state or city
 * Returns an array of landmark names for image searching
 */
const landmarks: Record<string, string[]> = {
  'california': ['Yosemite National Park', 'Big Sur', 'Napa Valley'],
  'texas': ['Alamo', 'Big Bend National Park', 'San Antonio River Walk'],
  'new york': ['Niagara Falls', 'Adirondack Mountains', 'Finger Lakes'],
  'florida': ['Everglades', 'Key West', 'Disney World'],
  'colorado': ['Rocky Mountain National Park', 'Garden of the Gods', 'Aspen'],
  'arizona': ['Grand Canyon', 'Sedona', 'Antelope Canyon'],
  'utah': ['Arches National Park', 'Zion National Park', 'Bryce Canyon'],
  'nevada': ['Hoover Dam', 'Lake Tahoe', 'Valley of Fire'],
  'oregon': ['Crater Lake', 'Columbia River Gorge', 'Cannon Beach'],
  'washington': ['Mount Rainier', 'Space Needle', 'Olympic National Park'],
};

/**
 * GET /api/landmarks?location=california
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const location = searchParams.get('location')?.trim().toLowerCase();

    if (!location) {
      return NextResponse.json(
        { error: 'Location is required' },
        { status: 400 }
      );
    }

    // If we have predefined landmarks, use those
    if (landmarks[location]) {
      return NextResponse.json({
        location,
        landmarks: landmarks[location],
        source: 'local-database',
      });
    }

    // Otherwise fallback to AI suggestion
    const prompt = `List three famous landmarks in ${location}. Only return a simple list.`;

    const ai = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 50,
    });

    const aiText = ai.choices[0].message.content || '';

    const aiLandmarks = aiText
      .split('\n')
      .map(l => l.replace(/^\d+\.\s*/, '').trim())
      .filter(Boolean);

    return NextResponse.json({
      location,
      landmarks: aiLandmarks,
      source: 'openai',
    });

  } catch (err) {
    console.error('Landmarks API error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch landmarks' },
      { status: 500 }
    );
  }
}

