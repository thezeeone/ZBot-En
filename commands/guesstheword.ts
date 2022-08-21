import { ComponentType, EmbedBuilder, ApplicationCommandOptionType, ChatInputCommandInteraction, bold, inlineCode, italic, ButtonBuilder, ButtonStyle, ActionRowBuilder, APIEmbedField, APIButtonComponentWithCustomId } from "discord.js"
import { Cmd } from "./command-exports"
import { LevelModel } from "../database"

const gtwCommand: Cmd = {
    data: {
        name: 'guess-the-word',
        description: 'Can you guess the word?!?',
        options: [
            {
                name: 'word-or-sentence',
                description: 'The word or sentence',
                type: ApplicationCommandOptionType.String,
                required: true
            },
            {
                name: 'clue-1',
                description: 'The first clue users can get',
                type: ApplicationCommandOptionType.String,
                required: false
            },
            {
                name: 'clue-2',
                description: 'The second clue users can get',
                type: ApplicationCommandOptionType.String,
                required: false
            },
            {
                name: 'clue-3',
                description: 'The third clue users can get',
                type: ApplicationCommandOptionType.String,
                required: false
            }
        ]
    },
    async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<any> {
        const wordOrSentence = interaction.options.getString('word-or-sentence', true).replace(/\s+/, () => ' ')

        if (wordOrSentence.length < 2) return await interaction.reply({
            content: 'String must be at least 2 characters long.',
            ephemeral: true
        })

        const matchedWords = wordOrSentence.match(/([^\s]+)/g) as RegExpMatchArray

        let correctCharacters: string[] = []
        let incorrectCharacters: string[] = []
        let layOut: string[][] = matchedWords.map(s => s.split('').map(n => n === ' ' ? ' ' : '_'))
        let wordLength = wordOrSentence.length
        let numDistinctChars = [... new Set(wordOrSentence.split(''))].length
        let numGuesses: number = 
        (wordLength < 7)
        ? (20 - ((8 - numDistinctChars) * 2)) + numDistinctChars
        : (
            (wordLength >= 7 && numDistinctChars <= 12)
            ? (((wordLength * 2 - 7) + numDistinctChars) > 45 ? 38 : ((wordLength * 2 - 7) + numDistinctChars))
            : (
                2 * (numDistinctChars + Math.floor(wordLength / 3)) - 5 > 62 ? 53 : 2 * (numDistinctChars + Math.floor(wordLength / 3)) - 5
            )
        )
        const totalGuesses = numGuesses
        const clues = [
            { clue: interaction.options.getString('clue-1'), revealed: false, index: 0 },
            { clue: interaction.options.getString('clue-2'), revealed: false, index: 1 },
            { clue: interaction.options.getString('clue-3'), revealed: false, index: 2 },
        ].filter(s => notEmpty(s.clue)) as ({ clue: string, revealed: boolean, index: number })[]

        const clueButtons = clues.map(
            (_, i) => new ButtonBuilder()
            .setCustomId((i + 1).toString())
            .setStyle(ButtonStyle.Primary)
            .setLabel(`Clue ${i + 1}`)
        )

        let embed = new EmbedBuilder()
        .setColor(0x00ffff)
        .setTitle('Guess The Word')
        .setDescription(`${bold('Word or Sentence')} ${inlineCode(layOut.map(s => s.join(' ')).join('  '))}\n\n${italic('Can you guess this one...? Simply type in either a letter, word or part of the sentence in chat to see if it\'s included, or if you can, try and guess the entire word/statement and gain experience points!\nCase-sensitive')}`)
        .setAuthor({ name: `${interaction.user.tag} (${interaction.user.id})`, iconURL: interaction.user.displayAvatarURL() })
        .addFields([
            { name: 'Guesses Remaining', value: String(numGuesses), inline: true },
            { name: 'Correct Characters', value: correctCharacters.length === 0 ? 'none' : correctCharacters.map(s => inlineCode(s)).join(' '), inline: true },
            { name: 'Incorrect Characters', value: incorrectCharacters.length === 0 ? 'none' : incorrectCharacters.map(s => inlineCode(s)).join(' '), inline: true },
            { name: 'Clues', value: 'none' }
        ])

        let actionRow = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(clueButtons)

        await interaction.reply({
            content: 'Let the game begin!',
            ephemeral: true
        })

        const cancelButton = new ButtonBuilder()
        .setCustomId('cancel')
        .setLabel('Cancel')
        .setStyle(ButtonStyle.Danger)

        let cancelButtonActionRow = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            cancelButton
        )

        const game = await interaction.followUp({
            embeds: [
                embed
            ],
            components: clues.length ? [
                actionRow,
                cancelButtonActionRow
            ] : [ cancelButtonActionRow ],
            fetchReply: true
        })

        const messageCollector = game.channel.createMessageCollector()

        const buttonCollector = game.createMessageComponentCollector({
            componentType: ComponentType.Button
        })

        buttonCollector.on('collect', async (btn): Promise<any> => {
            if (btn.customId === 'cancel') {
                messageCollector.stop()
                cancelButton.setDisabled(true)
                actionRow.components.map(s => s.setDisabled(true))
                cancelButtonActionRow.components.map(s => s.setDisabled(true))
                embed
                .setColor(0xff0000)
                .setTitle('Guess The Word - Game Cancelled')
                .setDescription(`${btn.user} cancelled the game.`)
                .setFields([])
                game.edit({
                    embeds: [embed],
                    components: clues.length ? [
                        actionRow,
                        cancelButtonActionRow
                    ] : [cancelButtonActionRow]
                })
                btn.reply('Game cancelled.')
            } else {
                btn.reply({
                    content: 'Clue revealed.',
                    ephemeral: true
                })
                clues[
                    actionRow.components.map(r => (r.data as Partial<APIButtonComponentWithCustomId>).custom_id)
                    .indexOf(btn.customId)
                ].revealed= true
                actionRow.components.map(
                    (r, i) => {
                        return (
                            (r.data as Partial<APIButtonComponentWithCustomId>).custom_id === btn.customId
                            || clues[i].revealed
                        )
                        ? r
                        .setDisabled(true)
                        .setLabel('Clue revealed!')
                        .setStyle(ButtonStyle.Secondary)
                        : r
                    }
                )
                game.edit({
                    embeds: [
                        EmbedBuilder.from(game.embeds[0]).setFields(
                            { name: 'Guesses Remaining', value: String(numGuesses), inline: true },
                            { name: 'Correct Characters', value: correctCharacters.length === 0 ? 'none' : correctCharacters.map(s => inlineCode(s)).join(' '), inline: true },
                            { name: 'Incorrect Characters', value: incorrectCharacters.length === 0 ? 'none' : incorrectCharacters.map(s => inlineCode(s)).join(' '), inline: true },
                            { name: 'Clues', value: clues.filter(c => c.revealed).length
                                ? clues.filter(c => c.revealed).map((c, i) => `${bold((c.index + 1).toString())} ${italic(c.clue)}`).join('\n')
                                : 'none'
                            }
                        )
                    ],
                    components: clues.length ? [
                        actionRow,
                        cancelButtonActionRow
                    ] : [ cancelButtonActionRow ]
                })
            }
        })

        messageCollector.on('collect', async (msg): Promise<any> => {
            if (
                msg.author.id === interaction.user.id 
                || msg.author.id === interaction.client.user?.id 
            ) return
            if (msg.content.replace(/\s+/g, () => ' ') === wordOrSentence) {
                embed
                .setColor(0x00ff00)
                .setTitle('Guess The Word - game successful!')
                .setDescription(`${bold('The word/sentence has been guessed! It was...')}\n${inlineCode(wordOrSentence)}\n\nCongratulations ${msg.author}, you won!`)
                .setFields([])
                msg.reply(`Congratulations, you guessed it! Click here to jump to original game: ${game.url}\nYou will gain **${inlineCode(String(numGuesses * 15))} experience points**.`)
                LevelModel.increment({
                    xp: numGuesses * 15
                }, {
                    where: {
                        id: msg.author.id
                    }
                })               
                game.edit({ embeds: [embed], components: [] })
                messageCollector.stop()
                buttonCollector.stop()
            } else if (msg.content.length === 1) {
                const letter = msg.content
                if (correctCharacters.includes(letter)) {
                    const rpl = await msg.reply( 
                        'This letter is already one of the correct letters!'
                    )
                    setTimeout(() => rpl.delete(), 750)
                } else if (incorrectCharacters.includes(letter)) {
                    const rpl = await msg.reply( 
                        'This letter is already one of the incorrect letters!'
                    )
                    setTimeout(() => rpl.delete(), 750)  
                } else if (wordOrSentence.includes(letter)) {
                    correctCharacters.push(letter)
                    layOut = matchedWords.map(s => s.split('').map(n => correctCharacters.includes(n) ? n : (n === ' ' ? ' ' : '_')))
                    embed
                    .setDescription(`${bold('Word or Sentence')} ${inlineCode(layOut.map(s => s.join(' ')).join('  '))}\n\n${italic('Can you guess this one...? Simply type in either a letter, word or part of the sentence in chat to see if it\'s included, or if you can, try and guess the entire word/statement and gain experience points!\nCase-sensitive')}`)
                    .setFields([
                        { name: 'Guesses Remaining', value: String(numGuesses), inline: true },
                        { name: 'Correct Characters', value: correctCharacters.length === 0 ? 'none' : correctCharacters.map(s => inlineCode(s)).join('  '), inline: true },
                        { name: 'Incorrect Characters', value: incorrectCharacters.length === 0 ? 'none' : incorrectCharacters.map(s => inlineCode(s)).join('  '), inline: true },
                        { name: 'Clues', value: clues.filter(c => c.revealed).length
                                ? clues.filter(c => c.revealed).map((c, i) => `${bold((c.index + 1).toString())} ${italic(c.clue)}`).join('\n')
                                : 'none'
                            }
                    ])
                    game.edit({ embeds: [embed] })
                    const rpl = await msg.reply({ content: 'Nice!' })
                    setTimeout(() => { rpl.delete(); msg.delete() }, 750)
                    if (layOut.flat().flat().every(s => s !== '_')) {
                        embed
                        .setColor(0x00ff00)
                        .setTitle('Guess The Word - game successful!')
                        .setDescription(`${bold('The word/sentence has been guessed! It was...')}\n${inlineCode(wordOrSentence)}\n\nCongratulations ${msg.author}, you won!`)
                        .setFields([])
                        game.edit({ embeds: [embed] })
                        await msg.reply(`Congratulations, you guessed it! Click here to jump to original game: ${game.url}\nYou will gain **${inlineCode(String(numGuesses * 5))} experience points**.`)
                        LevelModel.increment({
                            xp: numGuesses * 5
                        }, {
                            where: {
                                id: msg.author.id
                            }
                        })
                        messageCollector.stop()
                        buttonCollector.stop()
                    }
                } else {
                    numGuesses -= 1
                    incorrectCharacters.push(letter)
                    embed
                    .setDescription(`${bold('Word or Sentence')} ${inlineCode(layOut.map(s => s.join(' ')).join('  '))}\n\n${italic('Can you guess this one...? Simply type in either a letter, word or part of the sentence in chat to see if it\'s included, or if you can, try and guess the entire word/statement!\nCase-sensitive')}`)
                    .setFields([
                        { name: 'Guesses Remaining', value: String(numGuesses), inline: true },
                        { name: 'Correct Characters', value: correctCharacters.length === 0 ? 'none' : correctCharacters.map(s => inlineCode(s)).join(' '), inline: true },
                        { name: 'Incorrect Characters', value: incorrectCharacters.length === 0 ? 'none' : incorrectCharacters.map(s => inlineCode(s)).join(' '), inline: true },
                        { name: 'Clues', value: clues.filter(c => c.revealed).length
                                ? clues.filter(c => c.revealed).map((c, i) => `${bold((c.index + 1).toString())} ${italic(c.clue)}`).join('\n')
                                : 'none'
                            }
                    ])
                    .setColor((numGuesses / totalGuesses) < 0.5 ? [0xff9900, 0xff8800, 0xff7700, 0xff6600, 0xff5500, 0xff4400, 0xff3300, 0xff2200, 0xff1100, 0xff0000][10 - Math.floor((numGuesses / totalGuesses) * 20)] : 0x00ffff)
                    game.edit({ embeds: [embed] })
                    const rpl = await msg.reply({ content: 'Nice try, but not quite...' })
                    setTimeout(() => { rpl.delete(); msg.delete() }, 750)
                    if (numGuesses === 0) {
                        embed
                        .setDescription(`${bold('')}`)
                        .setFields([])
                        .setTitle('Guess The Word - game unsuccessful')
                        .setColor(0xff0000)
                        .setDescription(`${bold('The word/sentence was...')}\n${inlineCode(wordOrSentence)}\n\nToo many incorrect guesses! Better luck next time...`)
                        
                        game.edit({
                            embeds: [embed],
                            components: []
                        })

                        messageCollector.stop()
                        buttonCollector.stop()
                    }
                }
            } else {
                const letters = msg.content
                if (!wordOrSentence.includes(letters)) {
                    const rpl = await msg.reply(
                        'This word/group of letters isn\'t in the original word/sentence!'
                    )
                    return setTimeout(() => rpl.delete(), 750)
                } else if (letters.split('').filter(s => s !== ' ').every(s => correctCharacters.includes(s))) {
                    const rpl = await msg.reply( 
                        'These letters are already correct letters!'
                    )
                    setTimeout(() => rpl.delete(), 750)
                } else if (letters.split('').filter(s => s !== ' ').every(s => incorrectCharacters.includes(s))) {
                    const rpl = await msg.reply( 
                        'These letter is already one of the incorrect letters!'
                    )
                    setTimeout(() => rpl.delete(), 750)  
                } else if (wordOrSentence.includes(letters)) {
                    correctCharacters.push(...letters.split('').filter(s => s !== ' '))
                    layOut = matchedWords.map(s => s.split('').map(n => correctCharacters.includes(n) ? n : (n === ' ' ? ' ' : '_')))
                    embed
                    .setDescription(`${bold('Word or Sentence')} ${inlineCode(layOut.map(s => s.join(' ')).join('  '))}\n\n${italic('Can you guess this one...? Simply type in either a letter, word or part of the sentence in chat to see if it\'s included, or if you can, try and guess the entire word/statement and gain experience points!\nCase-sensitive')}`)
                    .setFields([
                        { name: 'Guesses Remaining', value: String(numGuesses), inline: true },
                        { name: 'Correct Characters', value: correctCharacters.length === 0 ? 'none' : correctCharacters.map(s => inlineCode(s)).join('  '), inline: true },
                        { name: 'Incorrect Characters', value: incorrectCharacters.length === 0 ? 'none' : incorrectCharacters.map(s => inlineCode(s)).join('  '), inline: true },
                        { name: 'Clues', value: clues.filter(c => c.revealed).length
                                ? clues.filter(c => c.revealed).map((c, i) => `${bold((c.index + 1).toString())} ${italic(c.clue)}`).join('\n')
                                : 'none'
                            }
                    ])
                    game.edit({ embeds: [embed] })
                    const rpl = await msg.reply({ content: 'Nice!' })
                    setTimeout(() => { rpl.delete(); msg.delete() }, 750)
                    if (layOut.flat().flat().every(s => s !== '_')) {
                        embed
                        .setColor(0x00ff00)
                        .setTitle('Guess The Word - game successful!')
                        .setDescription(`${bold('The word/sentence has been guessed! It was...')}\n${inlineCode(wordOrSentence)}\n\nCongratulations ${msg.author}, you won!`)
                        .setFields([])
                        game.edit({ embeds: [embed] })
                        await msg.reply(`Congratulations, you guessed it! Click here to jump to original game: ${game.url}\nYou will gain **${inlineCode(String(numGuesses * 5))} experience points**.`)
                        LevelModel.increment({
                            xp: numGuesses * 5
                        }, {
                            where: {
                                id: msg.author.id
                            }
                        })
                        messageCollector.stop()
                        buttonCollector.stop()
                    }
                }
            }
        })
    }
}

function notEmpty<T>(value: T | undefined | null): value is T {
    return value !== undefined && value !== null
}

export {
    gtwCommand
}
