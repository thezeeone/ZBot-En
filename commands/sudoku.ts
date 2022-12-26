import { ActionRowBuilder, ApplicationCommandOptionType, ApplicationCommandPermissionsManager, AttachmentBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, codeBlock, ComponentType, EmbedBuilder, SelectMenuBuilder, underscore } from "discord.js";
import { Cmd } from "./command-exports";
import { sudoku } from "./sudoku-generator.js";
import { writeFileSync } from "fs";
// @ts-ignore
import { createCanvas } from "canvas"
import { commaList } from "../util";
import { BlacklistModel } from "../database";

const sudokuCommand: Cmd = {
    data: {
        name: 'sudoku',
        description: 'Can you fill the 9x9 sudoku grid? Test your mind with this game!',
        options: [
            {
                name: 'difficulty',
                description: 'The difficulty of the sudoku board',
                type: ApplicationCommandOptionType.String,
                choices: [
                    { name: 'Easy (62 squares pre-filled)', value: 'easy' },
                    { name: 'Medium (53 squares pre-filled)', value: 'medium' },
                    { name: 'Hard (44 squares pre-filled)', value: 'hard' },
                    { name: 'Very Hard (35 squares pre-filled)', value: 'very-hard' },
                    { name: 'Insane (26 squares pre-filled)', value: 'insane' },
                    { name: 'Inhuman (17 squares pre-filled)', value: 'inhuman' }
                ],
                required: true
            }
        ]
    },
    async execute(interaction: ChatInputCommandInteraction<"cached">) {
        await interaction.deferReply({ ephemeral: true })

        const sudokuBoard = sudoku.generate(interaction.options.getString('difficulty', true))

        const sudokuBoardSolution = sudoku.solve(sudokuBoard)

        const sudokuBoardArrays = sudoku.board_string_to_grid(sudokuBoard) as string[][]

        const width = 525
        const height = 525

        const canvas = createCanvas(width, height)

        const context = canvas.getContext("2d")

        context.fillStyle = '#000000'
        context.fillRect(0, 0, width, height)

        context.fillStyle = '#ffffff'
        context.fillRect(10, 10, 505, 505)

        for (let row = 1; row <= 9; row++) {
            context.beginPath()
            context.lineTo(10, 10 + (55 * row + Math.floor(row / 3) * 3 + (row - Math.floor(row / 3))))
            context.lineWidth = row % 3 === 0 ? 2 : 1
            context.fillStyle = row % 3 === 0 ? '#000000' : '#888888'
            context.lineTo(515, 10 + (55 * row + Math.floor(row / 3) * 3 + (row - Math.floor(row / 3))))
            context.stroke()
            context.beginPath()
            context.lineTo(10 + (55 * row + Math.floor(row / 3) * 3 + (row - Math.floor(row / 3))), 10)
            context.lineWidth = row % 3 === 0 ? 2 : 1
            context.fillStyle = row % 3 === 0 ? '#000000' : '#888888'
            context.lineTo(10 + (55 * row + Math.floor(row / 3) * 3 + (row - Math.floor(row / 3))), 515)
            context.stroke()
        }

        context.font = "50px Comic Sans"

        for (let box = 0; box < 81; box++) {
            if (sudokuBoardArrays[Math.floor(box / 9)][box % 9] !== ".") {
                context.fillStyle = '#000000'
                context.fillText(
                    sudokuBoardArrays[Math.floor(box / 9)][box % 9],
                    20 + (55 * (box % 9) + 3 * (Math.floor((box % 9) / 3)) + ((box % 9) - Math.floor((box % 9) / 3))),
                    60 + (55 * Math.floor(box / 9) + 3 * Math.floor(box / 27) + (Math.floor(box / 9) - Math.floor(box / 27)))
                )
            }
        }

        const buffer = canvas.toBuffer('image/png')

        writeFileSync('./sudoku.png', buffer)

        const sudokuImage = new AttachmentBuilder('./sudoku.png')

        const selectableSquares = sudokuBoardArrays.map((a, i1) => a.map((e, i2) => e === "." ? `${['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'][i2]}${i1 + 1}` : null).filter(notEmpty)).flat()

        const rowSelectionMenu = new SelectMenuBuilder()
            .setCustomId('row')
            .setMinValues(1)
            .setMaxValues(1)
            .setOptions(
                selectableSquares
                    .map(s => s[0])
                    .filter((elem, ind, arr) => arr.indexOf(elem) === ind)
                    .map(r => {
                        return {
                            label: `Row ${r}`,
                            value: r
                        }
                    })
            )
            .setPlaceholder('Please select a row')

        const rowSelectionRow = new ActionRowBuilder<SelectMenuBuilder>()
            .addComponents(rowSelectionMenu)

        const game = await interaction.editReply({
            content: '⚠ ***Warning** This game lacks functionality. You can check for more updates by clicking the **`Breaking Changes coming to PSWMEs, Case System, Rank Cards and Sudoku`** button below the board.*\nSquares you can select: ' + commaList(selectableSquares),
            files: [sudokuImage],
            components: interaction.guild.id !== '1000073833551769600' ? [
                rowSelectionRow,
                new ActionRowBuilder<ButtonBuilder>()
                    .addComponents(
                        new ButtonBuilder()
                            .setEmoji('⚠')
                            .setLabel('Breaking Changes coming to PSWMEs, Case System, Rank Cards, and Sudoku')
                            .setStyle(ButtonStyle.Link)
                            .setURL('https://discord.com/channels/1000073833551769600/1010853170328633394/1042885833235103804'),
                        new ButtonBuilder()
                            .setEmoji('🔗')
                            .setLabel('Join ZBot Support Server!')
                            .setStyle(ButtonStyle.Link)
                            .setURL('https://discord.gg/6tkn6m5g52')
                    )
            ] : [
                rowSelectionRow,
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

        let isEditingSquare = false

        const rowSelectionCollector = game.createMessageComponentCollector({
            componentType: ComponentType.SelectMenu,
            filter: async (button) => {
                const isBlacklist = await BlacklistModel.findOne({
                    where: {
                        id: button.user.id
                    }
                })

                if (isBlacklist) {
                    await interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle(underscore('You are blacklisted from using this bot.'))
                                .setDescription(`⛔ **You are not allowed to use the bot, or interact with its commands or message components.**`)
                                .setColor(0x000000)
                        ],
                        ephemeral: true
                    })
                    return false
                }

                if (button.user.id !== interaction.user.id) {
                    await interaction.reply({
                        content: 'These buttons are not for you!',
                        ephemeral: true
                    })
                    return false
                }

                if (isEditingSquare) {
                    await interaction.reply({
                        content: 'You\'re editing a square! Please finish editing it before proceeding to edit another.',
                        ephemeral: true
                    })
                    return false
                }

                await button.reply({
                    content: `Row ${button.values[0]} selected.`,
                    ephemeral: true
                })
                return true
            }
        })
    }
}

