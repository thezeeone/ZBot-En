import { ActionRowBuilder, ApplicationCommandType, bold, ButtonBuilder, ButtonStyle, ChannelType, ComponentType, DMChannel, EmbedBuilder, Guild, italic, ModalBuilder, OverwriteType, PermissionsBitField, SelectMenuBuilder, TextChannel, TextInputBuilder, TextInputStyle, time, UserContextMenuCommandInteraction } from "discord.js"
import { TicketTypes, TicketSystemModel } from "../database"
import { pluralise, commaList } from "../util"
import { Cmd } from "./command-exports"

const repliedMessages = new Set<string>()

const reportMemberCommand: Cmd = {
    data: {
        name: 'report-member',
        type: ApplicationCommandType.User
    },
    async execute(interaction: UserContextMenuCommandInteraction<"cached">) {
        const member = interaction.targetMember

        interaction.user.send('Testing DM...')
            .then(async (DMMessage) => {
                await interaction.reply({
                    content: 'Sending DM...',
                    ephemeral: true
                })

                const reasons = [
                    {
                        label: 'Harassment or Abuse',
                        value: 'harassment',
                        description: 'Making comments, bullying, stalking etc.'
                    },
                    {
                        label: 'Spam',
                        value: 'spam',
                        description: 'Repetitive messages, attachment spam, raiding, etc.'
                    },
                    {
                        label: 'Offensive Content',
                        value: 'offence',
                        description: 'Making offensive comments about someone or a group of people'
                    },
                    {
                        label: 'NSFW',
                        value: 'nsfw',
                        description: 'Profile or bio deemed unsafe for viewing'
                    },
                    {
                        label: 'Threats',
                        value: 'threat',
                        description: 'Threatening a member or group of people'
                    },
                    {
                        label: 'Criminal Engagement',
                        value: 'crime',
                        description: 'Engaging in or supporting crime'
                    },
                    {
                        label: 'Suspicious Links',
                        value: 'suspicion',
                        description: 'Posting harmful and/or information-stealing software, suspicious links etc.'
                    },
                    {
                        label: 'Underage',
                        value: 'underage',
                        description: 'A user who is under the minimum required age in their country'
                    },
                    {
                        label: 'Raiding',
                        value: 'raid',
                        description: 'Mass spam or mass user spam in an attempt to crash the server'
                    },
                    {
                        label: 'Hacks',
                        value: 'cheats',
                        description: 'Discussing hacks, cheats to computers games, bots etc.'
                    },
                    {
                        label: 'Userbot',
                        value: 'userbot',
                        description: 'A user controlled by autonomous code'
                    },
                    {
                        label: 'Truancy',
                        value: 'truancy',
                        description: 'Attempting to evade bans or '
                    },
                    {
                        label: 'Other',
                        value: 'other',
                        description: 'Report for another reason'
                    }
                ]

                const selectMenu = new SelectMenuBuilder()
                    .setCustomId('reasons')
                    .setPlaceholder('Select 1 or more reasons')
                    .setMinValues(1)
                    .setMaxValues(12)
                    .setOptions(reasons)

                const selectMenuRow = new ActionRowBuilder<SelectMenuBuilder>()
                    .addComponents(selectMenu)

                const cancelButton = new ButtonBuilder()
                    .setCustomId('cancel')
                    .setLabel('Cancel')
                    .setStyle(ButtonStyle.Danger)

                const buttonRow = new ActionRowBuilder<ButtonBuilder>()
                    .addComponents(cancelButton)

                await DMMessage.edit({
                    content: `Please select a reason, or multiple, for reporting this member. ${italic(`A response is required ${time(Math.floor(Date.now() / 1000) + 180)}`)}`,
                    embeds: [
                        new EmbedBuilder()
                            .setColor(0x00ffff)
                            .setThumbnail(member.user.displayAvatarURL({ forceStatic: false }))
                            .setFields([
                                {
                                    name: 'Username',
                                    value: member.user.username,
                                    inline: true
                                },
                                {
                                    name: 'Discriminator',
                                    value: member.user.discriminator,
                                    inline: true
                                },
                                {
                                    name: 'ID',
                                    value: member.id,
                                    inline: true
                                },
                                {
                                    name: 'Account creation date',
                                    value: `${time(Math.floor(member.user.createdTimestamp / 1000), 'F')} (${time(Math.floor(member.user.createdTimestamp / 1000), 'R')})`,
                                    inline: true
                                },
                                {
                                    name: 'Joined this server',
                                    value: `${time(Math.floor((member.joinedTimestamp as number) / 1000), 'F')} (${time(Math.floor((member.joinedTimestamp as number) / 1000), 'R')})`,
                                    inline: true
                                },
                                {
                                    name: '\u200b',
                                    value: '\u200b',
                                    inline: true
                                }
                            ])
                    ],
                    components: [
                        selectMenuRow,
                        buttonRow
                    ]
                })

                await interaction.editReply('DM sent!')

                const menuCollector = DMMessage.createMessageComponentCollector({
                    componentType: ComponentType.SelectMenu,
                    time: 180000
                })

                const buttonCollector = DMMessage.createMessageComponentCollector({
                    componentType: ComponentType.Button,
                    time: 180000
                })

                menuCollector.on('collect', async (btn) => {
                    const modal = new ModalBuilder()
                        .setCustomId('extra-info')
                        .setTitle('Extra Information')

                    const reportTitle = new TextInputBuilder()
                        .setCustomId('title')
                        .setLabel('Please provide the title of your report.')
                        .setStyle(TextInputStyle.Short)
                        .setPlaceholder('Enter title that describes your report.')
                        .setMinLength(1)
                        .setMaxLength(75)
                        .setRequired(true)

                    const extraInformation = new TextInputBuilder()
                        .setCustomId('info')
                        .setLabel('Please enter as much detail as necessary.')
                        .setMaxLength(750)
                        .setStyle(TextInputStyle.Paragraph)

                    const titleRow = new ActionRowBuilder<TextInputBuilder>().addComponents(reportTitle)
                    const infoRow = new ActionRowBuilder<TextInputBuilder>().addComponents(extraInformation)

                    modal.addComponents(titleRow, infoRow)

                    await btn.showModal(modal)

                    btn.awaitModalSubmit({
                        time: 1800000
                    })
                        .then(async (modalInteraction) => {
                            const titleVal = modalInteraction.fields.getTextInputValue('title')
                            const extraInfoVal = modalInteraction.fields.getTextInputValue('info')

                            await modalInteraction.reply('Creating report ticket...')

                            // @ts-ignore
                            const ticket = await TicketSystemModel.create({
                                creator: interaction.user.id,
                                ticketRecipientChannelId: (modalInteraction.channel as DMChannel).id,
                                ticketType: TicketTypes.ReportMember,
                                closed: false,
                                referenceMessage: '',
                                ticketChannelId: ''
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
                                                name: 'Report Title',
                                                value: titleVal
                                            },
                                            {
                                                name: 'Extra Information',
                                                value: extraInfoVal
                                            },
                                            {
                                                name: 'Username',
                                                value: member.user.username,
                                            },
                                            {
                                                name: 'Discriminator',
                                                value: member.user.discriminator,
                                            },
                                            {
                                                name: 'ID',
                                                value: member.id,
                                            },
                                            {
                                                name: 'Account creation date',
                                                value: `${time(Math.floor(member.user.createdTimestamp / 1000), 'F')} (${time(Math.floor(member.user.createdTimestamp / 1000), 'R')})`,
                                            },
                                            {
                                                name: 'Joined this server',
                                                value: `${time(Math.floor((member.joinedTimestamp as number) / 1000), 'F')} (${time(Math.floor((member.joinedTimestamp as number) / 1000), 'R')})`,
                                            },
                                            {
                                                name: 'Ticket Created',
                                                value: time(Math.floor(Date.now() / 1000), 'R')
                                            },
                                            {
                                                name: 'Ticket Type',
                                                value: 'Message Report'
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
                                    await modalInteraction.editReply(`**Report Ticket #${ticket.id}** created.${(await TicketSystemModel.findAll({ where: { creator: interaction.user.id, closed: false } })).length > 1
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
                                    const DMCollector = (modalInteraction.channel as DMChannel).createMessageCollector({
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

                                            (modalInteraction.channel as DMChannel)?.send({
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
                                                        (`[${ticketNumber.id}] [DM COLLECTOR EVENT 'create'] Sent.`)
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
                                        (modalInteraction.channel as DMChannel).send({
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
                                        }, 600000)
                                    })
                                })
                                .catch(async () => {
                                    return
                                })
                        })
                        .catch(async (error) => {
                            console.log(error)
                            selectMenu
                                .setDisabled(true)
                                .setPlaceholder('You cannot select any options now.')
                            cancelButton
                                .setDisabled(true)
                            await DMMessage.edit({
                                content: 'Modal cancelled.',
                                components: [
                                    selectMenuRow,
                                    buttonRow
                                ]
                            })
                        })
                })

                menuCollector.on('end', async (collected) => {
                    if (!collected.size) {
                        selectMenu
                            .setDisabled(true)
                            .setPlaceholder('You cannot select any options now.')
                        cancelButton
                            .setDisabled(true)
                        await DMMessage.edit({
                            content: 'A response wasn\'t received in time.',
                            components: [
                                selectMenuRow,
                                buttonRow
                            ]
                        })
                    }
                })

                buttonCollector.on('end', async (collected) => {
                    if (!collected.size) {
                        selectMenu
                            .setDisabled(true)
                            .setPlaceholder('You cannot select any options now.')
                        cancelButton
                            .setDisabled(true)
                        await DMMessage.edit({
                            content: 'Cancelled.',
                            components: [
                                selectMenuRow,
                                buttonRow
                            ]
                        })
                    }
                })
            })
            .catch(async () => {
                await interaction.reply({
                    content: 'Please make sure this bot is unblocked and your DMs are open so you can run this command.',
                    ephemeral: true
                })

            })
    }
}

export {
    reportMemberCommand
}