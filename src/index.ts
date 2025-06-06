import "dotenv/config";
import { Bot, GrammyError, HttpError, InlineKeyboard } from "grammy";
import mongoose from "mongoose";
import { hydrate } from "@grammyjs/hydrate";
import { MyContext } from "./types.js";
import { start, profile, productsCommand, payments, telegramSuccessPaymentHandler } from "./commands/index.js";


const BOT_API_KEY = process.env.BOT_TOKEN;
if (!BOT_API_KEY) {
  throw new Error("BOT_API_KEY is nit defined");
}

const bot = new Bot<MyContext>(BOT_API_KEY);

bot.on('pre_checkout_query', (ctx) => {
  ctx.answerPreCheckoutQuery(true);
});

bot.use(hydrate());

bot.on(':successful_payment', telegramSuccessPaymentHandler);

// Ответ на команду /start
bot.command("start", start);

bot.callbackQuery("menu", (ctx) => {
  ctx.answerCallbackQuery();

  ctx.callbackQuery.message?.editText(
    "Вы в главном меню магазина. \nОтсюда вы можете попасть в раздел с товарами и в свой профиль. Для перехода нажмите на кнопку ниже:",
    {
      reply_markup: new InlineKeyboard()
        .text("Товары", "products")
        .text("Профиль", "profile"),
    }
  );
});


bot.callbackQuery("products", productsCommand);

bot.callbackQuery("profile", profile);

bot.callbackQuery(/^buyProduct-\d+$/, payments)

bot.callbackQuery("backToMenu", (ctx) => {
  ctx.answerCallbackQuery();

  ctx.callbackQuery.message?.editText(
    "Вы в главном меню магазина. \nОтсюда вы можете попасть в раздел с товарами и в свой профиль. Для перехода нажмите на кнопку ниже:",
    {
      reply_markup: new InlineKeyboard()
        .text("Товары", "products")
        .text("Профиль", "profile"),
    },
  );
});
// Ответ на любое сообщение
bot.on("message:text", (ctx) => {
  ctx.reply(ctx.message.text);
});

// Обработка ошибок согласно документации
bot.catch((err) => {
  const ctx = err.ctx;
  console.error(`Error while handling update ${ctx.update.update_id}:`);
  const e = err.error;

  if (e instanceof GrammyError) {
    console.error("Error in request:", e.description);
  } else if (e instanceof HttpError) {
    console.error("Could not contact Telegram:", e);
  } else {
    console.error("Unknown error:", e);
  }
});

// Функция запуска бота
async function startBot() {
  const MONGODB_URL = process.env.MONGODB_URL;
  if (!MONGODB_URL) {
    throw new Error("MONGODB_URL is not defined");
  }
  try {
    await mongoose.connect(MONGODB_URL);
    bot.start();
    console.log("MongoDB connected && bot started");
  } catch (error) {
    console.error("Error in startBot:", error);
  }
}

startBot();
