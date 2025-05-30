import { CallbackQueryContext, InlineKeyboard } from "grammy";
import { User } from "../models/User.js";
import { MyContext } from "../types.js";

export const profile = async (ctx:CallbackQueryContext<MyContext>) => {
  ctx.answerCallbackQuery();

  const user = await User.findOne({
    telegramId: ctx.from?.id,
  });

  if (!user) {
    return ctx.callbackQuery.message?.editText(
      "Для доступа к профилю необходимо зарегистрироваться, используя команду /start"
    );
  }

  const registrationDate = user.createdAt.toLocaleDateString('ru-Ru', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })

  ctx.callbackQuery.message?.editText(`Здравствуйте, ${ctx.from?.first_name}!\nДата регистрации:${registrationDate}\nУ вас еще нет заказов, перейдите во вкладку Товары для покупок.`, {
    reply_markup: new InlineKeyboard().text("Назад", "backToMenu"),
  });
}