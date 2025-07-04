const axios = require("axios");

const EMAIL = "sachithbalaka@gmail.com";
const NAME = "sachith balaka";
const ROLLNO = "22331a4403";
const ACCESS_CODE = "mUNQHe";
const CLIENT_ID = "52a6e3e8-6a00-49fe-8922-6dd96beb6646";
const CLIENT_SECRET = "JXDBFXwkAfUucknx";

const AUTH_URL = "http://20.144.56.144/evaluation-service/auth";
const LOGGING_URL = "http://20.144.56.144/evaluation-service/log";

const Log = async (stack, level, pack, message) => {
  try {
    const authRes = await axios.post(AUTH_URL, {
      email: EMAIL,
      name: NAME,
      rollNo: ROLLNO,
      accessCode: ACCESS_CODE,
      clientID: CLIENT_ID,
      clientSecret: CLIENT_SECRET
    });

    const token = authRes.data.access_token;
    if (!token) throw new Error("Token not received");

    await axios.post(
      LOGGING_URL,
      { stack, level, package: pack, message },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  } catch (err) {
    // Silent fail, no console.log allowed
  }
};

module.exports = Log;
