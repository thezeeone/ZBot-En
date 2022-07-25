import { getVoiceConnection } from '@discordjs/voice'
import { ChatInputCommandInteraction, GuildMember } from 'discord.js'
import { Cmd, queue } from './command-exports'

const stopCommand: Cmd = {
  data: {
    name: 'stop',
    description: 'Stop the current song, clear the queue and leave'
  },
  async execute(interaction: ChatInputCommandInteraction<"cached">) {
    // Check the user is in VC
    if (!interaction.member.voice?.channel) return await interaction.reply({
      content: 'You must be in VC for this command to work!',
      ephemeral: true
    })

    // Get the connection, if any
    const connection = getVoiceConnection(interaction.guild.id)

    if (connection) {
      if ((<GuildMember>interaction.guild.members.me).voice.channel?.id === interaction.member.voice.channel?.id) {
        await interaction.reply('Leaving voice chat...')
        queue.clear()
        connection.destroy()
        await interaction.editReply('Successfully left voice chat. Queue has been cleared.')
      } else return await interaction.reply({
        content: 'You must be in the same voice chat as the bot for this to work.',
        ephemeral: true
      })
    } else {
      return await interaction.reply({
        content: 'This bot is not in a voice chat!',
        ephemeral: true
      })
    }
  }
}

export {
  stopCommand
}
