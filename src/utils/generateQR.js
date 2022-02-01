const QRCode = require('qrcode');

const stringtoHex = (string) => {
  let stringToHex = '';
  if (string.length <= 0 || string.length >= 256) {
    throw new Error('input characters must be between 1 and 255');
  }
  for (let i = 0; i < string.length; i++) {
    stringToHex += string.charCodeAt(i).toString(16).toUpperCase();
  }
  return `${stringToHex}`.trim().toString();
};

const stringLengthtoHex = (string) => {
  if (string.length <= 0 || string.length >= 256) {
    throw new Error('input characters must be between 1 and 255');
  }
  const stringLength =
    string.length.toString(16).toUpperCase().length % 2 === 1
      ? `0${string.length.toString(16).toUpperCase()}`
      : string.length.toString(16).toUpperCase();

  return `${stringLength}`.trim().toString();
};

const generateTLVEncodeDataInHEX = (data) => {
  let i = 0;
  let hexString = '';
  for (const key in data) {
    hexString += `0${++i}${stringLengthtoHex(data[key])}${stringtoHex(data[key])}`;
  }
  return hexString;
};

const toASCII = (data) => {
  let str = '';
  for (let i = 0; i < data.length; i += 2) str += String.fromCharCode(parseInt(data.substr(i, 2), 16));
  return str;
};

const toBase64 = (data) => {
  return Buffer.from(data).toString('base64');
};

module.exports = async (data) => {
  try {
    return await QRCode.toDataURL(toBase64(toASCII(generateTLVEncodeDataInHEX(data))));
  } catch (err) {
    console.error(err);
  }
};
