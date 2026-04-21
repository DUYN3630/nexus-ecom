require('dotenv').config({ path: __dirname + '/.env' });
const mongoose = require('mongoose');
const Order = require('./models/Order');
const User = require('./models/User');
const Product = require('./models/Product');

const seedOrders = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Kết nối MongoDB thành công để seed đơn hàng.");

    // --- Xóa các đơn hàng mẫu cũ để tránh trùng lặp ---
    await Order.deleteMany({ 'customer.email': 'seed.user@example.com' });
    console.log("🧹 Đã xóa các đơn hàng mẫu cũ.");

    // --- Lấy dữ liệu cần thiết ---
    // 1. Lấy một admin user để gán cho đơn hàng
    let user = await User.findOne({ email: 'admin@nexus.com' }); 
    if (!user) {
        console.log("Không tìm thấy user admin@nexus.com. Đang thử tìm user bất kỳ...");
        user = await User.findOne();
    }
    if (!user) {
      throw new Error("Không có user nào trong database để gán cho đơn hàng. Hãy tạo một user trước.");
    }
    console.log(`👤 Sử dụng user: ${user.name} (${user.email})`);

    // 2. Lấy 2 sản phẩm bất kỳ
    const products = await Product.find().limit(2);
    if (products.length < 2) {
      throw new Error("Cần ít nhất 2 sản phẩm trong database để tạo đơn hàng mẫu.");
    }
    console.log(`📦 Sử dụng ${products.length} sản phẩm.`);

    // --- Tạo đơn hàng mẫu ---
    const orderItems = products.map(p => ({
      productId: p._id.toString(),
      name: p.name,
      quantity: 1,
      price: p.discountPrice > 0 ? p.discountPrice : p.price,
      image: p.images[0] || ''
    }));

    const totalAmount = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Tạo một order number duy nhất
    const orderNumber = `NEXUS-${Date.now()}`;

    const newOrder = new Order({
      orderNumber,
      customer: {
        name: user.name,
        email: 'seed.user@example.com', // Dùng email giả để dễ xóa
        phone: '0123456789',
        address: '123 Dinh Bo Linh, Binh Thanh, HCMC',
        avatar: user.avatar || ''
      },
      items: orderItems,
      totalAmount,
      deliveryStatus: 'Processing',
      paymentMethod: 'Credit Card',
      isPaid: true,
      isDeleted: false,
      auditLogs: [{
        action: 'Khởi tạo',
        detail: 'Đơn hàng được tạo tự động bởi seed script.',
        user: user._id.toString(),
        time: new Date()
      }]
    });

    await newOrder.save();
    console.log("✅ Đã tạo đơn hàng mẫu thành công!");
    console.log(`- Order Number: ${newOrder.orderNumber}`);
    console.log(`- Total: ${newOrder.totalAmount}`);

  } catch (error) {
    console.error("❌ Lỗi khi seed đơn hàng:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Đã ngắt kết nối MongoDB.");
  }
};

seedOrders();
