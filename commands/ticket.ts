import { ActionRowBuilder, ApplicationCommandOptionType, ButtonBuilder, ButtonStyle, ChannelType, ChatInputCommandInteraction, EmbedBuilder, OverwriteType, PermissionsBitField, time } from "discord.js"
import { TicketSystemModel, TicketTypes } from "../database"
import { Cmd } from "./command-exports"

const ticketCommand: Cmd = {
    data: {
        name: 'ticket',
        description: 'Create ot delete tickets',
        options: [
            {
                name: 'create',
                description: 'Create a ticket',
                type: ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: 'message',
                        description: 'The message for the ticket (max len 250)',
                        type: ApplicationCommandOptionType.String,
                        required: true,
                        minLength: 1,
                        maxLength: 250
                    }
                ]
            },
            {
                name: 'close',
                description: 'Close a certain ticket',
                type: ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: 'id',
                        description: 'The ID of the ticket to close',
                        type: ApplicationCommandOptionType.Integer,
                        required: true
                    }
                ]
            }
        ]
    },
    async execute(interaction: ChatInputCommandInteraction<"cached">) {
        if (interaction.guild.id !== '1000073833551769600') {
            return await interaction.reply({
                content: `This command only works in the official support server!`,
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

        const subcommand = interaction.options.getSubcommand(true) as 'create' | 'close'

        if (subcommand === 'close') {
            const id = interaction.options.getInteger('id', true)

            const ticket = await TicketSystemModel.findByPk(id)

            if (!ticket) {
                await interaction.reply({
                    content: `**Ticket #${id}** does not exist.`,
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
            } else {
                
            }
        } else if (subcommand === 'create') {
            interaction.user.send(`Creating ticket...`)
            .then(async (DMMessage) => {
                await interaction.reply({
                    content: `Creating ticket...`,
                    ephemeral: true
                })

                const message = interaction.options.getString('message', true)
                
                // @ts-ignore
                const ticket = await TicketSystemModel.create({
                    creator: interaction.user.id,
                    ticketRecipientChannelId: DMMessage.channel.id,
                    ticketType: TicketTypes.Normal,
                    closed: false,
                    referenceMessage: '',
                    ticketChannelId: '',
                })

                const channel = await interaction.guild.channels.create({
                    type: ChannelType.GuildText,
                    name: 'new-ticket',
                    permissionOverwrites: [
                        {
                            id: interaction.guild.id,
                            type: OverwriteType.Role,
                            deny: PermissionsBitField.Flags.ViewChannel
                        },
                        ...['1000082840697970870', '1021429868900134952', '1016681069703073823', '1000076492023267429', '1013960404797493398', '1023228765934981230', '1014969108401500180']
                        .map((s) => {
                            return {
                                id: s,
                                type: OverwriteType.Role,
                                allow: PermissionsBitField.Flags.ViewChannel | PermissionsBitField.Flags.AddReactions | PermissionsBitField.Flags.ReadMessageHistory
                                | PermissionsBitField.Flags.AttachFiles | PermissionsBitField.Flags.EmbedLinks | PermissionsBitField.Flags.ManageMessages
                            }
                        })
                    ]
                })

                channel.send({
                    embeds: [
                        new EmbedBuilder()
                        .setColor(0x00ffff)
                        .setAuthor({
                            name: `${interaction.member?.nickname ? `${interaction.member.nickname} (${interaction.user.tag})` : interaction.user.tag} (${interaction.user.id})`,
                            iconURL: interaction.user.displayAvatarURL({ forceStatic: false })
                        })
                        .setTitle(`Ticket #${ticket.id}`)
                        .addFields([
                            {
                                name: 'Message',
                                value: message
                            },
                            {
                                name: 'Creation Date',
                                value: time(Date.now(), 'R')
                            },
                            {
                                name: 'Type',
                                value: 'Normal'
                            }
                        ])
                    ]
                })
                .then(async (message) => {
                    await channel.edit({
                        topic: `This is **ticket #${ticket.id}**, created by ${interaction.member?.nickname ? `${interaction.member.nickname} (${interaction.user.tag})` : interaction.user.tag} (${interaction.user.id}) ${time(Date.now(), 'R')}. Use **/ticket close id: ${ticket.id}** to close the ticket.`,
                        name: `ticket-${ticket.id}`
                    })
                    await ticket.update({
                        referenceMessage: message.url,
                        ticketChannelId: channel.id
                    })
                    await interaction.editReply({ 
                        content: `Your **ticket #${ticket.id}** has been created. If you would like to use the ticket, please wait for a staff response which will be send in DMs.`,
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
                    await DMMessage.edit(`**Ticket #${ticket.id}** created.`)
                })
            })
            .catch(async () => {
                await interaction.reply({
                    content: `Please make sure this bot is unblocked and your DMs are open so you can run this command.`,
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
            })
        }

        return
    }
}

export {
    ticketCommand
}