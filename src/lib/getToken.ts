import "server-only";

export async function getAcronisToken() {
    const encodedClientCredentials = btoa(
        `${process.env.ACRONIS_CLIENT_ID}:${process.env.ACRONIS_CLIENT_SECRET}`,
    );
    const headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${encodedClientCredentials}`,
    };
    const res = await fetch(`${process.env.ACRONIS_API_V2_URL}/idp/token`, {
        method: "POST",
        headers: headers,
        body: new URLSearchParams({
            grant_type: "client_credentials",
        }),
        next: { revalidate: 7000 },
        // next: { revalidate: 0 },
    });

    const auth = await res.json();
    return await auth.access_token;
}

export async function getParasutToken() {
    const res = await fetch(`${process.env.PARASUT_BASE_URL}/oauth/token`, {
        method: "POST",
        body: new URLSearchParams({
            grant_type: "password",
            client_id: process.env.PARASUT_CLIENT_ID ?? "",
            client_secret: process.env.PARASUT_CLIENT_SECRET ?? "",
            username: process.env.PARASUT_USERNAME ?? "",
            password: process.env.PARASUT_PASSWORD ?? "",
            redirect_uri: process.env.PARASUT_CALLBACK_URL ?? "",
        }),
        next: { revalidate: 7000 },
    });

    const auth = await res.json();
    return await auth.access_token;
}
