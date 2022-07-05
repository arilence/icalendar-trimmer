import { prisma } from "~/db.server";

import type { Calendar } from "@prisma/client";
export type { Calendar } from "@prisma/client";

export function getCalendar(id: string) {
  return prisma.calendar.findUnique({ where: { id } });
}

export function createCalendar(
  new_calendar: Pick<Calendar, "events" | "remoteUrl">
) {
  return prisma.calendar.create({
    data: {
      events: new_calendar.events,
      remoteUrl: new_calendar.remoteUrl,
    },
  });
}
