/* const express = require("express");
const { Telegraf } = require("telegraf");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config(); // Ensure .env is correctly loaded

const app = express();
const bot = new Telegraf(process.env.BOT_TOKEN); // Ensure the correct environment variable
const genAI = new GoogleGenerativeAI(process.env.API_KEY); // Ensure the correct environment variable
const port = process.env.PORT || 3000;

// Dynamic import of node-fetch
(async () => {
  const fetch = (await import("node-fetch")).default;

  // Converts local file information to a GoogleGenerativeAI.Part object.
  async function fileToGenerativePart(path, mimeType) {
    try {
      const response = await fetch(path);
      const fileBuffer = await response.arrayBuffer();
      return {
        inlineData: {
          data: Buffer.from(fileBuffer).toString("base64"),
          mimeType,
        },
      };
    } catch (error) {
      console.error("Error converting file:", error);
      throw error;
    }
  }

  // Generate content based on prompt and model type
  async function rungemini(prompt, model, imagePath = null) {
    try {
      const genAImodel = genAI.getGenerativeModel({ model: model });

      if (model === "gemini-1.5-flash") {
        // Adjust handling for the new model
        if (imagePath) {
          // Handle image input if applicable, refer to the new model's documentation
          const part = await fileToGenerativePart(imagePath, "image/jpeg");
          const result = await genAImodel.generateContent([prompt, part]);
          return await result.response.text();
        } else {
          const result = await genAImodel.generateContent(prompt);
          return await result.response.text();
        }
      } else {
        throw new Error(`Unsupported model: ${model}`);
      }
    } catch (error) {
      console.error("Error generating content:", error);
      throw error;
    }
  }

  // Handle /start command
  bot.start((ctx) => ctx.reply("Welcome!"));

  // Handle text messages
  bot.on("text", async (ctx) => {
    try {
      const message = ctx.message.text;
      await ctx.replyWithChatAction("typing");
      const response = await rungemini(message, "gemini-1.5-flash");
      await ctx.reply(response);
    } catch (error) {
      console.error("Error handling text message:", error);
      await ctx.reply("Sorry, there was an error processing your request.");
    }
  });

  // Handle photo messages
  bot.on("photo", async (ctx) => {
    try {
      const photo = ctx.message.photo[ctx.message.photo.length - 1].file_id;
      await ctx.replyWithChatAction("typing");
      const prompt = ctx.message.caption;
      const file = await ctx.telegram.getFileLink(photo);
      const response = await rungemini(prompt, "gemini-1.5-flash", file.href);
      await ctx.reply(response);
    } catch (error) {
      console.error("Error handling photo message:", error);
      await ctx.reply("Sorry, there was an error processing your photo.");
    }
  });

  // Catch-all error handler
  bot.catch((err, ctx) => {
    console.error("Bot error:", err);
    ctx.reply("An unexpected error occurred.");
  });

  // Start the Telegram bot
  bot.launch();

  // Simple express server for health check
  app.get("/", (req, res) => {
    res.send("Hello World!");
  });

  // Start the express server
  app.listen(port, () => {
    console.log(`App listening on port ${port}`);
  });
})();
 */

/* const express = require("express");
const { Telegraf } = require("telegraf");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const sharp = require("sharp");
const fetch = require("node-fetch"); // Use node-fetch version 2.x
require("dotenv").config();

const app = express();
const bot = new Telegraf(process.env.BOT_TOKEN);
const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const port = process.env.PORT || 3000;

async function fetchAndProcessImage(imageUrl) {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    const imageBuffer = await response.buffer();
    const resizedImage = await sharp(imageBuffer).resize(800).toBuffer();
    return resizedImage;
  } catch (error) {
    console.error("Error processing image:", error);
    throw error;
  }
}

async function imageToGenerativePart(imageBuffer) {
  return {
    inlineData: {
      data: imageBuffer.toString("base64"),
      mimeType: "image/jpeg",
    },
  };
}

async function rungemini(prompt, model, imageUrl = null) {
  try {
    const genAImodel = genAI.getGenerativeModel({ model: model });

    if (model === "gemini-1.5-flash") {
      if (imageUrl) {
        const imageBuffer = await fetchAndProcessImage(imageUrl);
        const part = await imageToGenerativePart(imageBuffer);
        const result = await genAImodel.generateContent([prompt, part]);
        return await result.response.text();
      } else {
        const result = await genAImodel.generateContent(prompt);
        return await result.response.text();
      }
    } else {
      throw new Error(`Unsupported model: ${model}`);
    }
  } catch (error) {
    console.error("Error generating content:", error);
    throw error;
  }
}

bot.start((ctx) => ctx.reply("Welcome!"));

bot.on("text", async (ctx) => {
  try {
    const message = ctx.message.text;
    await ctx.replyWithChatAction("typing");
    const response = await rungemini(message, "gemini-1.5-flash");
    await ctx.reply(response);
  } catch (error) {
    console.error("Error handling text message:", error);
    await ctx.reply("Sorry, there was an error processing your request.");
  }
});

bot.on("photo", async (ctx) => {
  try {
    const photoId = ctx.message.photo[ctx.message.photo.length - 1].file_id;
    await ctx.replyWithChatAction("typing");
    const prompt = ctx.message.caption || "";
    const fileLink = await ctx.telegram.getFileLink(photoId);
    const response = await rungemini(prompt, "gemini-1.5-flash", fileLink.href);
    await ctx.reply(response);
  } catch (error) {
    console.error("Error handling photo message:", error);
    await ctx.reply("Sorry, there was an error processing your photo.");
  }
});

bot.catch((err, ctx) => {
  console.error("Bot error:", err);
  ctx.reply("An unexpected error occurred.");
});

bot.launch();

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
 */

