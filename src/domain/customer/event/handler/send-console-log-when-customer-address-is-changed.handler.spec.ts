import EventDispatcher from "../../../@shared/event/event-dispatcher";
import Customer from "../../entity/customer";
import Address from "../../value-object/address";
import CustomerAddressChangedEvent from "../customer-address-changed.event";
import SendConsoleLogWhenCustomerAddressIsChangedHandler from "./send-console-log-when-customer-address-is-changed.handler";

describe("SendConsoleLogWhenCustomerAddressIsChangedHandler tests", () => {
    it("should log the correct message when CustomerAddressChangedEvent is handled", () => {
        const eventDispatcher = new EventDispatcher();
        const eventHandler = new SendConsoleLogWhenCustomerAddressIsChangedHandler();
        const spyEventHandler = jest.spyOn(eventHandler, "handle");
        const consoleSpy = jest.spyOn(console, "log");

        eventDispatcher.register("CustomerAddressChangedEvent", eventHandler);

        expect(
            eventDispatcher.getEventHandlers["CustomerAddressChangedEvent"][0]
        ).toMatchObject(eventHandler);

        const customer = new Customer("123", "John Doe");
        const initialAddress = new Address("Street 1", 123, "13330-250", "São Paulo");
        customer.changeAddress(initialAddress);
        const newAddress = new Address("Street 2", 124, "13330-251", "São Paulo");
        customer.changeAddress(newAddress);

        const customerAddressChangedEvent = new CustomerAddressChangedEvent(customer);
        eventDispatcher.notify(customerAddressChangedEvent);

        expect(spyEventHandler).toHaveBeenCalled();
        expect(spyEventHandler).toHaveBeenCalledWith(customerAddressChangedEvent);
        expect(consoleSpy).toHaveBeenCalledWith(
            `Endereço do cliente: ${customer.id}, ${customer.name} alterado para: ${customer.Address.toString()}`
        );

        consoleSpy.mockRestore();
    });
});
