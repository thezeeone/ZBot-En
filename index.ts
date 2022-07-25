import { Client, Formatters, Guild, GatewayIntentBits, InteractionType, ChatInputCommandInteraction, ApplicationCommand, ClientApplication } from "discord.js"
import { config } from "dotenv"
import { blacklistCommand } from "./commands/blacklist"
config()

import { Cmd, leaderboardCommand, rankCommand, timeoutCommand, kickCommand, banCommand, tttCommand, gtwCommand, memoryGameCommand } from "./commands/command-exports"
import { sequelize, LevelModel, BlacklistModel } from "./database"

const commands: Cmd[] = [
    rankCommand,
    leaderboardCommand,
    timeoutCommand,
    kickCommand,
    banCommand,
    tttCommand,
    gtwCommand,
    memoryGameCommand,
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
    (<ClientApplication>client.application).commands.set(
        privateCommands.map(p => p.data),
        '1000073833551769600'
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
            content: `${Formatters.bold(Formatters.underscore('You are blacklisted from using this bot.'))}\n\n⛔ **You are not allowed to use the bot, or interact with its commands or message components.**`,
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
        message.channel.send(`Congratulations ${message.author}, you have levelled up to ${Formatters.bold(`Level ${lvl.lvl}`)}!`)
    }
})

client.login(process.env.TOKEN)
