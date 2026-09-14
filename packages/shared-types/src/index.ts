export type HealthResponse = {
  service: string;
  status: 'ok';
  timestamp: string;
};

export type ApiError = {
  message: string;
};
