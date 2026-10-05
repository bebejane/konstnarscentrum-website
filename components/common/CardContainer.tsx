import s from './CardContainer.module.scss'
import cn from 'classnames'
import { chunkArray } from '/lib/utils'
import useDevice from '/lib/hooks/useDevice'
import React, { useMemo } from 'react'

export type Props = {
  children?: React.ReactNode | React.ReactNode[],
  columns?: 2 | 3,
  className?: string
  whiteBorder?: boolean
}

export default function CardContainer({ children, columns = 3, className, whiteBorder = false }: Props) {

  const { isDesktop } = useDevice()

  // Derive rows from the current children on every change so a new result set
  // is always reflected (previously this was cached in state and went stale).
  const cards = useMemo(
    () => chunkArray(Array.isArray(children) ? children : [children], !isDesktop ? 2 : columns) as [React.ReactNode[]],
    [children, isDesktop, columns]
  )

  return (
    <ul className={cn(s.container, columns === 2 && s.two, columns === 3 && s.three, className, whiteBorder && s.whiteBorder)}>
      {cards.map((row, idx) => {
        return (
          <React.Fragment key={idx}>
            {row.map(el => el)}
            <hr key={idx} />
          </React.Fragment>
        )
      })}
    </ul>
  )
}