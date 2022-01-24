import { Message } from "node-nats-streaming";
import { TicketUpdatedEvent } from "@raventickets/common";
import { TicketUpdatedListener } from "../ticket-updated-listener";
import { natsWrapper } from "../../../nats-wrapper";
import mongoose from "mongoose";
import { Ticket } from "../../../models/ticket";

const setup = async () => {
  //create an instance of the listener
  const listener = new TicketUpdatedListener(natsWrapper.client);

  //create and save a ticket
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "band",
    price: 20,
  });
  await ticket.save();

  //create a fake data object
  const data: TicketUpdatedEvent["data"] = {
    id: ticket.id,
    version: ticket.version + 1,
    title: "new band",
    price: 200,
    userId: new mongoose.Types.ObjectId().toHexString(),
  };
  //create a fake message object
  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { ticket, listener, data, msg };
};

it("finds, updates, and saves a ticket", async () => {
  const { ticket, listener, data, msg } = await setup();

  //call the on Message function with the data object + message object
  await listener.onMessage(data, msg);

  //write assertions to make sure a ticket was created
  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket!.title).toEqual(data.title);
  expect(updatedTicket!.price).toEqual(data.price);
  expect(updatedTicket!.version).toEqual(data.version);
});

it("acks the message", async () => {
  const { listener, data, msg } = await setup();

  //call the onMessage function with the data obejct + message object
  await listener.onMessage(data, msg);

  //write assertions to make sure a ticket was created
  expect(msg.ack).toHaveBeenCalled();
});

it("does not call ack if the event has a skipped version number", async () => {
  const { listener, data, msg } = await setup();

  data.version = 10;
  // await expect(listener.onMessage(data, msg)).rejects.toThrow(
  //   "Ticket not found"
  // );
  expect(msg.ack).not.toHaveBeenCalled();

});
