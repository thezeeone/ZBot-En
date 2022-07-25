import { AudioPlayerStatus, createAudioPlayer, createAudioResource, getVoiceConnection } from '@discordjs/voice'
import { ApplicationCommandOptionType, ChatInputCommandInteraction, Formatters, GuildMember, TextChannel, User, VoiceChannel } from 'discord.js'
import { Cmd, queue } from './command-exports'
import { join } from 'node:path'

const skipCommand: Cmd = {
  data: {
    name: 'skip',
    description: 'Skip the currently playing song',
    options: [
      {
        name: 'to-position',
        description: 'Skip to a specific position',
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: 'position',
            description: 'The position in the queue to skip to',
            type: ApplicationCommandOptionType.Integer,
            minValue: 1,
            required: true
          }
        ]
      },
      {
        name: 'next-song',
        description: 'Skip to the next song',
        type: ApplicationCommandOptionType.Subcommand
      }
    ]
  },
  async execute(interaction: ChatInputCommandInteraction<'cached'>) {
    // Check if the bot is in any connection at all
    const connection = getVoiceConnection(interaction.guild.id)

    if (!connection) return await interaction.reply({
      content: 'This bot is not in a voice chat!',
      ephemeral: true
    })

    // Check the queue isn't empty
    if (!queue.size) return await interaction.reply({
      content: 'The queue is empty!',
      ephemeral: true
    })

    // Input
    const subcommand = interaction.options.getSubcommand(true)

    if (subcommand === 'next-song') {
      await interaction.reply('Stopping current song, and skipping to next...')
      queue.delete(queue.keys()[0])

    } else {
      const position = interaction.options.getInteger('position') as number

      if (position > queue.size) return await interaction.reply({
        content: 'Cannot access the position of a song that\'s outside the queue.',
        ephemeral: true
      })

      // Skip these songs
      queue.sweep( (_, _0, col) => !([...col.values()].map((_, ind) => ind < position)) )

      const player = createAudioPlayer()

      // Stop the currently playing song
      player.stop()

      // Edit the reply
      
      const resource = createAudioResource(join(__dirname, queue.first()))
      
      // Play the user's song
      player.play(resource)

      await interaction.editReply(`Skipped ${Formatters.bold(`${Formatters.inlineCode(position.toString())} song(s)`)}.\n${queue.firstKey() instanceof User ? (queue.firstKey() as User).id : `<@${queue.firstKey()}>`} Now playing your song (${queue.first()}).`)

      // Continue with the rest of the songs
      player.on(AudioPlayerStatus.Idle, async () => {
        queue.delete(queue.keys()[0])
  
        // Check for empty queue
        if (!queue.size) {
          // Stop the player, destroy the connection
          player.stop(true)
          connection.destroy()
          await interaction.followUp('Left voice chat, queue empty.')
        } else {
          // Play next song
          let nextSong = [queue.firstKey(), queue.first()]
          let newResource = createAudioResource(join(__dirname, `./ytfiles/${nextSong[1]}`))
          player.play(newResource)
          await (<TextChannel>interaction.channel).send(`${interaction.user} Now playing your song (https://youtube.com/watch?v=${nextSong[1]}) in voice chat 🔊 ${Formatters.bold((<VoiceChannel>(interaction.guild.members.me as GuildMember).voice.channel).name)}`)
        }
      })
    }
  }
}

export {
  skipCommand
}
