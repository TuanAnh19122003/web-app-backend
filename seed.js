/**
 * ⚠️ CHỈ CHẠY FILE NÀY TRONG DEV
 */
if (process.env.NODE_ENV === 'production') {
    console.error('❌ Không được chạy seed trên production');
    process.exit(1);
}

const sequelize = require('./src/config/database');
const { faker } = require('@faker-js/faker');

// Models
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

async function seed() {
    try {
        /* ================= CONNECT ================= */
        await sequelize.authenticate();
        console.log('✅ Connected DB');

        /* ================= RESET (FK ORDER) ================= */
        await OrderItem.sync({ force: true });
        await Order.sync({ force: true });
        await CartItem.sync({ force: true });
        await Cart.sync({ force: true });
        await ProductSize.sync({ force: true });
        await Size.sync({ force: true });
        await Product.sync({ force: true });
        await Discount.sync({ force: true });
        await Category.sync({ force: true });
        await User.sync({ force: true });
        await Role.sync({ force: true });
        await Contact.sync({ force: true });

        console.log('✅ Database synced');

        /* ================= ROLE ================= */
        const [adminRole, customerRole] = await Role.bulkCreate([
            { name: 'Admin' },
            { name: 'Customer' }
        ]);

        /* ================= USER ================= */
        const [, customer] = await User.bulkCreate([
            {
                firstname: 'Cafe',
                lastname: 'Admin',
                email: 'admin@cafe.com',
                password: 'admin123',
                roleId: adminRole.id
            },
            {
                firstname: 'Tran',
                lastname: 'Customer',
                email: 'customer@cafe.com',
                password: '123456',
                roleId: customerRole.id
            }
        ]);

        /* ================= CATEGORY (5 LOẠI) ================= */
        const categories = await Category.bulkCreate([
            { name: 'Cà phê' },
            { name: 'Trà' },
            { name: 'Trà sữa' },
            { name: 'Sinh tố' },
            { name: 'Bánh ngọt' }
        ]);

        /* ================= DISCOUNT ================= */
        const discounts = await Discount.bulkCreate([
            {
                name: 'Happy Hour',
                description: 'Giảm giá giờ vàng',
                percentage: 10,
                start_date: '2025-01-01',
                end_date: '2025-12-31'
            },
            {
                name: 'Member',
                description: 'Khách hàng thân thiết',
                percentage: 15,
                start_date: '2025-01-01',
                end_date: '2025-12-31'
            }
        ]);

        /* ================= SIZE ================= */
        const sizes = await Size.bulkCreate([
            { name: 'S', description: 'Nhỏ' },
            { name: 'M', description: 'Vừa' },
            { name: 'L', description: 'Lớn' }
        ]);

        /* ================= PRODUCT DATA ================= */
        const productMap = [
            // Cà phê
            ['Cà phê đen đá', 0],
            ['Cà phê sữa đá', 0],
            ['Latte', 0],
            ['Cappuccino', 0],

            // Trà
            ['Trà đào cam sả', 1],
            ['Trà vải', 1],

            // Trà sữa
            ['Trà sữa trân châu', 2],
            ['Trà sữa matcha', 2],

            // Sinh tố
            ['Sinh tố xoài', 3],
            ['Sinh tố bơ', 3],

            // Bánh ngọt
            ['Bánh tiramisu', 4],
            ['Bánh cheesecake', 4]
        ];

        const products = await Product.bulkCreate(
            productMap.map(([name, catIndex]) => ({
                name,
                price: faker.number.int({ min: 25000, max: 70000 }),
                categoryId: categories[catIndex].id,
                discountId: Math.random() < 0.4
                    ? faker.helpers.arrayElement(discounts).id
                    : null,
                is_active: true,
                description: faker.lorem.sentence()
            }))
        );

        /* ================= PRODUCT SIZE ================= */
        const productSizes = [];
        for (const product of products) {
            for (const size of sizes) {
                productSizes.push({
                    productId: product.id,
                    sizeId: size.id,
                    additional_price:
                        size.name === 'L' ? 10000 :
                        size.name === 'M' ? 5000 : 0
                });
            }
        }
        await ProductSize.bulkCreate(productSizes);

        /* ================= CART ================= */
        const cart = await Cart.create({ userId: customer.id });

        /* ================= CART ITEM ================= */
        await CartItem.create({
            cartId: cart.id,
            productId: products[0].id,
            sizeId: sizes[1].id,
            price: products[0].price + 5000,
            quantity: 2
        });

        /* ================= ORDER ================= */
        const order = await Order.create({
            userId: customer.id,
            total_price: (products[0].price + 5000) * 2,
            shipping_address: 'Tại quầy',
            status: 'pending',
            paymentMethod: 'cod'
        });

        /* ================= ORDER ITEM ================= */
        await OrderItem.create({
            orderId: order.id,
            productId: products[0].id,
            sizeId: sizes[1].id,
            quantity: 2,
            price: products[0].price + 5000
        });

        /* ================= CONTACT ================= */
        await Contact.create({
            name: 'Khách hàng A',
            email: 'a@cafe.com',
            phone: '0901234567',
            subject: 'Góp ý',
            message: 'Cà phê rất ngon!'
        });

        console.log('🎉 SEED DATA THÀNH CÔNG');
        process.exit(0);

    } catch (error) {
        console.error('❌ SEED ERROR:', error);
        process.exit(1);
    }
}

seed();
