# Visitor data and retention

## What the site stores

When Supabase is configured, the site stores:

- **Visitors:** a random browser visitor ID, first and last seen timestamps, any name, company, or role the visitor provides, the `ref` value or referrer host, and the page language. The `user_agent` column is left empty; the site does not collect it.
- **Chat conversations:** a random session conversation ID, visitor link, timestamps, message count, and backend name.
- **Chat messages:** the text of each user message and the assistant reply.
- **Leads:** the name and any company, role, email, phone, and message submitted through the contact form.
- **Engagement analytics:** CTA, chat, PDF print, and section-view event names and properties are sent to Vercel Analytics. These events are not copied into a custom Supabase table.

The Supabase service-role key is used only in server functions. The browser receives no Supabase key and cannot access the visitor tables. Do Not Track prevents analytics events and chat logging. A lead submitted through the contact form is still saved because the visitor explicitly submitted contact details.

The application does not write IP addresses to Supabase or its own files. The lead rate limiter keeps only a SHA-256 hash of the request IP in function memory for up to 10 minutes.

## Retention and deletion

There is no automatic deletion schedule configured. The site owner should delete visitor, conversation, message, and lead records when they are no longer needed. Visitors can request deletion by emailing [suanranger129@gmail.com](mailto:suanranger129@gmail.com). The owner can locate records using the visitor or conversation ID when available; deleting a conversation cascades to its messages.
