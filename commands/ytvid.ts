import { AudioPlayerStatus, createAudioPlayer, createAudioResource, joinVoiceChannel } from "@discordjs/voice"
import { ApplicationCommandOptionType, ChatInputCommandInteraction } from "discord.js"
import { Cmd } from "./command-exports"
import ytdl = require('ytdl-core')
import { createWriteStream, unlink } from 'fs'
import { join } from 'node:path'

const ytVidCommand: Cmd = {
    data: {
        name: 'yt-vid',
        description: 'Play a YouTube video in voice!',
        options: [
            {
                name: 'link',
                description: 'The link of the YouTube VIDEO to play',
                type: ApplicationCommandOptionType.String,
                required: true
            }
        ]
    },
    async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<any> {
        const voiceChannel = interaction.member.voice?.channel

        if (!voiceChannel) return await interaction.reply({
            content: 'You must be in a voice channel for this command to work!',
            ephemeral: true
        })

        const link = interaction.options.getString('link') as string
        const URL = link.match(/(?:(?:https?:)?\/\/)?(?:(?:www\.|m\.)?youtu(?:be\.com|\.be)\/)(?:watch\?v=([\w\-]+)|v\/([\w\-]+)|(?:embed\/)?([\w\-]+))/)
        if (!URL) return await interaction.reply({
            content: 'Not a valid YouTube video URL!',
            ephemeral: true
        })

        const connection = joinVoiceChannel({
            guildId: interaction.guild.id,
            channelId: voiceChannel.id,
            // @ts-ignore
            adapterCreator: interaction.guild.voiceAdapterCreator
        })
        
        ytdl(link)
        .pipe(createWriteStream(`/Users/zahid/Code Folder/Bots/ZBot/ytfiles/${URL[1]}.mp3`))

        const player = createAudioPlayer()
        const resource = createAudioResource(join(__dirname, `../ytfiles/${URL[1]}.mp3`))

        connection.subscribe(player)

        player.play(resource)

        await interaction.reply({
            content: 'Playing audio',
            ephemeral: true
        })

        player.on(AudioPlayerStatus.Idle, () => {
            player.stop(true)
            connection.destroy()
            unlink(`./ytfiles/${URL[1]}.mp3`, (err) => {
                console.log(err)
            })
        })
    }
}

export {
    ytVidCommand
}