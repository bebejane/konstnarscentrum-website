import { withWebPreviewsEdge } from 'dato-nextjs-utils/hoc';
import { getWebPreviewPath } from '/lib/web-paths';

export const config = {
  runtime: 'edge'
}

export default withWebPreviewsEdge(async ({ item, itemType }) => {
  return getWebPreviewPath(itemType, item)
})