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
}