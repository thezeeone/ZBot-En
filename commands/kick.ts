import { ActionRowBuilder, ApplicationCommandOptionType, bold, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, ComponentType, EmbedBuilder, GuildMember, inlineCode, italic, PermissionsBitField, time } from "discord.js"
import { WarningTypes } from "../database"
import { commaList, ordinalNumber, pluralise } from "../util"
import { Cmd, tipsAndTricks } from "./command-exports"

const kickCommand: Cmd = {
    data: {
        name: 'kick',
        description: 'Kick a member',
        options: [
            {
                name: 'member',
                description: 'The member to kick',
                type: ApplicationCommandOptionType.User,
                required: true
            },
            {
                name: 'reason',
                description: 'The reason for kicking this member',
                type: ApplicationCommandOptionType.String,
                required: false
            },
            {
                name: 'skip-confirmation',
                description: 'Whether to kick without confirmation',
                type: ApplicationCommandOptionType.Boolean,
                required: false
            }
        ]
    },
    async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<any> {
        // Input
        const member = interaction.options.getMember('member')
        const reason = interaction.options.getString('reason')
        const skipConfirmation = interaction.options.getBoolean('skip-confirmation')

        // Avoid repetition
        const botMember = <GuildMember>interaction.guild.members.me

        // Check if the member is in the server
        if (!member) return await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setAuthor({
                        name: `${interaction.member?.nickname ? `${interaction.member.nickname} (${interaction.user.tag})` : interaction.user.tag} (${interaction.user.id})`,
                        iconURL: interaction.user.displayAvatarURL({ forceStatic: false })
                    })
                    .setTitle(`Member not found`)
                    .setDescription(`Couldn't find that member.`)
                    .setColor(0xff0000)
            ],
            ephemeral: true
        })

        // Required permissions
        const perms = new PermissionsBitField('KickMembers').toArray()

        if (
            !perms.every(perm => botMember.permissions.has(perm))
        ) {
            const missingPerms = perms.filter(p => !botMember.permissions.has(p))
            return await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setAuthor({
                            name: `${interaction.member?.nickname ? `${interaction.member.nickname} (${interaction.user.tag})` : interaction.user.tag} (${interaction.user.id})`,
                            iconURL: interaction.user.displayAvatarURL({ forceStatic: false })
                        })
                        .setTitle(`Missing Permissions`)
                        .setDescription(`Bot is missing permissions.\nThis command requires the bot to have the ${bold(
                            `${commaList(
                                perms
                                    .map(
                                        s => inlineCode((s.match(/[A-Z][a-z]+/g) as RegExpMatchArray).join(' '))
                                    )
                            )} ${perms.length === 1
                                ? 'permission'
                                : 'permissions'
                            }`
                        )
                            }.\n${missingPerms.length
                                ? 'doesn\'t have any of the required permissions, and'
                                : `has the ${bold(
                                    `${commaList(
                                        perms
                                            .filter(
                                                p => !missingPerms.includes(p)
                                            )
                                            .map(
                                                s => inlineCode((s.match(/[A-Z][a-z]+/g) as RegExpMatchArray).join(' '))
                                            )
                                    )} ${perms.filter(p => !missingPerms.includes(p)).length === 1
                                        ? 'permission'
                                        : 'permissions'
                                    }`
                                )
                                }, however`
                            } is __missing__ the ${bold(
                                `${commaList(
                                    missingPerms
                                        .map(
                                            s => inlineCode((s.match(/[A-Z][a-z]+/g) as RegExpMatchArray).join(' '))
                                        )
                                )} ${missingPerms.length === 1
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

        // Check if the bot's highest role is higher than the member's highest
        if (member) {
            // Check if the bot's highest role is higher than the member's highest, IF the member is in the server
            if (member.roles.highest.position >= botMember.roles.highest.position) {
                const memberRolePos = member.roles.highest.position
                const botRolePos = botMember.roles.highest.position
                const numRoles = interaction.guild.roles.cache.size - 1
                return await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setAuthor({
                                name: `${interaction.member?.nickname ? `${interaction.member.nickname} (${interaction.user.tag})` : interaction.user.tag} (${interaction.user.id})`,
                                iconURL: interaction.user.displayAvatarURL({ forceStatic: false })
                            })
                            .setTitle(`Role Hierarchy`)
                            .setDescription(`Unable to kick member. Member's highest role (${bold(member.roles.highest.name)
                                } ${inlineCode(member.roles.highest.id)
                                }, ${numRoles - memberRolePos === 0
                                    ? bold('highest role')
                                    : bold(`${inlineCode(ordinalNumber(numRoles - memberRolePos))
                                        } highest role`)
                                }) is ${memberRolePos === botRolePos
                                    ? bold('the same role as')
                                    : bold(`${inlineCode(
                                        pluralise(memberRolePos - botRolePos, 'role')
                                    )} higher than`)
                                } my highest role (${bold(botMember.roles.highest.name)
                                } ${inlineCode(botMember.roles.highest.id)
                                }, ${numRoles - memberRolePos === 0
                                    ? bold('highest role')
                                    : bold(`${inlineCode(ordinalNumber(numRoles - memberRolePos))
                                        } highest role`)
                                }).`)
                            .setColor(0xff0000)
                    ],
                    ephemeral: true
                })
            } else if (member.roles.highest.position >= interaction.member.roles.highest.position) {
                const memberRolePos = member.roles.highest.position
                const commandMemberRolePos = interaction.member.roles.highest.position
                const numRoles = interaction.guild.roles.cache.size - 1
                return await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setAuthor({
                                name: `${interaction.member?.nickname ? `${interaction.member.nickname} (${interaction.user.tag})` : interaction.user.tag} (${interaction.user.id})`,
                                iconURL: interaction.user.displayAvatarURL({ forceStatic: false })
                            })
                            .setTitle(`Role Hierarchy`)
                            .setDescription(`Kick forbidden. Member's highest role (${bold(member.roles.highest.name)
                                } ${inlineCode(member.roles.highest.id)
                                }, ${numRoles - memberRolePos === 0
                                    ? bold('highest role')
                                    : bold(`${inlineCode(ordinalNumber(numRoles - memberRolePos))
                                        } highest role`)
                                }) is ${memberRolePos === commandMemberRolePos
                                    ? bold('the same role as')
                                    : bold(`${inlineCode(
                                        pluralise(memberRolePos - commandMemberRolePos, 'role')
                                    )} higher than`)
                                } your highest role (${bold(interaction.member.roles.highest.name)
                                } ${inlineCode(interaction.member.roles.highest.id)
                                }, ${numRoles - memberRolePos === 0
                                    ? bold('highest role')
                                    : bold(`${inlineCode(ordinalNumber(numRoles - memberRolePos))
                                        } highest role`)
                                }).`)
                            .setColor(0xff0000)
                    ],
                    ephemeral: true
                })
            }
        }


        // Check if the member is manageable apart from any other conditions
        // This will stop the bot from throwing errors when it kicks the member afterwards
        if (!member.kickable) return await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setAuthor({
                        name: `${interaction.member?.nickname ? `${interaction.member.nickname} (${interaction.user.tag})` : interaction.user.tag} (${interaction.user.id})`,
                        iconURL: interaction.user.displayAvatarURL({ forceStatic: false })
                    })
                    .setTitle(`Member unkickable`)
                    .setDescription(`Member unkickable.\nCannot kick this member, reason unknown.`)
                    .setColor(0xff0000)
            ],
            ephemeral: true
        })

        if (skipConfirmation) {
            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0x00ff00)
                        .setTitle('Kick Successful')
                        .setDescription(`Successfully kicked ${member.nickname
                                ? `${bold(member.nickname)} (${bold(member.user.tag)})`
                                : bold(member.user.tag)
                            } (${inlineCode(member.user.id)}) ${reason
                                ? `with reason ${bold(reason)}`
                                : 'without a reason'
                            }. ${italic('Confirmation has been skipped.')
                            }`)
                        .setFooter(
                            Math.random() < 0.1
                                ? { text: `💡 Did you know? ${tipsAndTricks[Math.floor(Math.random() * tipsAndTricks.length)]}` }
                                : null
                        )
                ],
                components: interaction.guild.id !== '1000073833551769600' ? [
                    new ActionRowBuilder<ButtonBuilder>()
                        .addComponents(
                            new ButtonBuilder()
                                .setEmoji('🔗')
                                .setLabel('Join ZBot Support Server!')
                                .setStyle(ButtonStyle.Link)
                                .setURL('https://discord.gg/6tkn6m5g52'),
                            new ButtonBuilder()
                                .setEmoji('⚠')
                                .setLabel('Breaking Changes coming to PSWMEs, Case System, Rank Cards, and Sudoku')
                                .setStyle(ButtonStyle.Link)
                                .setURL('https://discord.com/channels/1000073833551769600/1010853170328633394/1042885833235103804')
                        )
                ] : [
                    new ActionRowBuilder<ButtonBuilder>()
                        .addComponents(
                            new ButtonBuilder()
                                .setEmoji('⚠')
                                .setLabel('Breaking Changes coming to PSWMEs, Case System, Rank Cards, and Sudoku')
                                .setStyle(ButtonStyle.Link)
                                .setURL('https://discord.com/channels/1000073833551769600/1010853170328633394/1042885833235103804')
                        )
                ]
            })

            // @ts-ignore
            const punishment = await CaseSystem.create({
                user: member.id,
                moderator: interaction.user.id,
                type: WarningTypes.KICK,
                reason: reason || '',
                guild: interaction.guild.id,
                edited: false
            })

            // Directly message the member and reply, if it doesn't work the bot will inform, and kick anyways
            member.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xff7700)
                        .setTitle('Kick')
                        .setDescription(`You have been kicked from ${bold(interaction.guild.name)}.`)
                        .addFields([
                            {
                                name: 'Reason',
                                value: reason
                                    ? reason
                                    : italic(inlineCode('No reason provided'))
                            }
                        ])
                        .setFooter({ text: `Case ${punishment.id}` })
                ]
            })
                .finally(async () => {
                    await member.kick(`Kicked by ${interaction.user.tag
                        } (${interaction.user.id
                        }) ${reason
                            ? `with reason ${reason}`
                            : 'without a reason'
                        }.`
                    )
                })
        } else {
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

            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setAuthor({
                            name: `${interaction.member?.nickname ? `${interaction.member.nickname} (${interaction.user.tag})` : interaction.user.tag} (${interaction.user.id})`,
                            iconURL: interaction.user.displayAvatarURL({ forceStatic: false })
                        })
                        .setTitle('Confirm Kick')
                        .setDescription(`Are you sure you would like to kick ${member.nickname
                                ? `${bold(member.nickname)} (${bold(member.user.tag)})`
                                : bold(member.user.tag)
                            } (${inlineCode(member.user.id)})?\n\n${italic(`A response is required ${time(Math.floor(Date.now() / 1000) + 121, 'R')
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
                components: interaction.guild.id !== '1000073833551769600' ? [
                    confirmationRow,
                    new ActionRowBuilder<ButtonBuilder>()
                        .addComponents(
                            new ButtonBuilder()
                                .setEmoji('🔗')
                                .setLabel('Join ZBot Support Server!')
                                .setStyle(ButtonStyle.Link)
                                .setURL('https://discord.gg/6tkn6m5g52'),
                            new ButtonBuilder()
                                .setEmoji('⚠')
                                .setLabel('Breaking Changes coming to PSWMEs, Case System, Rank Cards, and Sudoku')
                                .setStyle(ButtonStyle.Link)
                                .setURL('https://discord.com/channels/1000073833551769600/1010853170328633394/1042885833235103804')
                        )
                ] : [
                    confirmationRow,
                    new ActionRowBuilder<ButtonBuilder>()
                        .addComponents(
                            new ButtonBuilder()
                                .setEmoji('⚠')
                                .setLabel('Breaking Changes coming to PSWMEs, Case System, Rank Cards, and Sudoku')
                                .setStyle(ButtonStyle.Link)
                                .setURL('https://discord.com/channels/1000073833551769600/1010853170328633394/1042885833235103804')
                        )
                ]
            })

            const confirmationCollector = (await interaction.fetchReply()).createMessageComponentCollector({
                componentType: ComponentType.Button,
                maxComponents: 1,
                time: 120000
            })

            confirmationCollector.on('collect', async (button): Promise<any> => {
                if (button.user.id !== interaction.user.id) {
                    confirmationCollector.dispose(button)
                    return await button.reply({
                        content: 'What do you think you\'re doing, you\'re not allowed to use these buttons!',
                        ephemeral: true
                    })
                }
                if (button.customId === 'yes') {
                    const original = await interaction.fetchReply()
                    yesButton.setDisabled(true)
                    noButton.setDisabled(true)
                    await original.edit({
                        embeds: [
                            EmbedBuilder.from((await interaction.fetchReply()).embeds[0])
                                .setColor(0x00ff00)
                                .setTitle('Kick Successful')
                                .setDescription(`Successfully kicked ${member.nickname
                                        ? `${bold(member.nickname)} (${bold(member.user.tag)})`
                                        : bold(member.user.tag)
                                    } (${inlineCode(member.user.id)}) ${reason
                                        ? `with reason ${bold(reason)}`
                                        : 'without a reason'
                                    }.`)
                                .setFooter(
                                    Math.random() < 0.1
                                        ? { text: `💡 Did you know? ${tipsAndTricks[Math.floor(Math.random() * tipsAndTricks.length)]}` }
                                        : null
                                )
                        ],
                        components: interaction.guild.id !== '1000073833551769600' ? [
                            new ActionRowBuilder<ButtonBuilder>()
                                .addComponents(
                                    new ButtonBuilder()
                                        .setEmoji('🔗')
                                        .setLabel('Join ZBot Support Server!')
                                        .setStyle(ButtonStyle.Link)
                                        .setURL('https://discord.gg/6tkn6m5g52'),
                                    new ButtonBuilder()
                                        .setEmoji('⚠')
                                        .setLabel('Breaking Changes coming to PSWMEs, Case System, Rank Cards, and Sudoku')
                                        .setStyle(ButtonStyle.Link)
                                        .setURL('https://discord.com/channels/1000073833551769600/1010853170328633394/1042885833235103804')
                                )
                        ] : [
                            new ActionRowBuilder<ButtonBuilder>()
                                .addComponents(
                                    new ButtonBuilder()
                                        .setEmoji('⚠')
                                        .setLabel('Breaking Changes coming to PSWMEs, Case System, Rank Cards, and Sudoku')
                                        .setStyle(ButtonStyle.Link)
                                        .setURL('https://discord.com/channels/1000073833551769600/1010853170328633394/1042885833235103804')
                                )
                        ]
                    })

                    // @ts-ignore
                    const punishment = await CaseSystem.create({
                        user: member.id,
                        moderator: interaction.user.id,
                        type: WarningTypes.KICK,
                        reason: reason || '',
                        guild: interaction.guild.id,
                        edited: false
                    })

                    // Directly message the member and reply, if it doesn't work the bot will inform, and kick anyways
                    member.send({
                        embeds: [
                            new EmbedBuilder()
                                .setColor(0xff7700)
                                .setTitle('Kick')
                                .setDescription(`You have been kicked from ${bold(interaction.guild.name)}.`)
                                .addFields([
                                    {
                                        name: 'Reason',
                                        value: reason
                                            ? reason
                                            : italic(inlineCode('No reason provided'))
                                    }
                                ])
                                .setFooter({ text: `Case ${punishment.id}` })
                        ]
                    })
                        .then(async () => {
                            await button.reply('Kick successful. Member has been messaged.')
                        })
                        .catch(async () => {
                            await button.reply('Kick successful. Couldn\'t send the member a message.')
                        })
                        .finally(async () => {
                            await member.kick(`Kicked by ${interaction.user.tag
                                } (${interaction.user.id
                                }) ${reason
                                    ? `with reason ${reason}`
                                    : 'without a reason'
                                }.`
                            )
                        })
                } else {
                    const original = await interaction.fetchReply()
                    original.edit({
                        content: `Cancelled the kick for ${member.nickname
                                ? `${bold(member.nickname)} (${bold(member.user.tag)})`
                                : bold(member.user.tag)
                            } (${inlineCode(member.user.id)}).`,
                        embeds: [],
                        components: interaction.guild.id !== '1000073833551769600' ? [
                            new ActionRowBuilder<ButtonBuilder>()
                                .addComponents(
                                    new ButtonBuilder()
                                        .setEmoji('🔗')
                                        .setLabel('Join ZBot Support Server!')
                                        .setStyle(ButtonStyle.Link)
                                        .setURL('https://discord.gg/6tkn6m5g52'),
                                    new ButtonBuilder()
                                        .setEmoji('⚠')
                                        .setLabel('Breaking Changes coming to PSWMEs, Case System, Rank Cards, and Sudoku')
                                        .setStyle(ButtonStyle.Link)
                                        .setURL('https://discord.com/channels/1000073833551769600/1010853170328633394/1042885833235103804')
                                )
                        ] : [
                            new ActionRowBuilder<ButtonBuilder>()
                                .addComponents(
                                    new ButtonBuilder()
                                        .setEmoji('⚠')
                                        .setLabel('Breaking Changes coming to PSWMEs, Case System, Rank Cards, and Sudoku')
                                        .setStyle(ButtonStyle.Link)
                                        .setURL('https://discord.com/channels/1000073833551769600/1010853170328633394/1042885833235103804')
                                )
                        ]
                    })
                    await button.reply('Kick cancelled.')
                }
            })

            confirmationCollector.on('end', async (collected): Promise<any> => {
                if (collected.size) return
                else {
                    const original = await interaction.fetchReply()
                    original.edit({
                        embeds: [
                            EmbedBuilder.from((await interaction.fetchReply()).embeds[0])
                                .setColor(0xff0000)
                                .setTitle('Kick Cancellation')
                                .setDescription('A response wasn\'t received in time.')
                                .setAuthor(null)
                                .setFields([])
                        ],
                        components: interaction.guild.id !== '1000073833551769600' ? [
                            new ActionRowBuilder<ButtonBuilder>()
                                .addComponents(
                                    new ButtonBuilder()
                                        .setEmoji('🔗')
                                        .setLabel('Join ZBot Support Server!')
                                        .setStyle(ButtonStyle.Link)
                                        .setURL('https://discord.gg/6tkn6m5g52'),
                                    new ButtonBuilder()
                                        .setEmoji('⚠')
                                        .setLabel('Breaking Changes coming to PSWMEs, Case System, Rank Cards, and Sudoku')
                                        .setStyle(ButtonStyle.Link)
                                        .setURL('https://discord.com/channels/1000073833551769600/1010853170328633394/1042885833235103804')
                                )
                        ] : [
                            new ActionRowBuilder<ButtonBuilder>()
                                .addComponents(
                                    new ButtonBuilder()
                                        .setEmoji('⚠')
                                        .setLabel('Breaking Changes coming to PSWMEs, Case System, Rank Cards, and Sudoku')
                                        .setStyle(ButtonStyle.Link)
                                        .setURL('https://discord.com/channels/1000073833551769600/1010853170328633394/1042885833235103804')
                                )
                        ]
                    })
                    return await interaction.followUp('A response wasn\'t received in time.')
                }
            })
        }

        return
    }
}

export { kickCommand }
