import { ApplicationCommandOptionType, ChatInputCommandInteraction } from "discord.js";
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
        
    }
}

export {
  playCommand
}
