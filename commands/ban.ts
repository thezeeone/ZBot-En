import { ActionRowBuilder, ApplicationCommandOptionType, bold, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, ComponentType, EmbedBuilder, GuildMember, inlineCode, italic, PermissionsBitField, TextChannel, time, underscore } from "discord.js"
import { BlacklistModel, CaseSystem, PunishmentTypes } from "../database"
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
                    },
                    {
                        name: 'referenceCases',
                        description: 'Cases to make a reference to (list of numbers)',
                        type: ApplicationCommandOptionType.String,
                        required: false
                    },
                    {
                        name: 'skip-confirmation',
                        description: 'Whether to ban without confirmation',
                        type: ApplicationCommandOptionType.Boolean,
                        required: false
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
                    },
                    {
                        name: 'referenceCases',
                        description: 'Cases to make a reference to (list of numbers)',
                        type: ApplicationCommandOptionType.String,
                        required: false
                    },
                    {
                        name: 'skip-confirmation',
                        description: 'Whether to unban without confirmation',
                        type: ApplicationCommandOptionType.Boolean,
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
            const skipConfirmation = interaction.options.getBoolean('skip-confirmation')

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
                                    : 'permission'
                                }`
                            )
                                }.\nThe bot ${missingPerms.length
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

            // Check if the user exists
            if (!user) return await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setAuthor({
                            name: `${interaction.member?.nickname ? `${interaction.member.nickname} (${interaction.user.tag})` : interaction.user.tag} (${interaction.user.id})`,
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
                            name: `${interaction.member?.nickname ? `${interaction.member.nickname} (${interaction.user.tag})` : interaction.user.tag} (${interaction.user.id})`,
                            iconURL: interaction.user.displayAvatarURL({ forceStatic: false })
                        })
                        .setTitle(`User not banned`)
                        .setDescription('This user isn\'t banned.')
                        .setColor(0xff0000)
                ],
                ephemeral: true
            })

            if (skipConfirmation) {
                const refCases = interaction.options.getString('referenceCases')
                    ? await Promise.all(interaction.options
                        .getString('referenceCases', true)
                        .split(/\D+/g)
                        .map(n => Number(n))
                        .filter(async (n) => !isNaN(n) && isFinite(n) && await CaseSystem.findOne({ where: { id: n } })))
                    : []

                const punishment = await CaseSystem.create({
                    guild: interaction.guild.id,
                    moderator: interaction.user.id,
                    user: user.id,
                    reason: reason ?? '',
                    edited: false,
                    type: PunishmentTypes.BAN_REMOVE,
                    referenceCases: refCases,
                    DMMessage: {
                        channelId: '',
                        messageId: ''
                    },
                    modLogMessage: {
                        channelId: '',
                        messageId: ''
                    },
                    id: 0
                })

                await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(0x00ff00)
                            .setTitle('Successful Unban')
                            .setDescription(`Successfully unbanned ${bold(user.tag)
                                } (${inlineCode(user.id)}) ${reason
                                    ? `with reason ${bold(reason)}`
                                    : 'without a reason'
                                }. ${italic('Confirmation has been skipped.')
                                }`)
                            .setFooter({
                                text: `Case ${punishment.id}${Math.random() < 0.1
                                    ? ` • 💡 Did you know? ${tipsAndTricks[Math.floor(Math.random() * tipsAndTricks.length)]}`
                                    : ''
                                    }`
                            })
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
                                    .setLabel('ZBot New Year\'s Updates')
                                    .setStyle(ButtonStyle.Link)
                                    .setURL('https://discord.com/channels/1000073833551769600/1010853170328633394/1057250247014879273')
                            )
                    ] : [
                        new ActionRowBuilder<ButtonBuilder>()
                            .addComponents(
                                new ButtonBuilder()
                                    .setEmoji('⚠')
                                    .setLabel('ZBot New Year\'s Updates')
                                    .setStyle(ButtonStyle.Link)
                                    .setURL('https://discord.com/channels/1000073833551769600/1010853170328633394/1057250247014879273')
                            )
                    ]
                })

                // Unban the user
                user.send({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(0x00ff00)
                            .setTitle('Unban')
                            .setDescription(`You have been unbanned from ${bold(interaction.guild.name)}.`)
                            .addFields([
                                {
                                    name: 'Reason',
                                    value: reason
                                        ? reason
                                        : italic(inlineCode('No reason provided'))
                                }
                            ])
                            .setFooter({
                                text: `Case ${punishment.id}`
                            })
                    ]
                })
                    .then(async (DMMsg) => {
                        await punishment.update({
                            DMMessage: {
                                channelId: DMMsg.channel.id,
                                messageId: DMMsg.id
                            }
                        })
                    })
                    .finally(async () => {
                        await interaction.guild.members.unban(user, `Unbanned by ${interaction.user.tag} (${interaction.user.id}) ${reason
                            ? `with reason ${reason}`
                            : 'without a reason'
                            }.`
                        )
                        if (interaction.guild.id !== '786984851014025286') return
                        try {
                            const channel = interaction.client.channels.cache.get('1046386065570799656') as unknown as TextChannel
                            if (!channel) return
                            channel.send({
                                embeds: [
                                    new EmbedBuilder()
                                        .setColor(0x00ff00)
                                        .setTitle('Unban')
                                        .setAuthor({
                                            iconURL: interaction.user.displayAvatarURL({ forceStatic: false }),
                                            name: interaction.member.nickname
                                                ? `${interaction.member.nickname} (${interaction.member.user.tag}) (${interaction.member.id})`
                                                : `${interaction.member.user.tag} (${interaction.member.id})`
                                        })
                                        .setThumbnail(user.displayAvatarURL({ forceStatic: false }))
                                        .setDescription(`**User** ${user.tag} (${user.id})\n**Reason** ${reason ?? '*`No reason provided`*'}${(await Promise.all(punishment.referenceCases.filter(async (caseNum) => await CaseSystem.findOne({ where: { id: caseNum } })))).filter(notEmpty).length
                                            ? `**Reference Cases** ${commaList(
                                                (await Promise.all(punishment.referenceCases.map(async (caseNum) => {
                                                    const fetchedPunishment = await CaseSystem.findOne({
                                                        where: {
                                                            id: caseNum
                                                        }
                                                    })
                                                    return fetchedPunishment ? (
                                                        fetchedPunishment.modLogMessage.channelId && fetchedPunishment.modLogMessage.messageId
                                                            ? `[${caseNum}](https://discord.com/messages/${fetchedPunishment.guild}/${fetchedPunishment.modLogMessage.channelId}/${fetchedPunishment.modLogMessage.messageId})`
                                                            : String(fetchedPunishment.id)
                                                    ) : undefined
                                                })))
                                                    .filter(notEmpty)
                                            )}`
                                            : ''
                                            }`)
                                        .setFooter({
                                            text: `Case ${punishment.id}`
                                        })
                                ]
                            })
                                .then(async (modLogMsg) => {
                                    await punishment.update({
                                        modLogMessage: {
                                            channelId: modLogMsg.channel.id,
                                            messageId: modLogMsg.id
                                        }
                                    })
                                })
                                .catch(() => {
                                    return
                                })
                        } catch {
                            return
                        }
                    })
            } else {
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
                                name: `${interaction.member?.nickname ? `${interaction.member.nickname} (${interaction.user.tag})` : interaction.user.tag} (${interaction.user.id})`,
                                iconURL: interaction.user.displayAvatarURL({ forceStatic: false })
                            })
                            .setTitle('Confirm Unban')
                            .setDescription(`Are you sure you would like to unban ${bold(user.tag)} (${inlineCode(user.id)})?\n\n${italic(`A response is required ${time(Math.floor(Date.now() / 1000) + 121, 'R')
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
                                    .setLabel('ZBot New Year\'s Updates')
                                    .setStyle(ButtonStyle.Link)
                                    .setURL('https://discord.com/channels/1000073833551769600/1010853170328633394/1057250247014879273')
                            )
                    ] : [
                        confirmationRow,
                        new ActionRowBuilder<ButtonBuilder>()
                            .addComponents(
                                new ButtonBuilder()
                                    .setEmoji('⚠')
                                    .setLabel('ZBot New Year\'s Updates')
                                    .setStyle(ButtonStyle.Link)
                                    .setURL('https://discord.com/channels/1000073833551769600/1010853170328633394/1057250247014879273')
                            )
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

                        confirmationCollector.on('collect', async (button): Promise<any> => {
                            if (button.user.id !== interaction.user.id) {
                                confirmationCollector.dispose(button)
                                return await button.reply({
                                    content: 'What do you think you\'re doing, you\'re not allowed to use these buttons!',
                                    ephemeral: true
                                })
                            }
                            if (button.customId === 'yes') {
                                const refCases = interaction.options.getString('referenceCases')
                                    ? await Promise.all(interaction.options
                                        .getString('referenceCases', true)
                                        .split(/\D+/g)
                                        .map(n => Number(n))
                                        .filter(async (n) => !isNaN(n) && isFinite(n) && await CaseSystem.findOne({ where: { id: n } })))
                                    : []

                                const punishment = await CaseSystem.create({
                                    guild: interaction.guild.id,
                                    moderator: interaction.user.id,
                                    user: user.id,
                                    reason: reason ?? '',
                                    edited: false,
                                    type: PunishmentTypes.BAN_REMOVE,
                                    referenceCases: refCases,
                                    DMMessage: {
                                        channelId: '',
                                        messageId: ''
                                    },
                                    modLogMessage: {
                                        channelId: '',
                                        messageId: ''
                                    },
                                    id: 0
                                })

                                const original = await interaction.fetchReply()
                                yesButton.setDisabled(true)
                                noButton.setDisabled(true)
                                original.edit({
                                    embeds: [
                                        EmbedBuilder.from((await interaction.fetchReply()).embeds[0])
                                            .setColor(0x00ff00)
                                            .setTitle('Successful Unban')
                                            .setDescription(`Successfully unbanned ${bold(user.tag)
                                                } (${inlineCode(user.id)}) ${reason
                                                    ? `with reason ${bold(reason)}`
                                                    : 'without a reason'
                                                }.`)
                                            .setFooter({
                                                text: `Case ${punishment.id}${Math.random() < 0.1
                                                    ? ` • 💡 Did you know? ${tipsAndTricks[Math.floor(Math.random() * tipsAndTricks.length)]}`
                                                    : ''
                                                    }`
                                            })
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
                                                    .setLabel('ZBot New Year\'s Updates')
                                                    .setStyle(ButtonStyle.Link)
                                                    .setURL('https://discord.com/channels/1000073833551769600/1010853170328633394/1057250247014879273')
                                            )
                                    ] : [
                                        new ActionRowBuilder<ButtonBuilder>()
                                            .addComponents(
                                                new ButtonBuilder()
                                                    .setEmoji('⚠')
                                                    .setLabel('ZBot New Year\'s Updates')
                                                    .setStyle(ButtonStyle.Link)
                                                    .setURL('https://discord.com/channels/1000073833551769600/1010853170328633394/1057250247014879273')
                                            )
                                    ]
                                })

                                // Unban the user
                                user.send({
                                    embeds: [
                                        new EmbedBuilder()
                                            .setColor(0x00ff00)
                                            .setTitle('Unban')
                                            .setDescription(`You have been unbanned from ${bold(interaction.guild.name)}.`)
                                            .addFields([
                                                {
                                                    name: 'Reason',
                                                    value: reason
                                                        ? reason
                                                        : italic(inlineCode('No reason provided'))
                                                }
                                            ])
                                            .setFooter({
                                                text: `Case ${punishment.id}`
                                            })
                                    ]
                                })
                                    .then(async (DMMsg) => {
                                        await button.reply('Unban successful. Member has been messaged.')
                                        await punishment.update({
                                            DMMessage: {
                                                channelId: DMMsg.channel.id,
                                                messageId: DMMsg.id
                                            }
                                        })
                                    })
                                    .catch(async () => {
                                        await button.reply('Unban removal successful. Couldn\'t send the member a message.')
                                        return
                                    })
                                    .finally(async () => {
                                        await interaction.guild.members.unban(user, `Unbanned by ${interaction.user.tag} (${interaction.user.id}) ${reason
                                            ? `with reason ${reason}`
                                            : 'without a reason'
                                            }.`
                                        )
                                        if (interaction.guild.id !== '786984851014025286') return
                                        try {
                                            const channel = interaction.client.channels.cache.get('1046386065570799656') as unknown as TextChannel
                                            if (!channel) return
                                            channel.send({
                                                embeds: [
                                                    new EmbedBuilder()
                                                        .setColor(0x00ff00)
                                                        .setTitle('Unban')
                                                        .setAuthor({
                                                            iconURL: interaction.user.displayAvatarURL({ forceStatic: false }),
                                                            name: interaction.member.nickname
                                                                ? `${interaction.member.nickname} (${interaction.member.user.tag}) (${interaction.member.id})`
                                                                : `${interaction.member.user.tag} (${interaction.member.id})`
                                                        })
                                                        .setThumbnail(user.displayAvatarURL({ forceStatic: false }))
                                                        .setDescription(`**User** ${user.tag} (${user.id})\n**Reason** ${reason ?? '*`No reason provided`*'}${(await Promise.all(punishment.referenceCases.filter(async (caseNum) => await CaseSystem.findOne({ where: { id: caseNum } })))).filter(notEmpty).length
                                                            ? `**Reference Cases** ${commaList(
                                                                (await Promise.all(punishment.referenceCases.map(async (caseNum) => {
                                                                    const fetchedPunishment = await CaseSystem.findOne({
                                                                        where: {
                                                                            id: caseNum
                                                                        }
                                                                    })
                                                                    return fetchedPunishment ? (
                                                                        fetchedPunishment.modLogMessage.channelId && fetchedPunishment.modLogMessage.messageId
                                                                            ? `[${caseNum}](https://discord.com/messages/${fetchedPunishment.guild}/${fetchedPunishment.modLogMessage.channelId}/${fetchedPunishment.modLogMessage.messageId})`
                                                                            : String(fetchedPunishment.id)
                                                                    ) : undefined
                                                                })))
                                                                    .filter(notEmpty)
                                                            )}`
                                                            : ''
                                                            }`)
                                                        .setFooter({
                                                            text: `Case ${punishment.id}`
                                                        })
                                                ]
                                            })
                                                .then(async (modLogMsg) => {
                                                    await punishment.update({
                                                        modLogMessage: {
                                                            channelId: modLogMsg.channel.id,
                                                            messageId: modLogMsg.id
                                                        }
                                                    })
                                                })
                                                .catch(() => {
                                                    return
                                                })
                                        } catch {
                                            return
                                        }
                                    })
                            } else {
                                const original = await interaction.fetchReply()
                                original.edit({
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
                                                    .setLabel('ZBot New Year\'s Updates')
                                                    .setStyle(ButtonStyle.Link)
                                                    .setURL('https://discord.com/channels/1000073833551769600/1010853170328633394/1057250247014879273')
                                            )
                                    ] : [
                                        new ActionRowBuilder<ButtonBuilder>()
                                            .addComponents(
                                                new ButtonBuilder()
                                                    .setEmoji('⚠')
                                                    .setLabel('ZBot New Year\'s Updates')
                                                    .setStyle(ButtonStyle.Link)
                                                    .setURL('https://discord.com/channels/1000073833551769600/1010853170328633394/1057250247014879273')
                                            )
                                    ],
                                    embeds: [],
                                    content: `Cancelled the unban for ${user.tag} (${inlineCode(user.id)}).`
                                })
                                await button.reply('Unban cancelled.')
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
                        const refCases = interaction.options.getString('referenceCases')
                            ? await Promise.all(interaction.options
                                .getString('referenceCases', true)
                                .split(/\D+/g)
                                .map(n => Number(n))
                                .filter(async (n) => !isNaN(n) && isFinite(n) && await CaseSystem.findOne({ where: { id: n } })))
                            : []

                        const punishment = await CaseSystem.create({
                            guild: interaction.guild.id,
                            moderator: interaction.user.id,
                            user: user.id,
                            reason: reason ?? '',
                            edited: false,
                            type: PunishmentTypes.BAN_REMOVE,
                            referenceCases: refCases,
                            DMMessage: {
                                channelId: '',
                                messageId: ''
                            },
                            modLogMessage: {
                                channelId: '',
                                messageId: ''
                            },
                            id: 0
                        })

                        const original = await interaction.fetchReply()
                        yesButton.setDisabled(true)
                        noButton.setDisabled(true)
                        original.edit({
                            embeds: [
                                EmbedBuilder.from(reply.embeds[0])
                                    .setColor(0x00ff00)
                                    .setTitle('Successful Unban')
                                    .setDescription(`Successfully unbanned ${bold(user.tag)
                                        } (${inlineCode(user.id)}) ${reason
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
                                    .setFooter({
                                        text: `Case ${punishment.id}`
                                    })
                            ]
                        })
                            .then(async (DMMsg) => {
                                await button.reply({
                                    content: 'Unban successful. Member has been messaged.',
                                    embeds: [
                                        EmbedBuilder.from(reply.embeds[0])
                                            .setColor(0x00ff00)
                                            .setTitle('Unban Successful')
                                            .setDescription(`Successfully unbanned ${bold(user.tag)
                                                } (${inlineCode(user.id)}) from ${bold(interaction.guild.name)
                                                } ${reason
                                                    ? `with reason ${bold(reason)}`
                                                    : 'without a reason'
                                                }.`)
                                            .setFooter({
                                                text: `Case ${punishment.id}${Math.random() < 0.1
                                                    ? ` • 💡 Did you know? ${tipsAndTricks[Math.floor(Math.random() * tipsAndTricks.length)]}`
                                                    : ''
                                                    }`
                                            })
                                            .setAuthor(null)
                                            .setFields([])
                                    ]
                                })
                                await punishment.update({
                                    DMMessage: {
                                        channelId: DMMsg.channel.id,
                                        messageId: DMMsg.id
                                    }
                                })
                            })
                            .catch(async () => {
                                await button.reply({
                                    content: 'Unban removal successful. Couldn\'t send the member a message.',
                                    embeds: [
                                        EmbedBuilder.from(reply.embeds[0])
                                            .setColor(0x00ff00)
                                            .setTitle('Unban Successful')
                                            .setDescription(`Successfully unbanned ${bold(user.tag)
                                                } (${inlineCode(user.id)}) from ${bold(interaction.guild.name)
                                                } ${reason
                                                    ? `with reason ${bold(reason)}`
                                                    : 'without a reason'
                                                }.`)
                                            .setFooter({
                                                text: `Case ${punishment.id}${Math.random() < 0.1
                                                    ? ` • 💡 Did you know? ${tipsAndTricks[Math.floor(Math.random() * tipsAndTricks.length)]}`
                                                    : ''
                                                    }`
                                            })
                                            .setAuthor(null)
                                            .setFields([])
                                    ]
                                })
                            })
                            .finally(async () => {
                                await interaction.guild.members.unban(user, `Unbanned by ${interaction.user.tag} (${interaction.user.id}) ${reason
                                    ? `with reason ${reason}`
                                    : 'without a reason'
                                    }.`
                                )
                                if (interaction.guild.id !== '786984851014025286') return
                                try {
                                    const channel = interaction.client.channels.cache.get('1046386065570799656') as unknown as TextChannel
                                    if (!channel) return
                                    channel.send({
                                        embeds: [
                                            new EmbedBuilder()
                                                .setColor(0x00ff00)
                                                .setTitle('Unban')
                                                .setAuthor({
                                                    iconURL: interaction.user.displayAvatarURL({ forceStatic: false }),
                                                    name: interaction.member.nickname
                                                        ? `${interaction.member.nickname} (${interaction.member.user.tag}) (${interaction.member.id})`
                                                        : `${interaction.member.user.tag} (${interaction.member.id})`
                                                })
                                                .setThumbnail(user.displayAvatarURL({ forceStatic: false }))
                                                .setDescription(`**User** ${user.tag} (${user.id})\n**Reason** ${reason ?? '*`No reason provided`*'}${(await Promise.all(punishment.referenceCases.filter(async (caseNum) => await CaseSystem.findOne({ where: { id: caseNum } })))).filter(notEmpty).length
                                                    ? `**Reference Cases** ${commaList(
                                                        (await Promise.all(punishment.referenceCases.map(async (caseNum) => {
                                                            const fetchedPunishment = await CaseSystem.findOne({
                                                                where: {
                                                                    id: caseNum
                                                                }
                                                            })
                                                            return fetchedPunishment ? (
                                                                fetchedPunishment.modLogMessage.channelId && fetchedPunishment.modLogMessage.messageId
                                                                    ? `[${caseNum}](https://discord.com/messages/${fetchedPunishment.guild}/${fetchedPunishment.modLogMessage.channelId}/${fetchedPunishment.modLogMessage.messageId})`
                                                                    : String(fetchedPunishment.id)
                                                            ) : undefined
                                                        })))
                                                            .filter(notEmpty)
                                                    )}`
                                                    : ''
                                                    }`)
                                                .setFooter({
                                                    text: `Case ${punishment.id}`
                                                })
                                        ]
                                    })
                                        .then(async (modLogMsg) => {
                                            await punishment.update({
                                                modLogMessage: {
                                                    channelId: modLogMsg.channel.id,
                                                    messageId: modLogMsg.id
                                                }
                                            })
                                        })
                                        .catch(() => {
                                            return
                                        })
                                } catch {
                                    return
                                }
                            })
                    } else {
                        const original = await interaction.fetchReply()
                        yesButton.setDisabled(true)
                        noButton.setDisabled(true)
                        original.edit({
                            components: [confirmationRow],
                            embeds: [
                                EmbedBuilder.from(reply.embeds[0])
                                    .setColor(0xff0000)
                                    .setTitle('Unban Cancellation')
                                    .setDescription(`Cancelled the unban for ${bold(user.tag)} (${inlineCode(user.id)}).`)
                                    .setAuthor(null)
                                    .setFields([])
                            ]
                        })
                        interaction.followUp('You cancelled the unban.')
                    }
                })

                confirmationCollector.on('end', async (collected): Promise<any> => {
                    if (!collected.size) {
                        const original = await interaction.fetchReply()
                        original.edit({
                            embeds: [
                                EmbedBuilder.from(reply.embeds[0])
                                    .setColor(0xff0000)
                                    .setTitle('Unban Cancellation')
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
                                            .setLabel('ZBot New Year\'s Updates')
                                            .setStyle(ButtonStyle.Link)
                                            .setURL('https://discord.com/channels/1000073833551769600/1010853170328633394/1057250247014879273')
                                    )
                            ] : [
                                new ActionRowBuilder<ButtonBuilder>()
                                    .addComponents(
                                        new ButtonBuilder()
                                            .setEmoji('⚠')
                                            .setLabel('ZBot New Year\'s Updates')
                                            .setStyle(ButtonStyle.Link)
                                            .setURL('https://discord.com/channels/1000073833551769600/1010853170328633394/1057250247014879273')
                                    )
                            ]
                        })
                        return await interaction.followUp('A response wasn\'t received in time.')
                    }
                })
            }
        } else {
            // Ban a user/member

            // Input
            const user = interaction.options.getUser('user', true)
            const reason = interaction.options.getString('reason')
            const userAsMember = interaction.guild.members.cache.get(user.id)
            const days = interaction.options.getInteger('clear') || 0
            const skipConfirmation = interaction.options.getString('skipConfirmation')

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
                                )} ${pluralise(perms.length, 'permissions')
                                }`
                            )
                                }.\nThe bot ${missingPerms.length
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
                                    name: `${interaction.member?.nickname ? `${interaction.member.nickname} (${interaction.user.tag})` : interaction.user.tag} (${interaction.user.id})`,
                                    iconURL: interaction.user.displayAvatarURL({ forceStatic: false })
                                })
                                .setTitle(`Role Hierarchy`)
                                .setDescription(`Unable to ban member. Member's highest role (${bold(userAsMember.roles.highest.name)
                                    } ${inlineCode(userAsMember.roles.highest.id)
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
                } else if (userAsMember.roles.highest.position >= interaction.member.roles.highest.position) {
                    const memberRolePos = userAsMember.roles.highest.position
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
                                .setDescription(`Ban forbidden. Member's highest role (${bold(userAsMember.roles.highest.name)
                                    } ${inlineCode(userAsMember.roles.highest.id)
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

                // Check if the member is bannable apart from any other conditions
                // This will stop the bot from throwing errors when it bans the member afterwards
                if (!userAsMember.bannable) return await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setAuthor({
                                name: `${interaction.member?.nickname ? `${interaction.member.nickname} (${interaction.user.tag})` : interaction.user.tag} (${interaction.user.id})`,
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
                            name: `${interaction.member?.nickname ? `${interaction.member.nickname} (${interaction.user.tag})` : interaction.user.tag} (${interaction.user.id})`,
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
                            name: `${interaction.member?.nickname ? `${interaction.member.nickname} (${interaction.user.tag})` : interaction.user.tag} (${interaction.user.id})`,
                            iconURL: interaction.user.displayAvatarURL({ forceStatic: false })
                        })
                        .setTitle(`User already banned`)
                        .setDescription('This user is already banned.')
                        .setColor(0xff0000)
                ],
                ephemeral: true
            })

            if (skipConfirmation) {
                const refCases = interaction.options.getString('referenceCases')
                    ? await Promise.all(interaction.options
                        .getString('referenceCases', true)
                        .split(/\D+/g)
                        .map(n => Number(n))
                        .filter(async (n) => !isNaN(n) && isFinite(n) && await CaseSystem.findOne({ where: { id: n } })))
                    : []

                const punishment = await CaseSystem.create({
                    guild: interaction.guild.id,
                    moderator: interaction.user.id,
                    user: user.id,
                    reason: reason ?? '',
                    edited: false,
                    type: PunishmentTypes.BAN,
                    referenceCases: refCases,
                    DMMessage: {
                        channelId: '',
                        messageId: ''
                    },
                    modLogMessage: {
                        channelId: '',
                        messageId: ''
                    },
                    id: 0
                })

                await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(0x00ff00)
                            .setTitle('Successful Ban')
                            .setDescription(`Successfully banned ${bold(user.tag)
                                } (${inlineCode(user.id)}) ${reason
                                    ? `with reason ${bold(reason)}`
                                    : 'without a reason'
                                }, clearing ${days === 0
                                    ? bold('no message history')
                                    : bold(`${inlineCode(days === 7 ? '1 week' : pluralise(days, 'day'))} of message history`)
                                }. ${italic('Confirmation has been skipped.')
                                }`)
                            .setFooter({
                                text: `Case ${punishment.id}${Math.random() < 0.1
                                    ? ` • 💡 Did you know? ${tipsAndTricks[Math.floor(Math.random() * tipsAndTricks.length)]}`
                                    : ''
                                    }`
                            })
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
                                    .setLabel('ZBot New Year\'s Updates')
                                    .setStyle(ButtonStyle.Link)
                                    .setURL('https://discord.com/channels/1000073833551769600/1010853170328633394/1057250247014879273')
                            )
                    ] : [
                        new ActionRowBuilder<ButtonBuilder>()
                            .addComponents(
                                new ButtonBuilder()
                                    .setEmoji('⚠')
                                    .setLabel('ZBot New Year\'s Updates')
                                    .setStyle(ButtonStyle.Link)
                                    .setURL('https://discord.com/channels/1000073833551769600/1010853170328633394/1057250247014879273')
                            )
                    ]
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
                            .setFooter({
                                text: `Case ${punishment.id}`
                            })
                    ]
                })
                    .then(async (DMMsg) => {
                        await punishment.update({
                            DMMessage: {
                                channelId: DMMsg.channel.id,
                                messageId: DMMsg.id
                            }
                        })
                    })
                    .finally(async () => {
                        await interaction.guild.members.ban(user, {
                            reason: `Banned by ${interaction.user.tag
                                } (${interaction.user.id
                                }) ${reason
                                    ? `with reason ${reason}`
                                    : 'without a reason'
                                }, clearing ${days === 0
                                    ? 'no message history'
                                    : `${days === 7 ? '1 week' : pluralise(days, 'day')} of message history`
                                }.`
                            , deleteMessageDays: days
                        })
                        if (interaction.guild.id !== '786984851014025286') return
                        try {
                            const channel = interaction.client.channels.cache.get('1046386065570799656') as unknown as TextChannel
                            if (!channel) return
                            channel.send({
                                embeds: [
                                    new EmbedBuilder()
                                        .setColor(0xff0000)
                                        .setTitle('Ban')
                                        .setAuthor({
                                            iconURL: interaction.user.displayAvatarURL({ forceStatic: false }),
                                            name: interaction.member.nickname
                                                ? `${interaction.member.nickname} (${interaction.member.user.tag}) (${interaction.member.id})`
                                                : `${interaction.member.user.tag} (${interaction.member.id})`
                                        })
                                        .setThumbnail(user.displayAvatarURL({ forceStatic: false }))
                                        .setDescription(`**User** ${user.tag} (${user.id})\n**Reason** ${reason ?? '*`No reason provided`*'}${(await Promise.all(punishment.referenceCases.filter(async (caseNum) => await CaseSystem.findOne({ where: { id: caseNum } })))).filter(notEmpty).length
                                            ? `**Reference Cases** ${commaList(
                                                (await Promise.all(punishment.referenceCases.map(async (caseNum) => {
                                                    const fetchedPunishment = await CaseSystem.findOne({
                                                        where: {
                                                            id: caseNum
                                                        }
                                                    })
                                                    return fetchedPunishment ? (
                                                        fetchedPunishment.modLogMessage.channelId && fetchedPunishment.modLogMessage.messageId
                                                            ? `[${caseNum}](https://discord.com/messages/${fetchedPunishment.guild}/${fetchedPunishment.modLogMessage.channelId}/${fetchedPunishment.modLogMessage.messageId})`
                                                            : String(fetchedPunishment.id)
                                                    ) : undefined
                                                })))
                                                    .filter(notEmpty)
                                            )}`
                                            : ''
                                            }`)
                                        .setFooter({
                                            text: `Case ${punishment.id}`
                                        })
                                ]
                            })
                                .then(async (modLogMsg) => {
                                    await punishment.update({
                                        modLogMessage: {
                                            channelId: modLogMsg.channel.id,
                                            messageId: modLogMsg.id
                                        }
                                    })
                                })
                                .catch(() => {
                                    return
                                })
                        } catch {
                            return
                        }
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

                const reply = await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setAuthor({
                                name: `${interaction.member?.nickname ? `${interaction.member.nickname} (${interaction.user.tag})` : interaction.user.tag} (${interaction.user.id})`,
                                iconURL: interaction.user.displayAvatarURL({ forceStatic: false })
                            })
                            .setTitle('Confirm Ban')
                            .setDescription(`Are you sure you would like to ban ${bold(user.tag)} (${inlineCode(user.id)})?\n\n${italic(`A response is required ${time(Math.floor(Date.now() / 1000) + 121, 'R')
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
                                    .setLabel('ZBot New Year\'s Updates')
                                    .setStyle(ButtonStyle.Link)
                                    .setURL('https://discord.com/channels/1000073833551769600/1010853170328633394/1057250247014879273')
                            )
                    ] : [
                        confirmationRow,
                        new ActionRowBuilder<ButtonBuilder>()
                            .addComponents(
                                new ButtonBuilder()
                                    .setEmoji('⚠')
                                    .setLabel('ZBot New Year\'s Updates')
                                    .setStyle(ButtonStyle.Link)
                                    .setURL('https://discord.com/channels/1000073833551769600/1010853170328633394/1057250247014879273')
                            )
                    ],
                    fetchReply: true
                })

                const confirmationCollector = reply.createMessageComponentCollector({
                    componentType: ComponentType.Button,
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
                        const refCases = interaction.options.getString('referenceCases')
                            ? await Promise.all(interaction.options
                                .getString('referenceCases', true)
                                .split(/\D+/g)
                                .map(n => Number(n))
                                .filter(async (n) => !isNaN(n) && isFinite(n) && await CaseSystem.findOne({ where: { id: n } })))
                            : []

                        const punishment = await CaseSystem.create({
                            guild: interaction.guild.id,
                            moderator: interaction.user.id,
                            user: user.id,
                            reason: reason ?? '',
                            edited: false,
                            type: PunishmentTypes.BAN,
                            referenceCases: refCases,
                            DMMessage: {
                                channelId: '',
                                messageId: ''
                            },
                            modLogMessage: {
                                channelId: '',
                                messageId: ''
                            },
                            id: 0
                        })

                        const original = await interaction.fetchReply()
                        yesButton.setDisabled(true)
                        noButton.setDisabled(true)
                        original.edit({
                            embeds: [
                                EmbedBuilder.from((await interaction.fetchReply()).embeds[0])
                                    .setColor(0x00ff00)
                                    .setTitle('Successful Ban')
                                    .setDescription(`Successfully banned ${bold(user.tag)
                                        } (${inlineCode(user.id)}) ${reason
                                            ? `with reason ${bold(reason)}`
                                            : 'without a reason'
                                        }, clearing ${days === 0
                                            ? bold('no message history')
                                            : bold(`${inlineCode(days === 7 ? '1 week' : pluralise(days, 'day'))} of message history`)
                                        }.`)
                                    .setFooter({
                                        text: `Case ${punishment.id}${Math.random() < 0.1
                                            ? ` • 💡 Did you know? ${tipsAndTricks[Math.floor(Math.random() * tipsAndTricks.length)]}`
                                            : ''
                                            }`
                                    })
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
                                            .setLabel('ZBot New Year\'s Updates')
                                            .setStyle(ButtonStyle.Link)
                                            .setURL('https://discord.com/channels/1000073833551769600/1010853170328633394/1057250247014879273')
                                    )
                            ] : [
                                new ActionRowBuilder<ButtonBuilder>()
                                    .addComponents(
                                        new ButtonBuilder()
                                            .setEmoji('⚠')
                                            .setLabel('ZBot New Year\'s Updates')
                                            .setStyle(ButtonStyle.Link)
                                            .setURL('https://discord.com/channels/1000073833551769600/1010853170328633394/1057250247014879273')
                                    )
                            ]
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
                                    .setFooter({
                                        text: `Case ${punishment.id}`
                                    })
                            ]
                        })
                            .then(async (DMMsg) => {
                                await button.reply('Ban successful. Member has been messaged.')
                                await punishment.update({
                                    DMMessage: {
                                        channelId: DMMsg.channel.id,
                                        messageId: DMMsg.id
                                    }
                                })
                            })
                            .catch(async (DMMsg) => {
                                await button.reply('Ban successful. Couldn\'t send the member a message.')
                                await punishment.update({
                                    DMMessage: {
                                        channelId: DMMsg.channel.id,
                                        messageId: DMMsg.id
                                    }
                                })
                            })
                            .finally(async () => {
                                await interaction.guild.members.ban(user, {
                                    reason: `Banned by ${interaction.user.tag
                                        } (${interaction.user.id
                                        }) ${reason
                                            ? `with reason ${reason}`
                                            : 'without a reason'
                                        }, clearing ${days === 0
                                            ? 'no message history'
                                            : `${days === 7 ? '1 week' : pluralise(days, 'day')} of message history`
                                        }.`
                                    , deleteMessageDays: days
                                })
                                if (interaction.guild.id !== '786984851014025286') return
                                try {
                                    const channel = interaction.client.channels.cache.get('1046386065570799656') as unknown as TextChannel
                                    if (!channel) return
                                    channel.send({
                                        embeds: [
                                            new EmbedBuilder()
                                                .setColor(0xff0000)
                                                .setTitle('Ban')
                                                .setAuthor({
                                                    iconURL: interaction.user.displayAvatarURL({ forceStatic: false }),
                                                    name: interaction.member.nickname
                                                        ? `${interaction.member.nickname} (${interaction.member.user.tag}) (${interaction.member.id})`
                                                        : `${interaction.member.user.tag} (${interaction.member.id})`
                                                })
                                                .setThumbnail(user.displayAvatarURL({ forceStatic: false }))
                                                .setDescription(`**User** ${user.tag} (${user.id})\n**Reason** ${reason ?? '*`No reason provided`*'}${(await Promise.all(punishment.referenceCases.filter(async (caseNum) => await CaseSystem.findOne({ where: { id: caseNum } })))).filter(notEmpty).length
                                                    ? `**Reference Cases** ${commaList(
                                                        (await Promise.all(punishment.referenceCases.map(async (caseNum) => {
                                                            const fetchedPunishment = await CaseSystem.findOne({
                                                                where: {
                                                                    id: caseNum
                                                                }
                                                            })
                                                            return fetchedPunishment ? (
                                                                fetchedPunishment.modLogMessage.channelId && fetchedPunishment.modLogMessage.messageId
                                                                    ? `[${caseNum}](https://discord.com/messages/${fetchedPunishment.guild}/${fetchedPunishment.modLogMessage.channelId}/${fetchedPunishment.modLogMessage.messageId})`
                                                                    : String(fetchedPunishment.id)
                                                            ) : undefined
                                                        })))
                                                            .filter(notEmpty)
                                                    )}`
                                                    : ''
                                                    }`)
                                                .setFooter({
                                                    text: `Case ${punishment.id}`
                                                })
                                        ]
                                    })
                                        .then(async (modLogMsg) => {
                                            await punishment.update({
                                                modLogMessage: {
                                                    channelId: modLogMsg.channel.id,
                                                    messageId: modLogMsg.id
                                                }
                                            })
                                        })
                                        .catch(() => {
                                            return
                                        })
                                } catch {
                                    return
                                }
                            })
                    } else {
                        const original = await interaction.fetchReply()
                        original.edit({
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
                                            .setLabel('ZBot New Year\'s Updates')
                                            .setStyle(ButtonStyle.Link)
                                            .setURL('https://discord.com/channels/1000073833551769600/1010853170328633394/1057250247014879273')
                                    )
                            ] : [
                                new ActionRowBuilder<ButtonBuilder>()
                                    .addComponents(
                                        new ButtonBuilder()
                                            .setEmoji('⚠')
                                            .setLabel('ZBot New Year\'s Updates')
                                            .setStyle(ButtonStyle.Link)
                                            .setURL('https://discord.com/channels/1000073833551769600/1010853170328633394/1057250247014879273')
                                    )
                            ],
                            embeds: [],
                            content: `Cancelled the ban for ${user.tag} (${inlineCode(user.id)}).`
                        })
                        await button.reply('Ban cancelled.')
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
                                    .setTitle('Ban Cancellation')
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
                                            .setLabel('ZBot New Year\'s Updates')
                                            .setStyle(ButtonStyle.Link)
                                            .setURL('https://discord.com/channels/1000073833551769600/1010853170328633394/1057250247014879273')
                                    )
                            ] : [
                                new ActionRowBuilder<ButtonBuilder>()
                                    .addComponents(
                                        new ButtonBuilder()
                                            .setEmoji('⚠')
                                            .setLabel('ZBot New Year\'s Updates')
                                            .setStyle(ButtonStyle.Link)
                                            .setURL('https://discord.com/channels/1000073833551769600/1010853170328633394/1057250247014879273')
                                    )
                            ]
                        })
                        return await interaction.followUp('A response wasn\'t received in time.')
                    }
                })
            }
        }
    }
}

function notEmpty<T>(value: T | null | undefined): value is T {
    return value !== null && value !== undefined
}

export { banCommand }
