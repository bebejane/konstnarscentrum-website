import { NextApiRequest, NextApiResponse } from 'next'
import { FORTNOX_TOKEN_URL, clientCredentials, FORTNOX_REDIRECT_URI } from '/lib/fortnox/constants'

export const config = {
  maxDuration: 30
}

/**
 * OAuth callback helper.
 *
 * This exchanges the Fortnox authorization code for access + refresh tokens and
 * renders them so you can copy them into `.env` (per-region tokens are stored
 * manually in `.env`).
 *
 * Redirect URI configured in the Fortnox developer portal must match:
 *   FORTNOX_REDIRECT_URI (e.g. http://localhost:3000/api/fortnox/callback)
 *
 * To start the flow, visit:
 *   https://apps.fortnox.se/oauth-v1/auth?client_id={CLIENT_ID}&redirect_uri={REDIRECT_URI}&scope=customer+invoice&access_type=offline&response_type=code&state={regionSlug}
 *
 * You can pass ?state={regionSlug} (e.g. nord) to label which region's tokens
 * are being captured, though the value is informational only.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { code, error, state } = req.query

  if (error) {
    res.setHeader('Content-Type', 'text/plain')
    return res.status(400).send(`Authorization failed: ${error}. Reason: ${state ?? 'unknown'}`)
  }

  if (!code) {
    res.setHeader('Content-Type', 'text/plain')
    return res.status(400).send('No authorization code provided. Start the OAuth flow from the Fortnox auth URL.')
  }

  try {
    const { id, secret } = clientCredentials()
    if (!FORTNOX_REDIRECT_URI)
      throw new Error('FORTNOX_REDIRECT_URI not set in .env')

    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code: String(code),
      redirect_uri: FORTNOX_REDIRECT_URI
    })

    const tokenRes = await fetch(FORTNOX_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString('base64')}`
      },
      body
    })

    if (!tokenRes.ok) {
      const text = await tokenRes.text()
      throw new Error(`Fortnox token exchange failed (${tokenRes.status}): ${text}`)
    }

    const data = await tokenRes.json()
    const region = state ? String(state).toUpperCase() : 'REGION'

    const envSnippet = [
      `# Region: ${region}`,
      `FORTNOX_${region}_ACCESS_TOKEN=${data.access_token ?? ''}`,
      `FORTNOX_${region}_REFRESH_TOKEN=${data.refresh_token ?? ''}`,
      ''
    ].join('\n')

    res.setHeader('Content-Type', 'text/plain')
    return res.status(200).send(
      `Fortnox OAuth success for region: ${region}\n\n` +
      `Copy these lines into your .env:\n\n${envSnippet}` +
      `Access tokens expire after ~5 minutes; the refresh token can be used to obtain new ones.`
    )
  } catch (err: any) {
    res.setHeader('Content-Type', 'text/plain')
    return res.status(500).send(`Error: ${err?.message ?? err}`)
  }
}
