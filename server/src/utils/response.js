// Sends a successful response with custom data and status (default 200)
export const ok = (res, data = {}, status = 200) =>
  res.status(status).json({ success: true, data });

// Sends a failure response with error message and status (default 400)
export const fail = (res, message = 'Bad Request', status = 400) =>
  res.status(status).json({ success: false, error: { message } });
