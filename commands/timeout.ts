import { ActionRowBuilder, ButtonBuilder, ApplicationCommandOptionType, ChatInputCommandInteraction, ButtonStyle, ComponentType, GuildMember, PermissionsBitField, EmbedBuilder, bold, inlineCode, italic, time } from "discord.js"
import { commaList, ordinalNumber, pluralise } from "../util"
import { Cmd, tipsAndTricks } from "./command-exports"

const timeoutCommand: Cmd = {
    data: {
        name: 'timeout',
        description: 'Timeout a member or remove their timeout',
        options: [
            {
                name: 'set',
                description: 'Give a user a timeout',
                type: ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: 'member',
                        description: 'The member to timeout',
                        type: ApplicationCommandOptionType.User,
                        required: true
                    },
                    {
                        name: 'days',
                        description: 'Between 0 and 27',
                        type: ApplicationCommandOptionType.Integer,
                        required: false,
                        minValue: 0,
                        maxValue: 27
                    },
                    {
                        name: 'hours',
                        description: 'Between 0 and 23',
                        type: ApplicationCommandOptionType.Integer,
                        required: false,
                        minValue: 0,
                        maxValue: 23
                    },
                    {
                        name: 'minutes',
                        description: 'Between 0 and 59',
                        type: ApplicationCommandOptionType.Integer,
                        required: false,
                        minValue: 0,
                        maxValue: 59
                    },
                    {
                        name: 'seconds',
                        description: 'Between 0 and 59',
                        type: ApplicationCommandOptionType.Integer,
                        required: false,
                        minValue: 0,
                        maxValue: 59
                    },
                    {
                        name: 'reason',
                        description: 'The reason for timing out this member',
                        type: ApplicationCommandOptionType.String,
                        required: false
                    }
                ]
            },
            {
                name: 'remove',
                description: 'Remove a timeout from a user',
                type: ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: 'member',
                        description: 'The member to remove the timeout from',
                        type: ApplicationCommandOptionType.User,
                        required: true
                    },
                    {
                        name: 'reason',
                        description: 'The reason for removing timeout from this member',
                        type: ApplicationCommandOptionType.String,
                        required: false
                    }
                ]
            }
        ]
    },
    async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<any> {
        const sc = interaction.options.getSubcommand(true) as "set" | "remove"

        if (sc === "set") {
            const member = interaction.options.getMember("member")

            // Check if the member is in the server
            if (!member) return await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setAuthor({
                        name: `${interaction.user.tag} (${interaction.user.id})`,
                        iconURL: interaction.user.displayAvatarURL({ forceStatic: false })
                    })
                    .setTitle(`Member not found`)
                    .setDescription(`Couldn't find that member.`)
                    .setColor(0xff0000)
                ],
                ephemeral: true
            })

            const botMember = <GuildMember>interaction.guild.members.me

            // Check if the bot's highest role is higher than the member's highest
            if (member.roles.highest.position >= (<GuildMember>interaction.guild.members.me).roles.highest.position) {
                const memberRolePos = member.roles.highest.position
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
                        .setDescription(`Unable to timeout member. Member's highest permission (${
                            bold(member.roles.highest.name)
                        } ${
                            inlineCode(member.roles.highest.id)
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
            } else if (member.roles.highest.position >= interaction.member.roles.highest.position) {
                const memberRolePos = member.roles.highest.position
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
                        .setDescription(`Timeout forbidden. Member's highest role (${
                            bold(member.roles.highest.name)
                        } ${
                            inlineCode(member.roles.highest.id)
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

            // Required permissions
            const perms = new PermissionsBitField('ModerateMembers').toArray()

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
                                    : 'permissions'
                                }`
                            )
                        }.\nThe bot has the ${
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
                                    pluralise(perms.filter(p => !missingPerms.includes(p)).length, 'permissions')
                                }`
                            )
                        }, however is __missing__ the ${
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

            // Check if the member is manageable apart from any other conditions
            // This will stop the bot from throwing errors when it times out the member afterwards
            if (!member.moderatable) return await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setAuthor({
                        name: `${interaction.user.tag} (${interaction.user.id})`,
                        iconURL: interaction.user.displayAvatarURL({ forceStatic: false })
                    })
                    .setTitle(`Member unmoderatable`)
                    .setDescription(`Member unmoderatable.\nCannot timeout this member, reason unknown.`)
                    .setColor(0xff0000)
                ],
                ephemeral: true
            })

            // Calculate the number of days, hours, minutes, seconds
            const [
                days,
                hours,
                minutes,
                seconds
            ]: number[] = [
                interaction.options.getInteger('days', false) || 0,
                interaction.options.getInteger('hours', false) || 0,
                interaction.options.getInteger('minutes', false) || 0,
                interaction.options.getInteger('seconds', false) || 0
            ]

            const [
                daysString,
                hoursString,
                minutesString,
                secondsString
            ] = [
                days,
                hours,
                minutes,
                seconds
            ].map((r, i) => pluralise(r, ["day", "hour", "minute", "second"][i]))

            // Check if it adds up to a value
            if (days + hours + minutes + seconds === 0) return await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setAuthor({
                        name: `${interaction.user.tag} (${interaction.user.id})`,
                        iconURL: interaction.user.displayAvatarURL({ forceStatic: false })
                    })
                    .setTitle(`Invalid duration`)
                    .setDescription('A duration must be provided.')
                    .setColor(0xff0000)
                ],
                ephemeral: true
            })

            // Input
            const reason = interaction.options.getString('reason', false)

            // CONFIRMATION
            // Buttons
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

            // Check if the user wants to timeout
            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setAuthor({
                        name: `${interaction.user.tag} (${interaction.user.id})`,
                        iconURL: interaction.user.displayAvatarURL({ forceStatic: false })
                    })
                    .setTitle('Timeout Confirmation')
                    .setDescription(`Are you sure you would like to timeout ${bold(member.user.tag)} (${inlineCode(member.id)})?\n${
                        italic(`A response is required ${
                            time(Math.floor(Date.now()/1000) + 121, 'R')
                        }.`)
                    }`)
                    .addFields([
                        {
                            name: 'Duration',
                            value: commaList(
                                [daysString, hoursString, minutesString, secondsString].filter(r => !r.startsWith('0'))
                            ),
                            inline: true
                        },
                        {
                            name: 'Reason',
                            value: reason
                                ? reason
                                : italic(inlineCode('No reason provided')),
                            inline: true
                        },
                        {
                            name: 'End of timeout',
                            value: `${time(
                                Math.floor(
                                    Date.now() / 1000
                                ) + (
                                    seconds
                                    + minutes * 60
                                    + hours * 60 * 60
                                    + days * 24 * 60 * 60
                                    )
                                , 'D')} ${time(
                                Math.floor(
                                    Date.now() / 1000
                                ) + (
                                    seconds
                                    + minutes * 60
                                    + hours * 60 * 60
                                    + days * 24 * 60 * 60
                                    )
                                , 'T')}`,
                            inline: true
                        }
                    ])
                    .setColor(0x00ffff)
                ],
                components: [
                    confirmationRow
                ]
            })

            const confirmationCollector = (await interaction.fetchReply()).createMessageComponentCollector({
                componentType: ComponentType.Button,
                time: 120000
            })

            confirmationCollector.on('collect', async (button): Promise<any> => {
                if (button.user.id !== interaction.user.id) return await button.reply({
                    content: 'What do you think you\'re doing, you\'re not allowed to use these buttons!',
                    ephemeral: true
                })
                if (button.customId === 'yes') {
                    const original = await interaction.fetchReply()
                    yesButton.setDisabled(true)
                    noButton.setDisabled(true)
                    original.edit({
                        embeds: [
                            EmbedBuilder.from((await interaction.fetchReply()).embeds[0])
                            .setColor(0x00ff00)
                            .setTitle('Timeout Successful')
                            .setDescription(`Successfully timed out ${
                                bold(member.user.tag)
                            } (${inlineCode(member.user.id)}) for a duration of ${bold(
                                commaList(
                                    [daysString, hoursString, minutesString, secondsString].filter(r => !r.startsWith('0'))
                                )
                            )} ${
                                reason
                                ? `with reason ${bold(reason)}`
                                : 'without a reason'
                            }.`)
                        ],
                        components: []
                    })
                    // Directly message the member and reply, if it doesn't work the bot will inform, and time out anyways
                    member.send({
                        embeds: [
                            new EmbedBuilder()
                            .setColor(0xffff00)
                            .setTitle('Timeout')
                            .setDescription(`You have been timed out in ${bold(interaction.guild.name)}.`)
                            .addFields([
                                {
                                    name: 'Duration',
                                    value: commaList(
                                        [daysString, hoursString, minutesString, secondsString].filter(r => !r.startsWith('0'))
                                    ),
                                    inline: true
                                },
                                {
                                    name: 'Reason',
                                    value: reason
                                        ? reason
                                        : italic(inlineCode('No reason provided')),
                                    inline: true
                                },
                                {
                                    name: 'End of timeout',
                                    value: time(
                                        Math.floor(
                                            Date.now() / 1000
                                        ) + (
                                            seconds
                                            + minutes * 60
                                            + hours * 60 * 60
                                            + days * 24 * 60 * 60
                                            )
                                        , 'D'),
                                    inline: true
                                }
                            ])
                        ]
                    })
                    .then(async () => {
                        await button.reply({
                            content: 'Timeout successful. Member has been messaged.',
                            embeds: [
                                EmbedBuilder.from((await interaction.fetchReply()).embeds[0])
                                .setColor(0x00ff00)
                                .setTitle('Timeout Successful')
                                .setDescription(`Successfully timed out ${
                                    bold(member.user.tag)
                                } (${inlineCode(member.user.id)}) for a duration of ${bold(
                                    commaList(
                                        [daysString, hoursString, minutesString, secondsString].filter(r => !r.startsWith('0'))
                                    )
                                )} ${
                                    reason
                                    ? `with reason ${bold(reason)}`
                                    : 'without a reason'
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
                            content: 'Timeout successful. Couldn\'t send the member a message.',
                            embeds: [
                                EmbedBuilder.from((await interaction.fetchReply()).embeds[0])
                                .setColor(0x00ff00)
                                .setTitle('Timeout Successful')
                                .setDescription(`Successfully timed out ${
                                    bold(member.user.tag)
                                } (${inlineCode(member.user.id)}) for a duration of ${bold(
                                    commaList(
                                        [daysString, hoursString, minutesString, secondsString].filter(r => !r.startsWith('0'))
                                    )
                                )} ${
                                    reason
                                    ? `with reason ${bold(reason)}`
                                    : 'without a reason'
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
                        await member.timeout(
                            1000 * (days * 24 * 60 * 60 + hours * 60 * 60 + minutes * 60 + seconds),
                            `Timed out by ${interaction.user.tag} (${interaction.user.id}) ${reason ? `with reason ${reason}` : 'without reason'} for a duration of ${commaList([daysString, hoursString, minutesString, secondsString].filter(r => !r.startsWith('0')))}`
                        )
                    })
                } else {
                    const original = await interaction.fetchReply()
                    yesButton.setDisabled(true)
                    noButton.setDisabled(true)
                    original.edit({
                        components: [ confirmationRow ],
                        embeds: [
                            EmbedBuilder.from((await interaction.fetchReply()).embeds[0])
                            .setColor(0xff0000)
                            .setTitle('Timeout Cancelled')
                            .setDescription(`Request to timeout ${bold(member.user.tag)} (${inlineCode(member.user.id)}) has been cancelled.`)
                            .setAuthor(null)
                            .setFields([])
                        ]
                    })
                    button.reply('You cancelled the timeout.')
                }
            })

            confirmationCollector.on('end', async (collected): Promise<any> => {
                if (!collected.size) {
                    const original = await interaction.fetchReply()
                    yesButton.setDisabled(true)
                    noButton.setDisabled(true)
                    original.edit({
                        components: [ confirmationRow ],
                        embeds: [
                            EmbedBuilder.from((await interaction.fetchReply()).embeds[0])
                            .setColor(0xff0000)
                            .setTitle('Timeout Cancelled')
                            .setDescription('A response wasn\'t received in time.')
                            .setAuthor(null)
                            .setFields([])
                        ]
                    })
                    try {
                        await interaction.followUp('A response wasn\'t received in time.')
                    } catch {
                        return await interaction.channel?.send('An error occured with the original message - timeout cancelled.')
                    }
                }
            })
        } else {
            // Input
            const member = interaction.options.getMember('member')
            const reason = interaction.options.getString('reason')

            const botMember = <GuildMember>interaction.guild.members.me

            // Check if the member is in the server
            if (!member) return await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setAuthor({
                        name: `${interaction.user.tag} (${interaction.user.id})`,
                        iconURL: interaction.user.displayAvatarURL({ forceStatic: false })
                    })
                    .setTitle(`Member not found`)
                    .setDescription(`Couldn't find that member.`)
                    .setColor(0xff0000)
                ],
                ephemeral: true
            })

            // Check if the bot's highest role is higher than the member's highest
            if (member.roles.highest.position >= (<GuildMember>interaction.guild.members.me).roles.highest.position) {
                const memberRolePos = member.roles.highest.position
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
                        .setDescription(`Unable to remove timeout from member. Member's highest permission (${
                            bold(member.roles.highest.name)
                        } ${
                            inlineCode(member.roles.highest.id)
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
                        } your highest role (${
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
            } else if (member.roles.highest.position >= interaction.member.roles.highest.position) {
                const memberRolePos = member.roles.highest.position
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
                        .setDescription(`Timeout forbidden. Member's highest role (${
                            bold(member.roles.highest.name)
                        } ${
                            inlineCode(member.roles.highest.id)
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

            // Required permissions
            const perms = new PermissionsBitField('ModerateMembers').toArray()

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
                                    : 'permissions'
                                }`
                            )
                        }.\nThe bot has the ${
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
                        }, however is __missing__ the ${
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

            // Check if the member is manageable apart from any other conditions
            // This will stop the bot from throwing errors when it removes the timeout from the member afterwards
            if (!member.moderatable) return await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setAuthor({
                        name: `${interaction.user.tag} (${interaction.user.id})`,
                        iconURL: interaction.user.displayAvatarURL({ forceStatic: false })
                    })
                    .setTitle(`Member unmoderatable`)
                    .setDescription(`Member unmoderatable.\nCannot remove the timeout for this member, reason unknown.`)
                    .setColor(0xff0000)
                ],
                ephemeral: true
            })

            // A final check to ensure the member IS timed out
            if (!member.communicationDisabledUntil) return await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setAuthor({
                        name: `${interaction.user.tag} (${interaction.user.id})`,
                        iconURL: interaction.user.displayAvatarURL({ forceStatic: false })
                    })
                    .setTitle(`Member isn't timed out`)
                    .setDescription(`Member is not in time out.\nCannot remove the timeout for this member, this command only works on members who are already timed out.`)
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

            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setAuthor({
                        name: `${interaction.user.tag} (${interaction.user.id})`,
                        iconURL: interaction.user.displayAvatarURL({ forceStatic: false })
                    })
                    .setTitle('Timeout Removal Confirmation')
                    .setDescription(`Are you sure you would like to remove the timeout for ${bold(member.user.tag)} (${inlineCode(member.id)})?\n${
                        italic(`A response is required ${
                            time(Math.floor(Date.now()/1000) + 121, 'R')
                        }.`)
                    }`)
                    .addFields([
                        {
                            name: 'Reason',
                            value: reason
                                ? reason
                                : italic(inlineCode('No reason provided')),
                            inline: false
                        },
                    ])
                    .setColor(0x00ffff)
                ],
                components: [
                    confirmationRow
                ]
            })

            const confirmationCollector = (await interaction.fetchReply()).createMessageComponentCollector({
                componentType: ComponentType.Button,
                time: 120000
            })

            confirmationCollector.on('collect', async (button): Promise<any> => {
                if (button.user.id !== interaction.user.id) return await button.reply({
                    content: 'What do you think you\'re doing, you\'re not allowed to use these buttons!',
                    ephemeral: true
                })
                if (button.customId === 'yes') {
                    const original = await interaction.fetchReply()
                    yesButton.setDisabled(true)
                    noButton.setDisabled(true)
                    original.edit({
                        embeds: [
                            EmbedBuilder.from((await interaction.fetchReply()).embeds[0])
                            .setColor(0x00ff00)
                            .setTitle('Timeout Removal Successful')
                            .setDescription(`Successfully removed the timeout for ${
                                bold(member.user.tag)
                            } (${inlineCode(member.user.id)}) ${
                                reason
                                ? `with reason ${bold(reason)}`
                                : 'without a reason'
                            }.`)
                        ],
                        components: []
                    })
                    // Directly message the member and reply, if it doesn't work the bot will inform, and remove time out anyways
                    member.send({
                        embeds: [
                            new EmbedBuilder()
                            .setColor(0x00ff00)
                            .setTitle('Timeout Removal')
                            .setDescription(`Your timeout has been removed in ${bold(interaction.guild.name)}.`)
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
                            content: 'Timeout removal successful. Member has been messaged.',
                            embeds: [
                                EmbedBuilder.from((await interaction.fetchReply()).embeds[0])
                                .setColor(0x00ff00)
                                .setTitle('Timeout Removal Successful')
                                .setDescription(`Successfully removed the timeout from ${
                                    bold(member.user.tag)
                                } (${inlineCode(member.user.id)}) ${
                                    reason
                                    ? `with reason ${bold(reason)}`
                                    : 'without a reason'
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
                            content: 'Timeout removal successful. Couldn\'t send the member a message.',
                            embeds: [
                                EmbedBuilder.from((await interaction.fetchReply()).embeds[0])
                                .setColor(0x00ff00)
                                .setTitle('Timeout Removal Successful')
                                .setDescription(`Successfully removed the timeout from ${
                                    bold(member.user.tag)
                                } (${inlineCode(member.user.id)}) ${
                                    reason
                                    ? `with reason ${bold(reason)}`
                                    : 'without a reason'
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
                        await member.timeout(
                            null,
                            `Timeout removed by ${interaction.user.tag} (${interaction.user.id}) ${reason ? `with reason ${reason}` : 'without reason'}`
                        )
                    })
                } else {
                    const original = await interaction.fetchReply()
                    yesButton.setDisabled(true)
                    noButton.setDisabled(true)
                    original.edit({
                        components: [ confirmationRow ],
                        embeds: [
                            EmbedBuilder.from((await interaction.fetchReply()).embeds[0])
                            .setColor(0xff0000)
                            .setTitle('Timeout Cancelled')
                            .setDescription(`Request to timeout ${bold(member.user.tag)} (${bold(member.user.id)}) has been cancelled.`)
                            .setAuthor(null)
                            .setFields([])
                        ]
                    })
                    button.followUp('You cancelled the timeout removal.')
                }
            })

            confirmationCollector.on('end', async (collected): Promise<any> => {
                if (!collected.size) {
                    const original = await interaction.fetchReply()
                    yesButton.setDisabled(true)
                    noButton.setDisabled(true)
                    original.edit({
                        embeds: [
                            EmbedBuilder.from((await interaction.fetchReply()).embeds[0])
                            .setColor(0xff0000)
                            .setTitle('Timeout Cancelled')
                            .setDescription('A response wasn\'t received in time.')
                            .setAuthor(null)
                            .setFields([])
                        ],
                        components: [ confirmationRow ]
                    })
                    try {
                        await interaction.followUp('A response wasn\'t received in time.')
                    } catch {
                        return await interaction.channel?.send('An error occured with the original message - timeout cancelled.')
                    }
                }
            })
        }
    }
}

export {
    timeoutCommand
}
