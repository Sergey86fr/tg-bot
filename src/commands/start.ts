import { InlineKeyboard } from "grammy";
import { User } from "../models/User.js";
import { MyContext } from "../types.js";

export const start =  async (ctx: MyContext) => {
if (!ctx.from) {
  return ctx.reply('User info is not avialable')
}

const { id, first_name, username } = ctx.from;
  
try {
  const keyboard = new InlineKeyboard().text('Меню', 'menu');

  const existingUser = await User.findOne({telegramId: id});
  if (existingUser) {
    return ctx.reply('Вы уже зарегистрированы!', {
      reply_markup: keyboard,
    });
  }

  const newUser = new User({
    telegramId:id,
    firstName: first_name,
    userName: username,
  });
  newUser.save();


  return ctx.reply('Вы успешно зарегистрированы!',{
    reply_markup: keyboard,
  });
} catch (error) {
  console.error('Ошибка при регистрации пользователя', error);
  ctx.reply('Произошла ошибка, попробуйте позже!');
};

};