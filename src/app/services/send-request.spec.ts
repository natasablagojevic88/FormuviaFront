import { TestBed } from "@angular/core/testing";

import { SendRequest } from "./send-request";

describe("SendRequest", () => {
  let service: SendRequest;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SendRequest);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