import { Telegraf } from 'telegraf';
import { GoogleGenerativeAI } from '@google/generative-ai';
import sharp from 'sharp';
import fetch from 'node-fetch';
import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN);
const genAI = new GoogleGenerativeAI(process.env.API_KEY);

const connection = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
});

connection.connect((err) => {
  if (err) console.error('Error connecting to MySQL database:', err);
  else console.log('Connected to MySQL database.');
});

async function fetchAndProcessImage(imageUrl) {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
    const imageBuffer = await response.buffer();
    const resizedImage = await sharp(imageBuffer).resize(800).toBuffer();
    return resizedImage;
  } catch (error) {
    console.error('Error processing image:', error);
    throw error;
  }
}

async function imageToGenerativePart(imageBuffer) {
  return {
    inlineData: {
      data: imageBuffer.toString('base64'),
      mimeType: 'image/jpeg',
    },
  };
}

async function rungemini(prompt, model, imageUrl = null) {
  try {
    const genAImodel = genAI.getGenerativeModel({ model: model });

    if (model === 'gemini-1.5-flash') {
      if (imageUrl) {
        const imageBuffer = await fetchAndProcessImage(imageUrl);
        const part = await imageToGenerativePart(imageBuffer);
        const result = await genAImodel.generateContent([prompt, part]);
        return await result.response.text();
      } else {
        const result = await genAImodel.generateContent(prompt);
        return await result.response.text();
      }
    } else {
      throw new Error(`Unsupported model: ${model}`);
    }
  } catch (error) {
    console.error('Error generating content:', error);
    throw error;
  }
}

async function storeUserData(userId, username, message) {
  return new Promise((resolve, reject) => {
    const query = 'INSERT INTO user_data (user_id, username, message) VALUES (?, ?, ?)';
    connection.query(query, [userId, username, message], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
}

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const update = req.body;
    const chatId = update.message.chat.id;

    if (update.message.text) {
      const message = update.message.text;
      const userId = update.message.from.id;
      const username = update.message.from.username || 'Unknown';

      try {
        await bot.telegram.sendChatAction(chatId, 'typing');
        const response = await rungemini(message, 'gemini-1.5-flash');
        await storeUserData(userId, username, message);
        await bot.telegram.sendMessage(chatId, response);
        res.status(200).end();
      } catch (error) {
        console.error('Error handling text message:', error);
        await bot.telegram.sendMessage(chatId, 'Sorry, there was an error processing your request.');
        res.status(500).end();
      }
    } else if (update.message.photo) {
      const photoId = update.message.photo[update.message.photo.length - 1].file_id;
      const prompt = update.message.caption || '';
      const fileLink = await bot.telegram.getFileLink(photoId);

      try {
        await bot.telegram.sendChatAction(chatId, 'typing');
        const response = await rungemini(prompt, 'gemini-1.5-flash', fileLink.href);
        await storeUserData(chatId, update.message.from.username || 'Unknown', `Photo: ${fileLink.href}`);
        await bot.telegram.sendMessage(chatId, response);
        res.status(200).end();
      } catch (error) {
        console.error('Error handling photo message:', error);
        await bot.telegram.sendMessage(chatId, 'Sorry, there was an error processing your photo.');
        res.status(500).end();
      }
    } else {
      res.status(400).end();
    }
  } else {
    res.status(405).end();
  }
}
