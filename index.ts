import { Client, GatewayIntentBits, InteractionType, ChatInputCommandInteraction, ClientApplication, ApplicationCommandPermissionType, User, bold, underscore, EmbedBuilder, inlineCode } from "discord.js"
import { config } from "dotenv"
import { blacklistCommand } from "./commands/blacklist"
config()

import { Cmd, leaderboardCommand, rankCommand, timeoutCommand, kickCommand, banCommand, tttCommand, gtwCommand, memoryGameCommand, reportCommand } from "./commands/command-exports"
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
    reportCommand
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
    ).forEach((cmd) => {
        if (cmd.permissions) {
            cmd.permissions.set({
                permissions: [
                    {
                        id: (<User>(<ClientApplication>client.application).owner).id,
                        type: ApplicationCommandPermissionType.User,
                        permission: true
                    }
                ],
                token: process.env.TOKEN as string
            })
        }
    });
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

    if (lvl.xp > (lvl.lvl + 1) * 50) {
        await lvl.increment({
            xp: -50 * (lvl.lvl + 1),
            lvl: 1
        })
        message.channel.send({
            embeds: [
                new EmbedBuilder()
                .setTitle('Level Up!')
                .setDescription(`🎉 **Congratulations ${message.author.id}**, you have levelled up to **Level ${inlineCode(lvl.lvl.toString())}**!`)
                .setColor((await RankCardModel.findOne({ where: { id: message.author.id }}))?.colour ?? 0x00ffff)
                .setFooter({
                    text: `Use the /rank command to view your rank or customise your rank card, or the /leaderboard command to see how you compete against other users.`
                })
            ]
        })
    }
})

client.login(process.env.TOKEN)
