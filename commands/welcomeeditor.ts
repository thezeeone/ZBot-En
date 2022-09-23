import { ActionRowBuilder, APIEmbed, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, ComponentType, EmbedBuilder, inlineCode, italic, PermissionsBitField, time, TimestampStyles, underscore } from "discord.js";
import { BlacklistModel, WelcomeMessageEditorModel } from "../database";
import { Cmd } from "./command-exports";

const welcomeEditorCommand: Cmd = {
    data: {
        name: 'welcome',
        description: 'Set up a welcome system for your server'
    },
    async execute(interaction: ChatInputCommandInteraction<"cached">) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) return await interaction?.reply({
            content: 'You must have the `Manage Server` permission to be able to set-up a welcome system.',
            ephemeral: true
        })

        const serverWelcomeSystem = await WelcomeMessageEditorModel.findOne({
            where: {
                id: interaction.guild.id
            }
        })

        if (!serverWelcomeSystem) {
            const [
                setupButton,
                cancelButton
            ] = [
                new ButtonBuilder()
                .setCustomId('setup')
                .setStyle(ButtonStyle.Success)
                .setLabel('Set Up'),
                new ButtonBuilder()
                .setCustomId('cancel')
                .setStyle(ButtonStyle.Danger)
                .setLabel('Cancel')
            ]

            const buttonRow = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(setupButton, cancelButton)

            const reply = await interaction.reply({
                content: `You don\'t have a welcome system set up. Click the buttons below to get started.\n\n${italic(`A response is required ${time(Math.floor(Date.now() / 1000) + 120)}`)}`,
                components: [buttonRow],
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

                    return true
                },
                time: 120000
            })

            confirmationCollector.on('collect', (btn) => {
                if (btn.customId === 'setup') {
                    setupButton.setDisabled(true)
                    cancelButton.setDisabled(true)
                    WelcomeMessageEditorModel.create({
                        id: interaction.guild.id,
                        channelId: undefined,
                        message: '',
                        embeds: [],
                        enabled: true
                    })
                    .then(async () => {
                        try {
                            await reply.edit({ content: `To set up a welcome system, you must re-run this command.`, components: [buttonRow] })
                            await btn.reply(`If you would like to set-up a welcome system, please re-run the command.`)
                        } catch {
                            return
                        }
                    })
                    .catch(async () => {
                        try {
                            await btn.reply(`Failed to create welcome system editor, please try again. If this issue persists, please report it [on our GitHub Issue #20](https://github.com/Zahid556/ZBot-En/issues/20) or in the [#reports channel on ZBot Server (En)](https://discord.gg/6tkn6m5g52).`)
                            await reply.edit({ content: `Welcome system failed.`, components: [buttonRow] })
                        } catch {
                            return
                        }
                    })
                } else if (btn.customId === 'cancel') {
                    setupButton.setDisabled(true) 
                    cancelButton.setDisabled(true)
                    reply.edit({ content: `Cancelled.`, components: [buttonRow] })
                    btn.reply(`Set-up cancelled.`)
                }
            })

            confirmationCollector.on('end', async (collected) => {
                if (!collected.size) {
                    try {
                        setupButton.setDisabled(true)
                        cancelButton.setDisabled(true)
                        await reply.edit({
                            content: `A response wasn\'t received in time.`,
                            components: [buttonRow]
                        })
                    } catch {
                        return
                    }
                }
            })
        } else {
            let editedSystem: {
                message: string,
                embeds: APIEmbed[],
                id: string,
                channelId: string | null,
                enabled: boolean
            } = {
                message: '',
                embeds: [],
                id: interaction.guild.id,
                channelId: serverWelcomeSystem.channelId || null,
                enabled: false
            }

            const syntax: ({ name: string, description: string, value: string | null | undefined | number })[] = [
                { name: '{user.username}', description: 'User\'s username.', value: interaction.user.username },
                { name: '{user.discriminator}', description: 'User\'s discriminator.', value: interaction.user.discriminator },
                { name: '{user.id}', description: 'User\'s ID.', value: interaction.user.id },
                { name: '{user.mention}', description: 'Mention the user.', value: interaction.user.toString() },
                { name: '{user.createdAt}', description: 'User account creation date.', value: time(new Date()) },
                { name: '{user.createdAt[short time | long time | short date | long date | short date-time | long date-time | relative]}', description: `User account creation date in a specific form. Type the syntax like this: \`{user.createdAt[short date]}\` to get ${time(new Date(), 'd')}, or an example with \`{user.createdAt[short date-time]}\`:`, value: time(new Date(), 'f') },
                { name: '{server.name}', description: 'Server name.', value: interaction.guild.name },
                { name: '{server.description}', description: 'Server description.', value: interaction.guild.description },
                { name: '{server.memberCount[before | after]}', description: 'Server member count - default is member count after member joined. Example with `{server.memberCount[before]}`:', value: interaction.guild.memberCount },
                { name: '{server.id}', description: 'Display the server ID.', value: interaction.guild.id }
            ]

            const embed = new EmbedBuilder()
            .setTitle('Welcome System Editor')
            .setDescription('Welcome to the Welcome System Editor! This is your starting point for managing the welcome system editor. Click some of the buttons below to get started. (**please read the experimental label above**)')
            .addFields([
                {
                    name: 'Syntax',
                    value: syntax.map(({ name, description, value }) => {
                        return `${inlineCode(name)} ${description} ${italic(value as string)}`
                    }).join('\n')
                }
            ])

            const [
                editButton,
                channelButton,
                previewButton,
                saveButton,
                discardButton,
                toggleEnableButton,
                completeButton
            ] = [
                new ButtonBuilder()
                .setCustomId('edit')
                .setLabel('Edit')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(editedSystem.channelId && editedSystem.enabled ? false : true),
                new ButtonBuilder()
                .setCustomId('channel')
                .setLabel('Set Channel')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(!editedSystem.enabled),
                new ButtonBuilder()
                .setCustomId('preview')
                .setLabel('Preview')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(editedSystem.enabled && (editedSystem.embeds.length || editedSystem.message) ? false : true),
                new ButtonBuilder()
                .setCustomId('save')
                .setLabel('Save')
                .setStyle(ButtonStyle.Success)
                .setDisabled(!editedSystem.enabled),
                new ButtonBuilder()
                .setCustomId('discard')
                .setLabel('Discard')
                .setStyle(ButtonStyle.Danger)
                .setDisabled(!editedSystem.enabled),
                new ButtonBuilder()
                .setCustomId(!editedSystem.enabled ? 'enable' : 'disable')
                .setLabel(!editedSystem.enabled ? 'Enable' : 'Disable')
                .setStyle(!editedSystem.enabled ? ButtonStyle.Success : ButtonStyle.Danger)
                .setDisabled(false),
                new ButtonBuilder()
                .setCustomId('complete')
                .setLabel('Complete editing')
                .setStyle(ButtonStyle.Success)
                .setDisabled(false)
            ]

            const [
                editorRow,
                enablerRow,
                completionRow
            ] = [
                new ActionRowBuilder<ButtonBuilder>().addComponents(editButton, channelButton, previewButton, saveButton, discardButton),
                new ActionRowBuilder<ButtonBuilder>().addComponents(toggleEnableButton),
                new ActionRowBuilder<ButtonBuilder>().addComponents(completeButton)
            ]

            const reply = await interaction.reply({
                components: [
                    editorRow,
                    enablerRow,
                    completionRow
                ],
                embeds: [
                    embed
                ],
                fetchReply: true
            })

            const collector = reply.createMessageComponentCollector({
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
                    }

                    return true
                }
            })

            collector.on('collect', async (btn) => {
                switch (btn.customId) {
                    case 'edit':
                        const rpl = await btn.reply({
                            content: `Type up your new welcome message, while replying to this message, using the syntax to help - this will be saved. If you would like to cancel, type \`cancel\`. ${italic(`A response is required ${time(Math.floor(Date.now() / 1000) + 1200, 'R')}`)}`,
                            fetchReply: true
                        })

                        toggleEnableButton
                        .setDisabled(true)
                        editButton
                        .setDisabled(true)
                        channelButton
                        .setDisabled(true)
                        previewButton
                        .setDisabled(true)
                        saveButton
                        .setDisabled(true)
                        discardButton
                        .setDisabled(true)
                        await reply.edit({
                            components: [
                                editorRow,
                                enablerRow,
                                completionRow
                            ]
                        })

                        const filter = rpl.channel.createMessageCollector({
                            filter: async (msg) => {
                                if (msg.author.id !== interaction.user.id || msg.reference?.messageId !== rpl.id) return false
                                return true
                            },
                            time: 1200000
                        })

                        filter.on('collect', async (msg) => {
                            if (msg.content === 'cancel') {
                                await rpl.edit('Cancelled.')

                                await msg.reply({
                                    content: 'Cancelled.',
                                    allowedMentions: {
                                        repliedUser: false
                                    }
                                })
                            } else {
                                editedSystem.message = msg.content

                                await msg.reply({
                                    content: 'Saved as your message.'
                                }) 
                            }

                            filter.stop()
                        })

                        filter.on('end', async (collected) => {
                            if (!collected.size) {
                                await rpl.edit('A response wasn\'t received in time.')
                                await rpl.reply('A response wasn\'t received in time.')
                            }

                            toggleEnableButton
                            .setCustomId('disable')
                            .setLabel('Disable')
                            .setStyle(ButtonStyle.Danger)
                            editButton
                            .setDisabled(editedSystem.channelId ? false : true)
                            channelButton
                            .setDisabled(false)
                            previewButton
                            .setDisabled(editedSystem.embeds.length || editedSystem.message ? false : true)
                            saveButton
                            .setDisabled(false)
                            discardButton
                            .setDisabled(false)
                            await reply.edit({
                                components: [
                                    editorRow,
                                    enablerRow,
                                    completionRow
                                ]
                            })

                            return
                        })

                        break
                    case 'channel':
                        const channelEditButton = new ButtonBuilder()
                        .setCustomId(editedSystem.channelId ? 'change' : 'set')
                        .setLabel(editedSystem.channelId ? 'Change Channel' : 'Set Channel')
                        .setStyle(ButtonStyle.Primary)

                        if (!editedSystem.channelId) {
                            await btn.reply({
                                content: 'This welcome system doesn\'t have a channel to send the messages to!',
                                components: [
                                    new ActionRowBuilder<ButtonBuilder>()
                                    .addComponents(channelEditButton)
                                ],
                                fetchReply: true
                            })
                        } else {
                            try {
                                const channel = await interaction.client.channels.fetch(editedSystem.channelId)
                                await btn.reply({
                                    content: `ZBot's welcome system messages will be sent in ${channel?.toString()}.`,
                                    components: [
                                        new ActionRowBuilder<ButtonBuilder>()
                                        .addComponents(channelEditButton)
                                    ],
                                    fetchReply: true
                                })
                            } catch {
                                await btn.reply({
                                    content: 'Channel unresolved; has been set to `undefined.`',
                                    components: [
                                        new ActionRowBuilder<ButtonBuilder>()
                                        .addComponents(channelEditButton)
                                    ],
                                    fetchReply: true
                                })
                            }
                        }

                        const fetchedreply = await btn.fetchReply()

                        const fetchedreplyCollector = fetchedreply.createMessageComponentCollector({
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
                                }

                                return true
                            },
                            componentType: ComponentType.Button,
                            time: 120000
                        })

                        fetchedreplyCollector.on('collect', async (collectedBtn) => {
                            channelEditButton
                            .setDisabled(true)
                            .setLabel('Editing channel...')
                            .setStyle(ButtonStyle.Secondary)

                            await fetchedreply.edit({
                                components: [
                                    new ActionRowBuilder<ButtonBuilder>()
                                    .addComponents(channelEditButton)
                                ]
                            })

                            const componentReply = await collectedBtn.reply({
                                content: `Please type the channel (mention or ID) you would like to send the messages to, **while replying to this one**. To cancel, type \`cancel\`. ${italic(`A response is required ${time(Math.floor(Date.now() / 1000) + 120, 'R')}`)}`,
                                fetchReply: true
                            })

                            const collector = componentReply.channel.createMessageCollector({
                                filter: (msg) => {
                                    if (msg.author.id !== interaction.user.id || msg.reference?.messageId !== componentReply.id) return false
                                    else if (!msg.mentions.channels.size || !msg.content.match(/\d{17,19}/)) return false
                                    return true
                                },
                                time: 120000
                            })

                            collector.on('collect', async (message) => {
                                if (message.content === 'cancel') {
                                    await componentReply.edit('Cancelled.')
                                    channelEditButton
                                    .setDisabled(true)
                                    .setLabel('Channel Set')
                                    .setStyle(ButtonStyle.Secondary)
                                    await fetchedreply.edit({
                                        components: [
                                            new ActionRowBuilder<ButtonBuilder>()
                                            .addComponents(channelEditButton)
                                        ]
                                    })
                                } else {
                                    try {
                                        const channel = await interaction.client.channels.fetch(message.content.match(/\d{17,19}/g)?.[0] as string)
                                        if (!channel?.isTextBased()) {
                                            await message.reply('Unrecognised channel.')
                                            return
                                        }
                                        editedSystem.channelId = channel?.id
                                        await componentReply.edit(`ZBot will now send welcome messages in ${channel}!`)
                                        fetchedreplyCollector.stop()
                                    } catch {
                                        await message.reply('Unrecognised channel.')
                                    } finally {
                                        channelEditButton
                                        .setDisabled(false)
                                        .setLabel(editedSystem.channelId ? 'Change Channel' : 'Set Channel')
                                        .setStyle(ButtonStyle.Primary)
                                        await fetchedreply.edit({
                                            components: [
                                                new ActionRowBuilder<ButtonBuilder>()
                                                .addComponents(channelEditButton)
                                            ]
                                        })
                                        toggleEnableButton
                                        .setCustomId('disable')
                                        .setLabel('Disable')
                                        .setStyle(ButtonStyle.Danger)
                                        editButton
                                        .setDisabled(editedSystem.channelId ? false : true)
                                        channelButton
                                        .setDisabled(false)
                                        previewButton
                                        .setDisabled(editedSystem.embeds.length || editedSystem.message ? false : true)
                                        saveButton
                                        .setDisabled(false)
                                        discardButton
                                        .setDisabled(false)
                                        await reply.edit({
                                            components: [
                                                editorRow,
                                                enablerRow,
                                                completionRow
                                            ]
                                        })
                                    }
                                }
                            })

                            collector.on('end', async (collected) => {
                                channelEditButton
                                .setDisabled(true)
                                .setLabel(!collected.size ? 'No response received' : 'Channel selected')
                                .setStyle(ButtonStyle.Secondary)
                                fetchedreply.edit({
                                    content: !collected.size ? 'A response wasn\'t received in time.' : 'Channel selected.',
                                    components: [
                                        new ActionRowBuilder<ButtonBuilder>()
                                        .addComponents(channelEditButton)
                                    ]
                                })
                            })
                        })

                        fetchedreplyCollector.on('end', () => {
                            channelEditButton.setDisabled(true)
                            fetchedreply.edit({
                                components: [
                                    new ActionRowBuilder<ButtonBuilder>()
                                    .addComponents(channelEditButton)
                                ]
                            })
                        })

                        break
                    case 'preview':
                        if (!editedSystem.message && !editedSystem.embeds.length) {
                            await btn.reply({
                                content: 'You don\'t have a message or any embeds! Click the edit button to edit your message.',
                                ephemeral: true
                            })
                        } else {
                            try {
                                await btn.reply({
                                    content: editedSystem.message
                                    .replace(/{user\.username}/ig, interaction.member.user.username)
                                    .replace(/{user\.discriminator}/ig, interaction.member.user.discriminator)
                                    .replace(/{user\.id}/ig, interaction.member.user.id)
                                    .replace(/{user\.mention}/ig, interaction.member.user.toString())
                                    .replace(/{user\.createdAt(?:\[(short time|long time|short date|long date|short date-time|long date-time|relative)\])?}/ig, (testParam) => {
                                        let timeFormat;
                                        switch (testParam) {
                                            case 'short time':
                                                timeFormat = TimestampStyles.ShortTime
                                                break
                                            case 'long time':
                                                timeFormat = TimestampStyles.LongTime
                                                break
                                            case 'short date':
                                                timeFormat = TimestampStyles.ShortDate
                                                break
                                            case 'long date':
                                                timeFormat = TimestampStyles.LongDate
                                                break
                                            case 'short date-time':
                                                timeFormat = TimestampStyles.ShortDateTime
                                                break
                                            case 'long date-time':
                                                timeFormat = TimestampStyles.LongDateTime
                                                break
                                            case 'relative':
                                                timeFormat = TimestampStyles.RelativeTime
                                                break
                                            default:
                                                timeFormat = TimestampStyles.ShortDateTime
                                                break
                                        }
                                        return time(interaction.member.user.createdAt, timeFormat)
                                    })
                                    .replace(/{server\.name}/ig, interaction.member.guild.name)
                                    .replace(/{server\.description}/ig, interaction.member.guild.description || 'no description')
                                    .replace(/{server\.memberCount(?:\[(before|after)\])?}/ig, (memberCountBorA) => {
                                        let memberCountType: 'before' | 'after';
                                        switch (memberCountBorA) {
                                            case 'before':
                                                memberCountType = 'before'
                                                break
                                            case 'after':
                                                memberCountType = 'after'
                                                break
                                            default:
                                                memberCountType = 'after'
                                                break
                                        }
                                        return memberCountType === 'before' ? (interaction.guild.memberCount - 1).toString() : (interaction.guild.memberCount).toString()
                                    })
                                    .replace(/{server\.id}/ig, interaction.member.guild.id),
                                    embeds: editedSystem.embeds
                                })
                            } catch {
                                await btn.reply({
                                    content: 'There\'s something wrong with either your content, your embed(s) or both!',
                                    ephemeral: true
                                })
                            }
                        }

                        break
                    case 'save':
                        try {
                            await WelcomeMessageEditorModel.update({
                                channelId: editedSystem.channelId as string,
                                message: editedSystem.message,
                                embeds: editedSystem.embeds,
                                enabled: editedSystem.enabled
                            }, {
                                where: {
                                    id: interaction.guild.id
                                }
                            })
                            toggleEnableButton
                            .setDisabled(true)
                            editButton
                            .setDisabled(true)
                            channelButton
                            .setDisabled(true)
                            previewButton
                            .setDisabled(true)
                            saveButton
                            .setDisabled(true)
                            discardButton
                            .setDisabled(true)
                            completeButton
                            .setDisabled(true)
                            .setLabel('Changes Saved')
                            .setStyle(ButtonStyle.Secondary)
                            await reply.edit({
                                components: [
                                    editorRow,
                                    enablerRow,
                                    completionRow
                                ]
                            })
                            await btn.reply('Changes saved.')
                            
                            break
                        } catch {
                            await btn.reply({
                                content: 'An error occured.',
                                ephemeral: true
                            })
                            return
                        }
                    case 'enable':
                        toggleEnableButton
                        .setCustomId('disable')
                        .setLabel('Disable')
                        .setStyle(ButtonStyle.Danger)
                        if (serverWelcomeSystem.enabled || editedSystem.enabled) {
                            await btn.reply({
                                content: 'The server welcome system is already enabled!',
                                ephemeral: true
                            })
                        } else {
                            editedSystem.enabled = true
                            await btn.reply({
                                content: 'Server welcome system enabled.',
                                ephemeral: true
                            })
                        }
                        editButton
                        .setDisabled(editedSystem.channelId ? false : true)
                        channelButton
                        .setDisabled(false)
                        previewButton
                        .setDisabled(editedSystem.embeds.length || editedSystem.message ? false : true)
                        saveButton
                        .setDisabled(false)
                        discardButton
                        .setDisabled(false)
                        await reply.edit({
                            components: [
                                editorRow,
                                enablerRow,
                                completionRow
                            ]
                        })
                        break
                    case 'disable':
                        toggleEnableButton
                        .setCustomId('enable')
                        .setLabel('Enable')
                        .setStyle(ButtonStyle.Success)
                        if (!(serverWelcomeSystem.enabled || editedSystem.enabled)) {
                            await btn.reply({
                                content: 'The server welcome system isn\'t enabled!',
                                ephemeral: true
                            })
                        } else {
                            editedSystem.enabled = false
                            await btn.reply({
                                content: 'Server welcome system disabled.',
                                ephemeral: true
                            })
                        }
                        editButton
                        .setDisabled(true)
                        channelButton
                        .setDisabled(true)
                        previewButton
                        .setDisabled(true)
                        saveButton
                        .setDisabled(true)
                        discardButton
                        .setDisabled(true)
                        await reply.edit({
                            components: [
                                editorRow,
                                enablerRow,
                                completionRow
                            ]
                        })
                        break
                    case 'discard':
                    case 'complete':
                        editButton.setDisabled(true)
                        channelButton.setDisabled(true)
                        previewButton.setDisabled(true)
                        saveButton.setDisabled(true)
                        discardButton.setDisabled(true)
                        toggleEnableButton.setDisabled(true)
                        completeButton
                        .setDisabled(true)
                        .setLabel(btn.customId === 'complete' ? 'Editing complete' : 'Changes Discarded')
                        .setStyle(ButtonStyle.Secondary)
                        await reply.edit({
                            components: [
                                editorRow,
                                enablerRow,
                                completionRow
                            ]
                        })
                        await btn.reply({
                            content: 'All your changes have been discarded.',
                            ephemeral: true
                        })
                        collector.stop()
                        break
                    default:
                        await btn.reply({
                            content: 'Unrecognised button.',
                            ephemeral: true
                        })
                        break
                }
            })
        }

        return
    }
}

export {
    welcomeEditorCommand
}