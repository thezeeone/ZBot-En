import { Collection, Client, GatewayIntentBits } from 'discord.js';

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });
const currency = new Collection<string, { balance: number }>();

client.on('messageCreate', async message => {
	if (message.author.bot) return;
	// currency.add(message.author.id, 1);
});

// client.on('interactionCreate', async interaction => {
// 	if (!interaction.isChatInputCommand()) return;

// 	const { commandName } = interaction;

// 	if (commandName === 'inventory') {
// 		const target = interaction.options.getUser('user') || interaction.user;
// 		const user = await Users.findOne({ where: { user_id: target.id } });
// 		const items = await user.getItems();

// 		if (!items.length) return interaction.reply(`${target.tag} has nothing! What a peasant, Am I right?!`);

// 		return interaction.reply(`${target.tag} currently has ${items.map(t => `${t.amount} ${t.item.name}`).join(', ')}`);
// 	}
// })