import { Client, Formatters, Guild, GatewayIntentBits, InteractionType, ChatInputCommandInteraction } from "discord.js"
import { config } from "dotenv"
config()

import { Cmd, leaderboardCommand, rankCommand, timeoutCommand, kickCommand, banCommand, tttCommand, gtwCommand, memoryGameCommand, ytVidCommand } from "./commands/command-exports"
import { sequelize, LevelModel } from "./database"

const commands: Cmd[] = [
    rankCommand,
    leaderboardCommand,
    timeoutCommand,
    kickCommand,
    banCommand,
    tttCommand,
    gtwCommand,
    memoryGameCommand,
    ytVidCommand
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
    
    const guild = client.guilds.cache.get('988857660109643836') as Guild
    const guild2 = client.guilds.cache.get('990290773746532392') as Guild

    sequelize.authenticate().then(() => {
        console.log("Successfully connected to database")
    })

    sequelize.sync().then(() => {
        console.log("Synchronised all models successfully")
    });

    [guild, guild2].forEach(async guild => {
        (await guild.commands.fetch()).filter(c => !commands.some(s => s.data.name === c.name)).forEach(async (cmd) => {
            await cmd.delete()
        });
    })

    commands.forEach(async (cmd) => {  
        await guild.commands.create(cmd.data)
        .catch((error: Error) => console.log(`Error while creating command ${cmd.data.name}:\n\n${error}`))
        await guild2.commands.create(cmd.data)
        .catch((error: Error) => console.log(`Error while creating command ${cmd.data.name}:\n\n${error}`))
    })
})

client.on('interactionCreate', (interaction) => {
    if (interaction.type === InteractionType.ApplicationCommand) {
        commands.find(command => command.data.name === interaction.commandName)
        ?.execute(interaction as ChatInputCommandInteraction<"cached">)
    }
})

client.on('messageCreate', async (message) => {
    if (message.author.bot) return
    if (message.partial) await message.fetch()
    if (message.author.partial) await message.author.fetch()
    else {
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
    }
})

client.login(process.env.TOKEN)