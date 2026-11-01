import { describe, expect, it } from "vitest";
import {
  CronValue,
  cronExpression,
  cronMode,
  cronPicked,
  cronValid,
  emptyCron,
} from "./cron-value";

/** The expressions below were tried against Quartz 2.5.2 itself, the one the server schedules with. */
describe("cron value", () => {
  it("a new job runs every minute", () => {
    const value = emptyCron();
    expect(cronValid(value)).toBe(true);
    expect(cronExpression(value)).toBe("0 * * * * ? *");
  });

  it("a step becomes */n", () => {
    const value: CronValue = { ...emptyCron(), anyMinutes: false, everyMinute: 5 };
    expect(cronMode(value, "minutes")).toBe("every");
    expect(cronExpression(value)).toBe("0 */5 * * * ? *");
  });

  it("picked values are sorted and come as a list", () => {
    const value: CronValue = { ...emptyCron(), anyMinutes: false, inMinutes: "30,0,15" };
    expect(cronPicked(value, "minutes")).toEqual([0, 15, 30]);
    expect(cronExpression(value)).toBe("0 0,15,30 * * * ? *");
  });

  it("any minute beside a chosen hour is the top of that hour", () => {
    const value: CronValue = { ...emptyCron(), anyHours: false, inHours: "8" };
    expect(cronExpression(value)).toBe("0 0 8 * * ? *");
  });

  it("any minute with any hour stays every minute", () => {
    expect(cronExpression({ ...emptyCron(), anyDay: false, inDay: "1" })).toBe("0 * * 1 * ? *");
  });

  it("the day of the month gives way to the weekday, because Quartz takes only one", () => {
    const value: CronValue = { ...emptyCron(), anyDOfWeek: false, inDOfWeek: "2,6" };
    expect(cronExpression(value)).toBe("0 * * ? * 2,6 *");
  });

  it("without a weekday the day of the month stands and the weekday is left open", () => {
    const value: CronValue = { ...emptyCron(), anyDay: false, inDay: "1,15" };
    expect(cronExpression(value)).toBe("0 * * 1,15 * ? *");
  });

  it("the two days together are refused", () => {
    const value: CronValue = {
      ...emptyCron(),
      anyDay: false,
      inDay: "1",
      anyDOfWeek: false,
      inDOfWeek: "2",
    };
    expect(cronValid(value)).toBe(false);
  });

  it("a unit that is neither any, nor a step, nor picked is not filled in", () => {
    expect(cronValid({ ...emptyCron(), anyHours: false })).toBe(false);
    expect(cronValid({ ...emptyCron(), anyHours: false, inHours: "" })).toBe(false);
    expect(cronValid({ ...emptyCron(), anyHours: false, everyHours: 0 })).toBe(false);
    expect(cronValid({ ...emptyCron(), anyHours: false, everyHours: 24 })).toBe(false);
    expect(cronValid({ ...emptyCron(), anyHours: false, everyHours: 6 })).toBe(true);
  });

  it("a whole schedule reads as the server will build it", () => {
    const value: CronValue = {
      ...emptyCron(),
      anyMinutes: false,
      everyMinute: 5,
      anyHours: false,
      inHours: "8,16",
      anyDOfWeek: false,
      inDOfWeek: "2,6",
    };
    expect(cronValid(value)).toBe(true);
    expect(cronExpression(value)).toBe("0 */5 8,16 ? * 2,6 *");
  });
});
