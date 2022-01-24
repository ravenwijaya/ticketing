import { Ticket } from "../ticket";

it("implements optimistic concurrency control", async () => {
  // Create an instance of a ticket
  const ticket = Ticket.build({
    title: "band",
    price: 5,
    userId: "123",
  });

  // Save the ticket to the database
  await ticket.save();

  // fetch the ticket twice
  const firstInstance = await Ticket.findById(ticket.id);
  const secondInstance = await Ticket.findById(ticket.id);

  // make two separate changes
  firstInstance!.set({ price: 10 });
  secondInstance!.set({ price: 15 });

  // save the first
  await firstInstance!.save();

  // save the second and expect an error
  //   try {
  //     await secondInstance!.save();
  //   } catch (err) {
  //     return done();
  //   }
  //   throw new Error("Should not reach this point");
  const result = async () => {
    await secondInstance!.save();
  };
  await expect(result()).rejects.toThrow();
});

it("increments the version number on multiple saves", async () => {
  const ticket = Ticket.build({
    title: "band",
    price: 20,
    userId: "123",
  });

  await ticket.save();
  expect(ticket.version).toEqual(0);
  await ticket.save();
  expect(ticket.version).toEqual(1);
  await ticket.save();
  expect(ticket.version).toEqual(2);
});
