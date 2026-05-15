const nodemailer = require('nodemailer');
const admin = require('firebase-admin');

// Cấu hình Nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const notificationService = {
  // 1. Gửi Email
  sendEmail: async (to, subject, html) => {
    try {
      const info = await transporter.sendMail({
        from: `"Nexus Store" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
      });
      console.log(`--- [NOTIFICATION] Email sent to ${to}: ${info.messageId} ---`);
      return info;
    } catch (error) {
      console.error('--- [ERROR] sendEmail Failed ---', error.message);
    }
  },

  // 2. Gửi Push Notification (FCM)
  sendNotification: async (token, title, body, data = {}) => {
    if (!token) return;
    try {
      const message = {
        notification: { title, body },
        data,
        token,
      };
      const response = await admin.messaging().send(message);
      console.log('--- [NOTIFICATION] FCM sent successfully:', response);
      return response;
    } catch (error) {
      console.error('--- [ERROR] sendNotification Failed ---', error.message);
    }
  },

  // 3. Thông báo cho Expert khi có đơn sửa chữa mới
  notifyExpertNewRepair: async (expert, repair) => {
    // Thông báo qua Email
    if (expert.email) {
      const html = `
        <h1>Yêu cầu sửa chữa mới</h1>
        <p>Chào <b>${expert.name}</b>,</p>
        <p>Bạn có một yêu cầu sửa chữa mới từ khách hàng.</p>
        <ul>
          <li>Mã đơn: <b>${repair.ticketNumber}</b></li>
          <li>Thiết bị: ${repair.deviceType}</li>
          <li>Mô tả: ${repair.description}</li>
        </ul>
        <p>Vui lòng đăng nhập vào trang quản trị để xử lý.</p>
      `;
      await notificationService.sendEmail(expert.email, 'Nexus Service - Yêu cầu sửa chữa mới', html);
    }
    // FCM (Nếu expert có lưu token)
    if (expert.fcmToken) {
      await notificationService.sendNotification(
        expert.fcmToken,
        'Yêu cầu sửa chữa mới',
        `Đơn ${repair.ticketNumber}: ${repair.deviceType}`
      );
    }
  },

  // 3b. Thông báo cho Khách hàng khi có đơn sửa chữa mới
  notifyNewRepair: async (userEmail, repair) => {
    const html = `
      <h1>Xác nhận yêu cầu sửa chữa</h1>
      <p>Chào bạn,</p>
      <p>Chúng tôi đã nhận được yêu cầu sửa chữa thiết bị <b>${repair.deviceType}</b> của bạn.</p>
      <ul>
        <li>Mã đơn: <b>${repair.ticketNumber}</b></li>
        <li>Mô tả: ${repair.description}</li>
      </ul>
      <p>Chúng tôi sẽ liên hệ lại với bạn sớm nhất có thể.</p>
    `;
    await notificationService.sendEmail(userEmail, 'Nexus Service - Xác nhận yêu cầu sửa chữa', html);
  },

  // 4. Thông báo cho Khách hàng khi báo giá sẵn sàng
  notifyQuotationReady: async (userEmail, repair) => {
    const html = `
      <h1>Báo giá sửa chữa đã sẵn sàng</h1>
      <p>Chào bạn,</p>
      <p>Kỹ thuật viên đã kiểm tra thiết bị <b>${repair.deviceType}</b> của bạn và đưa ra báo giá.</p>
      <p>Chi phí dự kiến: <b>${repair.estimatedCost.toLocaleString()} VNĐ</b></p>
      <p>Vui lòng truy cập trang cá nhân để xem chi tiết và xác nhận để chúng tôi bắt đầu sửa chữa.</p>
    `;
    await notificationService.sendEmail(userEmail, 'Nexus Service - Báo giá sửa chữa', html);
  },

  // 5. Thông báo cho Khách hàng khi máy sửa xong
  notifyRepairDone: async (userEmail, repair) => {
    const html = `
      <h1>Thiết bị của bạn đã được sửa xong</h1>
      <p>Chào bạn,</p>
      <p>Thiết bị <b>${repair.deviceType}</b> (Mã đơn: ${repair.ticketNumber}) đã được sửa xong và đang chờ bàn giao.</p>
      <p>Vui lòng tiến hành thanh toán trực tuyến trên hệ thống hoặc tại cửa hàng để nhận máy.</p>
      <p>Trân trọng cảm ơn!</p>
    `;
    await notificationService.sendEmail(userEmail, 'Nexus Service - Thiết bị đã sửa xong', html);
  },

  // 6. Thông báo hóa đơn điện tử
  notifyInvoiceCreated: async (userEmail, invoice) => {
    const link = `http://localhost:5173/invoice/${invoice.invoiceNumber}`;
    const html = `
      <h1>Thanh toán thành công & Hóa đơn điện tử</h1>
      <p>Chào bạn,</p>
      <p>Cảm ơn bạn đã sử dụng dịch vụ tại Nexus Store.</p>
      <p>Thanh toán cho hóa đơn <b>${invoice.invoiceNumber}</b> đã được xác nhận thành công.</p>
      <p>Bạn có thể xem và tải hóa đơn điện tử tại liên kết sau:</p>
      <p><a href="${link}" style="display:inline-block;padding:10px 20px;background:#000;color:#fff;text-decoration:none;border-radius:5px;">Xem Hóa đơn</a></p>
      <p>Trân trọng cảm ơn!</p>
    `;
    await notificationService.sendEmail(userEmail, 'Nexus Service - Hóa đơn điện tử', html);
  }
};

module.exports = notificationService;
