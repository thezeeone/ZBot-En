const Sequelize = require('sequelize');

const sequelize = new Sequelize('database', 'username', 'password', {
	host: 'localhost',
	dialect: '',
	logging: false,
	storage: '',
});

const Users = require('./models/Users.ts')(sequelize, Sequelize.DataTypes);
const CurrencyShop = require('./models/CurrencyShop.ts')(sequelize, Sequelize.DataTypes);
const UserItems = require('./models/UserItems.ts')(sequelize, Sequelize.DataTypes);

UserItems.belongsTo(CurrencyShop, { foreignKey: 'item_id', as: 'item' });

Reflect.defineProperty(Users.prototype, 'addItem', {

	value: async function addItem(item) {
		const userItem = await UserItems.findOne({
			where: { user_id: this.user_id, item_id: item.id },
		});

		if (userItem) {
			userItem.amount += 1;
			return userItem.save();
		}

		return UserItems.create({ user_id: this.user_id, item_id: item.id, amount: 1 });
	},
});

Reflect.defineProperty(Users.prototype, 'getItems', {
	
	value: function getItems() {
		return UserItems.findAll({
			where: { user_id: this.user_id },
			include: ['item'],
		});
	},
});

module.exports = { Users, CurrencyShop, UserItems };