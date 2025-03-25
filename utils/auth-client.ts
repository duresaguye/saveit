import { createAuthClient } from "better-auth/react" 
import { organizationClient } from "better-auth/client/plugins"
import { ac, member, admin } from "./permissions"

export const authClient = createAuthClient({});

const signIn = async () => {
    const githubData = await authClient.signIn.social({
        provider: "github",
    });

    const googleData = await authClient.signIn.social({
        provider: "google",
    });

    const data = { github: githubData, google: googleData };
    plugins: [
        organizationClient({
          ac,
          roles: { member, admin }
        })
      ]
};