import { Client, GatewayIntentBits, InteractionType, ChatInputCommandInteraction, ClientApplication, Guild, GuildMember, underscore, EmbedBuilder, inlineCode } from "discord.js"
import { config } from "dotenv"
import { blacklistCommand } from "./commands/blacklist"
config()

import { Cmd, leaderboardCommand, rankCommand, timeoutCommand, kickCommand, banCommand, tttCommand, gtwCommand, memoryGameCommand, reportCommand, pingCommand, slowmodeCommand, helpCommand } from "./commands/command-exports"
import { sequelize, LevelModel, BlacklistModel, RankCardModel } from "./database"

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
    helpCommand
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
    )
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
    }
})

client.on('messageCreate', async (message) => {
    if (message.author.bot) return
    if (message.partial) await message.fetch()
    if (message.author.partial) await message.author.fetch()
    const isBlacklist = await BlacklistModel.findOne({
        where: {
            id: message.author.id
        }
    })

    if (isBlacklist) return
    
    const lvl = await (await LevelModel.findOne({
        where: { id: message.author.id }
    }))?.increment({ xp: 5 }) || await (await LevelModel.create({
        id: message.author.id,
        xp: 0,
        lvl: 0
    })).increment({ xp: 5 })

    const levelRoles = [
        '1010283999425462323', '1010243115346559068', '1010243118232260618', '1010243121189228614',
        '1010243123001163806', '1010243125983314020', '1010243128495702057', '1010243130840338622',
        '1010243133960880260', '1010243135575699507', '1010243139262488627', '1010243141686808577',
        '1010243144593453127', '1010243147395252225', '1010243150079610950', '1010243153439248505',
        '1010243155918069780', '1010243159084769362', '1010243161286783186', '1010243165283942471'
    ]

    if (lvl.xp > (lvl.lvl + 1) * 50) {
        await lvl.increment({
            xp: -50 * (lvl.lvl + 1),
            lvl: 1
        })
        message.channel.send({
            embeds: [
                new EmbedBuilder()
                .setTitle('Level Up!')
                .setDescription(`🎉 **Congratulations ${message.author}**, you have levelled up to **Level ${inlineCode(lvl.lvl.toString())}**!`)
                .setColor((await RankCardModel.findOne({ where: { id: message.author.id }}))?.colour ?? 0x00ffff)
                .setFooter({
                    text: `Use the /rank command to view your rank or customise your rank card, or the /leaderboard command to see how you compete against other users.`
                })
            ]
        })
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
