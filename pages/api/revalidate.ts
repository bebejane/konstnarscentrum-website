import { withRevalidate } from 'dato-nextjs-utils/hoc'
import { getRevalidatePaths } from '/lib/web-paths'

export const config = {
  runtime: 'nodejs',
  maxDuration: 30
};

export default withRevalidate(async (record, revalidate) => {
  revalidate(getRevalidatePaths(record))
})