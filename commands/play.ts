import { ApplicationCommandOptionType, ChatInputCommandInteraction } from 'discord.js';
import { ytdl } from 'ytdl-core';
import { Cmd, queue } from './command-exports';

const playCommand: Cmd = {
	data: {
		name: 'play',
		description: 'Play music in VC! (supports YT only)',
		options: [
			{
				name: 'yt-vid',
				description: 'The link of the youtube video to play',
				type: ApplicationCommandOptionType.String,
				required: true
			}
		]
	},
	async execute(interaction: ChatInputCommandInteraction<"cached">): {
		// Get the voice channel of the member
		const memberVC = interaction.member.voice?.channelId

		// Permission Check
		const perms = new PermissionsBitField('Speak', 'Connect')
		
		if (
			!perms.every(perm => (<GuildMember>interaction.guild.members.me).permissions.has(perm))
		) return await interaction.reply({
			content: 'Bot is missing one of `Connect`, `Speak` permissions.',
			ephemeral: true
		})
		
		// if the member is not in VC, throw back a message informing the user
		if (!memberVC) return await interaction.reply({
			content: 'You must be in a voice channel for this command to work!',
			ephemeral: true
		})

		// Get the link
		const link = interaction.options.getString('yt-vid')
		
		// Test the URL against a regex to see if it's valid.
		if (!link.match(
		     /(?:(?:https?:)?\/\/)?(?:(?:www\.|m\.)?youtube(?:-nocookie)?\.com|youtu.be)\/(?:watch\?v=([\w-]+)|embed\/([\w-]+)|v\/([\w-]+)|([\w-]+))/gm
		)) return await interaction.reply({
			content: 'Not a valid YouTube video URL format!',
			ephemeral: true
		})

		// Add the user's song to the link
		queue.set(interaction.user.id, link)
		await interaction.reply({
			content: `[Song](${link}) added to queue.`,
			ephemeral: true
		})

		// Repeat the queue.
		do {
			if (queue.size === 0) {
				
			}
		} while (queue.size > -1)
	}
}

export {
	playCommand
}
