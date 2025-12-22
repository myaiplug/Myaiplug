/**
 * API client for audio splitting
 * PHASE 3: Landing page audio separation
 */

export interface SplitAudioResponse {
  success: boolean;
  vocals?: Blob;
  instrumental?: Blob;
  error?: string;
  upgradeUrl?: string;
  tier?: string;
  remainingUsage?: number;
}

/**
 * Split audio file into vocals and instrumental
 * @param audioFile - Audio file to split
 * @returns Split audio result with vocals and instrumental blobs
 */
export async function splitAudio(audioFile: File): Promise<SplitAudioResponse> {
  try {
    const formData = new FormData();
    formData.append('audio', audioFile);
    formData.append('format', 'wav');
    formData.append('normalize', 'true');

    const response = await fetch('/api/audio/separate', {
      method: 'POST',
      body: formData,
    });

    // Handle rate limiting (429)
    if (response.status === 429) {
      const data = await response.json();
      return {
        success: false,
        error: data.error || 'Daily limit reached',
        upgradeUrl: data.upgradeUrl || '/pricing',
        tier: data.tier,
        remainingUsage: data.remainingUsage,
      };
    }

    // Handle other errors
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      return {
        success: false,
        error: data.error || `Failed to split audio: ${response.statusText}`,
      };
    }

    // Success - parse response
    // Note: The actual API might return JSON with URLs or base64
    // For this implementation, we'll handle the response appropriately
    const data = await response.json();
    
    // If the API returns URLs, convert them to blobs
    if (data.vocals && data.instrumental) {
      // Assuming the API returns URLs or base64 data
      // This is a placeholder - adjust based on actual API response
      return {
        success: true,
        vocals: data.vocals instanceof Blob ? data.vocals : new Blob([]),
        instrumental: data.instrumental instanceof Blob ? data.instrumental : new Blob([]),
      };
    }

    return {
      success: false,
      error: 'Invalid response format from server',
    };
  } catch (error) {
    console.error('[SplitAudio] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error occurred',
    };
  }
}

/**
 * Demo mode: Simulate split for landing page
 * Uses pre-separated audio files from /public
 */
export async function splitAudioDemo(): Promise<SplitAudioResponse> {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Fetch pre-separated audio files
    const [vocalsResponse, instrumentalResponse] = await Promise.all([
      fetch('/audio/landing-demo-vocals.mp3'),
      fetch('/audio/landing-demo-instrumental.mp3'),
    ]);

    if (!vocalsResponse.ok || !instrumentalResponse.ok) {
      throw new Error('Failed to load demo audio files');
    }

    const vocals = await vocalsResponse.blob();
    const instrumental = await instrumentalResponse.blob();

    return {
      success: true,
      vocals,
      instrumental,
    };
  } catch (error) {
    console.error('[SplitAudioDemo] Error:', error);
    return {
      success: false,
      error: 'Failed to load demo audio. Please check that demo files exist in /public/audio/',
    };
  }
}
