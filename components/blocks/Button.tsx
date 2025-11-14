import s from './Button.module.scss';
import React from 'react';
import Link from 'next/link';

export type ButtonBlockProps = { data: ButtonRecord; onClick: Function };

export default function Button({ data: { text, url }, onClick }: ButtonBlockProps) {
	return (
		<Link className={s.button} href={url?.trim()}>
			<button>{text}</button>
		</Link>
	);
}
