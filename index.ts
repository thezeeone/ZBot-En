import { Client, italic, GatewayIntentBits, GuildMemberRoleManager, InteractionType, ChatInputCommandInteraction, ClientApplication, Guild, GuildMember, underscore, EmbedBuilder, inlineCode, ActivitiesOptions, ActivityType, ClientUser, PermissionsBitField, TextChannel, CategoryChannel, ChannelType, DMChannel, time, OverwriteType, bold, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js"
import { config } from "dotenv"
import { blacklistCommand } from "./commands/blacklist"
config()

import { Cmd, tipsAndTricks, leaderboardCommand, serverInfoCommand, rankCommand, timeoutCommand, kickCommand, banCommand, tttCommand, memoryGameCommand, pingCommand, slowmodeCommand, helpCommand, inviteCommand, updatesCommand, userInfoCommand, memberInfoCommand, balanceCommand, withdrawCommand, depositCommand, giveCommand, ticketCommand, reportMessageCommand, reportMemberCommand, questionCommand, quizCommand, sudokuCommand, voteCommand, warnCommand, welcomeEditorCommand, zBankCommand } from "./commands/command-exports"
import { sequelize, LevelModel, BlacklistModel, RankCardModel, TicketSystemModel, EconomyModel, XPBoostsModel, ZCentralBankModel } from "./database"
import { commaList, pluralise } from "./util"

const repliedMessages = new Set<string>()

const commands: Cmd[] = [
    rankCommand,
    leaderboardCommand,
    timeoutCommand,
    kickCommand,
    banCommand,
    tttCommand,
    memoryGameCommand,
    pingCommand,
    slowmodeCommand,
    helpCommand,
    blacklistCommand,
    serverInfoCommand,
    inviteCommand,
    updatesCommand,
    userInfoCommand,
    memberInfoCommand,
    balanceCommand,
    withdrawCommand,
    depositCommand,
    giveCommand,
    ticketCommand,
    reportMemberCommand,
    reportMessageCommand,
    questionCommand,
    sudokuCommand,
    voteCommand,
    zBankCommand,
    quizCommand,
    warnCommand,
    welcomeEditorCommand
]

const client = new Client({
    intents: [
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildBans,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildVoiceStates
    ]
})

client.on('ready', async () => {
    console.log('Client is now ready!')

    sequelize.authenticate().then(() => {
        console.log("Successfully connected to database")
    })

    sequelize.sync().then(() => {
        console.log("Synchronised all models successfully")
    });

    // Global
    (<ClientApplication>client.application).commands.set(
        commands.map(c => c.data)
    );

    ['744138083372367924', '885566428697202719', '929299656737976360', '923315540024500304', '712943338206003233', '999703297399201864', '871417904548155393', '921158371749535765', '740356765425598615', '988115217269530674', '550338040011423754', '755959891553812483', '1013212542681755698', '968561563021742170', '743040512365166634', '751180340181074010', '749687494299091015', '1036354172225855558', '738753771177508975', '877522557132238898', '768505782634938398', '953374745238339644', '895717127074500638', '948714494866124800', '847933213438771250', '582974622195253287', '786984851014025286', '930485664175231006', '768856508279685191', '748204055679205468', '897576155614412842', '667453927486259220', '703604602833993768', '1014486062309052416']
        .forEach(async (user) => {
            if (
                await XPBoostsModel.findOne({ where: { user } })
            ) return
            else await XPBoostsModel.create({
                user,
                XPBoosts: [
                    { boost: 2, expiryDate: new Date(Date.now() + 432000000) }
                ]
            })
        })

    const guild = client.guilds.cache.get('1000073833551769600') as Guild

    const ZBank = (await ZCentralBankModel.findAll())?.[0]

    EconomyModel.findAll().then((all) => {
        all.forEach(async (user) => {
            const userLevel = await LevelModel.findOne({
                where: {
                    id: user.id
                }
            }) || await LevelModel.create({
                id: user.id,
                lvl: 0,
                xp: 0
            })
            await user
                .update({
                    maxWallet: (
                        guild.members.cache.get(user.id)?.premiumSinceTimestamp
                            ? (100 * 6 * (userLevel.lvl + 2))
                            : (100 * 4 * (userLevel.lvl + 1))
                    ),
                    maxBank: (
                        guild.members.cache.get(user.id)?.premiumSinceTimestamp
                            ? (100 * 12 * (userLevel.lvl + 2))
                            : (100 * 8 * (userLevel.lvl + 1))
                    )
                })
            // if (user.wallet > user.maxWallet) {
            //     await ZBank.increment({
            //         original: user.wallet - user.maxWallet,
            //         moneyTaken: user.wallet - user.maxWallet
            //     })
            //     await user
            //     .decrement({
            //         wallet: -1 * (user.wallet - user.maxWallet)
            //     })
            // }
            // if (user.bank > user.maxBank) {
            //     await ZBank.increment({
            //         original: user.bank - user.maxBank,
            //         moneyTaken: user.bank - user.maxBank
            //     })
            //     await user
            //     .decrement({
            //         bank: -1 * (user.bank - user.maxBank)
            //     })
            // }
        })
    })

    if (Date.now() >= ZBank.lastTimeAdded.setHours(ZBank.lastTimeAdded.getHours() + 6) + 21600000) {
        setInterval(async () => {
            const moreThanSixHours = Math.floor(
                ZBank.lastTimeAdded.getTime() - ZBank.initialiseDate.getTime()
                / 21600000) === Math.floor(
                    Date.now() - ZBank.initialiseDate.getTime()
                    / 21600000)
            const sixHourPeriods = moreThanSixHours
                ? Math.floor((ZBank.lastTimeAdded.getTime() - ZBank.initialiseDate.getTime()) / 21600000)
                : Math.floor(((Date.now() - ZBank.initialiseDate.getTime()) - (ZBank.lastTimeAdded.getTime() - ZBank.initialiseDate.getTime())) / 21600000)

            const total = Math.round(
                (
                    ZBank.moneyTaken
                    +
                    (
                        500
                        *
                        (
                            moreThanSixHours
                                ? sixHourPeriods
                                : (sixHourPeriods ** 2 + sixHourPeriods) / 2
                        )
                    )
                ) * (
                    (2 * ZBank.moneyTaken / (ZBank.original + ZBank.moneyTaken))
                    +
                    (1 * ZBank.timesUsedInDay * 0.4)
                )
            )

            const channel = (client.guilds.cache.get('1000073833551769600') as Guild).channels.cache.get('1000073833551769603') as TextChannel

            try {
                await ZBank.update({
                    numberToAdd: total,
                    originalGiven: true,
                    moneyAdded: false
                })
                await ZBank.increment({
                    original: ZBank.numberToAdd
                });
                await ZBank.update({
                    timesUsedInDay: 0,
                    numberToAdd: 0,
                    moneyAdded: true,
                    moneyTaken: 0,
                    lastTimeAdded: new Date(),
                    originalGiven: false
                })
                await channel.send(`${bold(`${inlineCode(total.toLocaleString('ru'))} Z🪙`)
                    } has been added to ZBank, it now has ${bold(`${inlineCode((ZBank.original + ZBank.numberToAdd).toLocaleString('ru'))}`)
                    } Z🪙.\n${italic(
                        `${ZBank.timesUsedInDay === 0
                            ? 'Nobody'
                            : pluralise(ZBank.timesUsedInDay, 'user', 'users')} used the ZBank in the past 24 hours.`
                    )
                    }\n${italic(
                        `${bold(`${inlineCode(ZBank.moneyTaken.toLocaleString('ru'))} Z🪙`)} ${ZBank.moneyTaken === 1 ? 'was' : 'were'} taken out of the ZBank.`
                    )
                    }`);
            } catch (error) {
                console.log((error as Error).message)
                await channel.send((error as Error).message)
            }
        }, 21600000)
    }


    const ticketsCategory = <CategoryChannel>await client.channels.fetch('1021361153202470942')

    ticketsCategory.children.cache
        .filter((c): c is TextChannel => c.type === ChannelType.GuildText)
        .forEach(async (channel) => {
            const associatedTicket = await TicketSystemModel.findOne({
                where: {
                    ticketChannelId: channel.id
                }
            })

            if (!associatedTicket || associatedTicket.closed) {
                try {
                    await channel.delete()
                } catch {
                    return
                }
            } else {
                client.channels.fetch(associatedTicket.ticketRecipientChannelId)
                    .then(async (dmChannel) => {
                        const DMCollector = (dmChannel as DMChannel).createMessageCollector({
                            filter: async (msg) => {
                                if (msg.author.bot) {
                                    return false
                                }

                                if ((await TicketSystemModel.findAll({
                                    where: {
                                        creator: msg.author.id,
                                        closed: false
                                    }
                                })).length > 1) {
                                    try {
                                        const reference = await msg.fetchReference()
                                        if (reference.embeds[0]?.title?.startsWith('Ticket #')) {
                                            const ticketNum = Number(reference.embeds[0].title.replace('Ticket #', ''))
                                            const foundTicket = await TicketSystemModel.findOne({
                                                where: {
                                                    id: ticketNum
                                                }
                                            })
                                            if (foundTicket && !foundTicket.closed && foundTicket.id === associatedTicket.id) {
                                                return true
                                            } else {
                                                return false
                                            }
                                        } else {
                                            return false
                                        }
                                    } catch {
                                        setTimeout(async () => {
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
                                    if ((await TicketSystemModel.findAll({
                                        where: {
                                            creator: msg.author.id,
                                            closed: false
                                        }
                                    })).length === 0) {
                                        return false
                                    }
                                    return true
                                }
                            },
                            time: 2700000
                        })
                        const collector = channel.createMessageCollector({
                            time: 2700000,
                            filter: msg => !msg.author.bot
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
                                    .setTitle(`Ticket #${associatedTicket.id}`)

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

                                (dmChannel as DMChannel)?.send({
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
                                                    .setTitle(`Ticket #${associatedTicket.id} closed`)
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

                            if ((await TicketSystemModel.findAll({
                                where: {
                                    creator: msg.author.id,
                                    closed: false
                                }
                            })).length === 0) return
                            else if ((await TicketSystemModel.findAll({
                                where: {
                                    creator: msg.author.id,
                                    closed: false
                                }
                            })).length === 1) {
                                const ticketNumber = await TicketSystemModel.findOne({ where: { creator: msg.author.id, closed: false } })
                                if (!ticketNumber) return
                                const ticketChannel = await client.channels.fetch(ticketNumber.ticketChannelId as string) as TextChannel
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
                                                        .setTitle(`Ticket #${(await TicketSystemModel.findOne({ where: { id: ticketNumber.id } }) as TicketSystemModel).id} closed`)
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
                                        const ticketChannel = await reference.client.channels.fetch(ticketNumber?.ticketChannelId as string) as TextChannel
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
                    })
                    .catch(async () => {
                        return
                    })
            }
        })

    const customStatuses: Array<ActivitiesOptions> = [
        {
            name: '/help commands',
            type: ActivityType.Listening
        },
        {
            name: `${client.guilds.cache.size.toLocaleString('ru')} ${client.guilds.cache.size === 1
                ? 'server'
                : 'servers'
                } and ${client.guilds.cache
                    .map(r => [...r.members.cache.filter(m => !m.user.bot).values()])
                    .flat()
                    .map(m => m.id)
                    .filter((m, i, a) => a.indexOf(m) === i)
                    .length
                    .toLocaleString('ru')
                } ${client.guilds.cache
                    .map(r => [...r.members.cache.filter(m => !m.user.bot).values()])
                    .flat()
                    .map(m => m.id)
                    .filter((m, i, a) => a.indexOf(m) === i)
                    .length === 1
                    ? 'user'
                    : 'users'
                }`,
            type: ActivityType.Watching
        },
        {
            name: 'myself grow',
            type: ActivityType.Watching
        },
        {
            name: 'your feedbacks and reports on this bot',
            type: ActivityType.Listening
        },
        {
            name: 'your opinions',
            type: ActivityType.Listening
        }
    ]

    setInterval(async () => {
        (client.user as ClientUser).setPresence({ status: 'dnd', activities: customStatuses })
    }, 300000)
})

client.on('interactionCreate', async (interaction): Promise<any> => {
    if (interaction.type === InteractionType.ApplicationCommand) {
        const isBlacklist = await BlacklistModel.findOne({
            where: {
                id: interaction.user.id
            }
        })

        if (isBlacklist) return await interaction.reply({
            embeds: [
                new EmbedBuilder()
                .setTitle(underscore('You are blacklisted from using this bot.'))
                .setDescription(`⛔ **You are not allowed to use the bot, or interact with its commands or message components.**`)
                .setColor(0x000000)
            ],
            ephemeral: true
        })

        commands.find(command => command.data.name === interaction.commandName)
        ?.execute(interaction as ChatInputCommandInteraction<"cached">)
    } else if (interaction.type === InteractionType.MessageComponent) {
        if (interaction.customId === 'announcement-ping') {
            if ((interaction.member?.roles as GuildMemberRoleManager).cache.has('1010997349079863351')) {
                (interaction.member?.roles as GuildMemberRoleManager).remove('1010997349079863351')
                    .then(async () => {
                        return await interaction.reply({
                            content: `Taken the <@&1010997349079863351> role off you.\n${Math.random() < 0.1
                                ? `💡 **Did you know?** ${italic(tipsAndTricks[Math.floor(Math.random() * tipsAndTricks.length)])}`
                                : ''
                                }`,
                            ephemeral: true
                        })
                    })
                    .catch(async () => {
                        return await interaction.reply({
                            content: 'Couldn\'t take the role <@&1010997349079863351> off you.',
                            ephemeral: true
                        })
                    })
            } else {
                (interaction.member?.roles as GuildMemberRoleManager).add('1010997349079863351')
                    .then(async () => {
                        return await interaction.reply({
                            content: `Given you the <@&1010997349079863351> role.\n${Math.random() < 0.1
                                ? `💡 **Did you know?** ${italic(tipsAndTricks[Math.floor(Math.random() * tipsAndTricks.length)])}`
                                : ''
                                }`,
                            ephemeral: true
                        })
                    })
                    .catch(async () => {
                        return await interaction.reply({
                            content: 'Couldn\'t give you the <@&1010997349079863351> role.',
                            ephemeral: true
                        })
                    })
            }
        } else if (interaction.customId === 'zbot-announcement-ping') {
            if ((interaction.member?.roles as GuildMemberRoleManager).cache.has('1010998028011839598')) {
                (interaction.member?.roles as GuildMemberRoleManager).remove('1010998028011839598')
                    .then(async () => {
                        return await interaction.reply({
                            content: `Taken the <@&1010998028011839598> role off you.\n${Math.random() < 0.1
                                ? `💡 **Did you know?** ${italic(tipsAndTricks[Math.floor(Math.random() * tipsAndTricks.length)])}`
                                : ''
                                }`,
                            ephemeral: true
                        })
                    })
                    .catch(async () => {
                        return await interaction.reply({
                            content: 'Couldn\'t take the role <@&1010998028011839598> off you.',
                            ephemeral: true
                        })
                    })
            } else {

                (interaction.member?.roles as GuildMemberRoleManager).add('1010998028011839598')
                    .then(async () => {
                        return await interaction.reply({
                            content: `Given you the <@&1010998028011839598> role.\n${Math.random() < 0.1
                                ? `💡 **Did you know?** ${italic(tipsAndTricks[Math.floor(Math.random() * tipsAndTricks.length)])}`
                                : ''
                                }`,
                            ephemeral: true
                        })
                    })
                    .catch(async () => {
                        return await interaction.reply({
                            content: 'Couldn\'t give you the <@&1010998028011839598> role.',
                            ephemeral: true
                        })
                    })
            }
        }
    }
})

client.on('messageCreate', async (message): Promise<any> => {
    if (message.author.bot) return
    if (message.partial) await message.fetch()
    if (message.author.partial) await message.author.fetch()
    const isBlacklist = await BlacklistModel.findOne({
        where: {
            id: message.author.id
        }
    })

    if (isBlacklist) return

    const words = message.content.split(' ').filter(s => s.match(/\b[\w\-\_']+\b/g))
    const attachments = message.attachments

    let totalXP = (
        attachments.size * 20
    ) + (
            words.length >= 3
                ? (
                    5
                    + words.slice(3).map((w, i, arr): number => {
                        if (i % 2 !== 0) return 0
                        else if (w.length >= 3 || arr[i + 1]?.length >= 3) return 2
                        else return 0
                    }).reduce((a, b) => a + b, 0)
                )
                : 0
        ) >= (attachments.size * 20 + 40)
        ? (attachments.size * 20 + 40)
        : (
            attachments.size * 20
        ) + (
            words.length >= 3
                ? (
                    5
                    + words.slice(3).map((w, i, arr): number => {
                        if (i % 2 !== 0) return 0
                        else if (w.length >= 3 || arr[i + 1]?.length >= 3) return 2
                        else return 0
                    }).reduce((a, b) => a + b, 0)
                )
                : 0
        )

    if (
        (await XPBoostsModel.findOne({ where: { user: message.author.id } }))
        &&
        (await XPBoostsModel.findOne({ where: { user: message.author.id } }))?.XPBoosts.some(boost => Date.now() <= new Date(boost.expiryDate).getTime())
    ) {
        totalXP *= ((await XPBoostsModel.findOne({ where: { user: message.author.id } }))?.XPBoosts.map(({ boost }) => boost).reduce((a1, a2) => a1 + a2) || 1)
    }

    totalXP = Math.floor(totalXP)

    const lvl = await (await LevelModel.findOne({
        where: { id: message.author.id }
    }))?.increment({ xp: totalXP }) || await (await LevelModel.create({
        id: message.author.id,
        xp: 0,
        lvl: 0
    })).increment({ xp: totalXP })

    const levelRoles = [
        '1010283999425462323', '1010243115346559068', '1010243118232260618', '1010243121189228614',
        '1010243123001163806', '1010243125983314020', '1010243128495702057', '1010243130840338622',
        '1010243133960880260', '1010243135575699507', '1010243139262488627', '1010243141686808577',
        '1010243144593453127', '1010243147395252225', '1010243150079610950', '1010243153439248505',
        '1010243155918069780', '1010243159084769362', '1010243161286783186', '1010243165283942471'
    ]

    if (lvl.xp >= (lvl.lvl + 1) * 50) {
        do {
            await lvl.increment({
                xp: -50 * (lvl.lvl + 1),
                lvl: 1
            })
        } while (lvl.xp >= (lvl.lvl + 1) * 50)
        message.channel.send({
            embeds: [
                new EmbedBuilder()
                    .setTitle('Level Up!')
                    .setDescription(`🎉 **Congratulations ${message.author}**, you have levelled up to **Level ${inlineCode(lvl.lvl.toString())}**!${(await XPBoostsModel.findOne({ where: { user: message.author.id } }))
                            &&
                            (await XPBoostsModel.findOne({ where: { user: message.author.id } }))?.XPBoosts.some(boost => Date.now() <= new Date(boost.expiryDate).getTime())
                            ? `\n*This user has a ${(
                                Number(
                                    // @ts-ignore
                                    (await XPBoostsModel.findOne({ where: { user: message.author.id } }))
                                        .XPBoosts.some(boost => Date.now() <= new Date(boost.expiryDate).getTime())
                                ) * 100
                            ).toFixed(2)}% XP boost.*`
                            : ''
                        }`)
                    .setColor((await RankCardModel.findOne({ where: { id: message.author.id } }))?.colour ?? 0x00ffff)
                    .setFooter(
                        Math.random() < 0.1
                            ? { text: `💡 Did you know? ${tipsAndTricks[Math.floor(Math.random() * tipsAndTricks.length)]}` }
                            : null
                    )
            ],
            components: message.guild?.id !== '1000073833551769600' ? [
                new ActionRowBuilder<ButtonBuilder>()
                    .addComponents(
                        new ButtonBuilder()
                            .setEmoji('🔗')
                            .setLabel('Join ZBot Support Server!')
                            .setStyle(ButtonStyle.Link)
                            .setURL('https://discord.gg/6tkn6m5g52')
                    )
            ] : []
        });
        return
    } else if (lvl.xp < 0) {
        do {
            await lvl.increment({ xp: 50 * lvl.lvl })
            await lvl.decrement({ lvl: 1 })
        } while (lvl.xp < 0)
        if (lvl.lvl < 0) {
            await lvl.update({ lvl: 0 }, { where: { id: message.author.id } })
        }
        if (lvl.xp < 0) {
            await lvl.update({ xp: 0 }, { where: { id: message.author.id } })
        }
        return
    } else if (lvl.lvl < 0) {
        await lvl.update({ lvl: 0 }, { where: { id: message.author.id } })
        return
    }


    (<Guild>message.client.guilds.cache.get('1000073833551769600'))
        .members.fetch(message.author.id)
        .then(async (member: GuildMember) => {
            if (lvl.lvl < 5 || (await BlacklistModel.findOne({ where: { id: member.id } }))) member.roles.remove(levelRoles)
            else if (lvl.lvl >= 100) {
                if (!member.roles.cache.has(levelRoles[0])) {
                    member.roles.remove(levelRoles.filter((_, i) => i !== 0))
                    member.roles.add(levelRoles[0])
                }
            } else {
                if (levelRoles.some(r => r !== levelRoles[20 - Math.floor(lvl.lvl / 5)] && member.roles.cache.has(r))) member.roles.remove(
                    levelRoles.filter((_, i) => i !== 20 - Math.floor(lvl.lvl / 5))
                )
                member.roles.add(
                    levelRoles[20 - Math.floor(lvl.lvl / 5)]
                )
            }
        })
        .catch(() => null)
})

client.login(process.env.TOKEN)

export {
    repliedMessages
}
