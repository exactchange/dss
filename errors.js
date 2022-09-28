module.exports = {
  BAD_REQUEST: {
    error: {
      code: 400,
      message: 'Bad request.'
    }
  },
  UNAUTHORIZED: {
    error: {
      code: 401,
      message: 'Unauthorized.'
    }
  },
  INVALID_TOKEN_ERROR: {
    error: {
      code: 401,
      message: 'Invalid token.'
    }
  },
  NOT_ALLOWED_ERROR: {
    error: {
      code: 403,
      message: 'Not allowed.'
    }
  },
  UNPROCESSABLE_REQUEST: {
    error: {
      code: 422,
      message: 'Malformed request payload.'
    }
  },
  SERVER_ERROR: {
    error: {
      code: 500,
      message: 'Server error.'
    }
  }
};
