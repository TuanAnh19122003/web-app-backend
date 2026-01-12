const { Cart, CartItem, Product, Size, ProductSize, Discount } = require('../models');

class CartService {
    static async addToCart(userId, productId, sizeId, quantity) {
        const t = await Cart.sequelize.transaction();
        try {
            let cart = await Cart.findOne({ where: { userId }, transaction: t });
            if (!cart) {
                cart = await Cart.create({ userId }, { transaction: t });
            }
            const product = await Product.findByPk(productId, {
                include: [{ model: Discount, as: 'discount' }],
                transaction: t
            });

            if (!product) throw new Error('Product not found');

            let basePrice = parseFloat(product.price);
            let discountPercent = 0;

            const now = new Date();
            if (product.discount &&
                new Date(product.discount.start_date) <= now &&
                now <= new Date(product.discount.end_date)) {
                discountPercent = parseFloat(product.discount.percentage);
            }

            let discountedPrice = basePrice * (1 - discountPercent / 100);
            let additionalPrice = 0;

            if (sizeId) {
                const ps = await ProductSize.findOne({
                    where: { productId, sizeId },
                    transaction: t
                });
                if (ps) {
                    additionalPrice = parseFloat(ps.additional_price);
                }
            }

            let finalPrice = discountedPrice + additionalPrice;

            const existingItem = await CartItem.findOne({
                where: { cartId: cart.id, productId, sizeId: sizeId || null },
                transaction: t
            });

            if (existingItem) {
                existingItem.quantity += quantity;
                await existingItem.save({ transaction: t });
            } else {
                await CartItem.create({
                    cartId: cart.id,
                    productId,
                    sizeId,
                    quantity,
                    price: finalPrice.toFixed(2)
                }, { transaction: t });
            }
            await t.commit();
            return { cartId: cart.id, productId, sizeId, quantity, finalPrice: finalPrice.toFixed(2) };
        } catch (err) {
            await t.rollback();
            console.error('Error in addToCart:', err);
            throw err;
        }
    }

    static async getCartByUserId(userId) {
        try {
            const cart = await Cart.findOne({
                where: { userId },
                include: [
                    {
                        model: CartItem,
                        as: 'items',
                        include: [
                            {
                                model: Product,
                                as: 'product',
                                include: ['category', 'discount']
                            },
                            {
                                model: Size,
                                as: 'size'
                            }
                        ]
                    }
                ]
            });

            if (!cart) {
                return {
                    cartId: null,
                    items: []
                };
            }

            return {
                cartId: cart.id,
                items: cart.items || []
            };
        } catch (err) {
            console.error('Error in getCart:', err);
            throw err;
        }
    }



    static async updateQuantity(cartItemId, quantity) {
        // Đảm bảo quantity là số nguyên
        const qty = parseInt(quantity);
        if (isNaN(qty) || qty < 1) throw new Error('Số lượng không hợp lệ');

        const item = await CartItem.findByPk(cartItemId);
        if (!item) throw new Error('Không tìm thấy sản phẩm trong giỏ hàng');

        item.quantity = qty;
        await item.save();

        return item;
    }

    static async removeItem(cartItemId) {
        // Dùng destroy trực tiếp với điều kiện where để an toàn hơn
        const deleted = await CartItem.destroy({
            where: { id: cartItemId }
        });

        if (!deleted) throw new Error('Không tìm thấy sản phẩm để xóa');
        return { success: true };
    }

    static async clearCart(userId) {
        if (!userId) throw new Error('userId is required');

        // 1. Tìm giỏ hàng của user
        const cart = await Cart.findOne({ where: { userId } });
        if (!cart) return 0;

        // 2. Xóa tất cả items thuộc giỏ hàng đó
        const deletedCount = await CartItem.destroy({
            where: { cartId: cart.id }
        });

        return deletedCount;
    }
}

module.exports = CartService;
