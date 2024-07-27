const successJSONResponse = (data) => {
  const response = {
    Code: 200,
    Status: "Success",
    Message: "Vailed request",
    accessToken: data,
  };

  return JSON.stringify(response);
};

const failedJSONResponse = (message = "Username/Email or password is wrong!") => {
  const response = {
    Code: 400,
    Status: "User error",
    ErrorCode: "772011x",
    Message: message,
  };
  return JSON.stringify(response);
};

const customJSONResponse = (code, status, errorCode, message, data = null) => {
  const response = {
    Code: code,
    Status: status,
    ErrorCode: errorCode,
    Message: message,
    Data: data
  };
  return JSON.stringify(response);
};

function setInvalidTokenResponse(res) {
  // Set error 401 (Unauthorized) if the request
  // from the user doesnt have authorization header
  console.log('Setting header for no token provided with code 401')
  res.writeHead(401, { "Content-Type": "application/json" });

  res.end(failedJSONResponse('Access Denied. No token provided.'));
}

module.exports = {
  successJSONResponse,
  failedJSONResponse,
  customJSONResponse,
  setInvalidTokenResponse
};
