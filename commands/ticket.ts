import { ApplicationCommandOptionType, bold, ChannelType, ChatInputCommandInteraction, DMChannel, EmbedBuilder, Guild, italic, OverwriteType, PermissionsBitField, TextChannel, time } from "discord.js"
import { repliedMessages } from ".."
import { TicketSystemModel, TicketTypes } from "../database"
import { commaList, pluralise } from "../util"
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
        if (interaction.guild?.id !== '1000073833551769600') {
            return await interaction.reply({
                content: 'This command only works in the official support server, [ZBot Server (En)](https://discord.gg/6tkn6m5g52)!',
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
                    ephemeral: true
                })
                return
            } else {
                if (ticket.closed) await interaction.reply({ content: 'This ticket is already closed!', ephemeral: true })
                else {
                    if (ticket.creator !== interaction.user.id) {
                        if ([
                            '1000082840697970870', '1021429868900134952', '1016681069703073823', '1000076492023267429', '1013960404797493398', '1023228765934981230', '1014969108401500180'
                        ].some(r => interaction.member.roles.cache.has(r))) {
                            ticket.update({
                                closed: true
                            })
                                .then(async () => {
                                    const ticketCreator = await interaction.client.users.fetch(ticket.creator)

                                    ticketCreator.send({
                                        embeds: [
                                            new EmbedBuilder()
                                                .setColor(0xff0000)
                                                .setTitle(`Ticket #${ticket.id} closed`)
                                                .setDescription('A staff member closed this ticket. You can no longer send messages through this ticket.')
                                        ]
                                    })
                                        .then(async () => {
                                            await interaction.reply({
                                                content: 'Ticket closed.',
                                                ephemeral: true
                                            })
                                        })
                                        .catch(async () => {
                                            await interaction.reply({
                                                content: 'Ticket closed. Couldn\'t send the DM.',
                                                ephemeral: true
                                            })
                                        })
                                        .finally(async () => {
                                            interaction.guild.channels.fetch(ticket.ticketChannelId)
                                                .then(async (channel) => {
                                                    (channel as TextChannel).send({
                                                        embeds: [
                                                            new EmbedBuilder()
                                                                .setColor(0xff0000)
                                                                .setTitle(`Ticket #${ticket.id} closed`)
                                                                .setDescription(`A staff member closed this ticket. You can no longer send messages through this ticket.\n\n${italic(`This channel will be deleted ${time(Math.floor(Date.now() / 1000) + 600, 'R')}.`)}`)
                                                        ]
                                                    })
                                                        .then(() => {
                                                            setTimeout(() => {
                                                                try {
                                                                    (channel as TextChannel).delete()
                                                                } catch {
                                                                    return
                                                                }
                                                            }, 600000)
                                                        })
                                                })
                                                .catch(() => {
                                                    return
                                                })
                                        })
                                })
                                .catch(async () => {
                                    await interaction.reply({
                                        content: 'Couldn\'t close this ticket.',
                                        ephemeral: true
                                    })
                                })
                        } else {
                            await interaction.reply({
                                content: 'You cannot close a ticket that hasn\'t been created by you!',
                                ephemeral: true
                            })
                            return
                        }
                    } else {
                        ticket.update({
                            closed: true
                        })
                            .then(async () => {
                                interaction.user.send({
                                    embeds: [
                                        new EmbedBuilder()
                                            .setColor(0xff0000)
                                            .setTitle(`Ticket #${ticket.id} closed`)
                                            .setDescription('You closed this ticket. You can no longer send messages through this ticket.')
                                    ]
                                })
                                    .then(async () => {
                                        await interaction.reply({
                                            content: 'Ticket closed.',
                                            ephemeral: true
                                        })
                                    })
                                    .catch(async () => {
                                        await interaction.reply({
                                            content: 'Ticket closed. Couldn\'t send the DM.',
                                            ephemeral: true
                                        })
                                    })
                                    .finally(async () => {
                                        interaction.guild.channels.fetch(ticket.ticketChannelId)
                                            .then(async (channel) => {
                                                (channel as TextChannel).send({
                                                    embeds: [
                                                        new EmbedBuilder()
                                                            .setColor(0xff0000)
                                                            .setTitle(`Ticket #${ticket.id} closed`)
                                                            .setDescription(`The recipient closed this ticket. You can no longer send messages through this ticket.\n\n${italic(`This channel will be deleted ${time(Math.floor(Date.now() / 1000) + 600, 'R')}.`)}`)
                                                    ]
                                                })
                                                    .then(() => {
                                                        channel?.permissionOverwrites.set([
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
                                                                        allow: PermissionsBitField.Flags.ViewChannel,
                                                                        deny: PermissionsBitField.Flags.SendMessages | PermissionsBitField.Flags.AttachFiles | PermissionsBitField.Flags.EmbedLinks | PermissionsBitField.Flags.AddReactions | PermissionsBitField.Flags.ManageMessages
                                                                    }
                                                                })
                                                        ])
                                                        setTimeout(() => {
                                                            try {
                                                                (channel as TextChannel).delete()
                                                            } catch {
                                                                return
                                                            }
                                                        }, 600000)
                                                    })
                                            })
                                            .catch(() => {
                                                return
                                            })
                                    })
                            })
                            .catch(async () => {
                                await interaction.reply({
                                    content: 'Couldn\'t close this ticket.',
                                    ephemeral: true
                                })
                            })
                    }
                }
            }
        } else if (subcommand === 'create') {
            interaction.user.send(`Creating ticket...`)
                .then(async (dmMessage) => {
                    await interaction.reply({
                        content: `Creating ticket...`,
                        ephemeral: true
                    })

                    const message = interaction.options.getString('message', true)

                    // @ts-ignore
                    const ticket = await TicketSystemModel.create({
                        creator: interaction.user.id,
                        ticketRecipientChannelId: dmMessage.channel.id,
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
                        ],
                        parent: '1021361153202470942'
                    })

                    channel.send({
                        content: `<@1023228765934981230>`,
                        embeds: [
                            new EmbedBuilder()
                                .setColor(0x00ffff)
                                .setAuthor({
                                    name: `${interaction.user.tag} (${interaction.user.id})`,
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
                                        value: time(Math.floor(Date.now() / 1000), 'R')
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
                                topic: `This is **ticket #${ticket.id}**, created by ${interaction.user.tag} (${interaction.user.id}) ${time(Math.floor(Date.now() / 1000), 'R')}. Use **/ticket close id: ${ticket.id}** to close the ticket.`,
                                name: `ticket-${ticket.id}`
                            })
                            await ticket.update({
                                referenceMessage: message.url,
                                ticketChannelId: channel.id
                            })
                            await interaction.editReply(`Your **ticket #${ticket.id}** has been created. If you would like to use the ticket, please wait for a staff response which will be sent in DMs.`)
                            await dmMessage.edit(`**Ticket #${ticket.id}** created.${(await TicketSystemModel.findAll({ where: { creator: interaction.user.id, closed: false } })).length > 1
                                ? `\n\nYou now have **more than one** ticket open (${(await TicketSystemModel.findAll({ where: { creator: interaction.user.id, closed: false } })).length > 3
                                    ? `${commaList((await TicketSystemModel.findAll({ where: { creator: interaction.user.id, closed: false } })).slice(0, 3).map(s => `Ticket #${s.id}`).concat(`${(await TicketSystemModel.findAll({ where: { creator: interaction.user.id, closed: false } })).length - 3} more`))}`
                                    : commaList((await TicketSystemModel.findAll({ where: { creator: interaction.user.id, closed: false } })).map(s => `Ticket #${s.id}`))
                                }). If you would like to get your message sent to a specific ticket, reply to one of the embeds sent by the bot.`
                                : ''
                                }`)

                            const collector = channel.createMessageCollector({
                                time: 2700000,
                                filter: msg => !msg.author.bot
                            })
                            const DMCollector = (dmMessage.channel as DMChannel).createMessageCollector({
                                filter: async (msg) => {
                                    if (msg.author.bot) {
                                        return false
                                    }

                                    if ((await TicketSystemModel.findAll({ where: { creator: msg.author.id, closed: false } })).length > 1) {
                                        try {
                                            const reference = await msg.fetchReference()
                                            if (reference.embeds[0]?.title?.startsWith('Ticket #')) {
                                                const ticketNum = Number(reference.embeds[0].title.replace('Ticket #', ''))
                                                const foundTicket = await TicketSystemModel.findOne({
                                                    where: {
                                                        id: ticketNum
                                                    }
                                                })
                                                if (foundTicket && !foundTicket.closed && foundTicket.id === ticket.id) {
                                                    return true
                                                } else {
                                                    return false
                                                }
                                            } else {
                                                return false
                                            }
                                        } catch {
                                            setTimeout(async() => {
                                                if (!repliedMessages.has(msg.id)) {
                                                    await msg.reply({
                                                        content: `You currently have ${bold(pluralise((await TicketSystemModel.findAll({ where: { creator: msg.author.id, closed: false } })).length, 'open ticket', 'open tickets'))} open (${(await TicketSystemModel.findAll({ where: { creator: msg.author.id, closed: false } })).length > 3
                                                            ? `${commaList((await TicketSystemModel.findAll({ where: { creator: msg.author.id, closed: false } })).slice(0, 3).map(s => `Ticket #${s.id}`).concat(`${(await TicketSystemModel.findAll({ where: { creator: msg.author.id, closed: false } })).length - 3} more`))}`
                                                            : commaList((await TicketSystemModel.findAll({ where: { creator: msg.author.id, closed: false } })).map(s => `Ticket #${s.id}`))
                                                            }). If you would like to get your message sent to a specific ticket, reply to one of the embeds sent by the bot.`,
                                                        allowedMentions: {
                                                            repliedUser: false
                                                        }
                                                    })
                                                        .then(() => {
                                                            repliedMessages.add(msg.id)
                                                        })
                                                }
                                            }, 100)
                                            return false
                                        }
                                    } else {
                                        if ((await TicketSystemModel.findAll({ where: { creator: msg.author.id, closed: false } })).length === 0) {
                                            return false
                                        }
                                        return true
                                    }
                                },
                                time: 2700000
                            })

                            collector.on('collect', async (msg) => {
                                collector.resetTimer()
                                try {
                                    const embed = new EmbedBuilder()
                                        .setAuthor({
                                            name: `${msg.author.tag} (${msg.author.id})`,
                                            iconURL: msg.author.displayAvatarURL({ forceStatic: false })
                                        })
                                        .setColor(0x00ffff)
                                        .setTitle(`Ticket #${ticket.id}`)

                                    if (msg.content) embed.setDescription(msg.content)
                                    if (msg.attachments.size) embed.setFields([
                                        {
                                            name: 'Attachments',
                                            value: msg.attachments.size
                                                ? pluralise(msg.attachments.size, 'attachment')
                                                : '*None*'
                                        }
                                    ]);
                                    if ((await TicketSystemModel.findAll({ where: { creator: msg.author.id, closed: false } })).length > 1) {
                                        embed.setFooter({ text: 'You have more than one ticket open. If you would like to get your message sent to this ticket, please reply to this message.' })
                                    } else {
                                        embed.setFooter({ text: 'This is the only ticket you have open as of now. You do not need to reply to this message for your message to be sent.' })
                                    }

                                    (dmMessage.channel as DMChannel)?.send({
                                        embeds: [
                                            embed
                                        ],
                                        files: [...msg.attachments.values()]
                                    })
                                        .then(async () => {
                                            await msg.react('✅')
                                        })
                                } catch {
                                    msg.react('❌')
                                        .then(async () => {
                                            await msg.channel.send({
                                                embeds: [
                                                    new EmbedBuilder()
                                                        .setColor(0xff0000)
                                                        .setTitle(`Ticket #${ticket.id} closed`)
                                                        .setDescription(`Couldn\'t DM the recipient. You can no longer send messages through this ticket.\n\n${italic(`This channel will be deleted ${time(Math.floor(Date.now() / 1000) + 600, 'R')}`)}`)
                                                ]
                                            })
                                            channel?.permissionOverwrites.set([
                                                {
                                                    id: (msg.guild as Guild).id,
                                                    type: OverwriteType.Role,
                                                    deny: PermissionsBitField.Flags.ViewChannel
                                                },
                                                ...['1000082840697970870', '1021429868900134952', '1016681069703073823', '1000076492023267429', '1013960404797493398', '1023228765934981230', '1014969108401500180']
                                                    .map((s) => {
                                                        return {
                                                            id: s,
                                                            type: OverwriteType.Role,
                                                            allow: PermissionsBitField.Flags.ViewChannel,
                                                            deny: PermissionsBitField.Flags.SendMessages | PermissionsBitField.Flags.AttachFiles | PermissionsBitField.Flags.EmbedLinks | PermissionsBitField.Flags.AddReactions | PermissionsBitField.Flags.ManageMessages
                                                        }
                                                    })
                                            ])
                                            setTimeout(() => {
                                                try {
                                                    (channel as TextChannel).delete()
                                                } catch {
                                                    return
                                                }
                                            }, 600000)
                                        })
                                        .finally(() => {
                                            collector.stop()
                                            DMCollector.stop()
                                        })
                                }
                            })

                            DMCollector.on('collect', async (msg) => {
                                DMCollector.resetTimer()
                                const openTickets = (await TicketSystemModel.findAll({
                                    where: {
                                        creator: interaction.user.id,
                                        closed: false
                                    }
                                })).length

                                if (openTickets == 0) return
                                else if (openTickets === 1) {
                                    const ticket = Number(msg.embeds[0]?.title?.replace('Ticket #', ''))
                                    const ticketNumber = await TicketSystemModel.findByPk(ticket)
                                    if (!ticketNumber) return
                                    const ticketChannel = await interaction.client.channels.fetch(ticketNumber?.ticketChannelId as string) as TextChannel
                                    try {
                                        const embed = new EmbedBuilder()
                                            .setAuthor({
                                                name: `${msg.author.tag} (${msg.author.id})`,
                                                iconURL: msg.author.displayAvatarURL({ forceStatic: false })
                                            })
                                            .setColor(0x00ffff)

                                        if (msg.content) embed.setDescription(msg.content)
                                        if (msg.attachments.size) embed.setFields([
                                            {
                                                name: 'Attachments',
                                                value: msg.attachments.size
                                                    ? pluralise(msg.attachments.size, 'attachment')
                                                    : '*None*'
                                            }
                                        ]);

                                        ticketChannel.send({
                                            embeds: [
                                                embed
                                            ],
                                            files: [...msg.attachments.values()]
                                        })
                                            .then(async () => {
                                                await msg.react('✅')
                                            })
                                    } catch {
                                        msg.react('❌')
                                            .then(async () => {
                                                await msg.channel.send({
                                                    embeds: [
                                                        new EmbedBuilder()
                                                            .setColor(0xff0000)
                                                            .setTitle(`Ticket #${(await TicketSystemModel.findByPk(ticket) as TicketSystemModel).id} closed`)
                                                            .setDescription(`Couldn\'t send your message to the staff. You can no longer send messages through this ticket.`)
                                                    ]
                                                })
                                                ticketChannel.permissionOverwrites.set([
                                                    {
                                                        id: (msg.guild as Guild).id,
                                                        type: OverwriteType.Role,
                                                        deny: PermissionsBitField.Flags.ViewChannel
                                                    },
                                                    ...['1000082840697970870', '1021429868900134952', '1016681069703073823', '1000076492023267429', '1013960404797493398', '1023228765934981230', '1014969108401500180']
                                                        .map((s) => {
                                                            return {
                                                                id: s,
                                                                type: OverwriteType.Role,
                                                                allow: PermissionsBitField.Flags.ViewChannel,
                                                                deny: PermissionsBitField.Flags.SendMessages | PermissionsBitField.Flags.AttachFiles | PermissionsBitField.Flags.EmbedLinks | PermissionsBitField.Flags.AddReactions | PermissionsBitField.Flags.ManageMessages
                                                            }
                                                        })
                                                ])
                                                setTimeout(() => {
                                                    try {
                                                        ticketChannel.delete()
                                                    } catch {
                                                        return
                                                    }
                                                }, 600000)
                                            })
                                            .finally(() => {
                                                collector.stop()
                                                DMCollector.stop()
                                            })
                                    }
                                } else {
                                    msg.fetchReference()
                                        .then(async (reference) => {
                                            const ticket = Number(reference.embeds[0]?.title?.replace('Ticket #', ''))
                                            const ticketNumber = await TicketSystemModel.findOne({ where: { id: ticket } })
                                            if (!ticketNumber) return
                                            const ticketChannel = await interaction.client.channels.fetch(ticketNumber?.ticketChannelId as string) as TextChannel
                                            try {
                                                const embed = new EmbedBuilder()
                                                    .setAuthor({
                                                        name: `${msg.author.tag} (${msg.author.id})`,
                                                        iconURL: msg.author.displayAvatarURL({ forceStatic: false })
                                                    })
                                                    .setColor(0x00ffff)

                                                if (msg.content) embed.setDescription(msg.content)
                                                if (msg.attachments.size) embed.setFields([
                                                    {
                                                        name: 'Attachments',
                                                        value: msg.attachments.size
                                                            ? pluralise(msg.attachments.size, 'attachment')
                                                            : '*None*'
                                                    }
                                                ]);

                                                ticketChannel.send({
                                                    embeds: [
                                                        embed
                                                    ],
                                                    files: [...msg.attachments.values()]
                                                })
                                                    .then(async () => {
                                                        await msg.react('✅')
                                                    })
                                            } catch {
                                                msg.react('❌')
                                                    .then(async () => {
                                                        await msg.channel.send({
                                                            embeds: [
                                                                new EmbedBuilder()
                                                                    .setColor(0xff0000)
                                                                    .setTitle(`Ticket #${(await TicketSystemModel.findByPk(ticket) as TicketSystemModel).id} closed`)
                                                                    .setDescription(`Couldn\'t send your message to the staff. You can no longer send messages through this ticket.`)
                                                            ]
                                                        })
                                                        ticketChannel.permissionOverwrites.set([
                                                            {
                                                                id: (msg.guild as Guild).id,
                                                                type: OverwriteType.Role,
                                                                deny: PermissionsBitField.Flags.ViewChannel
                                                            },
                                                            ...['1000082840697970870', '1021429868900134952', '1016681069703073823', '1000076492023267429', '1013960404797493398', '1023228765934981230', '1014969108401500180']
                                                                .map((s) => {
                                                                    return {
                                                                        id: s,
                                                                        type: OverwriteType.Role,
                                                                        allow: PermissionsBitField.Flags.ViewChannel,
                                                                        deny: PermissionsBitField.Flags.SendMessages | PermissionsBitField.Flags.AttachFiles | PermissionsBitField.Flags.EmbedLinks | PermissionsBitField.Flags.AddReactions | PermissionsBitField.Flags.ManageMessages
                                                                    }
                                                                })
                                                        ])
                                                        setTimeout(() => {
                                                            try {
                                                                ticketChannel.delete()
                                                            } catch {
                                                                return
                                                            }
                                                        }, 600000)
                                                    })
                                                    .finally(() => {
                                                        collector.stop()
                                                        DMCollector.stop()
                                                    })
                                            }
                                        })
                                        .catch(console.error)
                                }
                            })

                            collector.on('end', async () => {
                                dmMessage.channel.send({
                                    embeds: [
                                        new EmbedBuilder()
                                            .setColor(0xff0000)
                                            .setTitle(`Ticket #${ticket.id} closed`)
                                            .setDescription(`Ticket closed. You can no longer send messages through this ticket.\n\n${italic(`This channel will be deleted ${time(Math.floor(Date.now() / 1000) + 600, 'R')}`)}`)
                                    ]
                                })
                                    .catch(() => null)
                                channel.send({
                                    embeds: [
                                        new EmbedBuilder()
                                            .setColor(0xff0000)
                                            .setTitle(`Ticket #${ticket.id} closed`)
                                            .setDescription(`Ticket closed. You can no longer send messages through this ticket.\n\n${italic(`This channel will be deleted ${time(Math.floor(Date.now() / 1000) + 600, 'R')}`)}`)
                                    ]
                                })
                                    .catch(() => null)
                                setTimeout(async () => {
                                    try {
                                        await channel.delete()
                                    } catch {
                                        return
                                    }
                                },)
                            })
                        })
                        .catch(async () => {
                            return
                        })
                })
                .catch(async () => {
                    await interaction.reply({
                        content: `Please make sure this bot is unblocked and your DMs are open so you can run this command.`,
                        ephemeral: true
                    })
                })
        }
    }
}

export {
    ticketCommand
}
