// client/src/types/resort.ts

export interface Resort {
    resort_id: string;
    name: string;
    base_cam_url: string;
    location?: string;
    current_crowding?: string;
    current_confidence?: number;
  }
  
  export interface ResortDetails extends Resort {
    crowding_history: {
      timestamp: string;
      crowd_level: string;
      confidence: number;
    }[];
  }