import { ApplicationCommandOptionType, ChatInputCommandInteraction, ChannelType, EmbedBuilder, bold, inlineCode, PermissionsBitField, GuildMember } from "discord.js"
import { commaList, pluralise } from "../util"
import { Cmd } from "./command-exports"

const slowmodeCommand: Cmd = {
    data: {
        name: 'slowmode',
        description: 'Display or set the slowmode of a text channel',
        options: [
            {
                name: 'display',
                description: 'Display the slowmode of a text channel',
                type: ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: 'channel',
                        description: 'The channel to display the slowmode of',
                        type: ApplicationCommandOptionType.Channel,
                        required: false
                    }
                ]
            },
            {
                name: 'set',
                description: 'Set the slowmode of a text channel',
                type: ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: 'new',
                        description: 'Set the slowmode of the channel to this value (in seconds, between 0 and 21,600)',
                        type: ApplicationCommandOptionType.Integer,
                        required: true
                    },
                    {
                        name: 'channel',
                        description: 'The channel to set the slowmode to',
                        type: ApplicationCommandOptionType.Channel,
                        required: false
                    }
                ]
            }
        ]
    },
    async execute(interaction: ChatInputCommandInteraction<"cached">) {
        const interactionSc = interaction.options.getSubcommand(true) as "display" | "set"

        if (interactionSc === "display") {
            const channel = interaction.options.getChannel('channel') || interaction.channel

            if (channel?.type !== ChannelType.GuildText) return await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setTitle('Invalid Channel Type')
                    .setDescription(`The channel type is invalid.\nThe channel must be a text channel.`)
                    .setColor(0xff0000)
                ],
                ephemeral: true
            })

            const channelSm = channel.rateLimitPerUser

            const [
                hours,
                minutes,
                seconds
            ] = [
                Math.floor(Number(channelSm) / 3600),
                Math.floor(Number(channelSm) / 60) % 60,
                Math.floor(Number(channelSm)) % 60
            ]
            .map((r, i) => pluralise(r, ["hour", "minute", "second"][i]))

            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setColor(0x00ff00)
                    .setTitle('Channel Slowmode')
                    .setDescription(
                        channelSm
                        ? `The slowmode for this text channel is ${bold(
                            commaList([hours, minutes, seconds].filter(s => !s.startsWith('0')))
                        )}.`
                        : "This channel doesn't have slowmode."
                    )
                ]
            })
        } else {
            const botMember = <GuildMember>interaction.guild.members.me

            const perms = new PermissionsBitField('ManageChannels').toArray()

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
                        .setTitle(`Missing Permissions`)
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

            const channel = interaction.options.getChannel('channel') || interaction.channel

            if (channel?.type !== ChannelType.GuildText) return await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setTitle('Invalid Channel Type')
                    .setDescription(`The channel type is invalid.\nThe channel must be a text channel.`)
                    .setColor(0xff0000)
                ],
                ephemeral: true
            })

            const oldChannelSm = channel.rateLimitPerUser

            const [
                oldHours,
                oldMinutes,
                oldSeconds
            ] = [
                Math.floor(Number(oldChannelSm) / 3600),
                Math.floor(Number(oldChannelSm) / 60) % 60,
                Math.floor(Number(oldChannelSm)) % 60
            ]
            .map((r, i) => pluralise(r, ["hour", "minute", "second"][i]))

            const newChannelSm = interaction.options.getInteger('new', true)            

            const [
                newHours,
                newMinutes,
                newSeconds
            ] = [
                Math.floor(Number(newChannelSm) / 3600),
                Math.floor(Number(newChannelSm) / 60) % 60,
                Math.floor(Number(newChannelSm)) % 60
            ]
            .map((r, i) => pluralise(r, ["hour", "minute", "second"][i]))

            channel.setRateLimitPerUser(newChannelSm)
            .then(async () => {
                await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setColor(0x00ff00)
                        .setTitle('Set New Channel Slowmode')
                        .setDescription(`Set the slowmode of the channel.`)
                        .addFields([
                            {
                                name: 'Old',
                                value: oldChannelSm
                                ? bold(
                                    commaList([oldHours, oldMinutes, oldSeconds].filter(s => !s.startsWith('0')))
                                )
                                : "No slowmode"
                            },
                            {
                                name: 'New',
                                value: newChannelSm
                                ? bold(
                                    commaList([newHours, newMinutes, newSeconds].filter(s => !s.startsWith('0')))
                                )
                                : "No slowmode"
                            }
                        ]
                        )
                    ]
                })
            })
            .catch(async () => {
                await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setColor(0xff0000)
                        .setTitle('Failed to Set Channel Slowmode')
                        .setDescription(`Failed to set the slowmode for the channel. Reason unknown.`)
                    ]
                })
            })
        }
    }
}

export {
    slowmodeCommand
}