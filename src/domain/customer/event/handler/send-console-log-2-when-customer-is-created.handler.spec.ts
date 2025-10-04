import EventDispatcher from "../../../@shared/event/event-dispatcher";
import CustomerCreatedEvent from "../customer-created.event";
import SendConsoleLog2Handler from "./send-console-log-2-when-customer-is-created.handler";

describe("SendConsoleLog2Handler tests", () => {
    it("should log the correct message when CustomerCreatedEvent is handled", () => {
        const eventDispatcher = new EventDispatcher();
        const eventHandler = new SendConsoleLog2Handler();
        const spyEventHandler = jest.spyOn(eventHandler, "handle");
        const consoleSpy = jest.spyOn(console, "log");

        eventDispatcher.register("CustomerCreatedEvent", eventHandler);

        expect(
            eventDispatcher.getEventHandlers["CustomerCreatedEvent"][0]
        ).toMatchObject(eventHandler);

        const customerCreatedEvent = new CustomerCreatedEvent({
            id: "123",
            name: "John Doe",
        });

        eventDispatcher.notify(customerCreatedEvent);

        expect(spyEventHandler).toHaveBeenCalled();
        expect(spyEventHandler).toHaveBeenCalledWith(customerCreatedEvent);
        expect(consoleSpy).toHaveBeenCalledWith(
            "Esse é o segundo console.log do evento: CustomerCreated"
        );

        consoleSpy.mockRestore();
    });
});
