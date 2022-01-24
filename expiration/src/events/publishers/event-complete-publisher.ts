import {
  Publisher,
  ExpirationCompleteEvent,
  Subjects,
} from "@raventickets/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
}
