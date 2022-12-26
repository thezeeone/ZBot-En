import { ActionRowBuilder, ApplicationCommandOptionType, AttachmentBuilder, bold, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, EmbedBuilder, inlineCode } from "discord.js";
import { Cmd, tipsAndTricks } from "./command-exports";
import { LevelModel, RankCardModel } from "../database";
import { createCanvas, registerFont, loadImage } from "canvas";

registerFont('fonts/static/Rubik-Bold.ttf', { family: 'Rubik', weight: '400', style: 'Bold' })

const rankCommand: Cmd = {
    data: {
        name: 'rank',
        description: 'Check yours or another user\'s rank',
        options: [
            {
                name: 'card',
                description: 'Display a rank card',
                type: ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: 'user',
                        description: 'The user to display the rank of',
                        type: ApplicationCommandOptionType.User,
                        required: false
                    }
                ]
            },
            {
                name: 'colour',
                description: 'Set colour of your rank card, or type \'reset\' in set option to reset',
                type: ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: 'set',
                        description: 'Accepted formats: #XXXXXX #XXX XXXXXX XXX 0xXXXXXX 0xXXX (X is 0-9 or A-F) or \'reset\' to reset',
                        type: ApplicationCommandOptionType.String,
                        required: true
                    },
                ]
            }
        ]
    },
    async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<any> {
        const subcommand = interaction.options.getSubcommand()

        if (subcommand === 'colour') {
            const userRankCard = await LevelModel.findOne({
                where: {
                    id: interaction.user.id
                }
            })

            if (!userRankCard) return await interaction.reply({
                content: '⚠ ***Warning** An exciting new change coming to Rank Cards - dynamic editing and images! You will soon be able to use your own images for the backgrounds - that feature is coming soon.*',
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Your Rank Card')
                        .setColor(0xff0000)
                        .setDescription('Cannot customise your rank card when you don\'t even have one!')
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
                ],
                ephemeral: true
            })

            const colourString = interaction.options.getString('set', true)

            const colour = colourString.match(/(0x|#)?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})/)?.[2]

            if (!colour) return await interaction.reply({
                content: '⚠ ***Warning** An exciting new change coming to Rank Cards - dynamic editing and images! You will soon be able to use your own images for the backgrounds - that feature is coming soon.*',
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Problem when Customising Rank Card')
                        .setDescription(`Colour is invalid.\n\nThe colour must match the following regex: ${inlineCode(
                            '/(?:#|0[xX])?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})/'
                        )}, however the value you provided, ${inlineCode(colourString)
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
                content: '⚠ ***Warning** An exciting new change coming to Rank Cards - dynamic editing and images! You will soon be able to use your own images for the backgrounds - that feature is coming soon.*',
                embeds: [
                    new EmbedBuilder()
                        .setColor(0x00ff00)
                        .setTitle('Successful Rank Card Colour Update')
                        .setDescription(`Successfully updated the colour of your rank card.\n**See the embed below for a preview of your rank card.**`)
                        .setFooter(
                            Math.random() < 0.1
                                ? { text: `💡 Did you know? ${tipsAndTricks[Math.floor(Math.random() * tipsAndTricks.length)]}` }
                                : null
                        ),
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
        } else {
            await interaction.deferReply()

            try {
                const width = 512
                const height = 256

                const canvas = createCanvas(width, height)

                const context = canvas.getContext("2d")

                const userRankCard = await LevelModel.findOne({
                    where: {
                        id: interaction.options.getUser('user')?.id || interaction.user.id
                    }
                })

                const userRankCardModel = await RankCardModel.findOne({
                    where: {
                        id: interaction.options.getUser('user')?.id || interaction.user.id
                    }
                })

                const leaderboard = await LevelModel.findAll()

                const userGlobalPosition = (
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
                    .indexOf((interaction.options.getUser('user') || interaction.user).id) + 1

                const userLocalPosition = (
                    await Promise.all(
                        leaderboard
                            .filter(async (model) => {
                                try {
                                    await interaction.guild.members.fetch(model.id);
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
                    .indexOf((interaction.options.getUser('user') || interaction.user).id) + 1

                const total = 502
                let XP = userRankCard?.xp || 0
                let XPToNextLevel = 50 * ((userRankCard?.lvl || 0) + 1)

                const circle: { x: number, y: number, r: number } = {
                    x: 75,
                    y: 87.5,
                    r: 50
                }

                context.fillStyle = "#282b30"
                context.fillRect(0, 0, width, height)

                context.fillStyle = (userRankCardModel?.colour) ? `#${userRankCardModel.colour.toString(16).padStart(6, '0')}` : "#00ffff"
                context.fillRect(10, 192, Math.floor(XP && XPToNextLevel ? (XP / XPToNextLevel) * total : 0), 10)

                context.fillStyle = '#ffffff'
                context.fillRect(Math.floor(XP && XPToNextLevel ? (XP / XPToNextLevel) * total : 0), 192, Math.floor(XP && XPToNextLevel ? ((XPToNextLevel - XP) / XPToNextLevel) * total : 0), 10)

                context.font = '20px "Rubik"'
                context.textAlign = 'left'
                context.fillStyle = '#ffffff'
                context.fillText('Level', 10, 187)

                context.textAlign = 'left'
                context.fillStyle = (userRankCardModel?.colour) ? `#${userRankCardModel.colour.toString(16).padStart(6, '0')}` : "#00ffff"

                context.fillText(`${userRankCard?.lvl.toLocaleString('ru') || '0'}`, 65, 187)

                context.font = '15px "Rubik"'
                context.textAlign = 'right'
                context.fillStyle = '#ffffff'

                context.fillText(`/${XPToNextLevel.toLocaleString('ru')}`, 502, 187)

                context.font = '20px "Rubik"'
                context.textAlign = 'right'
                context.fillStyle = (userRankCardModel?.colour) ? `#${userRankCardModel.colour.toString(16).padStart(6, '0')}` : "#00ffff"

                context.fillText(XP.toLocaleString('ru'), 502 - (10 + XPToNextLevel.toLocaleString('ru').length * 9.5), 187)

                context.fillStyle = '#555555'

                context.fillText('Global', 512 - 12.5 * Math.abs((userGlobalPosition != 0
                    ? `#${userGlobalPosition.toString()}`
                    : '-').length + 1), 25)
                context.fillText('Local', 512 - 12.5 * Math.abs((userLocalPosition != 0
                    ? `#${userLocalPosition.toString()}`
                    : '-').length + 1), 50)

                context.fillStyle = userGlobalPosition > 0 && userGlobalPosition <= 3
                    ? ['#ffcc00', '#aaaaaa', '#cd7f32'][userGlobalPosition - 1]
                    : (userGlobalPosition == 0 ? '#555555' : '#ffffff')

                context.fillText(
                    userGlobalPosition
                        ? `#${userGlobalPosition.toString()}`
                        : '-',
                    502, 25)

                context.fillStyle = userLocalPosition > 0 && userLocalPosition <= 3
                    ? ['#ffcc00', '#aaaaaa', '#cd7f32'][userLocalPosition - 1]
                    : (userLocalPosition == 0 ? '#555555' : '#ffffff')

                context.fillText(
                    userLocalPosition
                        ? `#${userGlobalPosition.toString()}`
                        : '-',
                    502, 50)

                if ((interaction.options.getMember('user') || interaction.member).nickname) {
                    context.font = `${(interaction.options.getMember('user') || interaction.member).displayName.length > 24
                        ? Math.floor(30 / ((interaction.options.getMember('user') || interaction.member).displayName.length / 24))
                        : 30
                        }px "Rubik"`
                    context.textAlign = 'left'
                    context.fillStyle = '#ffffff'

                    context.fillText((interaction.options.getMember('user') || interaction.member).displayName, 130, 85)

                    context.font = `${(interaction.options.getUser('user') || interaction.user).tag.length > 32
                        ? Math.floor(20 / ((interaction.options.getUser('user') || interaction.user).tag.length / 32))
                        : 20
                        }px "Rubik"`
                    context.textAlign = 'left'
                    context.fillStyle = '#555555'

                    context.fillText((interaction.options.getUser('user') || interaction.user).tag, 130, 115)
                } else {
                    context.font = `${(interaction.options.getUser('user') || interaction.user).tag.length > 14
                        ? Math.floor(40 / ((interaction.options.getUser('user') || interaction.user).tag.length / 14))
                        : 40
                        }px "Rubik"`
                    context.textAlign = 'left'
                    context.fillStyle = '#ffffff'

                    context.fillText((interaction.options.getUser('user') || interaction.user).tag, 130, 100)
                }

                context.beginPath()
                context.arc(circle.x, circle.y, circle.r, 0, Math.PI * 2, true)
                context.closePath()
                context.clip()

                try {
                    const avatar = await loadImage((interaction.options.getUser('user') || interaction.user).displayAvatarURL({ forceStatic: true }).replace(/(webm|webp)/g, 'jpg'))

                    const aspect = avatar.height / avatar.width

                    const hsx = circle.r * Math.max(1 / aspect, 1)
                    const hsy = circle.r * Math.max(aspect, 1)

                    context.drawImage(avatar, circle.x - hsx, circle.y - hsy, hsx * 2, hsy * 2)
                } finally {
                    const file = new AttachmentBuilder(canvas.toBuffer("image/png"))

                    await interaction.editReply({
                        content: '⚠ ***Warning**An exciting new change coming to Rank Cards - dynamic editing and images! You will soon be able to use your own images for the backgrounds - that feature is coming soon.*',
                        files: [
                            file
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
                }

                return
            } catch (error) {
                console.error(error)
                return await interaction[interaction.replied ? 'followUp' : 'editReply']({
                    content: 'An error occured while trying to generate your rank card.\n⚠ ***Warning** An exciting new change coming to Rank Cards - dynamic editing and images! You will soon be able to use your own images for the backgrounds - that feature is coming soon.*',
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
                    ],
                    ephemeral: true
                })
            }
        }
    }
}

function notEmpty<T>(value: T | null | undefined): value is T {
    return value !== undefined && value !== null
}

export { rankCommand }