import styles from './ReadMore.module.scss';
import { recordToSlug } from '/lib/utils';
import cn from 'classnames';
import { RegionLink } from '/components';
import { useRegion } from '/lib/context/region';
import { useTheme } from 'next-themes';

type Props = {
	message?: string;
	link: string;
	invert?: boolean;
	regional?: boolean;
	external?: boolean;
};

export default function ReadMore({ message, link, invert = false, regional, external = false }: Props) {
	const region = useRegion();
	const { theme } = useTheme();

	if (!link) return null;

	return (
		<RegionLink
			href={recordToSlug(link, region)}
			className={cn(styles.more, 'small', invert && styles.invert)}
			regional={regional}
			external={external}
		>
			<div className={cn(styles.square)} data-theme={theme} suppressHydrationWarning />
			<span data-theme={theme} suppressHydrationWarning>
				{message}
			</span>
		</RegionLink>
	);
}