function notEmpty<T>(value: T | undefined | null): value is T {
    return value !== undefined && value !== null
}

type Rows = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I'
type Columns = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9

function selectSquare(row: Rows, column: Columns, sudokuBoardArrays: Array<Array<string>>) {
    const width = 525
    const height = 525

    const canvas = createCanvas(width, height)

    const context = canvas.getContext("2d")

    context.fillStyle = '#000000'
    context.fillRect(0, 0, width, height)

    context.fillStyle = '#ffffff'
    context.fillRect(10, 10, 505, 505)

    for (let row = 1; row <= 9; row++) {
        context.beginPath()
        context.lineTo(10, 10 + (55 * row + Math.floor(row / 3) * 3 + (row - Math.floor(row / 3))))
        context.lineWidth = row % 3 === 0 ? 2 : 1
        context.fillStyle = row % 3 === 0 ? '#000000' : '#888888'
        context.lineTo(515, 10 + (55 * row + Math.floor(row / 3) * 3 + (row - Math.floor(row / 3))))
        context.stroke()
        context.beginPath()
        context.lineTo(10 + (55 * row + Math.floor(row / 3) * 3 + (row - Math.floor(row / 3))), 10)
        context.lineWidth = row % 3 === 0 ? 2 : 1
        context.fillStyle = row % 3 === 0 ? '#000000' : '#888888'
        context.lineTo(10 + (55 * row + Math.floor(row / 3) * 3 + (row - Math.floor(row / 3))), 515)
        context.stroke()
    }

    context.font = "50px Comic Sans"

    for (let box = 0; box < 81; box++) {
        if (sudokuBoardArrays[Math.floor(box / 9)][box % 9] !== ".") {
            context.fillStyle = (
                Math.floor(box / 9)
            )
            ? '#0000ff'
            : '#000000'
            context.fillText(
                sudokuBoardArrays[Math.floor(box / 9)][box % 9],
                20 + (55 * (box % 9) + 3 * (Math.floor((box % 9) / 3)) + ((box % 9) - Math.floor((box % 9) / 3))),
                60 + (55 * Math.floor(box / 9) + 3 * Math.floor(box / 27) + (Math.floor(box / 9) - Math.floor(box / 27)))
            )
        }
    }

    const buffer = canvas.toBuffer('image/png')

    writeFileSync('./sudoku.png', buffer)

    const sudokuImage = new AttachmentBuilder('./sudoku.png')

    return sudokuImage
}

export {
    sudokuCommand
}