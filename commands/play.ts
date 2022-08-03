import { ApplicationCommandOptionType, bold, ChatInputCommandInteraction, EmbedBuilder, inlineCode, PermissionsBitField } from "discord.js";
import { Cmd } from "./command-exports";
// @ts-ignore
// --esModuleInterop
import ytdl = require('ytdl-core')
import { join } from "node:path";
import { createWriteStream } from "fs";
import { AudioPlayerStatus, createAudioPlayer, createAudioResource, entersState, getVoiceConnection, joinVoiceChannel, VoiceConnectionStatus,  } from "@discordjs/voice";
import { VoiceChannel, GuildMember } from "discord.js";
import { commaList, pluralise } from "../util";

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
                            'https://www.youtube.com/watch?v=DFYRQ_zQ-gk&feature=featured',
                            'https://www.youtube.com/watch?v=DFYRQ_zQ-gk',
                            'http://www.youtube.com/watch?v=DFYRQ_zQ-gk',
                            'www.youtube.com/watch?v=DFYRQ_zQ-gk',
                            'https://youtube.com/watch?v=DFYRQ_zQ-gk',
                            'http://youtube.com/watch?v=DFYRQ_zQ-gk',
                            'youtube.com/watch?v=DFYRQ_zQ-gk',
                            'https://m.youtube.com/watch?v=DFYRQ_zQ-gk',
                            'http://m.youtube.com/watch?v=DFYRQ_zQ-gk',
                            'm.youtube.com/watch?v=DFYRQ_zQ-gk',
                            'https://www.youtube.com/v/DFYRQ_zQ-gk?fs=1&hl=en_US',
                            'http://www.youtube.com/v/DFYRQ_zQ-gk?fs=1&hl=en_US',
                            'www.youtube.com/v/DFYRQ_zQ-gk?fs=1&hl=en_US',
                            'youtube.com/v/DFYRQ_zQ-gk?fs=1&hl=en_US',
                            'https://www.youtube.com/embed/DFYRQ_zQ-gk?autoplay=1',
                            'https://www.youtube.com/embed/DFYRQ_zQ-gk',
                            'http://www.youtube.com/embed/DFYRQ_zQ-gk',
                            'www.youtube.com/embed/DFYRQ_zQ-gk',
                            'https://youtube.com/embed/DFYRQ_zQ-gk',
                            'http://youtube.com/embed/DFYRQ_zQ-gk',
                            'youtube.com/embed/DFYRQ_zQ-gk',
                            'https://www.youtube-nocookie.com/embed/DFYRQ_zQ-gk?autoplay=1',
                            'https://www.youtube-nocookie.com/embed/DFYRQ_zQ-gk',
                            'http://www.youtube-nocookie.com/embed/DFYRQ_zQ-gk',
                            'www.youtube-nocookie.com/embed/DFYRQ_zQ-gk',
                            'https://youtube-nocookie.com/embed/DFYRQ_zQ-gk',
                            'http://youtube-nocookie.com/embed/DFYRQ_zQ-gk',
                            'youtube-nocookie.com/embed/DFYRQ_zQ-gk',
                            'https://youtu.be/DFYRQ_zQ-gk?t=120',
                            'https://youtu.be/DFYRQ_zQ-gk',
                            'http://youtu.be/DFYRQ_zQ-gk',
                            'youtu.be/DFYRQ_zQ-gk',
                        ].map(s => inlineCode(s)).join('\n')
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
                    (<VoiceChannel>botMember.voice.channel).toString()
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

        const createConnection = joinVoiceChannel({
            guildId: interaction.guild.id,
            channelId: interaction.guild.id,
            adapterCreator: interaction.guild.voiceAdapterCreator
        })

        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                .setTitle('Connecting to VC')
                .setDescription(`Joining ${memberChannel.toString()}...`)
                .setColor(0xffff00)
            ]
        })

        createConnection.on(VoiceConnectionStatus.Ready, async () => {
            await interaction.editReply({
                embeds: [
                    EmbedBuilder.from((await interaction.fetchReply()).embeds[0])
                    .setTitle('Ready to Play Audio')
                    .setDescription(`The bot is ready to play audio in ${memberChannel.toString()}!`)
                    .setColor(0x00ff00)
                ]
            })

            const audioPlayer = createAudioPlayer()

            ytdl(link)
                .pipe(createWriteStream(`./ytfiles/${videoId}.mp3`))

            const videoInfo = await ytdl.getInfo(link)

            const audioResource = createAudioResource(join(__dirname, `./ytfiles/${videoId}.mp3`), { inlineVolume: true })
            audioResource.volume?.setVolume(1)

            console.log(videoInfo)

            audioPlayer.on(AudioPlayerStatus.Playing, async () => {
                await interaction.editReply({
                    embeds: [
                        EmbedBuilder.from((await interaction.fetchReply()).embeds[0])
                        .setTitle('Playing Audio')
                        .setDescription(`Playing audio in ${memberChannel.toString()}!`)
                        .setColor(0x00ffff)
                    ]
                })
            })

            audioPlayer.on(AudioPlayerStatus.Idle, async () => {
                createConnection.destroy()
                await interaction.channel?.send({
                    embeds: [
                        new EmbedBuilder()
                        .setColor(0xff7700)
                        .setTitle(`Audio Finished`)
                        .setDescription(`The audio has finished. Disconnecting from ${memberChannel.toString()}.`)
                    ]
                })
            })
        })

        createConnection.on(VoiceConnectionStatus.Disconnected, async () => {
            await interaction.editReply({
                embeds: [
                    EmbedBuilder.from((await interaction.fetchReply()).embeds[0])
                    .setTitle('Re-connection attempt')
                    .setDescription(`The connection to ${memberChannel.toString()} was cut off, I am attempting to re-connect so please give me 10 seconds...`)
                    .setColor(0xffff00)
                ]
            })
            Promise.race([
                entersState(createConnection, VoiceConnectionStatus.Signalling, 10000),
                entersState(createConnection, VoiceConnectionStatus.Connecting, 10000)
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
                createConnection.destroy()
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

        createConnection.on(VoiceConnectionStatus.Destroyed, async () => {
            await interaction.editReply({
                embeds: [
                    EmbedBuilder.from((await interaction.fetchReply()).embeds[0])
                    .setTitle('Connection Destroyed')
                    .setColor(0xff0000)
                    .setDescription(`Connection to ${memberChannel.toString()} has been manually destroyed, try again.`)
                ]
            })
        })
    }
}

export {
  playCommand
}
