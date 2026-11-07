import { Client, GatewayIntentBits, Partials } from 'discord.js';
import { GoogleGenAI } from '@google/genai';
import 'dotenv/config';

if (!process.env.GEMINI_API_KEY) {
  console.error("❌ ERROR: GEMINI_API_KEY is missing from your .env file!");
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel, Partials.Message],
});

client.once('ready', () => {
  console.log(`🤖 DevLogBot is online and logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const userMessage = message.content.trim();

  if (userMessage.toLowerCase() === 'approve') {
    await message.reply('🚀 Post approved! Publishing to X/LinkedIn simulated successfully. Great job shipping today!');
    return;
  }

  const isDM = !message.guild;
  const isMentioned = message.mentions.has(client.user);

  if (isDM || isMentioned) {
    try {
      const cleanNotes = userMessage.replace(/<@!?\d+>/g, '').trim();
      if (!cleanNotes) return;

      console.log(`📝 Generating social post for notes: "${cleanNotes}"`);

      const prompt = `You are an elite tech brand builder and developer advocate. Take these raw developer notes: "${cleanNotes}" and format them into a highly engaging, professional LinkedIn/X post complete with bullet points, concise technical highlights, and appropriate developer hashtags. End your response by asking the user to type "Approve" if they like it.`;

      // Updated to gemini-3.8-flash
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      await message.reply(response.text);
      console.log('✅ Post generated and sent to Discord successfully!');

    } catch (error) {
      console.error('🔥 GEMINI API ERROR:', error);
      await message.reply(`⚠️ Gemini Error: \`${error.message}\`. Check your terminal for details.`);
    }
  }
});

client.login(process.env.DISCORD_TOKEN);