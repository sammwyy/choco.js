export class HTTPError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

export class BadRequestError extends HTTPError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class UnauthorizedError extends HTTPError {
  constructor(message: string) {
    super(message, 401);
  }
}

export class ForbiddenError extends HTTPError {
  constructor(message: string) {
    super(message, 403);
  }
}

export class NotFoundError extends HTTPError {
  constructor(message: string) {
    super(message, 404);
  }
}

export class MethodNotAllowedError extends HTTPError {
  constructor(message: string) {
    super(message, 405);
  }
}

export class ConflictError extends HTTPError {
  constructor(message: string) {
    super(message, 409);
  }
}

export class InternalServerError extends HTTPError {
  constructor(message: string) {
    super(message, 500);
  }
}

export class NotImplementedError extends HTTPError {
  constructor(message: string) {
    super(message, 501);
  }
}

export class ServiceUnavailableError extends HTTPError {
  constructor(message: string) {
    super(message, 503);
  }
}

export class GatewayTimeoutError extends HTTPError {
  constructor(message: string) {
    super(message, 504);
  }
}
