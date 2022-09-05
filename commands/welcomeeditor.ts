import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, ComponentType, EmbedBuilder, inlineCode, italic, PermissionsBitField, time } from "discord.js";
import { WelcomeMessageEditorModel } from "../database";
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
            const reply = await interaction.reply({
                content: `You don\'t have a welcome system set up. Click the button below to get started.\n\n${
                    italic(`A response is required ${time(Math.floor(Date.now() / 1000) + 121, 'R')}.`)
                }`,
                components: [
                    new ActionRowBuilder<ButtonBuilder>({
                        components: [
                            new ButtonBuilder()
                            .setStyle(ButtonStyle.Success)
                            .setLabel('Set up')
                            .setCustomId('setup'),
                            new ButtonBuilder()
                            .setStyle(ButtonStyle.Danger)
                            .setLabel('Cancel')
                            .setCustomId('cancel')
                        ]
                    })
                ],
                fetchReply: true
            })

            const collector = reply.createMessageComponentCollector({
               componentType: ComponentType.Button,
                time: 120000
            })

            collector.on('collect', async (button) => {
                if (button.user.id !== interaction.user.id) {
                    await interaction.reply({
                        content: 'These buttons are not for you!',
                        ephemeral: true
                    })
                    collector.dispose(button)
                    return
                }

                if (button.customId === 'setup') {
                    button.reply({
                        content: 'System to be setup.',
                        ephemeral: true
                    })
                    collector.stop()
                    reply.edit({
                        content: 'Welcome system to be set up.',
                        components: []
                    })
                } else if (button.customId === 'cancel') {
                    reply.edit({
                        content: 'Cancelled.',
                        components: [
                            new ActionRowBuilder<ButtonBuilder>({
                                components: [
                                    new ButtonBuilder()
                                    .setStyle(ButtonStyle.Success)
                                    .setLabel('Set up')
                                    .setCustomId('setup')
                                    .setDisabled(true),
                                    new ButtonBuilder()
                                    .setStyle(ButtonStyle.Danger)
                                    .setLabel('Cancel')
                                    .setCustomId('cancel')
                                    .setDisabled(true)
                                ]
                            })
                        ]
                    })
                    button.reply({
                        content: 'Cancelled.',
                        ephemeral: true
                    })
                    collector.stop()
                    return
                }
            })

            collector.on('end', async (collected) => {
                if (collected.size) {
                    if (collected.some(c => c.customId === 'cancel')) return
                    const serverSystem = await WelcomeMessageEditorModel.findOne({
                        where: {
                            id: interaction.guild.id
                        }
                    }) || await WelcomeMessageEditorModel.create({
                        id: interaction.guild.id,
                        enabled: false
                    })

                    const embed = new EmbedBuilder()
                    .setColor(0x00ffff)
                    .setTitle('Welcome Message Editor')
                    .setAuthor({
                        name: `${interaction.user.tag} (${interaction.user.id})`,
                        iconURL: interaction.user.displayAvatarURL({ forceStatic: false })
                    })
                    .setDescription('Welcome to the Welcome Message Editor! This is the editor where you can edit the welcome message, manage settings and enable/disable the system. Use the buttons below to modify your welcome system. You can always discard your settings, save them or modify them later.\n\n⚠ **Note: this is an experimental feature and may break while in use.**')
                    .addFields([
                        {
                            name: 'Syntax',
                            value: [
                                { syntax: '{user.username}', desc: 'Display the user\'s username' },
                                { syntax: '{user.discriminator}', desc: 'Display the user\'s 4-digit discriminator' },
                                { syntax: '{user.id}', desc: 'Display the user\'s ID' },
                                { syntax: '{user.tag}', desc: 'Dislay the user\'s full tag' },
                                { syntax: '{user.mention}', desc: 'Mention the user' },
                                { syntax: '{user.createdAt[short-time | long time | short date | long date | short date-time | long date-time | relative]}', desc: 'The creation date of the user. The `[]` brackets are optional and can be omitted, and will default to `long date-time` format. If the brackets are provided, you must provide one of the formats. eg `{user.createdAt[long date-time]}`' },
                                { syntax: '{server.name}', desc: 'Display the server name' },
                                { syntax: '{server.description}', desc: 'Display the server description' },
                                { syntax: '{server.memberCount[`before` | `after`]}', desc: 'Display the server\'s member count (the `[]` brackets are optional and can be omitted, but if adding them, then use `[before]` to display the count before the member joined, or `[after]` after that)' },
                                { syntax: '{server.id}', desc: 'Display the server ID' }
                            ].map((s) => `${inlineCode(s.syntax)} ${italic(s.desc)}`).join('\n')
                        },
                        {
                            name: 'Examples',
                            value: [
                                { syntax: '{user.username}', ex: 'ZBot' },
                                { syntax: '{user.discriminator}', ex: '9348' },
                                { syntax: '{user.id}', ex: '956596792542257192' },
                                { syntax: '{user.tag}', ex: 'ZBot#9348' },
                                { syntax: '{user.mention}', ex: '<@956596792542257192>' },
                                { syntax: '{user.createdAt}', ex: '<t:1648140848>' },
                                { syntax: '{user.createdAt[relative]}', ex: '<t:1648140848:R>' },
                                { syntax: '{server.name}', ex: interaction.guild.name },
                                { syntax: '{server.description}', ex: interaction.guild.description || 'This is a server description!' },
                                { syntax: '{server.memberCount}', ex: interaction.guild.memberCount },
                                { syntax: '{server.memberCount[before]}', ex: interaction.guild.memberCount - 1 },
                                { syntax: '{server.id}', ex: interaction.guild.id }
                            ]
                            .map(s => `${inlineCode(s.syntax)} ${s.ex}`)
                            .join('\n')
                        }
                    ])

                    const [
                        editButton,
                        channelButton,
                        previewButton,
                        saveButton,
                        discardButton
                    ] = [
                        new ButtonBuilder()
                        .setCustomId('edit')
                        .setLabel('Edit Welcome Message')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(!serverSystem.enabled),
                        new ButtonBuilder()
                        .setCustomId('channel')
                        .setLabel('Display or Set Channel')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(!serverSystem.enabled),
                        new ButtonBuilder()
                        .setCustomId('preview')
                        .setLabel('Preview Welcome Message')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(!serverSystem.enabled),
                        new ButtonBuilder()
                        .setCustomId('save')
                        .setLabel('Save Changes')
                        .setStyle(ButtonStyle.Success)
                        .setDisabled(true),
                        new ButtonBuilder()
                        .setCustomId('discard')
                        .setLabel('Discard Changes')
                        .setStyle(ButtonStyle.Danger)
                        .setDisabled(true)
                    ]

                    const [
                        toggleEnableButton
                    ] = [
                        new ButtonBuilder()
                        .setDisabled(serverSystem.enabled)
                        .setCustomId(serverSystem.enabled ? 'disable' : 'enable')
                        .setLabel(serverSystem.enabled ? 'Disable Welcome Messages' : 'Enable Welcome Messages')
                        .setStyle(serverSystem.enabled ? ButtonStyle.Danger : ButtonStyle.Success)
                    ]

                    const editorRow = new ActionRowBuilder<ButtonBuilder>({ components: [editButton, channelButton, previewButton, saveButton, discardButton] })
                    const enablerRow = new ActionRowBuilder<ButtonBuilder>({ components: [toggleEnableButton] })

                    const editor = await interaction[interaction.replied ? 'followUp' : 'reply']({
                        embeds: [embed],
                        components: [
                            editorRow,
                            enablerRow
                        ],
                        content: `⚠ **__Warning:__ this is an experimental feature and may break while in use; please use this command __at the bot's own risk__.** Some buttons, select menus or features may fail, cause the command to behave strangely, or even worse, cause the bot to crash entirely. If using this command, we advise you use this **at the bot's own risk**.\n\n*Think you know what you're doing? Come and help us out in our GitHub issue, [#20 Per-Server Welcome System Editor](https://github.com/Zahid556/ZBot-En/issues/20).*`,
                        fetchReply: true
                    })
                }
                else {
                    reply.edit({
                        components: [],
                        content: 'A response wasn\'t received in time.'
                    })
                }
            })
        } else {
            const embed = new EmbedBuilder()
            .setColor(0x00ffff)
            .setTitle('Welcome Message Editor')
            .setAuthor({
                name: `${interaction.user.tag} (${interaction.user.id})`,
                iconURL: interaction.user.displayAvatarURL({ forceStatic: false })
            })
            .setDescription('Welcome to the Welcome Message Editor! This is the editor where you can edit the welcome message, manage settings and enable/disable the system. Use the buttons below to modify your welcome system. You can always discard your settings, save them or modify them later.\n\n⚠ **Note: this is an experimental feature and may break while in use.**')
            .addFields([
                {
                    name: 'Syntax',
                    value: [
                        { syntax: '{user.username}', desc: 'Display the user\'s username' },
                        { syntax: '{user.discriminator}', desc: 'Display the user\'s 4-digit discriminator' },
                        { syntax: '{user.id}', desc: 'Display the user\'s ID' },
                        { syntax: '{user.tag}', desc: 'Dislay the user\'s full tag' },
                        { syntax: '{user.mention}', desc: 'Mention the user' },
                        { syntax: '{user.createdAt[short-time | long time | short date | long date | short date-time | long date-time | relative]}', desc: 'The creation date of the user. The `[]` brackets are optional and can be omitted, and will default to `long date-time` format. If the brackets are provided, you must provide one of the formats. eg `{user.createdAt[long date-time]}`' },
                        { syntax: '{server.name}', desc: 'Display the server name' },
                        { syntax: '{server.description}', desc: 'Display the server description' },
                        { syntax: '{server.memberCount[`before` | `after`]}', desc: 'Display the server\'s member count (the `[]` brackets are optional and can be omitted, but if adding them, then use `[before]` to display the count before the member joined, or `[after]` after that)' },
                        { syntax: '{server.id}', desc: 'Display the server ID' }
                    ].map((s) => `${inlineCode(s.syntax)} ${italic(s.desc)}`).join('\n')
                },
                {
                    name: 'Examples',
                    value: [
                        { syntax: '{user.username}', ex: 'ZBot' },
                        { syntax: '{user.discriminator}', ex: '9348' },
                        { syntax: '{user.id}', ex: '956596792542257192' },
                        { syntax: '{user.tag}', ex: 'ZBot#9348' },
                        { syntax: '{user.mention}', ex: '<@956596792542257192>' },
                        { syntax: '{user.createdAt}', ex: '<t:1648140848>' },
                        { syntax: '{user.createdAt[relative]}', ex: '<t:1648140848:R>' },
                        { syntax: '{server.name}', ex: interaction.guild.name },
                        { syntax: '{server.description}', ex: interaction.guild.description || 'This is a server description!' },
                        { syntax: '{server.memberCount}', ex: interaction.guild.memberCount },
                        { syntax: '{server.memberCount[before]}', ex: interaction.guild.memberCount - 1 },
                        { syntax: '{server.id}', ex: interaction.guild.id }
                    ]
                    .map(s => `${inlineCode(s.syntax)} ${s.ex}`)
                    .join('\n')
                }
            ])

            const [
                editButton,
                channelButton,
                previewButton,
                saveButton,
                discardButton
            ] = [
                new ButtonBuilder()
                .setCustomId('edit')
                .setLabel('Edit Welcome Message')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(!serverWelcomeSystem.enabled),
                new ButtonBuilder()
                .setCustomId('channel')
                .setLabel('Display or Set Channel')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(!serverWelcomeSystem.enabled),
                new ButtonBuilder()
                .setCustomId('preview')
                .setLabel('Preview Welcome Message')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(!serverWelcomeSystem.enabled),
                new ButtonBuilder()
                .setCustomId('save')
                .setLabel('Save Changes')
                .setStyle(ButtonStyle.Success)
                .setDisabled(true),
                new ButtonBuilder()
                .setCustomId('discard')
                .setLabel('Discard Changes')
                .setStyle(ButtonStyle.Danger)
                .setDisabled(true)
            ]

            const [
                toggleEnableButton
            ] = [
                new ButtonBuilder()
                .setDisabled(serverWelcomeSystem.enabled)
                .setCustomId(serverWelcomeSystem.enabled ? 'disable' : 'enable')
                .setLabel(serverWelcomeSystem.enabled ? 'Disable Welcome Messages' : 'Enable Welcome Messages')
                .setStyle(serverWelcomeSystem.enabled ? ButtonStyle.Danger : ButtonStyle.Success)
            ]

            const editorRow = new ActionRowBuilder<ButtonBuilder>({ components: [editButton, channelButton, previewButton, saveButton, discardButton] })
            const enablerRow = new ActionRowBuilder<ButtonBuilder>({ components: [toggleEnableButton] })

            const editor = await interaction[interaction.replied ? 'followUp' : 'reply']({
                embeds: [embed],
                components: [
                    editorRow,
                    enablerRow
                ],
                content: `⚠ **__Warning:__ this is an experimental feature and may break while in use; please use this command __at the bot's own risk__.** Some buttons, select menus or features may fail, cause the command to behave strangely, or even worse, cause the bot to crash entirely. If using this command, we advise you use this **at the bot's own risk**.\n\n*Think you know what you're doing? Come and help us out in our GitHub issue, [#20 Per-Server Welcome System Editor](https://github.com/Zahid556/ZBot-En/issues/20).*`,
                fetchReply: true
            })
        }
    }
}

export {
    welcomeEditorCommand
}
