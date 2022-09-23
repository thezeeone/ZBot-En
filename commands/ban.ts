import { ActionRowBuilder, ApplicationCommandOptionType, bold, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, ComponentType, EmbedBuilder, GuildMember, inlineCode, italic, PermissionsBitField, time, underscore } from "discord.js"
import { BlacklistModel } from "../database"
import { commaList, ordinalNumber, pluralise } from "../util"
import { Cmd, tipsAndTricks } from "./command-exports"

const banCommand: Cmd = {
    data: {
        name: 'ban',
        description: 'Ban or unban a user',
        options: [
            {
                name: 'set',
                description: 'Ban a user',
                type: ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: 'user',
                        description: 'The user to ban',
                        type: ApplicationCommandOptionType.User,
                        required: true
                    },
                    {
                        name: 'reason',
                        description: 'The reason for banning this user (max len 200)',
                        type: ApplicationCommandOptionType.String,
                        minLength: 1,
                        maxLength: 200,
                        required: false
                    },
                    {
                        name: 'clear',
                        description: 'How long to clear from the user\'s message history',
                        type: ApplicationCommandOptionType.Integer,
                        required: false,
                        choices: [
                            {
                                name: 'Do not clear any message history for the user',
                                value: 0
                            },
                            {
                                name: '1 day',
                                value: 1
                            }, 
                            {
                                name: '2 days',
                                value: 2
                            }, 
                            {
                                name: '3 days',
                                value: 3
                            }, 
                            {
                                name: '4 days',
                                value: 4
                            }, 
                            {
                                name: '5 days',
                                value: 5
                            }, 
                            {
                                name: '6 days',
                                value: 6
                            }, 
                            {
                                name: '1 week',
                                value: 7
                            }

                        ]
                    }
                ]
            },
            {
                name: 'remove',
                description: 'Unban a user',
                type: ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: 'user',
                        description: 'The user to unban (using ID)',
                        type: ApplicationCommandOptionType.User,
                        required: true
                    },
                    { 
                        name: 'reason',
                        description: 'The reason for unbanning this user (max len 200)',
                        type: ApplicationCommandOptionType.String,
                        minLength: 1,
                        maxLength: 200,
                        required: false
                    }
                ]
            }
        ]
    },
    async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<any> {
        // Input
        const subcmd = interaction.options.getSubcommand(true) as "set" | "remove"

        // Avoid repetition
        const botMember = <GuildMember>interaction.guild.members.me

        if (subcmd === "remove") {
            // Remove a user's ban

            // Input
            const user = interaction.options.getUser('user', true)
            const reason = interaction.options.getString('reason')
            
            // Required permissions
            
            const perms = new PermissionsBitField('BanMembers').toArray()

            if (
                !perms.every(perm => botMember.permissions.has(perm))
            ) {
                const missingPerms = perms.filter(p => !botMember.permissions.has(p))
                return await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setAuthor({
                            name: `${interaction.user.tag} (${interaction.user.id})`,
                            iconURL: interaction.user.displayAvatarURL({ forceStatic: false })
                        })
                        .setTitle(`Missing Permissions`)
                        .setDescription(`Bot is missing permissions.\nThis command requires the bot to have the ${
                            bold(
                                `${commaList(
                                    perms
                                    .map(
                                        s => inlineCode((s.match(/[A-Z][a-z]+/g) as RegExpMatchArray).join(' '))
                                    )
                                )} ${
                                    perms.length === 1
                                    ? 'permission'
                                    : 'permission'
                                }`
                            )
                        }.\nThe bot ${
                            missingPerms.length 
                            ? 'doesn\'t have any of the required permissions, and'
                            : `has the ${
                                bold(
                                    `${commaList(
                                        perms
                                        .filter(
                                            p => !missingPerms.includes(p)
                                        )
                                        .map(
                                            s => inlineCode((s.match(/[A-Z][a-z]+/g) as RegExpMatchArray).join(' '))
                                        )
                                    )} ${
                                        perms.filter(p => !missingPerms.includes(p)).length === 1
                                        ? 'permission'
                                        : 'permissions'
                                    }`
                                )
                            }, however`
                        } is __missing__ the ${
                            bold(
                                `${commaList(
                                    missingPerms
                                    .map(
                                        s => inlineCode((s.match(/[A-Z][a-z]+/g) as RegExpMatchArray).join(' '))
                                    )
                                )} ${
                                    missingPerms.length === 1
                                    ? 'permission'
                                    : 'permissions'
                                }`
                            )
                        }.`)
                        .setColor(0xff0000)
                    ],
                    ephemeral: true
                })
            }

            // Check if the user exists
            if (!user) return await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setAuthor({
                        name: `${interaction.user.tag} (${interaction.user.id})`,
                        iconURL: interaction.user.displayAvatarURL({ forceStatic: false })
                    })
                    .setTitle(`User not found`)
                    .setDescription(`Couldn't find that user.`)
                    .setColor(0xff0000)
                ],
                ephemeral: true
            })

            // Check if the user is already banned
            if (!interaction.guild.bans.cache.has(user.id)) return await interaction.reply({ 
                embeds: [
                    new EmbedBuilder()
                    .setAuthor({
                        name: `${interaction.user.tag} (${interaction.user.id})`,
                        iconURL: interaction.user.displayAvatarURL({ forceStatic: false })
                    })
                    .setTitle(`User not banned`)
                    .setDescription('This user isn\'t banned.')
                    .setColor(0xff0000)
                ], 
                ephemeral: true 
            })


            const [
                yesButton,
                noButton
            ] = [
                new ButtonBuilder()
                .setCustomId('yes')
                .setStyle(ButtonStyle.Success)
                .setLabel('Yes'),
                new ButtonBuilder()
                .setCustomId('no')
                .setStyle(ButtonStyle.Danger)
                .setLabel('No')
            ]

            const confirmationRow = new ActionRowBuilder<ButtonBuilder>()
            .addComponents([yesButton, noButton])

            const reply = await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setAuthor({
                        name: `${interaction.user.tag} (${interaction.user.id})`,
                        iconURL: interaction.user.displayAvatarURL({ forceStatic: false })
                    })
                    .setTitle('Confirm Unban')
                    .setDescription(`Are you sure you would like to unban ${bold(user.tag)} (${inlineCode(user.id)})?\n\n${
                        italic(`A response is required ${
                            time(Math.floor(Date.now()/1000) + 121, 'R')
                        }.`)
                    }`)
                    .addFields([
                        {
                            name: 'Reason',
                            value: reason
                                ? reason
                                : italic(inlineCode('No reason')),
                            inline: false
                        },
                    ])
                    .setColor(0x00ffff)
                ],
                components: [
                    confirmationRow
                ],
                fetchReply: true
            })

            const confirmationCollector = reply.createMessageComponentCollector({
                componentType: ComponentType.Button,
                maxComponents: 1,
                filter: async (btn) => {
                    const isUserBlacklisted = await BlacklistModel.findOne({
                        where: {
                            id: btn.user.id
                        }
                    })

                    if (isUserBlacklisted) {
                        await btn.reply({
                            embeds: [
                                new EmbedBuilder()
                                .setTitle(underscore('You are blacklisted from using this bot.'))
                                .setDescription(`⛔ **You are not allowed to use the bot, or interact with its commands or message components.**`)
                                .setColor(0x000000)
                            ]
                        })
                        return false
                    }

                    if (btn.user.id !== interaction.user.id) {
                        await btn.reply({
                            content: 'What do you think you\'re doing, you\'re not allowed to use these buttons!',
                            ephemeral: true
                        })
                        return false
                    } else if (btn.customId !== 'yes' && btn.customId !== 'no') return false

                    return true
                }
                time: 120000
            })

            confirmationCollector.on('collect', async (button): Promise<any> => {
                if (button.customId === 'yes') {
                    const original = await interaction.fetchReply()
                    yesButton.setDisabled(true)
                    noButton.setDisabled(true)
                    original.edit({
                        embeds: [
                            EmbedBuilder.from(reply.embeds[0])
                            .setColor(0x00ff00)
                            .setTitle('Successful Unban')
                            .setDescription(`Successfully unbanned ${
                                bold(user.tag)
                            } (${inlineCode(user.id)}) ${
                                reason
                                ? `with reason ${bold(reason)}`
                                : 'without a reason'
                            }.`)
                        ],
                        components: []
                    })
                    
                    // Unban the user
                    user.send({
                        embeds: [
                            new EmbedBuilder()
                            .setColor(0x00ff00)
                            .setTitle('Unban')
                            .setDescription(`Your ban has been removed in ${bold(interaction.guild.name)}.`)
                            .addFields([
                                {
                                    name: 'Reason',
                                    value: reason
                                        ? reason
                                        : italic(inlineCode('No reason provided'))
                                }
                            ])
                        ]
                    })
                    .then(async () => {
                        await button.reply({
                            content: 'Unban successful. Member has been messaged.',
                            embeds: [
                                EmbedBuilder.from(reply.embeds[0])
                                .setColor(0x00ff00)
                                .setTitle('Unban Successful')
                                .setDescription(`Successfully unbanned ${
                                    bold(user.tag)
                                } (${inlineCode(user.id)}) from ${
                                    bold(interaction.guild.name)  
                                } ${
                                    reason
                                    ? `with reason ${bold(reason)}`
                                    : 'without a reason'
                                }.`)
                                .setFooter(
                                    Math.random() < 0.1
                                    ? { text: `💡 Did you know? ${tipsAndTricks[Math.floor(Math.random() * tipsAndTricks.length)]}` }
                                    : null
                                )
                                .setAuthor(null)
                                .setFields([])
                            ]
                        })
                    })
                    .catch(async () => {
                        await button.reply({
                            content: 'Unban removal successful. Couldn\'t send the member a message.',
                            embeds: [
                                EmbedBuilder.from(reply.embeds[0])
                                .setColor(0x00ff00)
                                .setTitle('Unban Successful')
                                .setDescription(`Successfully unbanned ${
                                    bold(user.tag)
                                } (${inlineCode(user.id)}) from ${
                                    bold(interaction.guild.name)
                                } ${
                                    reason
                                    ? `with reason ${bold(reason)}`
                                    : 'without a reason'
                                }.`)
                                .setFooter(
                                    Math.random() < 0.1
                                    ? { text: `💡 Did you know? ${tipsAndTricks[Math.floor(Math.random() * tipsAndTricks.length)]}` }
                                    : null
                                )
                                .setAuthor(null)
                                .setFields([])
                            ]
                        })
                    })
                    .finally(async () => {
                        await interaction.guild.members.unban(user, `Unbanned by ${
                                interaction.user.tag
                            } (${
                                interaction.user.id
                            }) ${
                                reason 
                                ? `with reason ${reason}` 
                                : 'without a reason'
                            }.`
                        )
                    })
                } else {
                    const original = await interaction.fetchReply()
                    yesButton.setDisabled(true)
                    noButton.setDisabled(true)
                    original.edit({
                        components: [ confirmationRow ],
                        embeds: [
                            EmbedBuilder.from(reply.embeds[0])
                            .setColor(0xff0000)
                            .setTitle('Unban Cancellation')
                            .setDescription(`Cancelled the unban for ${bold(user.tag)} (${inlineCode(user.id)}).`)
                            .setAuthor(null)
                            .setFields([])
                            .setFooter(
                                Math.random() < 0.1
                                ? { text: `💡 Did you know? ${tipsAndTricks[Math.floor(Math.random() * tipsAndTricks.length)]}` }
                                : null
                            )
                        ]
                    })
                    interaction.followUp('You cancelled the unban.')
                }
            })

            confirmationCollector.on('end', async (collected): Promise<any> => {
                if (!collected.size) {
                    const original = await interaction.fetchReply()
                    yesButton.setDisabled(true)
                    noButton.setDisabled(true)
                    original.edit({
                        embeds: [
                            EmbedBuilder.from(reply.embeds[0])
                            .setColor(0xff0000)
                            .setTitle('Unban Cancellation')
                            .setDescription('A response wasn\'t received in time.')
                            .setAuthor(null)
                            .setFields([])
                        ],
                        components: [ confirmationRow ]
                    })
                    return await interaction.followUp('A response wasn\'t received in time.')
                }
            })
        } else {
            // Ban a user/member
            
            const user = interaction.options.getUser('user', true)
            const reason = interaction.options.getString('reason')
            const userAsMember = interaction.guild.members.cache.get(user.id)
            const days = interaction.options.getInteger('clear') || 0
            
            
            // Required permissions
            const perms = new PermissionsBitField('BanMembers').toArray()

            if (
                !perms.every(perm => botMember.permissions.has(perm))
            ) {
                const missingPerms = perms.filter(p => !botMember.permissions.has(p))
                return await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setAuthor({
                            name: `${interaction.user.tag} (${interaction.user.id})`,
                            iconURL: interaction.user.displayAvatarURL({ forceStatic: false })
                        })
                        .setTitle(`Missing Permissions`)
                        .setDescription(`Bot is missing permissions.\nThis command requires the bot to have the ${
                            bold(
                                `${commaList(
                                    perms
                                    .map(
                                        s => inlineCode((s.match(/[A-Z][a-z]+/g) as RegExpMatchArray).join(' '))
                                    )
                                )} ${
                                    pluralise(perms.length, 'permissions')
                                }`
                            )
                        }.\nThe bot ${
                            missingPerms.length 
                            ? 'doesn\'t have any of the required permissions, and'
                            : `has the ${
                                bold(
                                    `${commaList(
                                        perms
                                        .filter(
                                            p => !missingPerms.includes(p)
                                        )
                                        .map(
                                            s => inlineCode((s.match(/[A-Z][a-z]+/g) as RegExpMatchArray).join(' '))
                                        )
                                    )} ${
                                        perms.filter(p => !missingPerms.includes(p)).length === 1
                                        ? 'permission'
                                        : 'permissions'
                                    }`
                                )
                            }, however`
                        } is __missing__ the ${
                            bold(
                                `${commaList(
                                    missingPerms
                                    .map(
                                        s => inlineCode((s.match(/[A-Z][a-z]+/g) as RegExpMatchArray).join(' '))
                                    )
                                )} ${
                                    missingPerms.length === 1
                                    ? 'permission'
                                    : 'permissions'
                                }`
                            )
                        }.`)
                        .setColor(0xff0000)
                    ],
                    ephemeral: true
                })
            }    

            if (userAsMember) {
                // Check if the bot's highest role is higher than the member's highest, IF the member is in the server
                if (userAsMember.roles.highest.position >= botMember.roles.highest.position) {
                    const memberRolePos = userAsMember.roles.highest.position
                    const botRolePos = botMember.roles.highest.position
                    const numRoles = interaction.guild.roles.cache.size - 1
                    return await interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                            .setAuthor({
                                name: `${interaction.user.tag} (${interaction.user.id})`,
                                iconURL: interaction.user.displayAvatarURL({ forceStatic: false })
                            })
                            .setTitle(`Role Hierarchy`)
                            .setDescription(`Unable to ban member. Member's highest role (${
                                bold(userAsMember.roles.highest.name)
                            } ${
                                inlineCode(userAsMember.roles.highest.id)
                            }, ${
                                numRoles - memberRolePos === 0 
                                ? bold('highest role')
                                : bold(`${
                                    inlineCode(ordinalNumber(numRoles - memberRolePos))
                                } highest role`)
                            }) is ${
                                memberRolePos === botRolePos
                                ? bold('the same role as')
                                : bold(`${inlineCode(
                                    pluralise(memberRolePos - botRolePos, 'role')
                                )} higher than`)
                            } my highest role (${
                                bold(botMember.roles.highest.name)
                            } ${
                                inlineCode(botMember.roles.highest.id)
                            }, ${
                                numRoles - memberRolePos === 0 
                                ? bold('highest role')
                                : bold(`${
                                    inlineCode(ordinalNumber(numRoles - memberRolePos))
                                } highest role`)
                            }).`)
                            .setColor(0xff0000)
                        ],
                        ephemeral: true
                    })
                } else if (userAsMember.roles.highest.position >= interaction.member.roles.highest.position) {
                    const memberRolePos = userAsMember.roles.highest.position
                    const commandMemberRolePos = interaction.member.roles.highest.position
                    const numRoles = interaction.guild.roles.cache.size - 1
                    return await interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                            .setAuthor({
                                name: `${interaction.user.tag} (${interaction.user.id})`,
                                iconURL: interaction.user.displayAvatarURL({ forceStatic: false })
                            })
                            .setTitle(`Role Hierarchy`)
                            .setDescription(`Ban forbidden. Member's highest role (${
                                bold(userAsMember.roles.highest.name)
                            } ${
                                inlineCode(userAsMember.roles.highest.id)
                            }, ${
                                numRoles - memberRolePos === 0 
                                ? bold('highest role')
                                : bold(`${
                                    inlineCode(ordinalNumber(numRoles - memberRolePos))
                                } highest role`)
                            }) is ${
                                memberRolePos === commandMemberRolePos
                                ? bold('the same role as')
                                : bold(`${inlineCode(
                                    pluralise(memberRolePos - commandMemberRolePos, 'role')
                                )} higher than`)
                            } your highest role (${
                                bold(interaction.member.roles.highest.name)
                            } ${
                                inlineCode(interaction.member.roles.highest.id)
                            }, ${
                                numRoles - memberRolePos === 0 
                                ? bold('highest role')
                                : bold(`${
                                    inlineCode(ordinalNumber(numRoles - memberRolePos))
                                } highest role`)
                            }).`)
                            .setColor(0xff0000)
                        ],
                        ephemeral: true
                    })
                }
                
                // Check if the member is bannable apart from any other conditions
                // This will stop the bot from throwing errors when it bans the member afterwards
                if (!userAsMember.bannable) return await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setAuthor({
                            name: `${interaction.user.tag} (${interaction.user.id})`,
                            iconURL: interaction.user.displayAvatarURL({ forceStatic: false })
                        })
                        .setTitle(`Member unbannable`)
                        .setDescription('This member cannot be unbanned. Reason unknown.')
                        .setColor(0xff0000)
                    ],
                    ephemeral: true
                })
            }

            // Check if the user exists
            if (!user) return await interaction.reply({ 
                embeds: [
                    new EmbedBuilder()
                    .setAuthor({
                        name: `${interaction.user.tag} (${interaction.user.id})`,
                        iconURL: interaction.user.displayAvatarURL({ forceStatic: false })
                    })
                    .setTitle(`User unknown`)
                    .setDescription('Couldn\'t find that user.')
                    .setColor(0xff0000)
                ], ephemeral: true 
            })

            // Check if the user is already banned
            if (interaction.guild.bans.cache.has(user.id)) return await interaction.reply({ 
                embeds: [
                    new EmbedBuilder()
                    .setAuthor({
                        name: `${interaction.user.tag} (${interaction.user.id})`,
                        iconURL: interaction.user.displayAvatarURL({ forceStatic: false })
                    })
                    .setTitle(`User already banned`)
                    .setDescription('This user is already banned.')
                    .setColor(0xff0000)
                ],
                ephemeral: true
            })

            const [
                yesButton,
                noButton
            ] = [
                new ButtonBuilder()
                .setCustomId('yes')
                .setStyle(ButtonStyle.Danger)
                .setLabel('Yes'),
                new ButtonBuilder()
                .setCustomId('no')
                .setStyle(ButtonStyle.Success)
                .setLabel('No')
            ]

            const confirmationRow = new ActionRowBuilder<ButtonBuilder>()
            .addComponents([yesButton, noButton])

            const reply = await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setAuthor({
                        name: `${interaction.user.tag} (${interaction.user.id})`,
                        iconURL: interaction.user.displayAvatarURL({ forceStatic: false })
                    })
                    .setTitle('Confirm Ban')
                    .setDescription(`Are you sure you would like to ban ${bold(user.tag)} (${inlineCode(user.id)})?\n\n${
                        italic(`A response is required ${
                            time(Math.floor(Date.now()/1000) + 121, 'R')
                        }.`)
                    }`)
                    .addFields([
                        {
                            name: 'Reason',
                            value: reason
                                ? reason
                                : italic(inlineCode('No reason')),
                            inline: false
                        },
                    ])
                    .setColor(0x00ffff)
                ],
                components: [
                    confirmationRow
                ],
                fetchReply: true
            })

            const confirmationCollector = reply.createMessageComponentCollector({
                componentType: ComponentType.Button,
                filter: async (btn) => {
                    const isUserBlacklisted = await BlacklistModel.findOne({
                        where: {
                            id: btn.user.id
                        }
                    })
                    
                    if (isUserBlacklisted) {
                        await btn.reply({
                            embeds: [
                                new EmbedBuilder()
                                .setTitle(underscore('You are blacklisted from using this bot.'))
                                .setDescription(`⛔ **You are not allowed to use the bot, or interact with its commands or message components.**`)
                                .setColor(0x000000)
                            ]
                        })
                        return false
                    }
                    
                    if (btn.user.id !== interaction.user.id) {
                        await btn.reply({
                            content: 'What do you think you\'re doing, you\'re not allowed to use these buttons!',
                            ephemeral: true
                        })
                        return false
                    } else if (btn.customId !== 'yes' && btn.customId !== 'no') return false

                    return true
                },
                time: 120000
            })

            confirmationCollector.on('collect', async (button): Promise<any> => {
                if (button.customId === 'yes') {
                    const original = await interaction.fetchReply()
                    yesButton.setDisabled(true)
                    noButton.setDisabled(true)
                    original.edit({
                        embeds: [
                            EmbedBuilder.from(reply.embeds[0])
                            .setColor(0x00ff00)
                            .setTitle('Successful Ban')
                            .setDescription(`Successfully banned ${
                                bold(user.tag)
                            } (${inlineCode(user.id)}) ${
                                reason
                                ? `with reason ${bold(reason)}`
                                : 'without a reason'
                            }, clearing ${
                                days === 0
                                ? bold('no message history')
                                : bold(`${inlineCode(days === 7 ? '1 week' : pluralise(days, 'day'))} of message history`)
                            }.`)
                        ],
                        components: []
                    })
                    
                    // Directly message the user (if possible) and reply, if it doesn't work the bot will inform, and ban anyways
                    user.send({
                        embeds: [
                            new EmbedBuilder()
                            .setColor(0xff0000)
                            .setTitle('Ban')
                            .setDescription(`You have been banned in ${bold(interaction.guild.name)}.`)
                            .addFields([
                                {
                                    name: 'Reason',
                                    value: reason
                                        ? reason
                                        : italic(inlineCode('No reason provided'))
                                }
                            ])
                        ]
                    })
                    .then(async () => {
                        await button.reply({
                            content: 'Ban successful. Member has been messaged.',
                            embeds: [
                                EmbedBuilder.from(reply.embeds[0])
                                .setColor(0x00ff00)
                                .setTitle('Ban Successful')
                                .setDescription(`Successfully banned ${
                                    bold(user.tag)
                                } (${inlineCode(user.id)}) from ${
                                    bold(interaction.guild.name)  
                                } ${
                                    reason
                                    ? `with reason ${bold(reason)}`
                                    : 'without a reason'
                                }, clearing ${
                                    days === 0
                                    ? bold('no message history')
                                    : bold(`${inlineCode(days === 7 ? '1 week' : pluralise(days, 'day'))} of message history`)
                                }.`)
                                .setAuthor(null)
                                .setFields([])
                                .setFooter(
                                    Math.random() < 0.1
                                    ? { text: `💡 Did you know? ${tipsAndTricks[Math.floor(Math.random() * tipsAndTricks.length)]}` }
                                    : null
                                )
                            ]
                        })
                    })
                    .catch(async () => {
                        await button.reply({
                            content: 'Ban successful. Couldn\'t send the member a message.',
                            embeds: [
                                EmbedBuilder.from(reply.embeds[0])
                                .setColor(0x00ff00)
                                .setTitle('Ban Successful')
                                .setDescription(`Successfully banned ${
                                    bold(user.tag)
                                } (${inlineCode(user.id)}) from ${
                                    bold(interaction.guild.name)
                                } ${
                                    reason
                                    ? `with reason ${bold(reason)}`
                                    : 'without a reason'
                                }, clearing ${
                                    days === 0
                                    ? bold('no message history')
                                    : bold(`${inlineCode(days === 7 ? '1 week' : pluralise(days, 'day'))} of message history`)
                                }.`)
                                .setAuthor(null)
                                .setFields([])
                                .setFooter(
                                    Math.random() < 0.1
                                    ? { text: `💡 Did you know? ${tipsAndTricks[Math.floor(Math.random() * tipsAndTricks.length)]}` }
                                    : null
                                )
                            ]
                        })
                    })
                    .finally(async () => {
                        await interaction.guild.members.ban(user, { reason: `Banned by ${
                                interaction.user.tag
                            } (${
                                interaction.user.id
                            }) ${
                                reason 
                                ? `with reason ${reason}` 
                                : 'without a reason'
                            }, clearing ${
                                days === 0
                                ? 'no message history'
                                : `${days === 7 ? '1 week' : pluralise(days, 'day')} of message history`
                            }.`
                        , deleteMessageDays: days })
                    })
                } else {
                    const original = await interaction.fetchReply()
                    yesButton.setDisabled(true)
                    noButton.setDisabled(true)
                    original.edit({
                        components: [ confirmationRow ],
                        embeds: [
                            EmbedBuilder.from(reply.embeds[0])
                            .setColor(0xff0000)
                            .setTitle('Ban Cancellation')
                            .setDescription(`Cancelled the ban for ${bold(user.tag)} (${inlineCode(user.id)}).`)
                            .setAuthor(null)
                            .setFields([])
                        ]
                    })
                    interaction.followUp('You cancelled the ban.')
                }
            })

            confirmationCollector.on('end', async (collected): Promise<any> => {
                if (collected.size) return
                else {
                    const original = await interaction.fetchReply()
                    yesButton.setDisabled(true)
                    noButton.setDisabled(true)
                    original.edit({
                        embeds: [
                            EmbedBuilder.from(reply.embeds[0])
                            .setColor(0xff0000)
                            .setTitle('Ban Cancellation')
                            .setDescription('A response wasn\'t received in time.')
                            .setAuthor(null)
                            .setFields([])
                        ],
                        components: [ confirmationRow ]
                    })
                    return await interaction.followUp('A response wasn\'t received in time.')
                }
            })
        }
    }
}

export { banCommand }
