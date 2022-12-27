<<<<<<< HEAD
import { ActionRowBuilder, ApplicationCommandOptionType, ButtonBuilder, ButtonStyle, ChannelType, ChatInputCommandInteraction, TextChannel } from "discord.js";
=======
import { ApplicationCommandOptionType, ChannelType, ChatInputCommandInteraction, TextChannel } from "discord.js";
>>>>>>> 79ddbb67222cabc17fdf0f5147ba5585e46dafb7
import { LevelsChannelListModel } from "../database";
import { Cmd } from "./command-exports";

const channelWLCommand: Cmd = {
    data: {
        name: 'xp-whitelist',
        description: 'Whitelist a channel (users can always gain XP in this channel)',
        options: [
            {
                name: 'channel',
                description: 'The channel to add to/remove from whitelist',
                type: ApplicationCommandOptionType.Channel,
                channelTypes: [ChannelType.GuildText],
                required: true
            }
        ]
    },
    async execute(interaction: ChatInputCommandInteraction<"cached">) {
        const channel = interaction.options.getChannel('channel', true)

        const isChannelWhitelisted = await LevelsChannelListModel.findOne({
            where: {
                guildId: interaction.guild.id,
                channelId: (interaction.channel as TextChannel).id
            }
        })

        if (isChannelWhitelisted) {
            if (isChannelWhitelisted.allowed) return await interaction.reply({
                content: 'This channel is already whitelisted.',
                ephemeral: true
            })
            else {
                isChannelWhitelisted.allowed = true
<<<<<<< HEAD
                await interaction.reply({
                    content: `Successfully whitelisted ${channel.id === interaction.channel?.id
                        ? 'this channel'
                        : channel.toString()
                        }; members can always get XP for sending messages in ${channel.id === interaction.channel?.id
                            ? 'this'
                            : 'that'
                        } channel.`,
                    components: interaction.guild.id !== '1000073833551769600' ? [
                        new ActionRowBuilder<ButtonBuilder>()
                            .addComponents(
                                new ButtonBuilder()
                                    .setEmoji('🔗')
                                    .setLabel('Join ZBot Support Server!')
                                    .setStyle(ButtonStyle.Link)
                                    .setURL('https://discord.gg/6tkn6m5g52')
                            )
                    ] : []
                })
=======
                await interaction.reply(`Successfully whitelisted ${
                    channel.id === interaction.channel?.id
                    ? 'this channel'
                    : channel.toString()
                }; members can always get XP for sending messages in ${
                    channel.id === interaction.channel?.id
                    ? 'this'
                    : 'that'
                } channel.`)
>>>>>>> 79ddbb67222cabc17fdf0f5147ba5585e46dafb7
            }
        } else {
            LevelsChannelListModel.create({
                guildId: interaction.guild.id,
                channelId: (interaction.channel as TextChannel).id,
                allowed: true
            })
<<<<<<< HEAD
                .then(async () => {
                    await interaction.reply({
                        content: `Successfully whitelisted ${channel.id === interaction.channel?.id
                            ? 'this channel'
                            : channel.toString()
                            }; members can always get XP for sending messages in ${channel.id === interaction.channel?.id
                                ? 'this'
                                : 'that'
                            } channel.`,
                        components: interaction.guild.id !== '1000073833551769600' ? [
                            new ActionRowBuilder<ButtonBuilder>()
                                .addComponents(
                                    new ButtonBuilder()
                                        .setEmoji('🔗')
                                        .setLabel('Join ZBot Support Server!')
                                        .setStyle(ButtonStyle.Link)
                                        .setURL('https://discord.gg/6tkn6m5g52')
                                )
                        ] : []
                    })
                })
                .catch(async () => {
                    await interaction.reply({
                        content: 'An error occured, please retry. If this problem persists, use the `/report-problem` command.',
                        ephemeral: true
                    })
                })
=======
            .then(async () => {
                await interaction.reply(`Successfully whitelisted ${
                    channel.id === interaction.channel?.id
                    ? 'this channel'
                    : channel.toString()
                }; members can always get XP for sending messages in ${
                    channel.id === interaction.channel?.id
                    ? 'this'
                    : 'that'
                } channel.`)
            })
            .catch(async () => {
                await interaction.reply({
                    content: 'An error occured, please retry. If this problem persists, use the `/report-problem` command.',
                    ephemeral: true
                })
            })
>>>>>>> 79ddbb67222cabc17fdf0f5147ba5585e46dafb7
        }

        return
    }
}

export {
    channelWLCommand
}