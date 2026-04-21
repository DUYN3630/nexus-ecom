const crypto = require('crypto');
const https = require('https');

/**
 * Gửi yêu cầu HTTPS POST tới MoMo
 */
const sendRequest = (body) => {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const options = {
      hostname: 'test-payment.momo.vn',
      port: 443,
      path: '/v2/gateway/api/create',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
    };

    const req = https.request(options, (res) => {
      let raw = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => { raw += chunk; });
      res.on('end', () => {
        try { resolve(JSON.parse(raw)); } catch { resolve(raw); }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
};

/**
 * Tạo yêu cầu thanh toán MoMo
 */
const createPayment = async (orderId, amount, orderInfo = 'Thanh toán đơn hàng Nexus') => {
  const partnerCode = process.env.MOMO_PARTNER_CODE;
  const accessKey = process.env.MOMO_ACCESS_KEY;
  const secretKey = process.env.MOMO_SECRET_KEY;
  const redirectUrl = process.env.MOMO_REDIRECT_URL;
  const ipnUrl = process.env.MOMO_IPN_URL;
  const requestType = 'payWithMethod';

  // MoMo yêu cầu orderId phải duy nhất cho mỗi lần bấm nút thanh toán (kể cả thanh toán lại)
  // Ta dùng timestamp để đảm bảo tính duy nhất, DB orderId sẽ được lưu trong extraData
  const momoOrderId = `${partnerCode}${Date.now()}`;
  const requestId = momoOrderId;
  const extraData = Buffer.from(JSON.stringify({ orderId })).toString('base64');

  // Tạo chữ ký (Signature) - Tuân thủ thứ tự alphabet của MoMo
  const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${momoOrderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;

  const signature = crypto.createHmac('sha256', secretKey).update(rawSignature).digest('hex');

  const requestBody = {
    partnerCode, 
    partnerName: 'Nexus Store', 
    storeId: 'NexusMainStore',
    requestId, 
    amount, 
    orderId: momoOrderId, 
    orderInfo, 
    redirectUrl,
    ipnUrl, 
    lang: 'vi', 
    requestType, 
    autoCapture: true, 
    extraData, 
    signature
  };

  const result = await sendRequest(requestBody);
  if (result.resultCode !== 0) throw new Error(`MoMo Error: ${result.message}`);
  
  return {
    payUrl: result.payUrl,
    requestId,
    momoOrderId
  };
};

/**
 * Xác thực IPN (Webhook) từ MoMo gửi về
 */
const verifyIPN = (body) => {
  const secretKey = process.env.MOMO_SECRET_KEY;
  const accessKey = process.env.MOMO_ACCESS_KEY;
  const { 
    partnerCode, orderId, requestId, amount, orderInfo, 
    orderType, transId, resultCode, message, payType, 
    responseTime, extraData, signature 
  } = body;

  const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${partnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;
  
  const expected = crypto.createHmac('sha256', secretKey).update(rawSignature).digest('hex');
  return expected === signature;
};

module.exports = { createPayment, verifyIPN };
