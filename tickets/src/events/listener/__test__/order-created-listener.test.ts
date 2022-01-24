import { Message } from "node-nats-streaming";
import { OrderCreatedEvent, OrderStatus } from "@raventickets/common";
import { OrderCreatedListener } from "../order-created-listener";
import { natsWrapper } from "../../../nats-wrapper";
import mongoose from "mongoose";
import { Ticket } from "../../../models/ticket";

const setup = async () => {
  //create an instance of the listener
  const listener = new OrderCreatedListener(natsWrapper.client);

  //create and save a ticket
  const ticket = Ticket.build({
    title: "band",
    price: 20,
    userId: new mongoose.Types.ObjectId().toHexString(),
  });
  await ticket.save();
  //create a fake data object
  const data: OrderCreatedEvent["data"] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    userId: new mongoose.Types.ObjectId().toHexString(),
    expiresAt: "asdsad",
    ticket: {
      id: ticket.id,
      price: ticket.price,
    },
  };
  //create a fake message object
  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, ticket, data, msg };
};
it("sets the orderId of the ticket", async () => {
  const { listener, ticket, data, msg } = await setup();

  //call the on Message function with the data object + message object
  await listener.onMessage(data, msg);

  //write assertions to make sure a ticket was created
  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket?.orderId).toEqual(data.id);
});

it("acks the message", async () => {
  const { listener, data, msg } = await setup();

  //call the onMessage function with the data obejct + message object
  await listener.onMessage(data, msg);

  //write assertions to make sure a ticket was created
  expect(msg.ack).toHaveBeenCalled();
});

it("publishes a ticket updated event", async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const ticketUpdatedData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  );
  expect(data.id).toEqual(ticketUpdatedData.orderId);
});
