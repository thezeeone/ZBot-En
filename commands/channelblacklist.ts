import { ApplicationCommandOptionType, ChannelType, ChatInputCommandInteraction, TextChannel } from "discord.js";
import { LevelsChannelListModel } from "../database";
import { Cmd } from "./command-exports";

const channelBLCommand: Cmd = {
    data: {
        name: 'xp-blacklist',
        description: 'Blacklist a channel (users can never gain XP in this channel)',
        options: [
            {
                name: 'channel',
                description: 'The channel to add to/remove from blacklist',
                type: ApplicationCommandOptionType.Channel,
                channelTypes: [ChannelType.GuildText],
                required: true
            }
        ]
    },
    async execute(interaction: ChatInputCommandInteraction<"cached">) {
        const channel = interaction.options.getChannel('channel', true)

        const isChannelBlacklisted = await LevelsChannelListModel.findOne({
            where: {
                guildId: interaction.guild.id,
                channelId: (interaction.channel as TextChannel).id
            }
        })

        if (!isChannelBlacklisted) {
            LevelsChannelListModel.create({
                guildId: interaction.guild.id,
                channelId: (interaction.channel as TextChannel).id,
                allowed: false
            })
            .then(async () => {
                await interaction.reply(`Successfully blacklisted ${
                    channel.id === interaction.channel?.id
                    ? 'this channel'
                    : channel.toString()
                }; members will never get XP for sending messages in ${
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
        } else {
            if (!isChannelBlacklisted.allowed) return await interaction.reply({
                content: 'This channel is already blacklisted.',
                ephemeral: true
            })
            else {
                isChannelBlacklisted.allowed = false
                await interaction.reply(`Successfully blacklisted ${
                    channel.id === interaction.channel?.id
                    ? 'this channel'
                    : channel.toString()
                }; members will never get XP for sending messages in ${
                    channel.id === interaction.channel?.id
                    ? 'this'
                    : 'that'
                } channel.`)
            }
        }

        return
    }
}

export {
    channelBLCommand
}