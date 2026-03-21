export interface SubtitleWord {
  text: string;
  startMs: number; // ms relative to clip start
  endMs: number;
}

export interface OutputClipProps {
  id: string;
  title: string;
  videoUrl: string;
  viralScore: number;
  duration: string;
  caption?: string;
  platform?: string;
  startTime?: number;
  endTime?: number;
  clipKey?: string;
  subtitleWords?: SubtitleWord[];
}