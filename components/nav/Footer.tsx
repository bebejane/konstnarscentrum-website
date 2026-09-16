import s from './Footer.module.scss';
import cn from 'classnames';
import type { MenuItem } from '/lib/menu';
import Logo from '/public/images/logo-round.svg';
import { DatoMarkdown as Markdown } from 'dato-nextjs-utils/components';
import { useInView } from 'react-intersection-observer';
import { RegionLink } from '/components';
import { useRegion } from '/lib/context/region';
import { useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useStore } from '/lib/store';

export type FooterProps = {
	menu: MenuItem[];
	footer: FooterRecord;
	regions: RegionRecord[];
};

export default function Footer({ menu, footer, regions }: FooterProps) {
	const { setTheme } = useTheme();
	const { inView, ref } = useInView({ threshold: 0.5 });
	const [showMobileMenu] = useStore(({ showMenuMobile }) => [showMenuMobile]);
	const region = useRegion();
	const sponsors = regions?.find((el) => el.id === region.id)?.sponsors;
	const year = new Date().getFullYear();

	useEffect(() => {
		setTheme(inView && !showMobileMenu ? 'dark' : 'light');
	}, [inView, setTheme, showMobileMenu]);

	return (
		<>
			<footer className={cn(s.footer)} id='footer' ref={ref}>
				<section className={s.menu}>
					<nav>
						<ul>
							{menu.map((item, idx) => {
								return (
									<li key={idx}>
										<ul className={s.category}>
											<>
												{item.index ? (
													<li>
														<RegionLink scroll={true} href={item.slug} regional={item.regional}>
															{item.label}
														</RegionLink>
													</li>
												) : (
													<li>{item.label}</li>
												)}

												{item.sub?.map((subItem, subidx) => (
													<li key={subidx}>
														{item.external ? (
															<a href={subItem.slug} target='_new'>
																{subItem.label}
															</a>
														) : (
															<RegionLink
																scroll={true}
																href={subItem.slug}
																regional={subItem.regional}
															>
																{subItem.label}
															</RegionLink>
														)}
													</li>
												))}
											</>
										</ul>
									</li>
								);
							})}
						</ul>
					</nav>
				</section>

				<section className={s.about}>
					<Markdown>{footer?.aboutKc}</Markdown>
				</section>

				<section className={s.social}>
					<div>
						<span>Följ oss</span>
						<span>
							<a href='https://www.instagram.com/konstnarscentrum/'>Instagram</a>
						</span>
						<span>
							<a href='https://www.facebook.com/profile.php?id=100079288527813'>Facebook</a>
						</span>
					</div>
					<div className={s.copyright}>
						<span>Copyright Konstnärscentrum {year}</span>
						<span>GDPR & Cookies</span>
					</div>
				</section>

				<section className={s.support}>
					<div className={s.sponsors}>
						{sponsors && sponsors.length > 0 && (
							<ul>
								<li>Med stöd av</li>
								{sponsors.map(({ image, url }, idx) => (
									<li key={idx}>
										<img src={image.url} className={s.image} />
									</li>
								))}
							</ul>
						)}
					</div>
					<div className={cn(s.logo, inView && s.inview)}>
						<Logo />
					</div>
				</section>
			</footer>
		</>
	);
}
