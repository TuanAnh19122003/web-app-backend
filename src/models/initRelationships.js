module.exports = (db) => {
    const {
        User,
        Role,
        Product,
        Category,
        Discount,
        Size,
        ProductSize,
        Cart,
        CartItem,
        Order,
        OrderItem
    } = db;

    const fk = (name, allowNull = false) => ({
        foreignKey: { name, allowNull },
        constraints: true,
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    });

    /* =========================
       USER - ROLE
    ========================= */
    User.belongsTo(Role, { ...fk('roleId'), as: 'role' });
    Role.hasMany(User, { foreignKey: 'roleId', as: 'users' });

    /* =========================
       PRODUCT - CATEGORY
    ========================= */
    Product.belongsTo(Category, { ...fk('categoryId'), as: 'category' });
    Category.hasMany(Product, { foreignKey: 'categoryId', as: 'products' });

    /* =========================
       PRODUCT - DISCOUNT
    ========================= */
    Product.belongsTo(Discount, {
        ...fk('discountId', true), // có thể null
        as: 'discount'
    });
    Discount.hasMany(Product, { foreignKey: 'discountId', as: 'products' });

    /* =========================
       PRODUCT - SIZE (M:N)
    ========================= */
    Product.hasMany(ProductSize, { foreignKey: 'productId', as: 'productSizes' });
    ProductSize.belongsTo(Product, { ...fk('productId'), as: 'product' });

    Size.hasMany(ProductSize, { foreignKey: 'sizeId', as: 'productSizes' });
    ProductSize.belongsTo(Size, { ...fk('sizeId'), as: 'size' });

    /* =========================
       CART - USER
    ========================= */
    Cart.belongsTo(User, { ...fk('userId'), as: 'user' });
    User.hasOne(Cart, { foreignKey: 'userId', as: 'cart' });

    /* =========================
       CART - CART ITEM
    ========================= */
    Cart.hasMany(CartItem, { foreignKey: 'cartId', as: 'items' });
    CartItem.belongsTo(Cart, { ...fk('cartId'), as: 'cart' });

    CartItem.belongsTo(Product, { ...fk('productId'), as: 'product' });
    CartItem.belongsTo(Size, { ...fk('sizeId'), as: 'size' });

    /* =========================
       ORDER - USER
    ========================= */
    Order.belongsTo(User, { ...fk('userId'), as: 'user' });
    User.hasMany(Order, { foreignKey: 'userId', as: 'orders' });

    /* =========================
       ORDER - ORDER ITEM
    ========================= */
    Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items' });
    OrderItem.belongsTo(Order, { ...fk('orderId'), as: 'order' });

    OrderItem.belongsTo(Product, { ...fk('productId'), as: 'product' });
    OrderItem.belongsTo(Size, { ...fk('sizeId'), as: 'size' });
};
