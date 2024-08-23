import express from "express";
import { Telegraf } from "telegraf";
import { GoogleGenerativeAI } from "@google/generative-ai";
import sharp from "sharp";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const bot = new Telegraf(process.env.BOT_TOKEN);
const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const port = process.env.PORT || 3000;

// MySQL connection using environment variables
import mysql from "mysql2";
const connection = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
});

connection.connect((err) => {
  if (err) throw err;
  console.log("Connected to MySQL database.");
});

// Fetch and process image
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

// Convert image to generative part
async function imageToGenerativePart(imageBuffer) {
  return {
    inlineData: {
      data: imageBuffer.toString("base64"),
      mimeType: "image/jpeg",
    },
  };
}

// Generate content using Google AI
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

// Store user data in MySQL
async function storeUserData(userId, username, message) {
  return new Promise((resolve, reject) => {
    const query =
      "INSERT INTO user_data (user_id, username, message) VALUES (?, ?, ?)";
    connection.query(query, [userId, username, message], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
}

// Handle start command
bot.start((ctx) => ctx.reply("Welcome!"));

// Handle text messages
bot.on("text", async (ctx) => {
  try {
    const message = ctx.message.text;
    const userId = ctx.from.id;
    const username = ctx.from.username || "Unknown";

    await ctx.replyWithChatAction("typing");
    const response = await rungemini(message, "gemini-1.5-flash");

    // Store user data
    await storeUserData(userId, username, message);

    await ctx.reply(response);
  } catch (error) {
    console.error("Error handling text message:", error);
    await ctx.reply("Sorry, there was an error processing your request.");
  }
});

// Handle photo messages
bot.on("photo", async (ctx) => {
  try {
    const photoId = ctx.message.photo[ctx.message.photo.length - 1].file_id;
    const prompt = ctx.message.caption || "";
    const fileLink = await ctx.telegram.getFileLink(photoId);

    await ctx.replyWithChatAction("typing");
    const response = await rungemini(prompt, "gemini-1.5-flash", fileLink.href);

    // Store user data
    const userId = ctx.from.id;
    const username = ctx.from.username || "Unknown";
    await storeUserData(userId, username, `Photo: ${fileLink.href}`);

    await ctx.reply(response);
  } catch (error) {
    console.error("Error handling photo message:", error);
    await ctx.reply("Sorry, there was an error processing your photo.");
  }
});

// Handle errors
bot.catch((err, ctx) => {
  console.error("Bot error:", err);
  ctx.reply("An unexpected error occurred.");
});

// Start the bot
bot.launch();

// Express endpoint
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Start the Express server
app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});

export default app;
