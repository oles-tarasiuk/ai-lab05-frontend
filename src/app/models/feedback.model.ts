export interface WorkerInfo {
  id: number;
  username: string;
}

export interface CompletedOrder {
  id: number;
  description: string;
  startDateUtc: string;
  endDateUtc: string;
  workers: WorkerInfo[];
  hasFeedback: boolean;
}

export interface WorkerRatingDto {
  workerId: number;
  rating: number;
}

export interface CreateFeedback {
  orderId: number;
  rating: number;
  comment?: string;
  workerRatings: WorkerRatingDto[];
}

export interface Feedback {
  id: number;
  orderId: number;
  customerId: number;
  rating: number;
  comment?: string;
  createdAtUtc: string;
  workerRatings: WorkerRatingDto[];
}

export interface WorkerAverageRating {
  workerId: number;
  workerUsername: string;
  averageRating: number;
  totalRatings: number;
}

