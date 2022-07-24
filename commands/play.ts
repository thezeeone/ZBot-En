import { AudioPlayerStatus, AudioResource, createAudioPlayer, createAudioResource, getVoiceConnection, joinVoiceChannel } from '@discordjs/voice';
import { ApplicationCommandOptionType, ChatInputCommandInteraction, Formatters, GuildMember, PermissionsBitField, TextChannel } from 'discord.js';
// @ts-ignore
import { ytdl } from 'ytdl-core';
import { Cmd, queue } from './command-exports';
import { createWriteStream } from 'fs';
import { join } from 'node:path';

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
	async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<any> {
		// Get the voice channel of the member
		const memberVC = interaction.member.voice?.channel

		// Permission Check
		// Converted to array
		// Added `.toArray()` to ensure it's an array of permissions
		const perms = new PermissionsBitField(['Speak', 'Connect']).toArray()
		
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
		const link = interaction.options.getString('yt-vid') as string
		
		// Get the actual video ID itself (for the purpose of files)
		const vidId = link.match(/(?:(?:https?:)?\/\/)?(?:(?:www\.|m\.)?youtube(?:-nocookie)?\.com|youtu.be)\/(?:watch\?v=([\w-]+)|embed\/([\w-]+)|v\/([\w-]+)|([\w-]+))/gm)?.[0]

		// Test the URL against a regex to see if it's valid.
		if (!vidId) return await interaction.reply({
			content: 'Not a valid YouTube video URL format!',
			ephemeral: true
		})

		// Checks if there is a connection, if there is one it tells the user...
		if (getVoiceConnection(interaction.guild.id)) return await interaction.reply({
			content: 'This bot is alredy playing music in one voice chat.',
			ephemeral: true
		})

		// ...otherwise, it will make a connection in a separate channel
		const connection = joinVoiceChannel({
			guildId: interaction.guild.id,
			channelId: memberVC.id,
			// @ts-ignore
			adapterCreator: interaction.guild.voiceAdapterCreator
		})

		// Create a file in a directory to be played later
		ytdl(link)
			.pipe(createWriteStream(`/Users/zahid/Code Folder/Bots/ZBot-En/ZBot-En/commands/ytfiles/${URL[1]}.mp3`))

		// Create a player for the user's audio
		const player = createAudioPlayer()

		// Create a resource for the player to play
		const resource = createAudioResource(join(__dirname, `./ytfiles/${URL[1]}.mp3`))

		// Subscribe to the connection
		connection.subscribe(player)

		// Add the user's song to the link, using Collection<UserResolvable, string> (the string is a YouTube video ID)
		queue.set(interaction.user.id, vidId)
		await interaction.reply(`Song (${link}) added to queue.`)

		// Is there something in the queue?
		if (queue.size) {
			// Leave it to the end
			await interaction.followUp(`${interaction.user} There are songs in the queue, your song has been placed in the end.`)
		} else {
			// Just move on and play the user's song
			player.play(resource)
			await (<TextChannel>interaction.channel).send(`${interaction.user} Now playing your song (${link}) in voice chat 🔊 ${Formatters.bold(memberVC.name)}`)
		}

		// Every time a song stops, check
		player.on(AudioPlayerStatus.Idle, async () => {
			queue.delete(queue.keys()[0])

			// Check for empty queue
			if (!queue.size) {
				// Stop the player, destroy the connection
				player.stop(true)
				connection.destroy()
				await interaction.followUp('Left voice chat, queue empty.')
			} else {
				// Play next song
				let nextSong = [queue.firstKey(), queue.first()]
				let newResource = createAudioResource(join(__dirname, `./ytfiles/${nextSong[1]}`))
				player.play(newResource)
				await (<TextChannel>interaction.channel).send(`${interaction.user} Now playing your song (${link}) in voice chat 🔊 ${Formatters.bold(memberVC.name)}`)
			}
		})
	}
}

export {
	playCommand
}

