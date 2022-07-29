import { ApplicationCommandOptionType, bold, ChatInputCommandInteraction, EmbedBuilder, inlineCode } from "discord.js";
import { Cmd } from "./command-exports";
import { LevelModel, RankCardModel } from "../database";
import { ordinalNumber } from "../util";

const rankCommand: Cmd = {
    data: {
        name: 'rank',
        description: 'Check yours or another user\'s rank',
        options: [
            {
                name: 'display',
                description: 'Display a rank card',
                type: ApplicationCommandOptionType.SubcommandGroup,
                options: [
                    {
                        name: 'user-card',
                        description: 'Display another user\'s rank card',
                        type: ApplicationCommandOptionType.Subcommand,
                        options: [
                            {
                                name: 'user',
                                description: 'Display another user\'s rank card',
                                type: ApplicationCommandOptionType.User,
                                required: true
                            }
                        ]
                    },
                    {
                        name: 'self-card',
                        description: 'Display your own rank card',
                        type: ApplicationCommandOptionType.Subcommand
                    }
                ]
            },
            {
                name: 'customise',
                description: 'Customise your own rank card',
                type: ApplicationCommandOptionType.SubcommandGroup,
                options: [
                    {
                        name: 'set-colour',
                        description: 'Set the colour of your rank card',
                        type: ApplicationCommandOptionType.Subcommand,
                        options: [
                            {
                                name: 'colour',
                                description: 'Accepted formats, #XXXXXX, #XXX, XXXXXX, XXX, 0xXXXXXX, 0xXXX (X is one of 0-9 or A-F or a-f)',
                                type: ApplicationCommandOptionType.String,
                                required: true
                            }
                        ]
                    },
                    {
                        name: 'remove-colour',
                        description: 'Remove the colour of your rank card (default is #00FFFF)',
                        type: ApplicationCommandOptionType.Subcommand
                    }
                ]
            }
        ]
    },
    async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<any> {
        const scGroup = interaction.options.getSubcommandGroup(true) as "display" | "customise"

        if (scGroup === "display") {
            const sc = interaction.options.getSubcommand(true) as "user-card" | "self-card"

            if (sc === "user-card") {
                const user = interaction.options.getUser('user', true)

                const localLeaderboard = (await LevelModel.findAll())
                .filter(r => interaction.guild.members.cache.has(r.id))
                .map(s => s.id)

                const globalLeaderboard = (await LevelModel.findAll())
                .map(s => s.id)

                const userLocalPosition = localLeaderboard.indexOf(interaction.user.id) + 1

                const userGlobalPosition = globalLeaderboard.indexOf(interaction.user.id) + 1
                
                if (user.id === interaction.user.id) {
                    const userRankCard = await LevelModel.findOne({
                        where: {
                            id: interaction.user.id
                        }
                    })
    
                    const userCustomisationOptions = await RankCardModel.findOne({
                        where: {
                            id: interaction.user.id
                        }
                    })
    
                    if (!userRankCard) {
                        return await interaction.reply({
                            embeds: [
                                new EmbedBuilder()
                                .setColor(0xff0000)
                                .setTitle('My Rank Card')
                                .setDescription('You don\'t have a rank card yet!')
                                .setFooter({
                                    text: 'Send some messages first, or play mini-games, to gain experience points.'
                                })
                            ]
                        })
                    } else {
                        return await interaction.reply({
                            embeds: [
                                new EmbedBuilder()
                                .setColor(userCustomisationOptions?.colour ?? 0x00ffff)
                                .setTitle('My Rank Card')
                                .setThumbnail(interaction.user.displayAvatarURL({ forceStatic: false }))
                                .setDescription(`You currently rank as ${
                                    userLocalPosition < 4
                                    ? bold(['🥇 top', '🥈 second highest', '🥉 third highest'][userLocalPosition])
                                    : bold(`${inlineCode(ordinalNumber(userLocalPosition))} place`)
                                } out of ${
                                    inlineCode(`${localLeaderboard.length}`)
                                } in this server's leaderboard, and ${
                                    userGlobalPosition < 4
                                    ? bold(['🥇 top', '🥈 second highest', '🥉 third highest'][userGlobalPosition])
                                    : bold(`${inlineCode(ordinalNumber(userGlobalPosition))} place`)
                                } out of ${
                                    inlineCode(`${globalLeaderboard.length}`)
                                } in the global leaderboard.`)
                                .addFields([
                                    {
                                        name: 'Level',
                                        value: userRankCard.lvl.toString(),
                                        inline: true
                                    },
                                    {
                                        name: 'Experience Points',
                                        value: userRankCard.xp.toString(),
                                        inline: true
                                    },
                                    {
                                        name: `Number of Experience Points required to reach Level ${userRankCard.lvl + 1}`,
                                        value: `${(userRankCard.lvl * 50 + 50) - userRankCard.xp}`,
                                        inline: true
                                    }
                                ])
                                .setFooter({
                                    text: 'Send messages or play minigames to gain more experience points. Customise your rank card using the /rank customise set-colour command.'
                                })
                            ]
                        })
                    }
                } else {
                    const localLeaderboard = (await LevelModel.findAll())
                    .filter(r => interaction.guild.members.cache.has(r.id))
                    .map(s => s.id)

                    const globalLeaderboard = (await LevelModel.findAll())
                    .map(s => s.id)

                    const userLocalPosition = localLeaderboard.indexOf(user.id) + 1

                    const userGlobalPosition = globalLeaderboard.indexOf(user.id) + 1
                
                    const userRankCard = await LevelModel.findOne({
                        where: {
                            id: user.id
                        }
                    })
    
                    const userCustomisationOptions = await RankCardModel.findOne({
                        where: {
                            id: user.id
                        }
                    })
    
                    if (!userRankCard) {
                        return await interaction.reply({
                            embeds: [
                                new EmbedBuilder()
                                .setColor(0xff0000)
                                .setTitle(`Rank Card for ${inlineCode(user.tag)} (${inlineCode(user.id)})`)
                                .setDescription(`${bold(user.tag)} (${inlineCode(user.id)}) doesn't have a rank card yet!`)
                                .setFooter({
                                    text: 'This user needs to send some messages first, or play mini-games, to gain experience points.'
                                })
                            ]
                        })
                    } else {
                        return await interaction.reply({
                            embeds: [
                                new EmbedBuilder()
                                .setColor(userCustomisationOptions?.colour ?? 0x00ffff)
                                .setTitle(`Rank Card for ${inlineCode(user.tag)} (${inlineCode(user.id)})`)
                                .setThumbnail(interaction.user.displayAvatarURL({ forceStatic: false }))
                                .setDescription(`${bold(user.tag)} (${inlineCode(user.id)}) currently ranks as ${
                                    userLocalPosition < 4
                                    ? bold(['🥇 top', '🥈 second highest', '🥉 third highest'][userLocalPosition])
                                    : bold(`${inlineCode(ordinalNumber(userLocalPosition))} place`)
                                } out of ${
                                    inlineCode(`${localLeaderboard.length}`)
                                } in this server's leaderboard, and ${
                                    userGlobalPosition < 4
                                    ? bold(['🥇 top', '🥈 second highest', '🥉 third highest'][userGlobalPosition])
                                    : bold(`${inlineCode(ordinalNumber(userGlobalPosition))} place`)
                                } out of ${
                                    inlineCode(`${globalLeaderboard.length}`)
                                } in the global leaderboard.`)
                                .addFields([
                                    {
                                        name: 'Level',
                                        value: userRankCard.lvl.toString(),
                                        inline: true
                                    },
                                    {
                                        name: 'Experience Points',
                                        value: userRankCard.xp.toString(),
                                        inline: true
                                    },
                                    {
                                        name: `Number of Experience Points required for ${inlineCode(user.tag)} to reach Level ${userRankCard.lvl + 1}`,
                                        value: `${(userRankCard.lvl * 50 + 50) - userRankCard.xp}`,
                                        inline: true
                                    }
                                ])
                            ]
                        })
                    }
                }
            } else {
                const userRankCard = await LevelModel.findOne({
                    where: {
                        id: interaction.user.id
                    }
                })

                const userCustomisationOptions = await RankCardModel.findOne({
                    where: {
                        id: interaction.user.id
                    }
                })

                const localLeaderboard = (await LevelModel.findAll())
                .filter(r => interaction.guild.members.cache.has(r.id))
                .map(s => s.id)

                const globalLeaderboard = (await LevelModel.findAll())
                .map(s => s.id)

                const userLocalPosition = localLeaderboard.indexOf(interaction.user.id) + 1

                const userGlobalPosition = globalLeaderboard.indexOf(interaction.user.id) + 1

                if (!userRankCard) {
                    return await interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                            .setColor(0xff0000)
                            .setTitle('My Rank Card')
                            .setDescription('You don\'t have a rank card yet!')
                            .setFooter({
                                text: 'Send some messages first, or play mini-games, to gain experience points.'
                            })
                        ]
                    })
                } else {
                    return await interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                            .setColor(userCustomisationOptions?.colour ?? 0x00ffff)
                            .setTitle('My Rank Card')
                            .setThumbnail(interaction.user.displayAvatarURL({ forceStatic: false }))
                            .setDescription(`You currently rank as ${
                                userLocalPosition < 4
                                ? bold(['🥇 top', '🥈 second highest', '🥉 third highest'][userLocalPosition])
                                : bold(`${inlineCode(ordinalNumber(userLocalPosition))} place`)
                            } out of ${
                                inlineCode(`${localLeaderboard.length}`)
                            } in this server's leaderboard, and ${
                                userGlobalPosition < 4
                                ? bold(['🥇 top', '🥈 second highest', '🥉 third highest'][userGlobalPosition])
                                : bold(`${inlineCode(ordinalNumber(userGlobalPosition))} place`)
                            } out of ${
                                inlineCode(`${globalLeaderboard.length}`)
                            } in the global leaderboard.`)
                            .addFields([
                                {
                                    name: 'Level',
                                    value: userRankCard.lvl.toString(),
                                    inline: true
                                },
                                {
                                    name: 'Experience Points',
                                    value: userRankCard.xp.toString(),
                                    inline: true
                                },
                                {
                                    name: `Number of Experience Points required to reach Level ${userRankCard.lvl + 1}`,
                                    value: `${(userRankCard.lvl * 50 + 50) - userRankCard.xp}`,
                                    inline: true
                                }
                            ])
                            .setFooter({
                                text: 'Send messages or play minigames to gain more experience points. Customise your rank card using the /rank customise set-colour command.'
                            })
                        ]
                    })
                }
            }
        } else {
            const sc = interaction.options.getSubcommand(true) as "set-colour" | "remove-colour"
            if (sc === "set-colour") {
                const userRankCard = await LevelModel.findOne({
                    where: {
                        id: interaction.user.id
                    }
                })
                if (!userRankCard) return await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle('Your Rank Card')
                        .setColor(0xff0000)
                        .setDescription('Cannot customise your rank card when you don\'t even have one!')
                    ],
                    ephemeral: true
                })
                const colourString = interaction.options.getString('colour', true)

                const colour = colourString.match(/(0x|#)?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})/)?.[2]

                if (!colour) return await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle('Problem when Customising Rank Card')
                        .setDescription(`Colour is invalid.\n\nThe colour must match the following regex: ${inlineCode(
                            '/(?:#|0[xX])?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})/'
                        )}, however the value you provided, ${
                            inlineCode(colourString)
                        }, doesn't.`)
                        .addFields([
                            {
                                name: 'Rules',
                                value: `Anything that has a string of either 3 or 6 hexadecimal digits [that is, **numbers \`0\` to \`9\`** or **letters \`a\` to \`f\`** (case-insensitive)].\nIt can also optionally start with **a hashtag (\`#\`)**, or **\`0x\`** or **\`0X\`**.`,
                                inline: true
                            },
                            {
                                name: 'Examples of accepted formats',
                                value: [
                                    'ff9900',
                                    'FF9900',
                                    'f90',
                                    'F90',
                                    '#ff9900',
                                    '#FF9900',
                                    '#f90',
                                    '#F90',
                                    '0xff9900',
                                    '0xFF9900',
                                    '0XFF9900',
                                    '0Xff9900',
                                    '0xf90',
                                    '0xF90',
                                    '0Xf90',
                                    '0XF90'
                                ].map(s => inlineCode(s)).join('\n'),
                                inline: true
                            }
                        ])
                    ],
                    ephemeral: true
                })

                const userCustomisedCard = await (
                    await RankCardModel.findOne({
                        where: {
                            id: interaction.user.id
                        }
                    })
                )?.update({
                    colour: eval(`0x${colour}`)
                }) || await RankCardModel.create({
                    id: interaction.user.id,
                    colour: eval(`0x${colour}`)
                })

                return await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setColor(0x00ff00)
                        .setTitle('Successful Rank Card Colour Update')
                        .setDescription(`Successfully updated the colour of your rank card.\n**See the embed below for a preview of your rank card.**`),
                        new EmbedBuilder()
                        .setColor(userCustomisedCard.colour)
                        .setTitle('My Rank Card - Preview')
                        .setThumbnail(interaction.user.displayAvatarURL({ forceStatic: false }))
                        .addFields([
                            {
                                name: 'Level',
                                value: userRankCard.lvl.toString(),
                                inline: true
                            },
                            {
                                name: 'Experience Points',
                                value: userRankCard.xp.toString(),
                                inline: true
                            },
                            {
                                name: `Number of Experience Points required to reach Level ${userRankCard.lvl + 1}`,
                                value: `${(userRankCard.lvl * 50 + 50) - userRankCard.xp}`,
                                inline: true
                            }
                        ])
                    ]
                })
            } else {
                const userRankCard = await LevelModel.findOne({
                    where: {
                        id: interaction.user.id
                    }
                })
                if (!userRankCard) return await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle('Your Rank Card')
                        .setColor(0xff0000)
                        .setDescription('Cannot reset the colour for your rank card when you don\'t even have one!')
                    ],
                    ephemeral: true
                })
                const colourString = interaction.options.getString('colour', true)

                const colour = colourString.match(/(0x|#)?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})/)?.[2]

                if (!colour) return await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle('Problem when Resetting Colour of Rank Card')
                        .setDescription(`Colour is invalid.\n\nThe colour must match the following regex: ${inlineCode(
                            '/(?:#|0[xX])?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})/'
                        )}, however the value you provided, ${
                            inlineCode(colourString)
                        }, doesn't.`)
                        .addFields([
                            {
                                name: 'Rules',
                                value: `Anything that has a string of either 3 or 6 hexadecimal digits [that is, **numbers \`0\` to \`9\`** or **letters \`a\` to \`f\`** (case-insensitive)].\nIt can also optionally start with **a hashtag (\`#\`)**, or **\`0x\`** or **\`0X\`**.`,
                                inline: true
                            },
                            {
                                name: 'Examples of accepted formats',
                                value: [
                                    'ff9900',
                                    'FF9900',
                                    'f90',
                                    'F90',
                                    '#ff9900',
                                    '#FF9900',
                                    '#f90',
                                    '#F90',
                                    '0xff9900',
                                    '0xFF9900',
                                    '0XFF9900',
                                    '0Xff9900',
                                    '0xf90',
                                    '0xF90',
                                    '0Xf90',
                                    '0XF90'
                                ].map(s => inlineCode(s)).join('\n'),
                                inline: true
                            }
                        ])
                    ]
                })

                const userCustomisedCard = await (
                    await RankCardModel.findOne({
                        where: {
                            id: interaction.user.id
                        }
                    })
                )?.update({
                    colour: 0x00ffff
                }) || await RankCardModel.create({
                    id: interaction.user.id,
                    colour: 0x00ffff
                })

                return await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setColor(0x00ff00)
                        .setTitle('Successful Rank Card Colour Reset')
                        .setDescription(`Successfully reset the colour of your rank card to the default \`0x00FFFF\`.\n**See the embed below for a preview of your rank card.**`),
                        new EmbedBuilder()
                        .setColor(userCustomisedCard.colour)
                        .setTitle('My Rank Card - Preview')
                        .addFields([
                            {
                                name: 'Level',
                                value: userRankCard.lvl.toString(),
                                inline: true
                            },
                            {
                                name: 'Experience Points',
                                value: userRankCard.xp.toString(),
                                inline: true
                            },
                            {
                                name: `Number of Experience Points required to reach Level ${userRankCard.lvl + 1}`,
                                value: `${(userRankCard.lvl * 50 + 50) - userRankCard.xp}`,
                                inline: true
                            }
                        ])
                    ]
                })
            }
        }
    }
}

export { rankCommand }
