// services/user.service.js
const hashPassword = require('../utils/hashPassword');
const Role = require('../models/role.model');
const User = require('../models/user.model');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/multer');
const { Op } = require('sequelize');

class UserService {
    static async findAll({ offset, limit, search }) {
        const where = {};

        if (search) {
            where[Op.or] = [
                { firstname: { [Op.like]: `%${search}%` } },
                { lastname: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } },
                { phone: { [Op.like]: `%${search}%` } },
            ];
        }

        return await User.findAndCountAll({
            where,
            include: {
                model: Role,
                as: 'role',
                attributes: ['id', 'name']
            },
            offset,
            limit,
            order: [['createdAt', 'ASC']]
        });
    }

    static async create(data, file) {
        if (data.password) {
            data.password = await hashPassword(data.password);
        }

        if (file) {
            const uploaded = await uploadToCloudinary(file, 'coffee-app/users');
            data.image = uploaded.url;
            data.imagePublicId = uploaded.publicId;
        }

        return await User.create(data);
    }

    static async update(id, data, file) {
        const user = await User.findByPk(id);
        if (!user) throw new Error('User không tồn tại');

        if (data.password && data.password !== user.password) {
            data.password = await hashPassword(data.password);
        } else {
            delete data.password;
        }

        if (file) {
            // xóa ảnh cũ
            await deleteFromCloudinary(user.imagePublicId);

            const uploaded = await uploadToCloudinary(file, 'users');
            data.image = uploaded.url;
            data.imagePublicId = uploaded.publicId;
        }

        return await user.update(data);
    }

    static async delete(id) {
        const user = await User.findByPk(id);
        if (!user) return 0;

        await deleteFromCloudinary(user.imagePublicId);
        return await User.destroy({ where: { id } });
    }
}

module.exports = UserService;
