import { ChatInputCommandInteraction, ApplicationCommandOptionType } from "discord.js";
import { BlacklistModel } from "../database.ts";
import { Cmd } from "./command-exports";

const blacklistCommand: Cmd = {
	data: {
		name: 'blacklist',
		description: 'Blacklist a certain user, banning them from using this bot (WARNING: IRREVERSIBLE)',
		options: [
			{
				name: 'user',
				description: 'The user to blacklist',
				type: ApplicationCommandOptionType.User,
				required: true
			}
		]
	},
	async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<any> {
		const user = interaction.options.getUser('user')
		
		if (!user) return await interaction.reply({
			content: 'Not a valid user!',
			ephemeral: true
		})
		
		const isUserBlacklisted = await BlacklistModel.findOne({
			where: {
				id: user.id
			}
		})
		
		if (isUserBlacklisted) return await interaction.reply({
			content: `This user, ${Formatters.bold(user.tag)} (${Formatters.inlineCode(user.id)}), is already blacklisted, and is therefore permanently banned from using this bot.`,
			ephemeral: true
		})
		
		const enEmbed = new EmbedBuilder()
		.setTitle('Blacklist')
		.setColor(0xf00)
		.setDescription(`This is a message in regards to your permission to use this bot.\n\n⛔ **__You have been blacklisted by the owner from using this bot.__**\n\nThis means you are **__permanently__ banned** from interacting with this bot in any way or form; you **__cannot__** **use this bot's slash commands** (unless certain commands are exempt), **interact with the bot's message components**, or **gain any more level or experience points from this bot**, and **your rank card will be removed entirely**.\n\nOther members however will still be able to use commands on you, for example, to ban you.\n\n**__Unfair?__ Either join our official Discord server, [ZBot Server (En)](https://discord.gg/6tkn6m5g52), for a reason as to why you've been blacklisted, or message the owner, ${Formatters.inlineCode(interaction.user.tag)} (${Formatters.inlineCode(interaction.user.id)}), for a further discussion.**`)
	
		const arEmbed = new EmbedBuilder()
		.setTitle('قائمة السوداء')
		.setColor(0xf00)
		.setDescription(`هذه هي رسالة بخصوص إذنك باستخدام هذه الآلة.\n\n⛔ **__تم إضافتك في القائمة السوداء لاستخدام هذه الآلة.__**\n\nهذا يعني أنك **ممنوع __بشكل دائم__** من التفاعل مع هذه الآلة في أي طريقة أو شكل؛ ف**__لا__** يمكنك **استخدام أوامر مائل هذه الآلة** (باستثناء بعض الأوامر المستثناة) أو **التفاعل مع عناصر رسائل هذه الآلة**، أو **الحصول على أي نقاط تجربة أو مستويات من هذه الآلة**، و**سيتم إزالة بطاقتك الرتبة تماماً**.\n\nلكن بذلك، يمكن للأعضاء الأخرى أن يستخدمون الأوامر عليك، فمثلاً، لحظرك.\n\n**__غير منصف؟__ إما انضمّ خادمنا الرسمي، [خادم ZBot (ع)](wfbbyYePTR) للتعرف على سبب إضافتك في القائمة السوداء لهذه الآلة، أو ارسل رسالة للصاحب، ${Formatters.inlineCode(interaction.user.tag)} (${Formatters.inlineCode(interaction.user.id)})، لمناقشة للمزيد من المعلومات.**`)
		
		user.send({
			embeds: [enEmbed, arEmbed]
		})
		.then(async () => {
			return await interaction.reply({
				content: `Successfully blacklisted ${Formatters.bold(user.tag)} (${Formatters.inlineCode(user.id)}) from using the bot.\n\n⛔ **__This user will no longer be able to use this bot or its commands, or gain any experience points from it.__ Commands however can still be used on them.**`,
				ephemeral: true
			})
		})
		.catch(async () => {
			return await interaction.reply({
				content: `Successfully blacklisted ${Formatters.bold(user.tag)} (${Formatters.inlineCode(user.id)}) from using the bot.I could not DM them.⛔ \n\n**__This user will no longer be able to use this bot or its commands, or gain any experience points from it.__ Commands however can still be used on them.**`,
				ephemeral: true
			})
		})
		.finally(async () => {
			await BlacklistModel.create({
				id: user.id
			})
		})
	}
}

export {
  blacklistCommand
}
