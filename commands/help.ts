import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, EmbedBuilder, italic, ChatInputApplicationCommandData, bold, inlineCode, underscore, ComponentType, SelectMenuBuilder, time } from "discord.js";
import { Cmd, imageCommand, welcomeEditorCommand } from "./command-exports";
import {
    banCommand,
    exchangeCommand,
    gtwCommand,
    inviteCommand,
    kickCommand,
    leaderboardCommand,
    memoryGameCommand,
    pingCommand,
    rankCommand,
    timeoutCommand,
    tttCommand,
    reportCommand,
    slowmodeCommand,
    serverInfoCommand,
    updatesCommand,
    userInfoCommand,
    balanceCommand,
    withdrawCommand,
    depositCommand,
    giveCommand,
    channelWLCommand,
    channelBLCommand
} from './command-exports'

const helpCommand: Cmd = {
    data: {
        name: 'help',
        description: 'Get all info about this bot'
    },
    async execute(interaction: ChatInputCommandInteraction<"cached">) {
        const groups: Array<{
            name: string,
            embedDescription: string,
            selectMenuDescription: string,
            commands: Array<object>
        }> = [
            {
                name: 'Moderation Commands',
                embedDescription: 'These are commands you can use to moderate other members which can help you in managing your server!',
                selectMenuDescription: 'See all moderation commands',
                commands: [
                    banCommand.data,
                    kickCommand.data,
                    timeoutCommand.data,
                    slowmodeCommand.data
                ]
            },
            {
                name: 'Information',
                embedDescription: 'These are commands that display information on specific things.',
                selectMenuDescription: 'See all information commands',
                commands: [
                    serverInfoCommand.data,
                    userInfoCommand.data
                ]
            },
            {
                name: 'Level System',
                embedDescription: 'Here you can see all commans relating to ZBot\'s level system. Remember, the rules for gaining XP are:\n• You can only gain 5 XP if you send at least 3 words in one sentence. Otherwise, you get no XP at all.\n• After the 3 words, every single two words is 2 XP as long as one or both of them is at least 3 letters long.\n• You can play mini-games to gain lots of XP!',
                selectMenuDescription: 'See all commands relating to ZBot level system',
                commands: [
                    rankCommand.data,
                    leaderboardCommand.data,
                    channelWLCommand.data,
                    channelBLCommand.data
                ]
            },
            {
                name: 'Mini-games',
                embedDescription: 'Want to have fun with your friends? Play mini-games!',
                selectMenuDescription: 'See all mini-games',
                commands: [
                    tttCommand.data,
                    memoryGameCommand.data,
                    gtwCommand.data
                ]
            },
            {
                name: 'Miscellaneous',
                embedDescription: 'View other miscellaneous commands you can use.',
                selectMenuDescription: 'See miscellaneous commands',
                commands: [
                    pingCommand.data,
                    reportCommand.data
                ]
            },
            {
                name: 'ZBot',
                embedDescription: 'See commands to do with ZBot! You can receive this bot\'s updates and also invite this bot to your server!',
                selectMenuDescription: 'See ZBot commands',
                commands: [
                    inviteCommand.data,
                    updatesCommand.data
                ]
            },
            {
                name: 'Level System',
                embedDescription: '**What is ZBot\'s Level System?**\nZBot\'s level system is a reward system where members gain XP through interacting with the bot or chatting. Every time you hit a certain amount of XP, you level up, and each level is harder than the previous.\nThere are currently two ways of getting XP:\n\n\`1\` **__Sending Messages__**\nYou can get XP through message sending, and the more and longer messages you send, the more XP you get.\n\n\`2\` **__Playing mini-games__**\nPlaying mini-games are worth a fortune when it comes to gaining XP, you can gain lots of XP for winning mini-games easily.\n\n**How do I check my progress?**\nYou can check your progress through the \`/rank\` command which displays your position on the leaderboard, and you can also use the \`/leaderboard\` command to see how you compete against the top ranking users, in either your server or globally.',
                selectMenuDescription: 'Display info on the level system',
                commands: []
            },
            {
                name: 'Economy System',
                embedDescription: `${italic('This is currently under development - some features are experimental and may break at any time.')}\nCheck out some new economy commands!`,
                selectMenuDescription: 'Economy system (currently under development)',
                commands: [
                    exchangeCommand.data,
                    balanceCommand.data,
                    withdrawCommand.data,
                    depositCommand.data,
                    giveCommand.data
                ]
            },
            {
                name: 'Experimental Commands and Features',
                embedDescription: `Some of the experimental commands you may come across.\n\n⚠ **Note: these are experimental features and may break while in use.**`,
                selectMenuDescription: 'View features under testing',
                commands: [
                    imageCommand.data,
                    welcomeEditorCommand.data
                ]
            },
            {
                name: 'Ticket System',
                embedDescription: italic("Coming soon!"),
                selectMenuDescription: 'Ticket System (coming soon)',
                commands: []
            },
            {
                name: 'Links',
                embedDescription: `**__Links__**\n**Join our support server,** [ZBot Server (En)](https://discord.gg/6tkn6m5g52).\n**Add this bot to your server** with [this invite link](https://discord.com/oauth2/authorize?client_id=956596792542257192&permissions=1644971949559&scope=bot%20applications.commands) (all permissions).\n**See our GitHub repository:** [Zahid556/ZBot-En](https://github.com/Zahid556/ZBot-Ar)\n**Read the Discord Guidelines** [here](https://discord.com/community-guidelines), the **Discord Terms of Service** [here](https://discord.com/terms) or the **Discord Privacy Policy** [here](https://discord.com/privacy).`,
                selectMenuDescription: 'See available links',
                commands: []
            }
        ]
        let currentPage = 1

        let buttons: ActionRowBuilder<ButtonBuilder> = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
            .setEmoji('◀')
            .setCustomId('previous')
            .setLabel('Previous')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(true),
            new ButtonBuilder()
            .setCustomId('go-to')
            .setLabel('Go to...')
            .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
            .setEmoji('▶')
            .setCustomId('next')
            .setLabel('Next')
            .setStyle(ButtonStyle.Primary)
        )

        const embed = new EmbedBuilder()
        .setTitle('Help')
        .setFields([
            {
                name: groups[currentPage - 1].name,
                value: groups[currentPage - 1].embedDescription
            }
        ])
        .setFooter({
            text: `Page ${currentPage} of ${groups.length} • Use the ${
                currentPage === 1
                ? '▶ button'
                : (
                    currentPage === groups.length
                    ? '◀ button'
                    : '◀ or ▶ buttons'
                )
            } to switch between pages, or the "Go to..." button to jump to a specific page.`
        })
        .setColor(0x00ffff)

        if (groups[currentPage - 1].commands.length !== 0) {
            embed.addFields([
                {
                    name: 'Commands',
                    value: groups[currentPage - 1].commands
                    .map((cmd) => {
                        let c = cmd as ChatInputApplicationCommandData
                        let text = `${underscore(bold(inlineCode(
                            `/${c.name}`
                        )))} ${c.description}`
                        return text
                    })
                    .join('\n\n')
                }
            ])
        }

        const reply = await interaction.reply({
            embeds: [
                embed
            ],
            components: [
                buttons
            ],
            fetchReply: true
        })

        const collector = reply.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 180000
        })

        collector.on('collect', async (button) => {
            if (button.user.id !== interaction.user.id) {
                await button.reply({
                    content: 'These buttons aren\'t for you!',
                    ephemeral: true
                })
                return
            }

            const customId = button.customId

            if (customId === 'previous') {
                if (currentPage === 1) {
                    await button.reply({
                        content: 'You\'re already on the first page, you cannot go back.',
                        ephemeral: true
                    })
                    buttons = new ActionRowBuilder<ButtonBuilder>({
                        components: buttons.components.map((b, i) => i === 0 ? b.setDisabled(true) : b.setDisabled(false))
                    })
                    reply.edit({
                        components: [
                            buttons
                        ]
                    })
                    collector.resetTimer()
                    return
                } else {
                    currentPage--
                    embed
                    .setFields([
                        {
                            name: groups[currentPage - 1].name,
                            value: groups[currentPage - 1].embedDescription
                        }
                    ])
                    .setFooter({
                        text: `Page ${currentPage} of ${groups.length} • Use the ${
                            currentPage === 1
                            ? '▶ button'
                            : (
                                currentPage === groups.length
                                ? '◀ button'
                                : '◀ or ▶ buttons'
                            )
                        } to switch between pages, or the "Go to..." button to jump to a specific page.`
                    })
            
                    if (groups[currentPage - 1].commands.length !== 0) {
                        embed.addFields([
                            {
                                name: 'Commands',
                                value: groups[currentPage - 1].commands
                                .map((cmd) => {
                                    let c = cmd as ChatInputApplicationCommandData
                                    let text = `${underscore(bold(inlineCode(
                                        `/${c.name}`
                                    )))} ${c.description}`
                                    return text
                                })
                                .join('\n\n')
                            }
                        ])
                    }

                    if (currentPage === 1) {
                        buttons = new ActionRowBuilder<ButtonBuilder>({
                            components: buttons.components.map((b, i) => i === 0 ? b.setDisabled(true) : b.setDisabled(false))
                        })
                    } else {
                        buttons = new ActionRowBuilder<ButtonBuilder>({
                            components: buttons.components.map((b, _i) => b.setDisabled(false))
                        })
                    }

                    reply.edit({
                        embeds: [
                            embed
                        ],
                        components: [
                            buttons
                        ]
                    })

                    button.reply({
                        content: `Switched to page ${inlineCode(currentPage.toString())}.`,
                        ephemeral: true
                    })

                    collector.resetTimer()
                }
            } else if (customId === 'next') {
                if (currentPage === groups.length) {
                    await button.reply({
                        content: 'You\'re already on the last page, you cannot go forward.',
                        ephemeral: true
                    })
                    buttons = new ActionRowBuilder<ButtonBuilder>({
                        components: buttons.components.map((b, i, arr) => i + 1 === arr.length ? b.setDisabled(true) : b.setDisabled(false))
                    })
                    reply.edit({
                        components: [
                            buttons
                        ]
                    })
                    collector.resetTimer()
                    return
                } else {
                    currentPage++
                    embed
                    .setFields([
                        {
                            name: groups[currentPage - 1].name,
                            value: groups[currentPage - 1].embedDescription
                        }
                    ])
                    .setFooter({
                        text: `Page ${currentPage} of ${groups.length} • Use the ${
                            currentPage === 1
                            ? '▶ button'
                            : (
                                currentPage === groups.length
                                ? '◀ button'
                                : '◀ or ▶ buttons'
                            )
                        } to switch between pages, or the "Go to..." button to jump to a specific page.`
                    })
            
                    if (groups[currentPage - 1].commands.length !== 0) {
                        embed.addFields([
                            {
                                name: 'Commands',
                                value: groups[currentPage - 1].commands
                                .map((cmd) => {
                                    let c = cmd as ChatInputApplicationCommandData
                                    let text = `${underscore(bold(inlineCode(
                                        `/${c.name}`
                                    )))} ${c.description}`
                                    return text
                                })
                                .join('\n\n')
                            }
                        ])
                    }

                    if (currentPage === groups.length) {
                        buttons = new ActionRowBuilder<ButtonBuilder>({
                            components: buttons.components.map((b, i, arr) => i + 1 === arr.length  ? b.setDisabled(true) : b.setDisabled(false))
                        })
                    } else {
                        buttons = new ActionRowBuilder<ButtonBuilder>({
                            components: buttons.components.map((b) => b.setDisabled(false))
                        })
                    }

                    reply.edit({
                        embeds: [
                            embed
                        ],
                        components: [
                            buttons
                        ]
                    })

                    button.reply({
                        content: `Switched to page ${inlineCode(currentPage.toString())}.`,
                        ephemeral: true
                    })

                    collector.resetTimer()
                }
            } else if (customId === 'go-to') {
                buttons = new ActionRowBuilder<ButtonBuilder>({
                    components: buttons.components.map((b) => b.setDisabled(true))
                })

                const filteredGroups = groups.filter((_, i) => i !== currentPage - 1)

                const selectMenu = new ActionRowBuilder<SelectMenuBuilder>()
                .addComponents(
                    new SelectMenuBuilder()
                    .setCustomId('go-to-menu')
                    .setPlaceholder('Select a page to go to...')
                    .addOptions(
                        filteredGroups
                        .map((g, i) => {
                            return {
                                label: `${
                                    i < currentPage - 1 
                                    ? i + 1 
                                    : i + 2
                                }. ${g.name}`,
                                description: g.selectMenuDescription,
                                value: String(i < currentPage - 1 ? i + 1 : i + 2)
                            }
                        })
                    )
                    .setMaxValues(1)
                )

                const menuReply = await button.reply({
                    content: `Select a page between \`1\` and \`${groups.length}\` (excluding \`${currentPage}\`) to go to. You must respond ${
                        time(Math.floor(Date.now() / 1000) + 91, 'R')
                    }`,
                    components: [
                        selectMenu
                    ],
                    fetchReply: true
                })

                menuReply.awaitMessageComponent({
                    time: 90000,
                    componentType: ComponentType.SelectMenu
                })
                .then((choice) => {
                    currentPage = Number(choice.values[0])

                    embed
                    .setFields([
                        {
                            name: groups[currentPage - 1].name,
                            value: groups[currentPage - 1].embedDescription
                        }
                    ])
                    .setFooter({
                        text: `Page ${currentPage} of ${groups.length} • Use the ${
                            currentPage === 1
                            ? '▶ button'
                            : (
                                currentPage === groups.length
                                ? '◀ button'
                                : '◀ or ▶ buttons'
                            )
                        } to switch between pages, or the "Go to..." button to jump to a specific page.`
                    })
            
                    if (groups[currentPage - 1].commands.length !== 0) {
                        embed.addFields([
                            {
                                name: 'Commands',
                                value: groups[currentPage - 1].commands
                                .map((cmd) => {
                                    let c = cmd as ChatInputApplicationCommandData
                                    let text = `${underscore(bold(inlineCode(
                                        `/${c.name}`
                                    )))} ${c.description}`
                                    return text
                                })
                                .join('\n\n')
                            }
                        ])
                    }

                    if (currentPage === 1) {
                        buttons = new ActionRowBuilder<ButtonBuilder>({
                            components: buttons.components.map((b, i) => i === 0 ? b.setDisabled(true) : b.setDisabled(false))
                        })
                    } else if (currentPage === groups.length) {
                        buttons = new ActionRowBuilder<ButtonBuilder>({
                            components: buttons.components.map((b, i, arr) => i + 1 === arr.length ? b.setDisabled(true) : b.setDisabled(false))
                        })
                    } else {
                        buttons = new ActionRowBuilder<ButtonBuilder>({
                            components: buttons.components.map((b, _i) => b.setDisabled(false))
                        })
                    }

                    reply.edit({
                        embeds: [
                            embed
                        ],
                        components: [
                            buttons
                        ]
                    })

                    choice.reply({
                        content: `Jumped to page ${inlineCode(currentPage.toString())}.`,
                        ephemeral: true
                    })
                    
                    menuReply.edit({
                        content: 'Page selected.',
                        components: [
                            new ActionRowBuilder<SelectMenuBuilder>({
                                components: selectMenu.components.map(s => s.setDisabled(true))
                            })
                        ]
                    }).then(() => {
                        setTimeout(() => menuReply.delete(), 500)
                    })

                    collector.resetTimer()
                })
                .catch((err) => {
                    console.log(err)
                    selectMenu.components[0].setDisabled(true)
                    menuReply.edit({
                        content: 'Didn\'t receive a response in time.',
                        components: [
                            selectMenu
                        ]
                    })
                    if (currentPage === 1) {
                        buttons = new ActionRowBuilder<ButtonBuilder>({
                            components: buttons.components.map((b, i) => i === 0 ? b.setDisabled(true) : b.setDisabled(false))
                        })
                    } else if (currentPage === groups.length) {
                        buttons = new ActionRowBuilder<ButtonBuilder>({
                            components: buttons.components.map((b, i, arr) => i + 1 === arr.length ? b.setDisabled(true) : b.setDisabled(false))
                        })
                    } else {
                        buttons = new ActionRowBuilder<ButtonBuilder>({
                            components: buttons.components.map((b, _i) => b.setDisabled(false))
                        })
                    }
                })
            }
        })

        collector.on('end', () => {
            reply.edit({
                components: [
                    new ActionRowBuilder<ButtonBuilder>({
                        components: buttons.components.map(b => b.setDisabled(true))
                    })
                ],
                embeds: [
                    embed.setFooter({
                        text: `Page ${currentPage} of ${groups.length} • You can no longer switch between pages or jump to a specific one.`
                    })
                ]
            })
            .catch(() => {
                return interaction.channel?.send('An error occured with the original message - help pagination cancelled.')
            })
        })
    }
}

export {
    helpCommand
}