import {
    ActionFunction,
    json,
    LoaderFunction,
    redirect,
} from "@remix-run/node";
import {
    Form,
    useActionData,
    useSearchParams,
    useTransition,
} from "@remix-run/react";
import { verifyLogin } from "~/models/user.server";
import { createUserSession, getUserId } from "~/session.server";

export const loader: LoaderFunction = async ({ request }) => {
    const userId = await getUserId(request);
    if (userId) return redirect("/");
    return json({});
};

// `safeRedirect()` from remix-run/indie-stack
// https://github.com/remix-run/indie-stack/blob/7a012f40f1ee1dfc6a19a16cbb06c0b15fe1f3c4/app/utils.ts
export function safeRedirect(
    to: FormDataEntryValue | string | null | undefined,
    defaultRedirect: string = "/"
) {
    if (!to || typeof to !== "string") {
        return defaultRedirect;
    }

    if (!to.startsWith("/") || to.startsWith("//")) {
        return defaultRedirect;
    }

    return to;
}

export const action: ActionFunction = async ({ request }) => {
    const formData = await request.formData();
    const username = formData.get("username");
    const password = formData.get("password");
    const redirectTo = safeRedirect(formData.get("redirectTo"));
    var errors = {};
    if (typeof username !== "string" || username.length === 0) {
        errors = {
            ...errors,
            username: "Username is required",
        };
    }
    if (typeof password !== "string" || password.length === 0) {
        errors = {
            ...errors,
            password: "Password is required",
        };
    }
    if (Object.values(errors).some(Boolean)) {
        return json({
            formData,
            errors,
            status: 400,
        });
    }
    const user = await verifyLogin(username, password);
    if (!user) {
        return json({
            errors: { username: "Invalid username or password" },
            status: 400,
        });
    }
    return createUserSession(user.id, redirectTo);
};

export default function Login() {
    const actionData = useActionData();
    const transition = useTransition();
    const [searchParams] = useSearchParams();

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
                <>
                    <input
                        type="hidden"
                        name="redirectTo"
                        value={searchParams.get("redirectTo") ?? undefined}
                    />
                    <fieldset
                        className="select-none"
                        disabled={formState === "submitting"}
                    >
                        <div className="flex">
                            <label
                                htmlFor="username"
                                className="flex-1 pb-1 block text-sm font-medium text-slate-600"
                            >
                                Username
                                {formState === "errors" ? (
                                    <em className="text-sm font-medium text-red-600">
                                        &nbsp;
                                        {actionData?.errors?.username}
                                    </em>
                                ) : null}
                            </label>
                        </div>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            defaultValue={actionData?.formData?.username}
                            key={actionData?.formData?.username}
                            className="bg-white bg-clip-padding border border-solid border-slate-300 rounded transition ease-in-out focus:text-slate-700 focus:bg-white focus:border-blue-600 focus:outline-none block w-full p-2 rounded-md"
                        />
                    </fieldset>
                    <fieldset
                        className="select-none mt-4 gap-2"
                        disabled={formState === "submitting"}
                    >
                        <div className="flex">
                            <label
                                htmlFor="password"
                                className="flex-1 pb-1 block text-sm font-medium text-slate-600"
                            >
                                Password
                                {formState === "errors" ? (
                                    <em className="text-sm font-medium text-red-600">
                                        &nbsp;
                                        {actionData?.errors?.password}
                                    </em>
                                ) : null}
                            </label>
                        </div>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            defaultValue={actionData?.formData?.password}
                            key={actionData?.formData?.password}
                            className="bg-white bg-clip-padding border border-solid border-slate-300 rounded transition ease-in-out focus:text-slate-700 focus:bg-white focus:border-blue-600 focus:outline-none block w-full p-2 rounded-md"
                        />
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
                                : "Login"}
                        </button>
                    </fieldset>
                </>
            </Form>
        </div>
    );
}
