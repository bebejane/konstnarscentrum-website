import Link from 'next/link';
import { useRegion } from '/lib/context/region';

export type Props = {
	[key: string]: any;
	href: string;
	regional?: boolean;
	externa?: boolean;
};

export default function RegionLink(props: Props) {
	if (!props.href) throw new Error('Link has no href');

	const region = useRegion();
	const isRegional = props.regional === false ? false : true;
	const isExternal = props.href.toLowerCase().startsWith('http');
	const href =
		region && isRegional && !isExternal
			? `/${region.slug}${props.href}`
			: isExternal
			? props.href
			: props.href.startsWith('/')
			? props.href
			: `/${props.href}`;

	return (
		<Link {...props} href={href} regional={undefined} external={undefined} suppressHydrationWarning>
			{props.children}
		</Link>
	);
}
