import { ApplicationCommandOptionType, ChatInputCommandInteraction, Formatters, GuildMember } from "discord.js";
import { LevelModel } from "../database";
import { ordinalNumber } from "../util";
import { Cmd } from "./command-exports";

const leaderboardCommand: Cmd = {
    data: {
        name: 'leaderboard',
        description: 'Show a leaderboard of the highest ranking members',
        options: [
            {
                name: 'display',
                description: 'Whether to display the global or server leaderboard',
                type: ApplicationCommandOptionType.String,
                choices: [
                    {
                        name: 'Display global leaderboard',
                        value: 'global'
                    },
                    {
                        name: 'Display leaderboard for this server only',
                        value: 'server'
                    }
                ], 
                required: true
            }
        ]
    },
    async execute (interaction: ChatInputCommandInteraction<"cached">) {
        const option = interaction.options.getString('display') as 'global' | 'server'

        const leaderboard = await LevelModel.findAll()
        const userPosition = leaderboard
        .filter(
            async (model) => {
                try {
                    await interaction.client.users.fetch(model.id)
                    return model
                } catch (error) {
                    return undefined
                }
            }
        )
        .filter(i => i !== undefined)
        .map(i => i.id)
        .indexOf(interaction.user.id) + 1

        if (option === 'global') {
            const globalLeaderboard = (
                await Promise.all(
                    leaderboard
                    .filter(async (model) => {
                        try {
                            await interaction.client.users.fetch(model.id)
                            return model
                        } catch (error) {
                            return undefined
                        }
                    })
                )
            )
            .filter(i => i !== undefined)
            .slice(0, 10)

            await interaction.reply({
                content: globalLeaderboard.length
                ? `${Formatters.bold(
                    `${
                        Formatters
                        .underscore(`Leaderboard - Top ${globalLeaderboard.length >= 10 ? 10 : globalLeaderboard.length}`)} Global`)
                    }\n${
                    globalLeaderboard.sort((l1, l2) => {
                        if (l1.lvl > l2.lvl) return -1
                        else if (l1.lvl < l2.lvl) return 1
                        else {
                            if (l1.xp > l2.xp) return -1
                            else if (l1.xp < l2.xp) return 1
                            else return 0
                        } 
                    }).map((l, i) => {
                        return `${
                            i < 2 
                            ? ['🥇', '🥈', '🥉'][i] 
                            : Formatters.bold(
                                ordinalNumber(i + 1)
                            )} ${
                                interaction.guild.members.cache.get(l.id)
                                ? `${
                                    Formatters.bold((interaction.guild.members.cache.get(l.id) as GuildMember).user.username)
                                } (${Formatters.inlineCode(l.id)})`
                                : Formatters.inlineCode('Unknown Member')
                            } | ${
                                Formatters.bold('Level')
                            } ${Formatters.inlineCode(l.lvl.toString())} ${
                                Formatters.bold('Experience Points')
                            } ${Formatters.inlineCode(l.xp.toString())}`
                    }).join('\n')
                }\n\n${userPosition
                    ? `You currently rank as ${
                        userPosition === 1
                        ? Formatters.bold('🥇 top')
                        : (
                            userPosition < 4
                            ? `${['🥈', '🥉'][userPosition - 1]} ${Formatters.bold(`${Formatters.inlineCode(ordinalNumber(userPosition))} highest`)}`
                            : `${Formatters.inlineCode(ordinalNumber(userPosition))} highest`
                          )
                    } in the global leaderboard, out of ${Formatters.inlineCode(leaderboard.length.toString())}.`
                    : 'You don\'t have a rank card yet.' 
                }` : 'There\'s nothing to see here! Send messages or play mini-games to be able to get to the top of the global leaderboard.',
                ephemeral: true
            })
        } else if (option === 'server') {
            const serverLeaderboard = leaderboard.filter(r => interaction.guild.members.cache.has(r.id)).slice(0, 10)

            await interaction.reply({
                content: serverLeaderboard.length
                ? `${Formatters.bold(
                    `${
                        Formatters.underscore(`Leaderboard - Top ${serverLeaderboard.length >= 10 ? 10 : serverLeaderboard.length}`)} for ${Formatters.inlineCode(interaction.guild.name)}`)
                    }\n${
                        serverLeaderboard.sort((l1, l2) => {
                            if (l1.lvl > l2.lvl) return -1
                            else if (l1.lvl < l2.lvl) return 1
                            else {
                                if (l1.xp > l2.xp) return -1
                                else if (l1.xp < l2.xp) return 1
                                else return 0
                            } 
                        }).map((l, i) => {
                            return `${
                                i < 2 
                                ? ['🥇', '🥈', '🥉'][i] 
                                : Formatters.bold(
                                    ordinalNumber(i + 1)
                                )} ${
                                    interaction.guild.members.cache.get(l.id)
                                    ? `${
                                        Formatters.bold((interaction.guild.members.cache.get(l.id) as GuildMember).user.username)
                                    } (${Formatters.inlineCode(l.id)})`
                                    : Formatters.inlineCode('Unknown Member')
                                } | ${
                                    Formatters.bold('Level')
                                } ${Formatters.inlineCode(l.lvl.toString())} ${
                                    Formatters.bold('Experience Points')
                                } ${Formatters.inlineCode(l.xp.toString())}`
                            }).join('\n')
                }\n\n${userPosition
                    ? `You currently rank as ${
                        userPosition === 1
                        ? Formatters.bold('top')
                        : (
                            userPosition < 4
                            ? `${['🥈', '🥉'][userPosition - 1]} ${Formatters.bold(`${Formatters.inlineCode(ordinalNumber(userPosition))} highest`)}`
                            : `${Formatters.inlineCode(ordinalNumber(userPosition))} highest`
                          )
                    } in the server leaderboard, out of ${Formatters.inlineCode(serverLeaderboard.length.toString())}.`
                    : 'You don\'t have a rank card yet.' 
                }` : 'There\'s nothing to see here! Send messages or play mini-games to be able to get to the top of the server leaderboard.',
                ephemeral: true
            })
        }
    }
}

export {
    leaderboardCommand
}
