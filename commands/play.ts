import { ApplicationCommandOptionType, bold, ChatInputCommandInteraction, EmbedBuilder, inlineCode, PermissionsBitField, TextChannel } from "discord.js";
import { Cmd, queue, SongInfo, QueueConstruct } from "./command-exports";
// @ts-ignore
// --esModuleInterop
import ytdl = require('ytdl-core')
import { AudioPlayerStatus, createAudioPlayer, createAudioResource, entersState, getVoiceConnection, joinVoiceChannel, VoiceConnectionReadyState, VoiceConnectionStatus,  } from "@discordjs/voice";
import { VoiceChannel, GuildMember, Guild } from "discord.js";
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

        const memberChannel = interaction.member.voice?.channel

        if (!memberChannel) return await interaction.reply({
            embeds: [
                new EmbedBuilder()
                .setColor(0xff0000)
                .setTitle('`/play` - No Voice Channel')
                .setDescription('You must be in a voice channel for this command to work!')
            ]
        })

        const botMember = <GuildMember>interaction.guild.members.me

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

        const serverQueue = queue.get(interaction.guild.id)

        const songInfo = await ytdl.getInfo(link)

        const songConstruct: SongInfo = {
            title: songInfo.videoDetails.title,
            url: songInfo.videoDetails.video_url || link,
            author: songInfo.videoDetails.author.name,
            authorChannelUrl: songInfo.videoDetails.author.channel_url,
            duration: Number(songInfo.videoDetails.lengthSeconds),
            thumbnail: songInfo.videoDetails.thumbnails[0].url,
            suggestedBy: interaction.user,
            playing: false
        }
        
        const newConnection = joinVoiceChannel({
            guildId: interaction.guild.id,
            channelId: memberChannel.id,
            adapterCreator: interaction.guild.voiceAdapterCreator
        })

        if (!serverQueue) {
            const queueConstruct: QueueConstruct = {
                songs: [],
                textChannel: interaction.channel as TextChannel,
                voiceChannel: memberChannel as VoiceChannel,
                connection: newConnection,
            }

            queueConstruct.songs.push(songConstruct)

            queue.set(interaction.guild.id, queueConstruct)
    
            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setTitle('Connecting to VC')
                    .setDescription(`Connecting to ${memberChannel.toString()}...`)
                    .setColor(0xffff00)
                ]
            })
    
            const downloadedVideo = ytdl(link)
    
            downloadedVideo.on('error', async (error) => {
                console.log(`[ZBot-En] Error while downloading ${link} in guild ${interaction.guild.name} (${interaction.guild.id})`, error)
                await interaction.channel?.send({
                    embeds: [
                        new EmbedBuilder()
                        .setColor(0xff7700)
                        .setTitle(`Video failed to download`)
                        .setDescription(`Video failed to download. Disconnecting from ${memberChannel.toString()}.\n\nServer queue has been cleared.`)
                    ]
                })
                queueConstruct.songs = []
            })
        
            const audioPlayer = createAudioPlayer()
            
            newConnection.subscribe(audioPlayer)
    
            queueConstruct.songs[0].playing = false

            newConnection.on(VoiceConnectionStatus.Ready, async () => {
                await interaction.editReply({
                    embeds: [
                        EmbedBuilder.from((await interaction.fetchReply()).embeds[0])
                        .setTitle('Connection to VC successful')
                        .setDescription(`Connected to ${memberChannel.toString()} successfully!`)
                        .setColor(0x00ff00)
                    ]
                })
                playNext(interaction.guild, queueConstruct.songs[0], memberChannel as VoiceChannel, interaction)
            })
        } else {
            serverQueue.songs.push(songConstruct)
            await interaction.reply({
                content: interaction.user.toString(),
                embeds: [
                    new EmbedBuilder()
                    .setAuthor({
                        name: `${interaction.user.tag} (${interaction.user.id})`,
                        iconURL: interaction.user.displayAvatarURL({ forceStatic: false })
                    })
                    .setTitle('Added song to queue')
                    .setDescription(`Added ${bold(`[${
                        songConstruct.title
                    }](${
                        link
                    })`)} by ${bold(`[${
                        songConstruct.author
                    }](${
                        songConstruct.authorChannelUrl
                    })`)} (${inlineCode(`${timeFormat(songConstruct.duration)}`)}) at position ${
                        inlineCode(String(serverQueue.songs.length))
                    } in the queue!`)
                    .setColor(0x00ffff)
                ]
            })
            if (serverQueue.songs.length === 1) playNext(interaction.guild, serverQueue.songs[0], memberChannel as VoiceChannel, interaction)
        }

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
                await interaction.editReply({
                    embeds: [
                        EmbedBuilder.from((await interaction.fetchReply()).embeds[0])
                        .setTitle('Re-connection Attempt Failed')
                        .setDescription(`Attempt to re-connect to ${memberChannel.toString()} failed... try again.`)
                        .setColor(0xff0000)
                    ]
                })
                try {
                    newConnection.destroy()
                } catch (error) {
                    return
                }
            })
        })
    }
}

function playNext(guild: Guild | string, song: SongInfo, voiceChannel: VoiceChannel, interaction: ChatInputCommandInteraction) {
    const serverQueue = queue.get(typeof guild === 'string' ? guild : guild.id);

    if (!serverQueue) return
 
    const downloadVid = ytdl(song.url);

    const connection = serverQueue.connection

    if (!connection) return

    const player = (connection.state as VoiceConnectionReadyState)?.subscription?.player

    if (!player) return

    const audioResource = createAudioResource(downloadVid)

    player.play(audioResource)

    serverQueue.songs[0].playing = true
    player.on(AudioPlayerStatus.Playing, async () => {
        await interaction.channel?.send({
            content: song.suggestedBy.toString(),
            embeds: [
                EmbedBuilder.from((await interaction.fetchReply()).embeds[0])
                .setAuthor({
                    name: `${song.suggestedBy.tag} (${song.suggestedBy.id})`,
                    iconURL: song.suggestedBy.displayAvatarURL({ forceStatic: false })
                })
                .setTitle('Playing Audio')
                .setDescription(`Now playing song ${bold(`[${
                    song.title
                }](${
                    song.url
                })`)} by ${bold(`[${
                    song.author
                }](${
                    song.authorChannelUrl
                })`)} (${inlineCode(`${timeFormat(song.duration)}`)}) in ${voiceChannel.toString()}!`)
                .setColor(0x00ffff)
            ]
        })
    })

    player.on(AudioPlayerStatus.Idle, async () => {
        serverQueue.songs.shift()
        if (serverQueue.songs.length) {
            playNext(interaction.guild as Guild, serverQueue.songs[0], voiceChannel as VoiceChannel, interaction)
        } else {
            queue.delete((interaction.guild as Guild).id)
            serverQueue.connection?.destroy()
            await interaction.channel?.send({
                embeds: [
                    new EmbedBuilder()
                    .setColor(0xff7700)
                    .setTitle(`Audio Finished`)
                    .setDescription(`The audio has finished. Disconnecting from ${voiceChannel.toString()}.`)
                ]
            })
        }
    })
    
    player.on('error', async (error) => {
        await interaction.channel?.send({
            embeds: [
                new EmbedBuilder()
                .setColor(0xff7700)
                .setTitle(`Player Failed`)
                .setDescription(`An error occured with the player. Disconnecting from ${voiceChannel.toString()}.\n\nServer queue has been cleared.`)
            ]
        })
        queue.delete((interaction.guild as Guild).id)
        serverQueue.connection?.destroy()
    })
}

export {
    playCommand
}
