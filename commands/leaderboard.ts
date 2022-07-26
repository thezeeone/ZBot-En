import { ApplicationCommandOptionType, bold, ChatInputCommandInteraction, EmbedBuilder, inlineCode, underscore, User } from "discord.js";
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
                        name: 'Display local leaderboard (this server only)',
                        value: 'local'
                    }
                ], 
                required: true
            }
        ]
    },
    async execute(interaction: ChatInputCommandInteraction<"cached">) {
        const option = interaction.options.getString('display', true) as 'global' | 'local'
               
        const leaderboard = await LevelModel.findAll()
        const userPosition = (
            await Promise.all(
                leaderboard
                .filter(async (model) => {
                    try {
                        await interaction.client.users.fetch(model.id);
                        return true;
                    } catch (error) {
                        return false;
                    }
                })
            )
        )
        .filter(notEmpty)
        .sort((l1, l2) => {
            if (l1.lvl > l2.lvl) return -1
            else if (l1.lvl < l2.lvl) return 1
            else {
                if (l1.xp > l2.xp) return -1
                else if (l1.xp < l2.xp) return 1
                else return 0
            }
        })
        .map(i => i.id)
        .indexOf(interaction.user.id) + 1

        if (option === 'global') {
            interaction.deferReply()
            const globalLeaderboard = (
                await Promise.all(
                    leaderboard
                    .map(async (model) => {
                        try {
                            await interaction.client.users.fetch(model.id)
                            return model
                        } catch (error) {
                            return undefined
                        }
                    })
                )
            )
            .filter(notEmpty)
            const globalSortedLeaderboard = (
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
            .filter(notEmpty)
            .sort((l1, l2) => {
                if (l1.lvl > l2.lvl) return -1
                else if (l1.lvl < l2.lvl) return 1
                else {
                    if (l1.xp > l2.xp) return -1
                    else if (l1.xp < l2.xp) return 1
                    else return 0
                }
            })
            .slice(0, 10)

            try {
                await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                        .setAuthor({
                            name: `${interaction.user.tag} (${interaction.user.id})`,
                            iconURL: interaction.user.displayAvatarURL({ forceStatic: false })
                        })
                        .setTitle(underscore(`Leaderboard - Top ${globalSortedLeaderboard.length >= 10 ? 10 : globalSortedLeaderboard.length} Global`))
                        .setDescription(
                            userPosition
                            ? `You currently rank as ${userPosition < 4 ? bold(['🥇 top', '🥈 second highest', '🥉 third highest'][userPosition - 1]) : bold(`${ordinalNumber(userPosition)} place`)}, out of ${inlineCode(`${globalLeaderboard.length}`)}.`
                            : 'You don\'t have a rank card yet.'
                        )
                        .addFields([
                            {
                                name: 'Position and User',
                                value: (
                                        await Promise.all(
                                            globalSortedLeaderboard
                                            .map(async (pos, ind) => {
                                                let user = await interaction.client.users.fetch(pos.id) as User
                                                return `${
                                                    ind < 3 
                                                    ? ['🥇', '🥈', '🥉'][ind] 
                                                    : inlineCode(ordinalNumber(ind + 1, true))
                                                } ${
                                                    user.id === interaction.user.id
                                                    ? bold(user.tag)
                                                    : user.tag
                                                } (${inlineCode(user.id)})`
                                            })
                                        )
                                    )
                                    .join('\n'),
                                inline: true
                            },
                            {
                                name: 'Level',
                                value: globalSortedLeaderboard
                                    .map((pos) => pos.lvl)
                                    .join('\n'),
                                inline: true
                            },
                            {
                                name: 'Experience Points',
                                value: globalSortedLeaderboard
                                    .map((pos) => pos.xp)
                                    .join('\n'),
                                inline: true
                            }
                        ])
                        .setColor(0x00ffff)
                    ]
                })
            } catch (error) {
                return
            }
        } else if (option === 'local') {
            interaction.deferReply()

            const localLeaderboard = (await Promise.all(
                (await LevelModel.findAll())
                .map(async r => {
                    try {
                        await interaction.guild.members.fetch(r.getDataValue('id'))
                        return r
                    } catch (error) {
                        return undefined
                    }
                })
            ))
            .filter(notEmpty)
            const localSortedLeaderboard = (await Promise.all(
                localLeaderboard
                .map(async (member) => {
                    try {
                        await interaction.guild.members.fetch(member.id)
                        return await LevelModel.findOne({ where: { id: member.id } })
                    } catch (error) {
                        return undefined
                    }
                })
            ))
            .filter(notEmpty)
            .sort((l1, l2) => {
                if (l1.lvl > l2.lvl) return -1
                else if (l1.lvl < l2.lvl) return 1
                else {
                    if (l1.xp > l2.xp) return -1
                    else if (l1.xp < l2.xp) return 1
                    else return 0
                }
            })
            .slice(0, 10)
            
            try {
                await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                        .setAuthor({
                            name: `${interaction.user.tag} (${interaction.user.id})`,
                            iconURL: interaction.user.displayAvatarURL({ forceStatic: false })
                        })
                        .setTitle(underscore(`Leaderboard - Top ${localSortedLeaderboard.length >= 10 ? 10 : localSortedLeaderboard.length} Local`))
                        .setDescription(
                            userPosition
                            ? `You currently rank as ${userPosition < 4 ? bold(['🥇 top', '🥈 second highest', '🥉 third highest'][userPosition - 1]) : bold(`${ordinalNumber(userPosition)} place`)}, out of ${inlineCode(`${localLeaderboard.length}`)}.`
                            : 'You don\'t have a rank card yet.'
                        )
                        .addFields([
                            {
                                name: 'Position and Member',
                                value: (
                                        await Promise.all(
                                            localSortedLeaderboard
                                            .map(async (pos, ind) => {
                                                let user = await interaction.client.users.fetch(pos.id) as User
                                                return `${
                                                    ind < 3 
                                                    ? ['🥇', '🥈', '🥉'][ind] 
                                                    : inlineCode(ordinalNumber(ind + 1, true))
                                                } ${
                                                    user.id === interaction.user.id
                                                    ? bold(user.tag)
                                                    : user.tag
                                                } (${inlineCode(user.id)})`
                                            })
                                        )
                                    )
                                    .join('\n'),
                                inline: true
                            },
                            {
                                name: 'Level',
                                value: localSortedLeaderboard
                                    .map((pos) => pos.lvl)
                                    .join('\n'),
                                inline: true
                            },
                            {
                                name: 'Experience Points',
                                value: localSortedLeaderboard
                                    .map((pos) => pos.xp)
                                    .join('\n'),
                                inline: true
                            }
                        ])
                        .setColor(0x00ffff)
                    ]
                })
            } catch (err) {
                return console.log(err)
            }
        }
    }
}

function notEmpty<T>(value: T | undefined | null): value is T {
    return value !== undefined && value !== null
}

export {
    leaderboardCommand
}
