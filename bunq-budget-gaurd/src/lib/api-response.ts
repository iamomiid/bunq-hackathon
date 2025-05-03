export class ApiError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
  }
}

export function handleApiResponse<T>(
  promise: Promise<T>
): Promise<{ data: T | null; error: string | null }> {
  return promise
    .then((data) => ({ data, error: null }))
    .catch((err) => {
      console.error(err);

      if (err instanceof ApiError) {
        return {
          data: null,
          error: err.message,
        };
      }

      return {
        data: null,
        error: err instanceof Error ? err.message : "An unknown error occurred",
      };
    });
}
