import { ChatInputCommandInteraction, EmbedBuilder, italic } from "discord.js";
import { Cmd } from "./command-exports";

const helpCommand: Cmd = {
    data: {
        name: 'help',
        description: 'Get all info about this bot'
    },
    async execute(interaction: ChatInputCommandInteraction<"cached">) {
        return await interaction.reply({
            embeds: [
                new EmbedBuilder()
                .setTitle('Help')
                .setDescription('This is the starting point for using this bot. Here you can read about the different commands and systems.\nNeed help? [Our support server](https://discord.gg/6tkn6m5g52)\nDo you have a question? Is there an issue? Would you like to suggest something? Comment on it on our GitHub, here: [Zahid556/ZBot-En](https://github.com/Zahid556/ZBot-En)')
                .addFields([
                    {
                        name: 'Links',
                        value: `[Our Support Server](https://discord.gg/6tkn6m5g52)\nSource Code on GitHub: [Zahid556/ZBot-En](https://github.com/Zahid556/ZBot-En)\n[Invite this bot to your server](https://discord.com/api/oauth2/authorize?client_id=956596792542257192&permissions=8&scope=bot%20applications.commands) (with "Administrator" permission)\n[Invite the bot to your server](https://discord.com/api/oauth2/authorize?client_id=956596792542257192&permissions=1644971949559&scope=bot%20applications.commands) (with all other permissions)`,
                    },
                    {
                        name: 'Slash Commands (`/`) - Description',
                        value: 'This bot uses Slash Commands, and they are commands that you can access by typing the forward slash key, `/`, on your keyboard.'
                    },
                    {
                        name: 'Slash Commands (`/`) - Moderation',
                        value: '`/ban` Ban or unban a user\n`/kick` Kick a member\n`/timeout` Timeout or untimeout a member. You can timeout a member for up to 28 days.\n`/slowmode` Display or change the slowmode of a text channel.'
                    },
                    {
                        name: 'Slash Commands (`/`) - Level System',
                        value: '`/rank` See your rank card\n`/leaderboard` How do you compare with other users?'
                    },
                    {
                        name: 'Slash Commands (`/`) - Mini-games',
                        value: '`/tic-tac-toe` Can you win in this classic strategical game?\n`/guess-the-word` Try to guess other users\' words or sentences!\n`/memory-game` Test your memory in this game!'
                    },
                    {
                        name: 'Slash Commands (`/`) - Miscellaneous',
                        value: '`/ping` How fast can this bot reply to the command?'
                    },
                    {
                        name: 'Slash Commands (`/`) - Other',
                        value: '`/report-problem` Is there an issue? Use this command to get links that could help you'
                    },
                    {
                        name: 'Systems - Level System',
                        value: 'The level system (also known as "rank system") is a system where you get experience points for playing mini-games or sending messages in text channels. Members are rewarded for sending messages or interacting with this bot, and when a user gets to a specific number of experience points, they level up.'
                        + '\n**Explanation**\nFor every message a member sends in a channel the bot is in, the member gets 5 experience points. Playing mini-games can give you large rewards, which can get in the hundreds! We are adding to this system to make it beneficial.'
                    },
                    {
                        name: 'Systems - Economy System',
                        value: italic('Coming soon!')
                    },
                    {
                        name: 'Systems - Ticket System',
                        value: italic('In the distant future...')
                    }
                ])
                .setColor(0x00ffff)
            ]
        })
    }
}

export {
    helpCommand
}
