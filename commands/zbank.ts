import { ActionRowBuilder, ApplicationCommandOptionType, bold, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, Guild, inlineCode, time } from "discord.js"
import { EconomyModel, LevelModel, ZBankCooldowns, ZCentralBankModel } from "../database"
import { Cmd } from "./command-exports"

const zBankCommand: Cmd = {
    data: {
        name: 'zbank',
        description: 'How much does ZBank have, I wonder?',
        options: [
            {
                name: 'amount',
                description: 'The amount of ZCoins to withdraw from ZBank',
                type: ApplicationCommandOptionType.Integer,
                minValue: 1,
                maxValue: 2500,
                required: false
            }
        ]
    },
    async execute(interaction: ChatInputCommandInteraction<"cached">) {
        const guild = interaction.client.guilds.cache.get('1000073833551769600') as Guild

        const userLevel = await LevelModel.findOne({
            where: {
                id: interaction.user.id
            }
        }) || await LevelModel.create({
            id: interaction.user.id,
            lvl: 0,
            xp: 0
        })

        const totalToWithdraw = interaction.options.getInteger('amount')

        if (Date.now() < 1667759400000) {
            return await interaction.reply({
                content: `This command is only usable **after <t:1667759400:F>** (<t:1667759400:R>, 30 minutes after the ZBank has been introduced).\nℹ *ZBank will gain money again ${time(
                    Math.floor(new Date(new Date().setHours(6 * Math.floor(new Date().getUTCHours() / 6 + 1), 0, 0, 0)).getTime() / 1000),
                    'R'
                )}.*`,
                ephemeral: true,
                components: interaction.guild.id !== '1000073833551769600'
                    ? [
                        new ActionRowBuilder<ButtonBuilder>()
                            .addComponents(
                                new ButtonBuilder()
                                    .setEmoji('🔗')
                                    .setLabel('Join ZBot Support Server!')
                                    .setStyle(ButtonStyle.Link)
                                    .setURL('https://discord.gg/6tkn6m5g52')
                            )
                    ]
                    : []
            })
        } else {
            if (totalToWithdraw) {
                const userCooldown = await ZBankCooldowns.findOne({ where: { user: interaction.user.id } })
                if (
                    userCooldown && Date.now()
                    - (
                        userCooldown.lastTimestamp?.getTime() || 0
                    ) <= 10800000
                ) {
                    return await interaction.reply({
                        content: `You\'ve already withdrawn from the ZBank ${time(
                            Math.floor(userCooldown.lastTimestamp.getTime() / 1000),
                            'R'
                        )}, you can withdraw again ${time(
                            Math.floor((userCooldown.lastTimestamp.getTime() + 10800000) / 1000),
                            'R'
                        )}.\nℹ *ZBank will gain money again ${time(
                            Math.floor(new Date(new Date().setHours(6 * Math.floor(new Date().getUTCHours() / 6 + 1), 0, 0, 0)).getTime() / 1000),
                            'R'
                        )}.*`,
                        components: interaction.guild.id !== '1000073833551769600'
                            ? [
                                new ActionRowBuilder<ButtonBuilder>()
                                    .addComponents(
                                        new ButtonBuilder()
                                            .setEmoji('🔗')
                                            .setLabel('Join ZBot Support Server!')
                                            .setStyle(ButtonStyle.Link)
                                            .setURL('https://discord.gg/6tkn6m5g52')
                                    )
                            ]
                            : [],
                        fetchReply: true
                    }).then((reply) => {
                        setTimeout(async () => {
                            try {
                                reply.delete()
                            } catch {
                                return
                            }
                        }, 10000)
                    })
                } else {
                    const userBank = await EconomyModel.findOne({
                        where: {
                            id: interaction.user.id
                        }
                    }) || await EconomyModel.create({
                        wallet: 0,
                        maxWallet: (
                            guild.members.cache.get(interaction.user.id)?.premiumSinceTimestamp
                                ? (100 * 6 * (userLevel.lvl + 2))
                                : (100 * 4 * (userLevel.lvl + 1))
                        ),
                        maxBank: (
                            guild.members.cache.get(interaction.user.id)?.premiumSinceTimestamp
                                ? (100 * 12 * (userLevel.lvl + 2))
                                : (100 * 8 * (userLevel.lvl + 1))
                        ),
                        bank: 0,
                        id: interaction.user.id
                    })


                    if ((await ZCentralBankModel.findAll())[0].original <= 200) return await interaction.reply(`ZBank is bankrupt with less than 200 Z:coin:! Please wait until it gains money again ${time(
                        Math.floor((Math.floor(new Date(new Date().setHours(6 * Math.floor(new Date().getUTCHours() / 6 + 1), 0, 0, 0)).getTime() / 1000) - Date.now()) / 1000),
                        'R'
                    )}.`)

                    if (totalToWithdraw > userBank.maxBank - userBank.bank) return await interaction.reply({
                        content: `You ${userBank.maxBank - userBank.bank > 0
                            ? `only have ${bold(`${inlineCode((userBank.maxBank - userBank.bank).toLocaleString('ru'))} Z🪙`)}`
                            : 'don\'t have any available space for'
                            } ZBank coins to be stored in your bank. If possible, withdraw enough for there to be avaiable space, then try again.\nℹ *ZBank will gain money again ${time(
                                Math.floor(new Date(new Date().setHours(6 * Math.floor(new Date().getUTCHours() / 6 + 1), 0, 0, 0)).getTime() / 1000),
                                'R'
                            )}.*`,
                        components: interaction.guild.id !== '1000073833551769600'
                            ? [
                                new ActionRowBuilder<ButtonBuilder>()
                                    .addComponents(
                                        new ButtonBuilder()
                                            .setEmoji('🔗')
                                            .setLabel('Join ZBot Support Server!')
                                            .setStyle(ButtonStyle.Link)
                                            .setURL('https://discord.gg/6tkn6m5g52')
                                    )
                            ]
                            : [],
                        ephemeral: true
                    })

                    userBank.increment({
                        bank: totalToWithdraw
                    }).then(async () => {
                        (await ZCentralBankModel.findAll())[0].increment({
                            timesUsedInDay: 1,
                            moneyTaken: totalToWithdraw,
                            original: -totalToWithdraw
                        })

                        if (await ZBankCooldowns.findOne({ where: { user: interaction.user.id } })) {
                            await ZBankCooldowns.update({
                                lastTimestamp: new Date()
                            }, {
                                where: {
                                    user: interaction.user.id,
                                }
                            })
                        } else {
                            await ZBankCooldowns.create({
                                user: interaction.user.id,
                                lastTimestamp: new Date()
                            })
                        }

                        await interaction.reply({
                            content: `Successfully withdrawn ${bold(`${inlineCode(totalToWithdraw.toLocaleString('ru'))} Z🪙`)} from ZBank to your bank. You can withdraw again at ${time(
                                Math.floor((Date.now() + 10800000) / 1000),
                                't'
                            )} (${time(
                                Math.floor((Date.now() + 10800000) / 1000),
                                'R'
                            )}).\nℹ *ZBank will gain money again ${time(
                                Math.floor(new Date(new Date().setHours(6 * Math.floor(new Date().getUTCHours() / 6 + 1), 0, 0, 0)).getTime() / 1000),
                                'R'
                            )}.*`
                        })
                    })
                        .catch(async (error) => {
                            console.log(error)
                            await interaction.reply({
                                content: `${error.message}\nℹ *ZBank will gain money again ${time(
                                    Math.floor(new Date(new Date().setHours(6 * Math.floor(new Date().getUTCHours() / 6 + 1), 0, 0, 0)).getTime() / 1000),
                                    'R'
                                )}.*`,
                                components: interaction.guild.id !== '1000073833551769600'
                                    ? [
                                        new ActionRowBuilder<ButtonBuilder>()
                                            .addComponents(
                                                new ButtonBuilder()
                                                    .setEmoji('🔗')
                                                    .setLabel('Join ZBot Support Server!')
                                                    .setStyle(ButtonStyle.Link)
                                                    .setURL('https://discord.gg/6tkn6m5g52')
                                            )
                                    ]
                                    : [],
                                ephemeral: true
                            })
                        })
                }
            } else return await interaction.reply({
                content: `${(await ZCentralBankModel.findAll())[0].original > 200
                    ? `ZBank has ${bold(`${inlineCode((await ZCentralBankModel.findAll())[0].original.toLocaleString('ru'))} Z🪙`)}.`
                    : (await ZCentralBankModel.findAll())[0].original === 0
                        ? 'ZBank has no money. Why are you all so greedy. 😭'
                        : `ZBank is bankrupt! It has only ${bold(`${inlineCode((await ZCentralBankModel.findAll())[0].original.toLocaleString('ru'))} Z🪙`)} left - users cannot withdraw until it has more money.`
                    }\nℹ *ZBank will gain money again ${time(
                        Math.floor(new Date(new Date().setHours(6 * Math.floor(new Date().getUTCHours() / 6 + 1), 0, 0, 0)).getTime() / 1000),
                        'R'
                    )}.*`,
                components: interaction.guild.id !== '1000073833551769600'
                    ? [
                        new ActionRowBuilder<ButtonBuilder>()
                            .addComponents(
                                new ButtonBuilder()
                                    .setEmoji('🔗')
                                    .setLabel('Join ZBot Support Server!')
                                    .setStyle(ButtonStyle.Link)
                                    .setURL('https://discord.gg/6tkn6m5g52')
                            )
                    ]
                    : []
            })
        }
    }
}

export {
    zBankCommand
}