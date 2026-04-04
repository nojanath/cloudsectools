export interface Tool {
  name: string;
  repo: string;
  stars: number;
  last_commit: string;
  language: string;
  description: string;
  tags: string[];
}

export interface ToolWithBadge extends Tool {
  badge: { text: string; color: string };
  formattedDate: string;
  formattedStars: string;
}

export interface PieSlice {
  label: string;
  value: number;
  color: string;
  path: string;
}
