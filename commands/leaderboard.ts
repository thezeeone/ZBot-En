import { ChatInputCommandInteraction, Formatters } from "discord.js";
import { LevelModel } from "../database";
import { Cmd } from "./command-exports";

const leaderboardCommand: Cmd = {
    data: {
        name: 'leaderboard',
        description: 'Show a leaderboard of the highest ranking members'
    },
    async execute (interaction: ChatInputCommandInteraction<"cached">) {
        const leaderboard = await LevelModel.findAll({
            limit: 10
        })
        await interaction.reply({
            content: `${Formatters.bold(Formatters.underscore('Leaderboard - Top 10'))}\n${
                leaderboard.length ? leaderboard.sort((l1, l2) => {
                    if (l1.lvl > l2.lvl) return -1
                    else if (l1.lvl < l2.lvl) return 1
                    else {
                        if (l1.xp > l2.xp) return -1
                        else if (l1.xp < l2.xp) return 1
                        else return 0
                    } 
                }).map((l, i) => {
                    return `${i < 2 ? ['🥇', '🥈', '🥉'][i] : Formatters.bold(String(i + 1))} ${interaction.guild.members.cache.get(l.id)?.user.username || `Unknown Member`} | Level ${l.lvl}, ${l.xp} Experience Points`;
                }).join('\n') : 'There\'s nothing to see here! Send messages to be able to get to the top of the leaderboard.'
            }`,
            ephemeral: true
        })
    }
}

export {
    leaderboardCommand
}