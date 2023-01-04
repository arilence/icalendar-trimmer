import type { ActionFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useActionData, Link, Form, useTransition } from "@remix-run/react";
import { z } from "zod";
import { getParams } from "remix-params-helper";
import * as icsParser from "node-ical";

import { createCalendar } from "~/models/calendar.server";

async function getURL(remoteUrl: string): Promise<{}> {
    const remoteIcs = await icsParser.async.fromURL(remoteUrl);
    let selectableEvents = new Map<string, string>();
    // In most cases there are 3 occurances of an event: 1 - current year + 1.
    // For the purpose of creating a selectable events list, we assume that the
    // user will want all occurances of an event. Therefore, only one instance of
    // the name needs to show up in the list.
    // To achieve this, we use the `summary` (event name) as a key to avoid
    // duplicates in the list.
    for (let key in remoteIcs) {
        const event = remoteIcs[key];
        if (event.type != "VEVENT") {
            continue;
        }
        selectableEvents.set(event.summary, event.summary);
    }
    return Object.fromEntries(selectableEvents);
}

export const action: ActionFunction = async ({ request }) => {
    const urlSchema = z.object({
        action: z.enum(["load", "create"]),
        remoteUrl: z.string().url(),
    });
    const selectSchema = z.object({
        remoteUrl: z.string().url(),
        selectedEvents: z.string().array(),
    });

    // Normally we'd use something like Object.fromEntries(await request.formData())
    // But Zod doesn't support data that requires the use of `FormData.getAll()`
    // So instead we're using `getParams()` from `remix-params-helper`.
    const formData = await request.formData();

    const urlResult = getParams(formData, urlSchema);
    if (!urlResult.success) {
        return json({ formData, errors: urlResult.errors });
    }
    const selectableEvents = await getURL(urlResult.data.remoteUrl);

    // Button values within the Form dictate which action we want to take.
    switch (urlResult.data.action) {
        case "load": {
            return json({
                formData: urlResult.data,
                selectableEvents,
            });
        }
        case "create": {
            const selectResult = getParams(formData, selectSchema);
            if (!selectResult.success) {
                return json({
                    formData: urlResult.data,
                    errors: selectResult.errors,
                    selectableEvents,
                });
            }
            const calendar = await createCalendar({
                remoteUrl: selectResult.data.remoteUrl,
                events: selectResult.data.selectedEvents,
            });
            return redirect("/" + calendar.id);
        }
        default: {
            throw new Error("Unexpected action");
        }
    }
};

export default function Index() {
    const actionData = useActionData();
    const transition = useTransition();

    let pageState: "url" | "select" = actionData?.selectableEvents
        ? "select"
        : "url";

    let formState: "idle" | "errors" | "submitting" = transition.submission
        ? "submitting"
        : actionData?.errors
        ? "errors"
        : "idle";

    return (
        <div className="flex flex-col my-2 sm:my-0 sm:justify-center h-screen container mx-auto max-w-md font-sans">
            <Form
                method="post"
                className="p-6 bg-white flex-initial rounded-lg"
            >
                {pageState === "url" ? (
                    <>
                        <fieldset
                            className="select-none"
                            disabled={formState === "submitting"}
                        >
                            <div className="flex">
                                <label
                                    htmlFor="remoteUrl"
                                    className="flex-1 pb-1 block text-sm font-medium text-slate-600"
                                >
                                    Calendar URL
                                    {formState === "errors" ? (
                                        <em className="text-sm font-medium text-red-600">
                                            &nbsp;
                                            {actionData?.errors?.remoteUrl}
                                        </em>
                                    ) : null}
                                </label>
                            </div>
                            <input
                                type="text"
                                id="remoteUrl"
                                name="remoteUrl"
                                defaultValue={actionData?.formData?.remoteUrl}
                                key={actionData?.formData?.remoteUrl}
                                className="bg-white bg-clip-padding border border-solid border-slate-300 rounded transition ease-in-out focus:text-slate-700 focus:bg-white focus:border-blue-600 focus:outline-none block w-full p-2 rounded-md"
                            />
                            <div className="text-xs mt-1 text-slate-500">
                                Public address in iCal format
                            </div>
                        </fieldset>
                        <fieldset
                            className="flex h-10 mt-4 gap-2 place-content-end"
                            disabled={formState === "submitting"}
                        >
                            <button
                                type="submit"
                                name="action"
                                value="load"
                                className="px-5 text-sm font-medium bg-slate-800 text-white rounded-lg"
                            >
                                {formState === "submitting"
                                    ? "Loading..."
                                    : "Continue"}
                            </button>
                        </fieldset>
                    </>
                ) : null}

                {pageState === "select" ? (
                    <>
                        <fieldset
                            className="pb-2"
                            disabled={formState === "submitting"}
                        >
                            <label
                                htmlFor="remoteUrl"
                                className="flex-1 pb-1 block text-sm font-medium text-slate-600"
                            >
                                Calendar URL:
                            </label>
                            <input
                                type="text"
                                id="ignoredRemoteUrl"
                                name="ignoredRemoteUrl"
                                defaultValue={actionData?.formData?.remoteUrl}
                                key={actionData?.formData?.remoteUrl}
                                className="text-slate-500 bg-slate-100 bg-clip-padding border border-solid border-slate-300 rounded transition ease-in-out block w-full p-2 rounded-md cursor-not-allowed"
                                disabled={true}
                            />
                            <input
                                type="hidden"
                                id="remoteUrl"
                                name="remoteUrl"
                                defaultValue={actionData?.formData?.remoteUrl}
                                key={actionData?.formData?.remoteUrl}
                            />
                        </fieldset>
                        <fieldset
                            className=""
                            disabled={formState === "submitting"}
                        >
                            <label className="flex-1 pb-1 block text-sm font-medium text-slate-600">
                                Events to keep:
                                {formState === "errors" ? (
                                    <em className="text-sm font-medium text-red-600">
                                        &nbsp;
                                        {actionData?.errors?.selectedEvents}
                                    </em>
                                ) : null}
                            </label>
                            <div className="h-52 overflow-y-scroll overscroll-auto bg-clip-padding border border-solid border-slate-300 rounded select-none">
                                {Object.keys(actionData?.selectableEvents).map(
                                    (event) => (
                                        <div key={event}>
                                            <input
                                                type="checkbox"
                                                name="selectedEvents"
                                                value={event}
                                                id={event}
                                                className="mx-1"
                                            />
                                            <label htmlFor={event}>
                                                {event}
                                            </label>
                                        </div>
                                    )
                                )}
                            </div>
                            <div className="text-xs mt-1 text-slate-500">
                                Only selected events will appear in the new
                                calendar
                            </div>
                        </fieldset>
                        <fieldset
                            className="flex h-10 mt-4 gap-2 place-content-end"
                            disabled={formState === "submitting"}
                        >
                            <Link to=".">
                                <button
                                    type="button"
                                    className="px-5 bg-slate-200 text-slate-800 text-sm font-medium h-full rounded-lg"
                                >
                                    Start Over
                                </button>
                            </Link>
                            <button
                                type="submit"
                                name="action"
                                value="create"
                                className="px-5 text-sm font-medium bg-slate-800 text-white rounded-lg"
                            >
                                {formState === "submitting"
                                    ? "Creating..."
                                    : "Create Calendar"}
                            </button>
                        </fieldset>
                    </>
                ) : null}
            </Form>
        </div>
    );
}
