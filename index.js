require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const fetch = require('node-fetch');

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, 'Hi! Send me a city name and I will send you the current weather.');
});

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const city = msg.text;

  if (!city || city.startsWith('/') || city.trim() === '') return;

  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${WEATHER_API_KEY}&units=metric&lang=en`
    );

    if (res.status === 404) {
      throw new Error('City not found');
    } else if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }

    const data = await res.json();

    const weather = `
📍 City: ${data.name || 'Unknown'}
🌡 Temperature: ${Math.round(data.main?.temp ?? 'N/A')}°C
🤔 Feels like: ${Math.round(data.main?.feels_like ?? 'N/A')}°C
🌤 Weather: ${data.weather?.[0]?.description || 'No description'}
💨 Wind: ${Math.round(data.wind?.speed ?? 'N/A')} m/s
    `.trim();

    await bot.sendMessage(chatId, weather);
  } catch (error) {
    console.error('Error fetching weather:', error);
    await bot.sendMessage(chatId, 'Could not find weather for that city. Please check the name.');
  }
});
