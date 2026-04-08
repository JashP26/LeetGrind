export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface UserPublic {
  id: number;
  username: string;
  leetcode_username: string | null;
  created_at: string;
}

export interface UserStats {
  user_id: number;
  username: string;
  total_problems_solved: number;
  total_hours_spent: number;
  current_activity_streak: number;
  current_daily_problem_streak: number;
  solved_by_difficulty: Record<string, number>;
}

export interface LeetCodeSnapshotResponse {
  snapshot_date: string;
  total_solved: number;
  easy_solved: number;
  medium_solved: number;
  hard_solved: number;
}

export interface ProgressPublic {
  id: number;
  user_id: number;
  entry_date: string;
  problem_difficulty: string | null;
  problems_solved: number;
  hours_spent: number;
  did_daily_problem: boolean;
  created_at: string;
}

export interface ProgressCheckInRequest {
  entry_date?: string;
  problem_difficulty?: "easy" | "medium" | "hard";
  problems_solved: number;
  hours_spent: number;
  did_daily_problem: boolean;
}

export interface GroupPublic {
  id: number;
  name: string;
  owner_id: number;
  created_at: string;
}

export interface GroupStats {
  group_id: number;
  group_name: string;
  group_daily_problem_streak: number;
  member_count: number;
  leaderboard: UserStats[];
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  total_problems_solved: number;
  current_activity_streak: number;
  current_daily_problem_streak: number;
}

export interface MessageResponse {
  message: string;
}