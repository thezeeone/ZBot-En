import { ActionRowBuilder, ApplicationCommandOptionType, ButtonBuilder, ButtonStyle, ChannelType, ChatInputCommandInteraction, EmbedBuilder, GuildMember, italic, NewsChannel, PermissionsBitField } from "discord.js";
import { Cmd, tipsAndTricks } from "./command-exports";

const updatesCommand: Cmd = {
    data: {
        name: 'updates',
        description: 'Receive ZBot updates in your server!',
        options: [
            {
                name: 'channel',
                description: 'The channel to send updates to (default: current channel)',
                type: ApplicationCommandOptionType.Channel,
                channelTypes: [ChannelType.GuildText],
                required: false
            }
        ]
    },
    async execute(interaction: ChatInputCommandInteraction<"cached">) {
        if (interaction.guild.id === '1000073833551769600') return await interaction.reply({
            content: 'Following updates in the support server itself is forbidden - this is the server with the updates channel (<#1000079781041275080>) itself.',
            ephemeral: true
        })

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

        try {
            const announcementChannel = await interaction.client.channels.fetch('1000079781041275080') as NewsChannel

            const botChannelPerms = (interaction.guild.members.me as GuildMember).permissionsIn(channel)

            if (!botChannelPerms.has(PermissionsBitField.Flags.ManageChannels)) return await interaction.reply({
                content: 'This bot must have the `Manage Channels` permission to be able to add updates in this channel.',
                components: interaction.guild.id !== '1000073833551769600' ? [
                        new ActionRowBuilder<ButtonBuilder>()
                            .addComponents(
                                new ButtonBuilder()
                                    .setEmoji('🔗')
                                    .setLabel('Join ZBot Support Server!')
                                    .setStyle(ButtonStyle.Link)
                                    .setURL('https://discord.gg/6tkn6m5g52')
                            )
                    ] : [],
                ephemeral: true
            })

            announcementChannel.addFollower(channel)
                .then(async () => {
                    await interaction.reply({
                        content: `Successfully added ZBot Announcements to ${channel.id === interaction.channel?.id
                                ? 'this channel'
                                : channel.toString()
                            }.\n*Don't like reciving updates? Head to ${channel.id === interaction.channel?.id
                                ? 'this channel\'s settings'
                                : `${channel.toString()} settings`
                            } > \`Integrations\` > \`Channels Followed\` > \`ZBot Server (En) #zbot-announcements\` and click \`Unfollow\`.*\n${Math.random() < 0.1
                                ? `**Did you know?** ${italic(tipsAndTricks[Math.floor(Math.random() * tipsAndTricks.length)])}`
                                : ''
                            }`,
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
                .catch(async (error) => {
                    await interaction.reply({
                        content: 'An error occured while adding ZBot Announcements. You may already be following this channel.',
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
                    console.log(error)
                })
        } catch (error) {
            return await interaction.reply({
                content: 'Announcement channel not found.',
                components: interaction.guild.id !== '1000073833551769600' ? [
                    new ActionRowBuilder<ButtonBuilder>()
                        .addComponents(
                            new ButtonBuilder()
                                .setEmoji('🔗')
                                .setLabel('Join ZBot Support Server!')
                                .setStyle(ButtonStyle.Link)
                                .setURL('https://discord.gg/6tkn6m5g52')
                        )
                ] : [],
                ephemeral: true
            })
        }

        return
    }
}

export {
    updatesCommand
}