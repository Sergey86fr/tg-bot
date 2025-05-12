import "dotenv/config";
import { CallbackQueryContext, InlineKeyboard } from "grammy";
import { MyContext } from "../types.js";
import { products } from "../consts/products.js";
import { log } from "console";
import { User } from "../models/User.js";
import { Order } from "../models/order.js";

export const payments = (ctx: CallbackQueryContext<MyContext>) => {
  ctx.answerCallbackQuery();
  const productId = ctx.callbackQuery.data.split("-")[1];
  const product = products.find(
    (product) => product.id === parseInt(productId)
  );

  if (!product) {
    return ctx.callbackQuery.message?.editText("Кажется, что-то пошло не так");
  }

  try {
    const chatId = ctx.chat?.id;
    if (!chatId) {
      throw new Error("Chat ID is not defined");
    }

    const providerInvoiceData = {
      receipt: {
        items: [
          {
            description: product.description,
            quantity: 1,
            amount: {
              value: `${product.price}.00`,
              cyrrency: "RUB",
            },
            vat_code: 1,
          },
        ],
      },
    };

    ctx.api.sendInvoice(
      chatId,
      product.name,
      product.description,
      product.id.toString(),
      "RUB",
      [
        {
          label: "Руб",
          amount: product.price * 100,
        },
      ],
      {
        provider_token: process.env.PAYMENT_TOKEN,
        need_email: true,
        send_email_to_provider: true,
        provider_data: JSON.stringify(providerInvoiceData),
      }
    );
  } catch (error) {
    console.error("Error in payment"), ctx.reply("Произошла ошибка");
  }

  //   ctx.callbackQuery.message?.editText(`Вы выбрали товар: ${product.name}`)
};

export const telegramSuccessPaymentHandler = async (ctx: MyContext) => {
  console.log(ctx.message?.successful_payment);
  if (!ctx.message?.successful_payment || !ctx.from?.id) {
    return ctx.reply("Что-то пошло не так");
  }

  const { invoice_payload, total_amount } = ctx.message?.successful_payment;

  const productId = parseInt(invoice_payload);
  const price = total_amount / 100;

  try {
    const user = await User.findOne({
      telegramId: ctx.from.id,
    });
    if (!user) {
      throw new Error(`${ctx.from.id}: User not found`);
    }

    await Order.create({
      userId: user._id,
      productId,
      price,
    });

    ctx.reply("Оплата прошла успешно", {
      reply_markup: new InlineKeyboard().text("Меню", "menu"),
    });
  } catch (error) {
    console.error("Error in payment"), ctx.reply("Произошла ошибка");
  }
};
