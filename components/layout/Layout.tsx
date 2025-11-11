import s from './Layout.module.scss';
import React, { useEffect, useState } from 'react';
import {
	Content,
	Footer,
	MenuDesktop,
	MenuMobile,
	Logo,
	Grid,
	Search,
	FullscreenGallery,
	Breadcrumbs,
} from '/components';
import type { MenuItem } from '/lib/menu';
import { buildMenu } from '/lib/menu';
import { useRouter } from 'next/router';
import { useStore, shallow } from '/lib/store';

export type LayoutProps = {
	children: React.ReactNode;
	menu: MenuItem[];
	title: string;
	footer: FooterRecord;
	regions: RegionRecord[];
};

export default function Layout({ children, menu: menuFromProps, title, footer, regions }: LayoutProps) {
	const router = useRouter();
	const [images, imageId, setImageId, showMenu] = useStore(
		(state) => [state.images, state.imageId, state.setImageId, state.showMenu],
		shallow
	);
	const isHome =
		router.asPath === '/' ||
		router.asPath === '/test' ||
		regions?.find(({ slug }) => slug === router.asPath.replace('/', '')) !== undefined;
	const [menu, setMenu] = useState(menuFromProps);

	useEffect(() => {
		// Refresh menu on load.
		buildMenu()
			.then((res) => setMenu(res))
			.catch((err) => console.error(err));
	}, []);

	return (
		<>
			<MenuMobile items={menu} home={isHome} />
			{!isHome && <MenuDesktop items={menu} home={isHome} />}
			<div className={s.layout}>
				<Logo />
				<Content noMargins={isHome}>{children}</Content>
				<Breadcrumbs title={title} show={!showMenu} />
				<Search />
			</div>

			<Footer menu={menu} footer={footer} regions={regions} />
			<FullscreenGallery
				index={images?.findIndex((image) => image?.id === imageId)}
				images={images}
				show={imageId !== undefined}
				onClose={() => setImageId(undefined)}
			/>
			<Grid />
		</>
	);
}
