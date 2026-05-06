// TODO: Implement API error envelope and helpers
export class ApiError extends Error {
  public status: number;
  public code?: string;
  public details?: any;
  constructor(status: number, message: string, code?: string, details?: any) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function toResponse(err: ApiError) {
  return {
    status: err.status || 500,
    body: {
      code: err.code || "internal_error",
      message: err.message,
      details: err.details || null,
    },
  };
}
