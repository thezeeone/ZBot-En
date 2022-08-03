import { ApplicationCommandOptionType, ChatInputCommandInteraction, EmbedBuilder, inlineCode } from "discord.js";
import { Cmd } from "./command-exports";

const playCommand: Cmd = {
    data: {
        name: 'play',
        description: 'Play music in voice chat',
        options: [
            {
                name: 'link',
                description: 'Enter YouTube link (spotify support coming soon)',
                type: ApplicationCommandOptionType.String,
                required: true
            }
        ]
    },
    async execute(interaction: ChatInputCommandInteraction<"cached">) {
        const link = interaction.options.getString('link', true)
        
        const videoId = link.match(/^(?:https?:\/\/)?(?:(?:www\.|m\.)?youtu\.?be(?:-nocookie)?(?:\.com)?)\/(?:(?:watch\?v=|embed\/|v\/)?([\w\d-]+))$/)?.[1]

        if (!videoId) return await interaction.reply({
            embeds: [
                new EmbedBuilder()
                .setColor(0xff0000)
                .setTitle('`/play` - Invalid URL link')
                .setDescription(`Invalid YouTube link.\nYouTube link must match the following regex:\n${
                    inlineCode('/^(?:https?:\/\/)?(?:(?:www\.|m\.)?youtu\.?be(?:-nocookie)?(?:\.com)?)\/(?:(?:watch\?v=|embed\/|v\/)?([\w\d-]+))$/')
                }\nYour value did not match the regex above.`)
                .addFields(
                    {
                        name: 'Examples of valid URL links',
                        value: [
                            'https://www.youtube.com/watch?v=DFYRQ_zQ-gk&feature=featured',
                            'https://www.youtube.com/watch?v=DFYRQ_zQ-gk',
                            'http://www.youtube.com/watch?v=DFYRQ_zQ-gk',
                            'www.youtube.com/watch?v=DFYRQ_zQ-gk',
                            'https://youtube.com/watch?v=DFYRQ_zQ-gk',
                            'http://youtube.com/watch?v=DFYRQ_zQ-gk',
                            'youtube.com/watch?v=DFYRQ_zQ-gk',
                            'https://m.youtube.com/watch?v=DFYRQ_zQ-gk',
                            'http://m.youtube.com/watch?v=DFYRQ_zQ-gk',
                            'm.youtube.com/watch?v=DFYRQ_zQ-gk',
                            'https://www.youtube.com/v/DFYRQ_zQ-gk?fs=1&hl=en_US',
                            'http://www.youtube.com/v/DFYRQ_zQ-gk?fs=1&hl=en_US',
                            'www.youtube.com/v/DFYRQ_zQ-gk?fs=1&hl=en_US',
                            'youtube.com/v/DFYRQ_zQ-gk?fs=1&hl=en_US',
                            'https://www.youtube.com/embed/DFYRQ_zQ-gk?autoplay=1',
                            'https://www.youtube.com/embed/DFYRQ_zQ-gk',
                            'http://www.youtube.com/embed/DFYRQ_zQ-gk',
                            'www.youtube.com/embed/DFYRQ_zQ-gk',
                            'https://youtube.com/embed/DFYRQ_zQ-gk',
                            'http://youtube.com/embed/DFYRQ_zQ-gk',
                            'youtube.com/embed/DFYRQ_zQ-gk',
                            'https://www.youtube-nocookie.com/embed/DFYRQ_zQ-gk?autoplay=1',
                            'https://www.youtube-nocookie.com/embed/DFYRQ_zQ-gk',
                            'http://www.youtube-nocookie.com/embed/DFYRQ_zQ-gk',
                            'www.youtube-nocookie.com/embed/DFYRQ_zQ-gk',
                            'https://youtube-nocookie.com/embed/DFYRQ_zQ-gk',
                            'http://youtube-nocookie.com/embed/DFYRQ_zQ-gk',
                            'youtube-nocookie.com/embed/DFYRQ_zQ-gk',
                            'https://youtu.be/DFYRQ_zQ-gk?t=120',
                            'https://youtu.be/DFYRQ_zQ-gk',
                            'http://youtu.be/DFYRQ_zQ-gk',
                            'youtu.be/DFYRQ_zQ-gk',
                        ].map(s => inlineCode(s)).join('\n')
                    }
                )
            ]
        })
    }
}

export {
  playCommand
}
