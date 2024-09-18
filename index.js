const Discord = require("discord.js");
const { IntentsBitField, Collection, GatewayIntentBits } = require('discord.js');
const dotenv = require("dotenv");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const fs = require("fs");
const { Player } = require("discord-player");

dotenv.config();

const TOKEN = process.env.TOKEN;
const CLIENT_ID = "1242655221134659584";
const GUILD_ID = "1241169857114935398";
const LOAD_SLASH = process.argv[2] === "load";

const client = new Discord.Client({
    intents: [
        GatewayIntentBits.Guilds,
        IntentsBitField.Flags.GuildVoiceStates,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ]
});

client.slashcommands = new Collection();

client.player = new Player(client, {
    ytdloptions: {
        quality: "highestaudio",
        highWaterMark: 1 << 25
    }
});

const commands = [];
const slashFiles = fs.readdirSync("./slash").filter(file => file.endsWith(".js"));

for (const file of slashFiles) {
    const slashcmd = require(`./slash/${file}`);
    client.slashcommands.set(slashcmd.data.name, slashcmd);
    if (LOAD_SLASH) commands.push(slashcmd.data.toJSON());
}

if (LOAD_SLASH) {
    const rest = new REST({ version: "9" }).setToken(TOKEN);
    console.log("Deploying slash commands");

    rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands })
        .then(() => {
            console.log("Successfully registered!");
            process.exit(0);
        })
        .catch((err) => {
            console.error(err);
            process.exit(1);
        });
} else {
    client.once("ready", () => {
        console.log(`Logged in as ${client.user.tag}`);
    });

    client.on("interactionCreate", async (interaction) => {
        if (!interaction.isCommand()) return;

        const slashcmd = client.slashcommands.get(interaction.commandName);
        if (!slashcmd) {
            await interaction.reply({ content: "Not a valid slash command", ephemeral: true });
            return;
        }

        try {
            await interaction.deferReply();
            await slashcmd.run({ client, interaction });
        } catch (error) {
            console.error("Error handling interaction:", error);
            await interaction.reply({ content: "There was an error while executing this command!", ephemeral: true });
        }
    });

    client.login(TOKEN);
}