import { AttachmentBuilder, ChatInputCommandInteraction } from "discord.js"
import { Cmd, tipsAndTricks } from "./command-exports"
// @ts-ignore
import { createCanvas, registerFont, loadImage } from "canvas"
import { writeFileSync } from "fs"
import { LevelModel, RankCardModel } from "../database"

registerFont('fonts/static/Rubik-Bold.ttf', { family: 'Rubik', weight: '400', style: 'Bold' })

const imageCommand: Cmd = {
    data: {
        name: 'pic',
        description: 'Create a picture! (beta)',
    },
    async execute(interaction: ChatInputCommandInteraction<"cached">) {
        await interaction.deferReply()

        try {
            const width = 512
            const height = 256
    
            const canvas = createCanvas(width, height)
    
            const context = canvas.getContext("2d")

            const userRankCard = await LevelModel.findOne({
                where: {
                    id: interaction.user.id
                }
            })

            const userRankCardModel = await RankCardModel.findOne({
                where: {
                    id: interaction.user.id
                }
            })

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

            context.fillStyle = (userRankCardModel?.colour) ? `#${userRankCardModel.colour.toString(16)}` : "#00ffff"
            context.fillRect(10, 192, Math.floor(XP && XPToNextLevel ? (XP / XPToNextLevel) * total : 0), 10)

            context.fillStyle = '#ffffff'
            context.fillRect(Math.floor(XP && XPToNextLevel ? (XP / XPToNextLevel) * total : 0), 192, Math.floor(XP && XPToNextLevel ? ((XPToNextLevel - XP) / XPToNextLevel) * total : 0), 10)

            context.font = '20px "Rubik"'
            context.textAlign = 'left'
            context.fillStyle = '#ffffff'
            context.fillText('Level', 10, 187)

            context.textAlign = 'left'
            context.fillStyle = (userRankCardModel?.colour) ? `#${userRankCardModel.colour.toString(16)}` : "#00ffff"

            context.fillText(`${userRankCard?.lvl || '0'}`, 65, 187)

            context.font = '15px "Rubik"'
            context.textAlign = 'right'
            context.fillStyle = '#ffffff'

            context.fillText(`/${XPToNextLevel}`, 502, 187)

            context.font = '20px "Rubik"'
            context.textAlign = 'right'
            context.fillStyle = (userRankCardModel?.colour) ? `#${userRankCardModel.colour.toString(16)}` : "#00ffff"

            context.fillText(XP.toString(), 502 - (10 + XPToNextLevel.toString().length * 9.5), 187)

            context.beginPath()
            context.arc(circle.x, circle.y, circle.r, 0, Math.PI * 2, true)
            context.closePath()
            context.clip()

            if (Math.random() < 0.1) {
                const randomFact = tipsAndTricks[Math.floor(Math.random() * tipsAndTricks.length)]

                context.font = '10px "Rubik"'
                context.textAlign = 'left'
                context.fillStyle = '#ffd700'

                context.fillText('Did you know?', 10, 187)
                
                context.font = '15px "Rubik"'
                context.fillStyle = '#ffffff'
                
                context.fillText(randomFact, 10, 212, 492)
            }

            try {
                const avatar = await loadImage(interaction.user.displayAvatarURL({ forceStatic: true }).replace(/(webm|webp)/g, 'jpg'))

                const aspect = avatar.height / avatar.width

                const hsx = circle.r * Math.max(1 / aspect, 1)
                const hsy = circle.r * Math.max(aspect, 1)

                context.drawImage(avatar, circle.x - hsx, circle.y - hsy, hsx * 2, hsy * 2)
            } finally {
                const buffer = canvas.toBuffer("image/png")
        
                writeFileSync("./image.png", buffer)
        
                const file = new AttachmentBuilder("./image.png")
        
                await interaction.editReply({
                    content: 'This is your image!\n\n⚠ **__Warning:__ this is an experimental feature and may break while in use; please use this command __at the bot\'s own risk__.** Some buttons, select menus or features may fail, cause the command to behave strangely, or even worse, cause the bot to crash entirely. If using this command, we advise you use this **at the bot\'s own risk**.',
                    files: [
                        file
                    ]
                })
            }

            return
        } catch (error) {
            console.error(error)
            return await interaction[interaction.replied ? 'followUp' : 'editReply']({
                content: 'An error occured while trying to send the image.\n\n⚠ **__Warning:__ this is an experimental feature and may break while in use; please use this command __at the bot\'s own risk__.** Some buttons, select menus or features may fail, cause the command to behave strangely, or even worse, cause the bot to crash entirely. If using this command, we advise you use this **at the bot\'s own risk**.',
                ephemeral: true 
            })
        }
    }
}

export {
    imageCommand
}