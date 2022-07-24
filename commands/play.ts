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
		// get the voice channel of the member
		const memberVC = interaction.member.voice?.channelId

		// if the member is not in VC, throw back a message informing the user
		if (!memberVC) return await interaction.reply({
			content: 'You must be in a voice channel for this command to work!',
			ephemeral: true
		})
		
		// get the link
		const link = interaction.options.getString('yt-vid')
		
	}
}

export {
	playCommand
}
