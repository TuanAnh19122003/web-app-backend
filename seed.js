/**
 * ⚠️ CHỈ CHẠY FILE NÀY TRONG MÔI TRƯỜNG DEVELOPMENT
 * Lệnh chạy: NODE_ENV=development node seed.js
 */
require('dotenv').config();

// Kiểm tra môi trường để tránh xóa nhầm dữ liệu thật
if (process.env.NODE_ENV === 'production') {
    console.error('❌ CẢNH BÁO: Không được chạy seed trên production vì sẽ mất dữ liệu!');
    process.exit(1);
}

const sequelize = require('./src/config/database');
const { faker } = require('@faker-js/faker');

// Import Models
const Role = require('./src/models/role.model');
const User = require('./src/models/user.model');
const Category = require('./src/models/category.model');
const Discount = require('./src/models/discount.model');
const Product = require('./src/models/product.model');
const Size = require('./src/models/size.model');
const ProductSize = require('./src/models/product_size.model');
const Cart = require('./src/models/cart.model');
const CartItem = require('./src/models/cartItem.model');
const Order = require('./src/models/order.model');
const OrderItem = require('./src/models/orderItem.model');
const Contact = require('./src/models/contact.model');

// --- DATA MAPPING CHO ẢNH SẢN PHẨM ---
const productImages = {
    // Cà phê
    'Cà phê đen đá': 'https://images.unsplash.com/photo-1541167760496-162955ed8a9f?q=80&w=500',
    'Cà phê sữa đá': 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?q=80&w=500',
    'Bạc xỉu': 'https://images.unsplash.com/photo-1594132220612-d469179bc95a?q=80&w=500',
    'Latte': 'https://images.unsplash.com/photo-1536939459926-301728717817?q=80&w=500',
    'Cappuccino': 'https://images.unsplash.com/photo-1534778101976-62847782c213?q=80&w=500',
    'Cà phê muối': 'https://images.unsplash.com/photo-1512568448817-79a07a73b7e6?q=80&w=500',
    'Espresso': 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?q=80&w=500',
    'Americano': 'https://images.unsplash.com/photo-1551033406-611cf9a28f67?q=80&w=500',
    'Cà phê trứng': 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=500',
    'Cold Brew': 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?q=80&w=500',
    // Trà
    'Trà đào cam sả': 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?q=80&w=500',
    'Trà vải thạch đào': 'https://images.unsplash.com/photo-1558160074-4d7d8bdf4256?q=80&w=500',
    'Trà sen vàng': 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=500',
    'Trà xanh Nhật Bản': 'https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?q=80&w=500',
    'Trà oolong sen': 'https://images.unsplash.com/photo-1597318181409-cf64d0b5d8a2?q=80&w=500',
    'Trà hoa cúc mật ong': 'https://images.unsplash.com/photo-1506368249639-73a05d6f6488?q=80&w=500',
    'Trà dâu tằm': 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=500',
    // Trà sữa
    'Trà sữa trân châu đường đen': 'https://images.unsplash.com/photo-1576092762791-dd9e2220abd1?q=80&w=500',
    'Trà sữa Matcha': 'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?q=80&w=500',
    'Trà sữa khoai môn': 'https://images.unsplash.com/photo-1594631252845-29fc458695d7?q=80&w=500',
    'Trà sữa socola': 'https://images.unsplash.com/photo-1544787210-22bb840c266a?q=80&w=500',
    'Hồng trà sữa': 'https://images.unsplash.com/photo-1544787210-22bb840c266a?q=80&w=500',
    'Trà sữa nướng viên phô mai': 'https://images.unsplash.com/photo-1558857563-b371f30ca6a5?q=80&w=500',
    // Sinh tố & Đá xay
    'Sinh tố bơ sáp': 'https://images.unsplash.com/photo-1525385139772-e5c72ca7daa2?q=80&w=500',
    'Sinh tố xoài cát': 'https://images.unsplash.com/photo-1532634922-8fe0b757fb13?q=80&w=500',
    'Sinh tố dâu tây': 'https://images.unsplash.com/photo-1590080873972-06995641773d?q=80&w=500',
    'Chanh tuyết': 'https://images.unsplash.com/photo-1523362628745-0c100150b504?q=80&w=500',
    'Matcha đá xay': 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?q=80&w=500',
    'Cookie cream đá xay': 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?q=80&w=500',
    'Nước ép cam tươi': 'https://images.unsplash.com/photo-1613478223719-2ab302624559?q=80&w=500',
    'Soda Blue Ocean': 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=500',
    // Bánh ngọt
    'Bánh Tiramisu': 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?q=80&w=500',
    'Cheesecake chanh dây': 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?q=80&w=500',
    'Bánh sừng bò (Croissant)': 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=500',
    'Muffin Socola': 'https://images.unsplash.com/photo-1582142839970-2b99ad5d9499?q=80&w=500',
    'Red Velvet': 'https://images.unsplash.com/photo-1616541823729-00fe0aacd32c?q=80&w=500',
    'Macaron 5 vị': 'https://images.unsplash.com/photo-1569864358642-9d1619702661?q=80&w=500',
    'Bánh tart trứng': 'https://images.unsplash.com/photo-1505253304499-671c55fb57fe?q=80&w=500',
    'Bánh su kem': 'https://images.unsplash.com/photo-1612203985729-70726954388c?q=80&w=500',
};

