import { AttachmentBuilder, ChatInputCommandInteraction } from "discord.js"
import { Cmd } from "./command-exports"
// @ts-ignore
import { createCanvas } from "canvas"
import { writeFileSync } from "fs"
import { LevelModel, RankCardModel } from "../database"

const imageCommand: Cmd = {
    data: {
        name: 'pic',
        description: 'Create a picture! (beta)',
    },
    async execute(interaction: ChatInputCommandInteraction<"cached">) {
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
    
            context.fillStyle = "#282b30"
            context.fillRect(0, 0, width, height)

            context.fillStyle = (userRankCardModel?.colour) ? `#${userRankCardModel.colour.toString(16)}` : "#0ff"
            context.fillRect(10, 192, Math.floor(XP && XPToNextLevel ? (XP / XPToNextLevel) * total : 0), 10)

            context.fillStyle = '#fff'
            context.fillRect(Math.floor(XP && XPToNextLevel ? (XP / XPToNextLevel) * total : 0), 192, Math.floor(XP && XPToNextLevel ? ((XPToNextLevel - XP) / XPToNextLevel) * total : 0), 10)

            context.fillStyle = '#000001'
            drawRoundRectangle(context, 10, 208, 501, 10, 5)

            // context.font = '20px Ubuntu'
            context.font = '20px Rubik'
            context.textAlign = 'left'
            context.fillStyle = (userRankCardModel?.colour) ? `#${userRankCardModel.colour.toString(16)}` : "#0ff"

            context.fillText(`${userRankCard?.lvl || 'level undeterminable'}`, 10, 187)

            const buffer = canvas.toBuffer("image/png")
    
            writeFileSync("./image.png", buffer)
    
            const file = new AttachmentBuilder("./image.png")
    
            await interaction.reply({
                content: 'This is your image!\n\n⚠ **__Warning:__ this is an experimental feature and may break while in use; please use this command __at the bot\'s own risk__.** Some buttons, select menus or features may fail, cause the command to behave strangely, or even worse, cause the bot to crash entirely. If using this command, we advise you use this **at the bot\'s own risk**.',
                files: [
                    file
                ]
            })

            return
        } catch (error) {
            console.error(error)
            return await interaction.reply({
                content: 'An error occured while trying to send the image.\n\n⚠ **__Warning:__ this is an experimental feature and may break while in use; please use this command __at the bot\'s own risk__.** Some buttons, select menus or features may fail, cause the command to behave strangely, or even worse, cause the bot to crash entirely. If using this command, we advise you use this **at the bot\'s own risk**.',
                ephemeral: true 
            })
        }
    }
}

function drawRoundRectangle(
    context: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number    
) {
    if (w < 2 * r) r = w / 2
    if (h < 2 * r) r = h / 2
    context.beginPath()
    context.moveTo(x+r, y)
    context.beginPath()
    context.moveTo(x+r, y)
    context.arcTo(x+w, y,   x+w, y+h, r)
    context.arcTo(x+w, y+h, x,   y+h, r)
    context.arcTo(x,   y+h, x,   y,   r)
    context.arcTo(x,   y,   x+w, y,   r)
    context.closePath()
    return context
}


export {
    imageCommand
}