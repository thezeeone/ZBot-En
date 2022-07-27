import { ApplicationCommandOptionType, ChatInputCommandInteraction, Formatters } from "discord.js";
import { Cmd } from "./command-exports";
import { LevelModel } from "../database";
import { ordinalNumber } from "../util";

const rankCommand: Cmd = {
    data: {
        name: 'rank',
        description: 'Check yours or another user\'s rank',
        options: [
            {
                name: 'user',
                description: 'The user\'s rank to check',
                required: false,
                type: ApplicationCommandOptionType.User
            }
        ]
    },
    async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<any> {
        const user = interaction?.options.getUser('user')

        const leaderboard = await LevelModel.findAll()

        const serverLeaderboard = leaderboard.filter(r => interaction.guild.members.cache.has(r.id)).slice(0, 10)

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

        if (user && user?.id !== interaction.user.id) {
            const userRank = await LevelModel.findOne({ where: { id: user.id } })
            if (!userRank) return await interaction.reply({ content: `${user.username} does not have a rank yet!`, ephemeral: true })
            await interaction.reply({
                ephemeral: true,
                content: `${
                    Formatters.bold(
                        Formatters
                        .underscore(`Rank Card for ${Formatters.inlineCode(user.username)}`)
                    )
                }\n${
                    Formatters.bold('Level')
                } ${userRank.lvl}\n${
                    Formatters.bold('Experience Points')
                } ${Formatters.inlineCode(userRank.xp.toString())}\n**Experience points required for ${user.username} to hit Level ${
                    userRank.lvl + 1
                }** ${
                    Formatters.inlineCode(String(50 * (userRank.lvl + 1) - userRank.xp))
                }\n\n${Formatters.bold(user.tag)} (${Formatters.inlineCode(user.id)}) currently ranks as ${
                    userPosition === 1
                    ? Formatters.bold('top')
                    : (
                        userPosition < 4
                        ? `${['🥈', '🥉'][userPosition - 1]} ${Formatters.bold(`${Formatters.inlineCode(ordinalNumber(userPosition))} highest`)}`
                        : `${Formatters.inlineCode(ordinalNumber(userPosition))} highest`
                      )
                } in the server leaderboard, out of ${Formatters.inlineCode(serverLeaderboard.length.toString())}.`
            })
        } else {
            const userRank = await LevelModel.findOne({ where: { id: interaction.user.id } })
            if (!userRank) return await interaction.reply({ content: `You do not have a rank yet! Send a few messages first, and then try again.`, ephemeral: true })
            await interaction.reply({
                ephemeral: true,
                content: `${
                    Formatters.bold(
                        Formatters.underscore('Your Rank Card')
                    )
                }\n${
                    Formatters.bold('Level')
                } ${userRank.lvl}\n${
                    Formatters.bold('Experience Points')
                } ${Formatters.inlineCode(userRank.xp.toString()).toString()}\n**Experience points required for you to hit Level ${
                    userRank.lvl + 1
                }** ${
                    Formatters.inlineCode(String(50 * (userRank.lvl + 1) - userRank.xp))
                }\n\nYou currently rank as ${
                    userPosition === 1
                    ? Formatters.bold('top')
                    : (
                        userPosition < 4
                        ? `${['🥈', '🥉'][userPosition - 1]} ${Formatters.bold(`${Formatters.inlineCode(ordinalNumber(userPosition))} highest`)}`
                        : `${Formatters.inlineCode(ordinalNumber(userPosition))} highest`
                      )
                } in the server leaderboard, out of ${Formatters.inlineCode(serverLeaderboard.length.toString())}.`
            })
        }
    }
}

export { rankCommand }
