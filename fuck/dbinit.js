const Sequelize = require('sequelize');

const sequelize = new Sequelize('database', 'username', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	storage: 'database.sqlite',
});

const CurrencyShop = require('./models/CurrencyShop.js')(sequelize, Sequelize.DataTypes);
require('./models/Users.ts')(sequelize, Sequelize.DataTypes);
require('./models/UserItems.ts')(sequelize, Sequelize.DataTypes);

const force = process.argv.includes('--force') || process.argv.includes('-f');

sequelize.sync({ force }).then(async () => {
	const shop = [
		CurrencyShop.upsert({ name: 'Cookie \:cookie:', cost: 5 }),
		CurrencyShop.upsert({ name: 'Water \:wine_glass:', cost: 10 }),
		CurrencyShop.upsert({ name: 'Jamols Starter kit \:package:', cost: 25 }),
		CurrencyShop.upsert({ name: 'Apple Juice \:beverage_box:', cost: 3 }),
	];

	await Promise.all(shop);
	console.log('Database synced');

	sequelize.close();
}).catch(console.error);

const PetShop = require('./models/PetShop.ts')(sequelize, Sequelize.DataTypes);
require('./models/Users.ts')(sequelize, Sequelize.DataTypes);
require('./models/UserItems.ts')(sequelize, Sequelize.DataTypes);

sequelize.sync({ force }).then(async () => {
	const shop = [
          PetShop.upsert({ name: 'Pet cat \:cat:', cost: 50 }),
          PetShop.upsert({ name: 'Pet dog \:dog:', cost: 50}),
		PetShop.upsert({ name: 'Pet Parrot \:bird:', cost: 50}),
		PetShop.upsert({ name: 'Pet Panda \:panda_face:', cost: 50}),
	];

	await Promise.all(shop);
	console.log('Database synced');

	sequelize.close();
}).catch(console.error);
