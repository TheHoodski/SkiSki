// client/src/utils/api.ts

const API_BASE_URL = 'http://localhost:3000/api';

// Types
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

export interface CrowdMetric {
  resort_id: string;
  timestamp: string;
  people_count: number;
  crowd_level: string;
  confidence: number;
}

// API functions
export async function fetchResorts(): Promise<Resort[]> {
  const response = await fetch(`${API_BASE_URL}/resorts`);
  if (!response.ok) {
    throw new Error('Failed to fetch resorts');
  }
  return response.json();
}

export async function fetchResortDetails(id: string): Promise<ResortDetails> {
  const response = await fetch(`${API_BASE_URL}/resorts/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch resort details');
  }
  return response.json();
}

export async function fetchMetrics(): Promise<CrowdMetric[]> {
  const response = await fetch(`${API_BASE_URL}/metrics`);
  if (!response.ok) {
    throw new Error('Failed to fetch metrics');
  }
  return response.json();
}

export async function fetchResortHistory(id: string, hours = 24): Promise<CrowdMetric[]> {
  const response = await fetch(`${API_BASE_URL}/metrics/resort/${id}/history?hours=${hours}`);
  if (!response.ok) {
    throw new Error('Failed to fetch resort history');
  }
  return response.json();
}