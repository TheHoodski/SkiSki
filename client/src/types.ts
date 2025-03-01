export interface Resort {
  resort_id: string;
  name: string;
  current_crowding: string;
  current_confidence?: number;
  base_cam_url: string;
  crowding_history?: Array<{
    timestamp: string;
    crowd_level: string;
    confidence: number;
  }>;
} 