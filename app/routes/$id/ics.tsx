import type { LoaderFunction } from "@remix-run/node";
import { DateTime } from "luxon";
import * as icsParser from "node-ical";
import * as icsGenerator from "ics";

import { getCalendar } from "~/models/calendar.server";

export const loader: LoaderFunction = async ({ params }) => {
  if (!params.hasOwnProperty("id") || !params?.id) {
    throw new Response("No calendar specified");
  }
  const calendarMetadata = await getCalendar(params.id);
  if (!calendarMetadata) {
    throw new Response("No calendar found", {
      status: 404,
    });
  }

  const googleIcs = await icsParser.fromURL(calendarMetadata.remoteUrl);
  let calendarName = googleIcs?.vcalendar
    ? (googleIcs.vcalendar as icsParser.VCalendar)["WR-CALNAME"]
    : "";

  let calendarEvents = [];
  // It might be better to loop through the smaller array `calendarMetadata` and
  // match them to the larger array `googleIcs` instead.
  for (let key in googleIcs) {
    const event = googleIcs[key];
    if (event.type != "VEVENT") {
      continue;
    }
    if (calendarMetadata.events.find((element) => element === event.summary)) {
      // The ics generator library uses their own format for DateTime values
      // which uses an array of values [year, month, day, hour, minute]
      const start = DateTime.fromISO(event.start.toISOString());
      const startArray: icsGenerator.DateArray = [
        start.year,
        start.month,
        start.day,
      ];
      const end = DateTime.fromISO(event.end.toISOString());
      const endArray: icsGenerator.DateArray = [end.year, end.month, end.day];
      const created = DateTime.fromISO(event.created.toISOString());
      const createdArray: icsGenerator.DateArray = [
        created.year,
        created.month,
        created.day,
        created.hour,
        created.minute,
      ];
      const lastModified = DateTime.fromISO(event.lastmodified.toISOString());
      const lastModifiedArray: icsGenerator.DateArray = [
        lastModified.year,
        lastModified.month,
        lastModified.day,
        lastModified.hour,
        lastModified.minute,
      ];

      calendarEvents.push({
        start: startArray,
        end: endArray,
        title: event.summary,
        description: event.description,
        status: event.status,
        uid: event.uid,
        method: event.method,
        sequence: +event.sequence,
        calName: calendarName,
        created: createdArray,
        lastModified: lastModifiedArray,
      });
    }
  }

  if (calendarEvents.length > 0) {
    const { error, value } = icsGenerator.createEvents(calendarEvents);
    return new Response(value, {
      headers: {
        "Content-Type": "text/calendar",
      },
    });
  }

  throw new Response("No events found", {
    status: 500,
  });
};
