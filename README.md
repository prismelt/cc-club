# Green Level Coding Club

The club homepage provides a simple passwordless account flow: students can sign up with a name and unique email, then log in later with that email.

After changing the Drizzle schema, apply it to the configured Postgres database with `pnpm db:push`.

Set `ADMIN_EMAILS` to a comma-separated list of emails before those users sign up to create admin accounts. Existing users can also be promoted by setting `club_user.role` to `admin`.

The app includes `/about`, `/vision`, `/presentations`, `/resources`, `/login`, `/signup`, `/home`, and `/admin`. Signed-in users can edit their profile or delete their account from `/home`; admins can manage the roster from `/admin`.

Admin accounts can be created at `/admin/signup` with the temporary code `password123`. Change this code in `src/server/auth/config.ts` before deploying.
