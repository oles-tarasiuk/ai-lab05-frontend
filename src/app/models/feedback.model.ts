export interface SubmitFeedbackRequest {
  orderId: number;
  rating: number; // 1..5
  comment?: string | null;
}

export interface Feedback {
  id: number;
  orderId: number;
  customerId: number;
  rating: number;
  comment?: string | null;
  createdAtUtc: string;
}

export interface WorkerAverageResponse {
  workerId: number;
  average: number;
  count: number;
}

export interface WorkerFeedbackItem {
  id: number;
  orderId: number;
  customerId: number;
  rating: number;
  comment?: string | null;
  createdAtUtc: string;
  workerRating: number;
}
