import "server-only";
export default async function getToken() {
    const encodedClientCreds = btoa(
        `${process.env.ACRONIS_CLIENT_ID}:${process.env.ACRONIS_CLIENT_SECRET}`,
    );
    const headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${encodedClientCreds}`,
    };
    const res = await fetch(`${process.env.ACRONIS_API_V2_URL}/idp/token`, {
        method: "POST",
        headers: headers,
        body: new URLSearchParams({
            grant_type: "client_credentials",
        }),
        next: { revalidate: 5400 },
        // next: { revalidate: 0 },
    });
    const auth = await res.json();
    console.log(auth?.access_token);
    return await auth.access_token;
}
