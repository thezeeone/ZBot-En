import { Client, italic, GatewayIntentBits, GuildMemberRoleManager, InteractionType, ChatInputCommandInteraction, ClientApplication, Guild, GuildMember, underscore, EmbedBuilder, inlineCode, ActivitiesOptions, ActivityType, ClientUser, PermissionsBitField, TextChannel } from "discord.js"
import { config } from "dotenv"
import { blacklistCommand } from "./commands/blacklist"
config()

import { Cmd, tipsAndTricks, leaderboardCommand, serverInfoCommand, rankCommand, timeoutCommand, kickCommand, banCommand, tttCommand, gtwCommand, memoryGameCommand, reportCommand, pingCommand, slowmodeCommand, helpCommand, inviteCommand, updatesCommand, userInfoCommand, exchangeCommand, memberInfoCommand, balanceCommand, withdrawCommand, depositCommand, giveCommand } from "./commands/command-exports"
import { sequelize, LevelModel, BlacklistModel, RankCardModel } from "./database"
import { pluralise } from "./util"

const commands: Cmd[] = [
    rankCommand,
    leaderboardCommand,
    timeoutCommand,
    kickCommand,
    banCommand,
    tttCommand,
    gtwCommand,
    memoryGameCommand,
    reportCommand,
    pingCommand,
    slowmodeCommand,
    helpCommand,
    serverInfoCommand,
    inviteCommand,
    updatesCommand,
    userInfoCommand,
    exchangeCommand,
    memberInfoCommand,
    balanceCommand,
    withdrawCommand,
    depositCommand,
    giveCommand
]

const privateCommands: Cmd[] = [
    blacklistCommand
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

    // Private
    (await
        (<ClientApplication>client.application).commands.set(
            privateCommands.map(p => p.data),
            '1000073833551769600'
        )
    );

    const customStatuses: Array<ActivitiesOptions> = [
        {
            name: '/help commands',
            type: ActivityType.Listening
        },
        {
            name: `${pluralise(client.guilds.cache.size, 'server')} and ${pluralise(
                client.guilds.cache
                .map(r => r.members.cache.filter(s => !s.user.bot).size)
                .reduce((num1, num2) => {
                    return num1 + num2
                }), 'user')
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
                        content: `Taken the <@&1010997349079863351> role off you.\n${
                            Math.random() < 0.1
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
                        content: `Given you the <@&1010997349079863351> role.\n${
                            Math.random() < 0.1
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
                        content: `Taken the <@&1010998028011839598> role off you.\n${
                            Math.random() < 0.1
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
                        content: `Given you the <@&1010998028011839598> role.\n${
                            Math.random() < 0.1
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
    
    const totalXP = (
        attachments.size * 100
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
    ) >= (attachments.size * 100 + 40)
    ? (attachments.size * 100 + 40)
    : (
        attachments.size * 100
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
                .setDescription(`🎉 **Congratulations ${message.author}**, you have levelled up to **Level ${inlineCode(lvl.lvl.toString())}**!`)
                .setColor((await RankCardModel.findOne({ where: { id: message.author.id }}))?.colour ?? 0x00ffff)
                .setFooter(
                    Math.random() < 0.1
                    ? { text: `💡 Did you know? ${tipsAndTricks[Math.floor(Math.random() * tipsAndTricks.length)]}` }
                    : null
                )
            ]
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
            await lvl.update({ xp: 0 }, { where: { id: message.author.id }})
        }
        return
    } else if (lvl.lvl < 0) {
        await lvl.update({ lvl: 0 }, { where: { id: message.author.id } })
        return
    }


    (<Guild>message.client.guilds.cache.get('1000073833551769600'))
    .members.fetch(message.author.id)
    .then((member: GuildMember) => {
        if (lvl.lvl >= 100 && !member.roles.cache.has(levelRoles[0])) member.roles.add(levelRoles[0])
        else if (lvl.lvl < 5) member.roles.remove(levelRoles)
        else {
            member.roles.remove(
                levelRoles.filter((r, i) => i !== (20 - Math.floor(lvl.lvl / 5)) && member.roles.cache.has(r))
            )
            member.roles.add(
                levelRoles[20 - Math.floor(lvl.lvl / 5)]
            )
        }
    })
    .catch(() => null)
})

client.login(process.env.TOKEN)
