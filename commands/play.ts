import { ApplicationCommandOptionType, bold, ChatInputCommandInteraction, EmbedBuilder, inlineCode, PermissionsBitField } from "discord.js";
import { Cmd } from "./command-exports";
// @ts-ignore
// --esModuleInterop
import ytdl = require('ytdl-core')
import { join } from "node:path";
import { createWriteStream } from "fs";
import { AudioPlayerStatus, createAudioPlayer, createAudioResource, entersState, getVoiceConnection, joinVoiceChannel, VoiceConnectionStatus,  } from "@discordjs/voice";
import { VoiceChannel, GuildMember } from "discord.js";
import { commaList, pluralise, timeFormat } from "../util";

const playCommand: Cmd = {
    data: {
        name: 'play',
        description: 'Play music in voice chat',
        options: [
            {
                name: 'link',
                description: 'Enter YouTube link (spotify support coming soon)',
                type: ApplicationCommandOptionType.String,
                required: true
            }
        ]
    },
    async execute(interaction: ChatInputCommandInteraction<"cached">) {
        const link = interaction.options.getString('link', true)
        
        const videoId = link.match(/^(?:https?:\/\/)?(?:(?:www\.|m\.)?youtu\.?be(?:-nocookie)?(?:\.com)?)\/(?:(?:watch\?v=|embed\/|v\/)?([\w\d-]+))$/)?.[1]

        if (!videoId) return await interaction.reply({
            embeds: [
                new EmbedBuilder()
                .setColor(0xff0000)
                .setTitle('`/play` - Invalid URL link')
                .setDescription(`Invalid YouTube link.\nYouTube link must match the following regex:\n${
                    inlineCode('/^(?:https?:\/\/)?(?:(?:www\.|m\.)?youtu\.?be(?:-nocookie)?(?:\.com)?)\/(?:(?:watch\?v=|embed\/|v\/)?([\w\d-]+))$/')
                }\nYour value did not match the regex above.`)
                .addFields(
                    {
                        name: 'Examples of valid URL links',
                        value: [
                            'www.youtube.com/watch?v=DFYRQ_zQ-gk',
                            'youtube.com/watch?v=DFYRQ_zQ-gk',
                            'm.youtube.com/watch?v=DFYRQ_zQ-gk',
                            'www.youtube.com/v/DFYRQ_zQ-gk?fs=1&hl=en_US',
                            'youtube.com/v/DFYRQ_zQ-gk?fs=1&hl=en_US',
                            'www.youtube.com/embed/DFYRQ_zQ-gk',
                            'youtube.com/embed/DFYRQ_zQ-gk',
                            'www.youtube-nocookie.com/embed/DFYRQ_zQ-gk',
                            'youtube-nocookie.com/embed/DFYRQ_zQ-gk',
                            'youtu.be/DFYRQ_zQ-gk',
                        ].map(s => inlineCode(s)).join('\n') + '\n\n*`http://` and `https://` links are also valid.*'
                    }
                )
            ]
        })

        const botMember = <GuildMember>interaction.guild.members.me

        const currentConnection = getVoiceConnection(interaction.guild.id)

        if (currentConnection) return await interaction.reply({
            embeds: [
                new EmbedBuilder()
                .setColor(0xff0000)
                .setTitle('`/play` - Existing connection')
                .setDescription(`This bot is already playing audio in ${
                    (<VoiceChannel>botMember.voice.channel)?.toString() || '**a channel that cannot be determined**.'
                }`)
            ]
        })

        const memberChannel = interaction.member.voice?.channel

        if (!memberChannel) return await interaction.reply({
            embeds: [
                new EmbedBuilder()
                .setColor(0xff0000)
                .setTitle('`/play` - No Voice Channel')
                .setDescription('You must be in a voice channel for this command to work!')
            ]
        })

        const perms = new PermissionsBitField(['Connect', 'Speak']).toArray()

        if (
            !perms.every(perm => botMember.permissions.has(perm))
            ) {
            const missingPerms = perms.filter(p => !botMember.permissions.has(p))
            return await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setAuthor({
                        name: `${interaction.user.tag} (${interaction.user.id})`,
                        iconURL: interaction.user.displayAvatarURL({ forceStatic: false })
                    })
                    .setTitle(`${inlineCode('/ban remove')} - Missing Permissions`)
                    .setDescription(`Bot is missing permissions.\nThis command requires the bot to have the ${
                        bold(
                            `${commaList(
                                perms
                                .map(
                                    s => inlineCode((s.match(/[A-Z][a-z]+/g) as RegExpMatchArray).join(' '))
                                )
                            )} ${
                                pluralise(perms.length, 'permissions')
                            }`
                        )
                    }.\nThe bot has the ${
                        bold(
                            `${commaList(
                                perms
                                .filter(
                                    p => !missingPerms.includes(p)
                                )
                                .map(
                                    s => inlineCode((s.match(/[A-Z][a-z]+/g) as RegExpMatchArray).join(' '))
                                )
                            )} ${
                                pluralise(perms.filter(p => !missingPerms.includes(p)).length, 'permissions')
                            }`
                        )
                    }, however is __missing__ the ${
                        bold(
                            `${commaList(
                                missingPerms
                                .map(
                                    s => inlineCode((s.match(/[A-Z][a-z]+/g) as RegExpMatchArray).join(' '))
                                )
                            )} ${
                                pluralise(missingPerms.length, 'permissions')
                            }`
                        )
                    }.`)
                    .setColor(0xff0000)
                ],
                ephemeral: true
            })
        }

        const newConnection = joinVoiceChannel({
            guildId: interaction.guild.id,
            channelId: (<VoiceChannel>interaction.member.voice.channel).id,
            adapterCreator: interaction.guild.voiceAdapterCreator
        })

        botMember.voice.setDeaf(false)

        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                .setTitle('Connecting to VC')
                .setDescription(`Joining ${memberChannel.toString()}...`)
                .setColor(0xffff00)
            ]
        })

        const downloadedVideo = ytdl(link)

        downloadedVideo.on('error', async (error) => {
            console.log(`Error while downloading ${link} in guild ${interaction.guild.name} (${interaction.guild.id})`, error)
            await interaction.channel?.send({
                embeds: [
                    new EmbedBuilder()
                    .setColor(0xff7700)
                    .setTitle(`Video failed to download`)
                    .setDescription(`Video failed to download. Disconnecting from ${memberChannel.toString()}.`)
                ]
            })
            newConnection.destroy()
        })
    
        const audioResource = createAudioResource(downloadedVideo)

        const audioPlayer = createAudioPlayer()
        
        audioPlayer.play(audioResource)

        newConnection.subscribe(audioPlayer)
        
        downloadedVideo.on('info', (info) => {
            const duration = timeFormat(info.videoDetails.lengthSeconds)
            audioPlayer.on(AudioPlayerStatus.Playing, async () => {
                await interaction.editReply({
                    embeds: [
                        EmbedBuilder.from((await interaction.fetchReply()).embeds[0])
                        .setAuthor({
                            name: `${interaction.user.tag} (${interaction.user.id})`,
                            iconURL: interaction.user.displayAvatarURL({ forceStatic: false })
                        })
                        .setTitle('Playing Audio')
                        .setDescription(`${interaction.user} Now playing song ${bold(`[${
                            info.videoDetails.title
                        }](${
                            link
                        })`)} by ${bold(`[${
                            info.videoDetails.author.name
                        }](${
                            info.videoDetails.author.channel_url
                        })`)} (${inlineCode(`${duration}`)}) in ${memberChannel.toString()}!`)
                        .setThumbnail(info.videoDetails.thumbnails[0])
                        .setColor(0x00ffff)
                    ]
                })
            })
        })

        audioPlayer.on(AudioPlayerStatus.Idle, async () => {
            newConnection.destroy()
            await interaction.channel?.send({
                embeds: [
                    new EmbedBuilder()
                    .setColor(0xff7700)
                    .setTitle(`Audio Finished`)
                    .setDescription(`The audio has finished. Disconnecting from ${memberChannel.toString()}.`)
                ]
            })
        })

        audioPlayer.on('error', async (error) => {
            console.error(`Error while playing audio ${link} in guild ${interaction.guild.name} ${interaction.guild.id}:`, error)
            await interaction.channel?.send({
                embeds: [
                    new EmbedBuilder()
                    .setColor(0xff7700)
                    .setTitle(`Player Failed`)
                    .setDescription(`An error occured with the player. Disconnecting from ${memberChannel.toString()}.`)
                ]
            })
            newConnection.destroy()
        })

        newConnection.on(VoiceConnectionStatus.Disconnected, async () => {
            await interaction.editReply({
                embeds: [
                    EmbedBuilder.from((await interaction.fetchReply()).embeds[0])
                    .setTitle('Re-connection attempt')
                    .setDescription(`The connection to ${memberChannel.toString()} was cut off, I am attempting to re-connect so please give me 10 seconds...`)
                    .setColor(0xffff00)
                ]
            })
            Promise.race([
                entersState(newConnection, VoiceConnectionStatus.Signalling, 10000),
                entersState(newConnection, VoiceConnectionStatus.Connecting, 10000)
            ])
            .then(async () => {
                await interaction.editReply({
                    embeds: [
                        EmbedBuilder.from((await interaction.fetchReply()).embeds[0])
                        .setTitle('Successful Re-connection')
                        .setDescription(`I have successfully re-connected to ${memberChannel.toString()}!`)
                        .setColor(0x00ff00)
                    ]
                })
            })
            .catch(async () => {
                newConnection.destroy()
                await interaction.editReply({
                    embeds: [
                        EmbedBuilder.from((await interaction.fetchReply()).embeds[0])
                        .setTitle('Re-connection Attempt Failed')
                        .setDescription(`Attempt to re-connect to ${memberChannel.toString()} failed... try again.`)
                        .setColor(0xff0000)
                    ]
                })
            })
        })
    }
}

export {
  playCommand
}
