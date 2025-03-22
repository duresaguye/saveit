import { createAuthClient } from "better-auth/react" 
 
export const authClient = createAuthClient({});

const signIn = async () => {
    const githubData = await authClient.signIn.social({
        provider: "github",
    });

    const googleData = await authClient.signIn.social({
        provider: "google",
    });

    const data = { github: githubData, google: googleData };
};