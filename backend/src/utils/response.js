const success = (res, { message = "OK", data = {}, status = 200 }) => {
  const code = status || 200;
  return res.status(code).json({ success: true, message, data });
};

const fail = (res, { message, status = 400, data }) => {
  const body = { success: false, message };
  if (data !== undefined) body.data = data;
  return res.status(status).json(body);
};

module.exports = { success, fail };
