const CartService = require('../services/cart.service');
const Cart = require('../models/cart.model');
const CartItem = require('../models/cartItem.model');

class CartController {
    async addToCart(req, res) {
        try {
            const { userId, productId, sizeId, quantity } = req.body;
            console.log(req.body);

            if (!userId || !productId || !quantity) {
                return res.status(400).json({ message: 'Missing required fields' });
            }

            const data = await CartService.addToCart(userId, productId, sizeId, quantity);
            res.status(200).json({ message: 'Product added to cart', data });
        } catch (err) {
            console.error('Error in addToCart:', err);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }

    async getCart(req, res) {
        try {
            const userId = req.params.userId;

            if (!userId) {
                return res.status(400).json({ message: 'User ID is required' });
            }

            const data = await CartService.getCartByUserId(userId);
            res.status(200).json({
                message: 'Lấy giỏ hàng thành công',
                data
            });
        } catch (err) {
            console.error('Error in getCart:', err);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }

    async updateQuantity(req, res) {
        try {
            const { cartItemId, quantity } = req.body;

            // Dòng log quan trọng để kiểm tra ID
            console.log(`>>> Update Yêu cầu: ID dòng giỏ hàng=${cartItemId}, Số lượng mới=${quantity}`);

            if (!cartItemId || quantity == null) {
                return res.status(400).json({ message: 'Missing cartItemId or quantity' });
            }

            const updated = await CartService.updateQuantity(cartItemId, quantity);
            res.status(200).json({ message: 'Quantity updated', data: updated });
        } catch (err) {
            console.error('Error in updateQuantity:', err);
            res.status(500).json({ message: err.message || 'Internal Server Error' });
        }
    }

    async removeItem(req, res) {
        try {
            const { cartItemId } = req.body;

            if (!cartItemId) {
                return res.status(400).json({ message: 'Missing cartItemId' });
            }

            await CartService.removeItem(cartItemId);
            res.status(200).json({ message: 'Item removed from cart' });
        } catch (err) {
            console.error('Error in removeItem:', err);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }

    async clearCart(req, res) {
        try {
            const userId = req.params.userId;

            const cart = await Cart.findOne({ where: { userId } });
            if (!cart) return res.status(404).json({ message: 'Không tìm thấy giỏ hàng' });

            const deleted = await CartItem.destroy({
                where: { cartId: cart.id }
            });
            res.status(200).json({ message: 'Đã xóa sản phẩm trong giỏ hàng' });
        } catch (error) {
            console.error('Error clearing cart:', error);
            res.status(500).json({ message: 'Lỗi khi xóa giỏ hàng', error: error.message });
        }
    }

}

module.exports = new CartController();
