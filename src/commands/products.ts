import { CallbackQueryContext, InlineKeyboard } from "grammy";
import { MyContext } from "../types.js";
import { products } from "../consts/products.js";

export const productsCommand = (ctx: CallbackQueryContext<MyContext>) => {
  ctx.answerCallbackQuery();

  const productList = products.reduce((acc, current) => {
    return (
      acc +
      `- ${current.name}\nЦена: ${current.price}руб.\nОписание: ${current.description}\n`
    );
  }, "");

  const messageText = `Все товары: \n${productList}`

  const keyboardButtonRows = products.map((product) => {
    return InlineKeyboard.text(product.name, `buyProduct-${product.id}`)
  })

  const keyboard = InlineKeyboard.from([
    keyboardButtonRows,
    [InlineKeyboard.text("Назад", "backToMenu")]
  ])

  ctx.callbackQuery.message?.editText(messageText, {
    reply_markup: keyboard,
  });
};