async function seed() {
    try {
        console.log('⏳ Đang kết nối Database...');
        await sequelize.authenticate();
        console.log('✅ Đã kết nối với Database');

        /* ================= 1. RESET DATABASE ================= */
        console.log('Sweep 🧹 Đang dọn dẹp dữ liệu cũ...');
        const syncOptions = { force: true };
        await OrderItem.sync(syncOptions);
        await Order.sync(syncOptions);
        await CartItem.sync(syncOptions);
        await Cart.sync(syncOptions);
        await ProductSize.sync(syncOptions);
        await Product.sync(syncOptions);
        await Size.sync(syncOptions);
        await Discount.sync(syncOptions);
        await Category.sync(syncOptions);
        await User.sync(syncOptions);
        await Role.sync(syncOptions);
        await Contact.sync(syncOptions);
        console.log('✅ Đã reset toàn bộ bảng');

        /* ================= 2. TẠO ROLE & USER ================= */
        const roles = await Role.bulkCreate([
            { name: 'Admin' },
            { name: 'Customer' }
        ]);

        const customer = await User.create({
            firstname: 'Tran',
            lastname: 'Customer',
            email: 'customer@cafe.com',
            password: '123456', 
            roleId: roles[1].id
        });

        await User.create({
            firstname: 'Cafe',
            lastname: 'Admin',
            email: 'admin@cafe.com',
            password: 'admin123',
            roleId: roles[0].id
        });

        /* ================= 3. TẠO CATEGORY ================= */
        const categories = await Category.bulkCreate([
            { name: 'Cà phê' },
            { name: 'Trà' },
            { name: 'Trà sữa' },
            { name: 'Sinh tố & Đá xay' },
            { name: 'Bánh ngọt' }
        ]);

        /* ================= 4. TẠO DISCOUNT ================= */
        const discounts = await Discount.bulkCreate([
            { name: 'Happy Hour', description: 'Giảm giá 10% giờ vàng', percentage: 10, start_date: '2025-01-01', end_date: '2026-12-31' },
            { name: 'Member', description: 'Ưu đãi thành viên', percentage: 15, start_date: '2025-01-01', end_date: '2026-12-31' }
        ]);

        /* ================= 5. TẠO SIZE ================= */
        const sizes = await Size.bulkCreate([
            { name: 'S', description: 'Cỡ nhỏ' },
            { name: 'M', description: 'Cỡ vừa' },
            { name: 'L', description: 'Cỡ lớn' }
        ]);

        /* ================= 6. TẠO PRODUCT DATA ================= */
        const menu = [
            { cat: 0, items: ['Cà phê đen đá', 'Cà phê sữa đá', 'Bạc xỉu', 'Latte', 'Cappuccino', 'Cà phê muối', 'Espresso', 'Americano', 'Cà phê trứng', 'Cold Brew'] },
            { cat: 1, items: ['Trà đào cam sả', 'Trà vải thạch đào', 'Trà sen vàng', 'Trà xanh Nhật Bản', 'Trà oolong sen', 'Trà hoa cúc mật ong', 'Trà dâu tằm'] },
            { cat: 2, items: ['Trà sữa trân châu đường đen', 'Trà sữa Matcha', 'Trà sữa khoai môn', 'Trà sữa socola', 'Hồng trà sữa', 'Trà sữa nướng viên phô mai'] },
            { cat: 3, items: ['Sinh tố bơ sáp', 'Sinh tố xoài cát', 'Sinh tố dâu tây', 'Chanh tuyết', 'Matcha đá xay', 'Cookie cream đá xay', 'Nước ép cam tươi', 'Soda Blue Ocean'] },
            { cat: 4, items: ['Bánh Tiramisu', 'Cheesecake chanh dây', 'Bánh sừng bò (Croissant)', 'Muffin Socola', 'Red Velvet', 'Macaron 5 vị', 'Bánh tart trứng', 'Bánh su kem'] }
        ];

        let flatProducts = [];
        menu.forEach(group => {
            group.items.forEach(name => {
                flatProducts.push({
                    name,
                    image: productImages[name] || 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085', // Link mặc định nếu thiếu
                    price: Math.floor(faker.number.int({ min: 29, max: 79 })) * 1000,
                    categoryId: categories[group.cat].id,
                    discountId: Math.random() < 0.3 ? faker.helpers.arrayElement(discounts).id : null,
                    is_active: true,
                    description: `Hương vị đậm đà đặc trưng của ${name}, thơm ngon khó cưỡng.`
                });
            });
        });

        const createdProducts = await Product.bulkCreate(flatProducts);

        /* ================= 7. TẠO PRODUCT SIZES ================= */
        const productSizeData = [];
        for (const prod of createdProducts) {
            for (const s of sizes) {
                productSizeData.push({
                    productId: prod.id,
                    sizeId: s.id,
                    additional_price: s.name === 'L' ? 10000 : (s.name === 'M' ? 5000 : 0)
                });
            }
        }
        await ProductSize.bulkCreate(productSizeData);

        /* ================= 8. TẠO DỮ LIỆU MẪU (Cart, Order, Contact) ================= */
        const cart = await Cart.create({ userId: customer.id });
        await CartItem.create({
            cartId: cart.id,
            productId: createdProducts[0].id,
            sizeId: sizes[1].id,
            price: createdProducts[0].price + 5000,
            quantity: 1
        });

        const order = await Order.create({
            userId: customer.id,
            total_price: Math.round(createdProducts[1].price + 5000),
            shipping_address: '123 Đường ABC, Quận 1, TP.HCM',
            status: 'completed',
            paymentMethod: 'cod',
        });

        await OrderItem.create({
            orderId: order.id,
            productId: createdProducts[1].id,
            sizeId: sizes[1].id,
            quantity: 1,
            price: createdProducts[1].price + 5000
        });

        await Contact.create({
            name: 'Nguyễn Văn Khách',
            email: 'khachhang@gmail.com',
            phone: '0987654321',
            subject: 'Khen ngợi',
            message: 'Đồ uống rất ngon, nhân viên nhiệt tình!'
        });

        console.log('\n-----------------------------------------');
        console.log('🎉  CHÚC MỪNG! SEED DATA HOÀN TẤT!');
        console.log(`📊  Số lượng sản phẩm: ${createdProducts.length}`);
        console.log('-----------------------------------------\n');

        process.exit(0);

    } catch (error) {
        console.error('❌ LỖI TRONG QUÁ TRÌNH SEED:', error);
        process.exit(1);
    }
}

seed();