import * as dotenv from 'dotenv'
dotenv.config({ path: './.env' })

import regions from '../../regions.json'
import { listCustomers } from '../fortnox/customers'
import { hasFortnoxCredentials } from '../fortnox/auth'
import { FORTNOX_ENABLED_REGIONS } from '../fortnox/constants'

/**
 * Connectivity smoke test for the Fortnox integration.
 *
 * Refreshes the access token and performs a read-only call (list customers)
 * for each enabled region that has credentials configured. Run against the
 * dev DatoCMS environment (see DATOCMS_ENVIRONMENT in .env).
 *
 * Usage: npm run testfortnox
 */
const main = async () => {
  console.log(`DatoCMS environment: ${process.env.DATOCMS_ENVIRONMENT ?? 'main'}`)

  const enabled = regions.filter(r => FORTNOX_ENABLED_REGIONS.includes(r.slug))
  if (enabled.length === 0) {
    console.error('No Fortnox-enabled regions found in FORTNOX_ENABLED_REGIONS.')
    process.exit(1)
  }

  let ran = 0
  for (const region of enabled) {
    if (!hasFortnoxCredentials(region.slug)) {
      console.warn(`[${region.slug}] No Fortnox credentials configured, skipping`)
      continue
    }

    console.log(`\n[${region.slug}] Refreshing token and listing customers...`)
    try {
      const customers = await listCustomers(region.slug)
      ran++
      console.log(`[${region.slug}] OK — ${customers.length} customers`)
      customers.slice(0, 5).forEach(c =>
        console.log(`  - ${c.CustomerNumber}: ${c.Name ?? ''} <${c.Email ?? ''}>`)
      )
    } catch (err: any) {
      console.error(`[${region.slug}] FAILED: ${err?.message ?? err}`)
      process.exitCode = 1
    }
  }

  if (!ran) {
    console.error('No region with credentials was tested. Add Fortnox tokens to .env.')
    process.exit(1)
  }

  console.log('\nConnectivity test complete.')
}

main()
  .then(() => process.exit(process.exitCode ?? 0))
  .catch(err => {
    console.error(err)
    process.exit(1)
  })