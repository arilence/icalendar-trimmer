import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, useLoaderData } from "@remix-run/react";

import { getCalendar } from "~/models/calendar.server";
import { requireUser } from "~/session.server";

export const loader: LoaderFunction = async ({ params, request }) => {
    const user = await requireUser(request);

    if (!params.hasOwnProperty("id") || !params?.id) {
        throw new Response("No calendar specified");
    }
    const calendarMetadata = await getCalendar(params.id);
    if (!calendarMetadata) {
        throw new Response("No calendar found", {
            status: 404,
        });
    }
    const icsUrl = new URL(request.url);
    const icsLink = "webcal://" + icsUrl.host + icsUrl.pathname + ".ics";
    const icsText = request.url + ".ics";
    return json({
        user,
        id: calendarMetadata.id,
        selectedEvents: calendarMetadata.events,
        icsLink,
        icsText,
    });
};

export default function Index() {
    const loaderData = useLoaderData();
    const events: string[] = loaderData.selectedEvents
        ? loaderData.selectedEvents
        : null;
    return (
        <div className="flex flex-col my-2 sm:my-0 sm:justify-center h-screen container mx-auto max-w-md font-sans">
            <Form action="/logout" method="post">
                <span className="text-sm font-medium text-slate-600">
                    Logged in as {loaderData.user.username}
                </span>
                <button
                    type="submit"
                    className="ml-2 pb-1 text-sm font-medium text-slate-600"
                >
                    Log Out
                </button>
            </Form>
            <div className="p-6 bg-white flex-initial rounded-lg">
                <div className="mb-4">
                    <p className="pb-1 block text-sm font-medium text-slate-600">
                        Subscribe to this address in your favourite calendar
                        application.
                    </p>
                    <a href={loaderData.icsLink} className="underline">
                        {loaderData.icsText}
                    </a>
                </div>
                <label className="pb-1 block text-sm font-medium text-slate-600">
                    Selected events:
                </label>
                <div className="max-h-52 overflow-y-scroll overscroll-auto bg-clip-padding border border-solid border-slate-300 rounded select-none">
                    <ul>
                        {Object.values(events).map((value) => (
                            <li key={value} className="mx-1">
                                {value}
                            </li>
                        ))}
                    </ul>
                </div>
                <fieldset className="flex h-10 mt-4 gap-2 place-content-start">
                    <Link to="/">
                        <button
                            type="button"
                            className="px-5 bg-slate-200 text-slate-800 text-sm font-medium h-full rounded-lg"
                        >
                            Create new calendar
                        </button>
                    </Link>
                </fieldset>
            </div>
        </div>
    );
}
