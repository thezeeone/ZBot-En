const { Op } = require('sequelize');
const { Collection, Client, Formatters, GatewayIntentBits } = require('discord.js');
const { Users, CurrencyShop, PetShop } = require('./dbObjects.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });
const currency = new Collection();

Reflect.defineProperty(currency, 'add', {
	value: async (id, amount) => {
		const user = currency.get(id);

		if (user) {
			user.balance += Number(amount);
			return user.save();
		}

		const newUser = await Users.create({ user_id: id, balance: amount });
		currency.set(id, newUser);

		return newUser;
	},
});

Reflect.defineProperty(currency, 'getBalance', {
	value: id => {
		const user = currency.get(id);
		return user ? user.balance : 0;
	},
});

client.once('ready', async () => {
	const storedBalances = await Users.findAll();
	storedBalances.forEach(b => currency.set(b.user_id, b));

	console.log(`${client.user.tag} is logged in!`);
});

client.on('messageCreate', async message => {
	if (message.author.bot) return;
	currency.add(message.author.id, 1);
});

client.on('interactionCreate', async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const { commandName } = interaction;

	if (commandName === 'balance') {
		const target = interaction.options.getUser('user') || interaction.user;

		return interaction.reply(`${target.tag} has ${currency.getBalance(target.id)}Zcoins`);
	} else if (commandName === 'inventory') {
		const target = interaction.options.getUser('user') || interaction.user;
		const user = await Users.findOne({ where: { user_id: target.id } });
		const items = await user.getItems();

		if (!items.length) return interaction.reply(`${target.tag} has nothing! What a peasant, Am I right?!`);

		return interaction.reply(`${target.tag} currently has ${items.map(t => `${t.amount} ${t.item.name}`).join(', ')}`);
	} else if (commandName === 'transfer') {
		const currentAmount = currency.getBalance(interaction.user.id);
		const transferAmount = interaction.options.getInteger('amount');
		const transferTarget = interaction.options.getUser('user');

		if (transferAmount > currentAmount) return interaction.reply(`Sorry ${interaction.user} you don't have that much.`);
		if (transferAmount <= 0) return interaction.reply(`Please enter an amount greater than zero, ${interaction.user}`);

		currency.add(interaction.user.id, -transferAmount);
		currency.add(transferTarget.id, transferAmount);

		return interaction.reply(`Successfully transferred ${transferAmount}Zcoins to ${transferTarget.tag}. Your current balance is ${currency.getBalance(interaction.user.id)}Zcoins`);
	} else if (commandName === 'buy') {
		const itemName = interaction.options.getString('item');
		const item = await CurrencyShop.findOne({ where: { name: { [Op.like]: itemName } } });

		if (!item) return interaction.reply('That item doesn\'t exist.');
		if (item.cost > currency.getBalance(interaction.user.id)) {
			return interaction.reply(`You don't have enough Zcoins peasant, ${interaction.user}`);
		}

		const user = await Users.findOne({ where: { user_id: interaction.user.id } });
		currency.add(interaction.user.id, -item.cost);
		await user.addItem(item);

		return interaction.reply(`You've bought a ${item.name}`);
	} else if (commandName === 'shop') {
		const items = await CurrencyShop.findAll();
		return interaction.reply(Formatters.codeBlock(items.map(i => `${i.name}: ${i.cost}Zcoins`).join('\n')));
	} else if (commandName === 'leaderboard') {
		return interaction.reply(
			Formatters.codeBlock(
				currency.sort((a, b) => b.balance - a.balance)
					.filter(user => client.users.cache.has(user.user_id))
					.first(10)
					.map((user, position) => `(${position + 1}) ${(client.users.cache.get(user.user_id).tag)}: ${user.balance}Zcoins`)
					.join('\n'),
			),
		);
	}
});

client.login('give it');